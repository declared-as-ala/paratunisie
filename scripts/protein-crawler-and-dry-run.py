import urllib.request
import re
import json
import ssl
import os
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

ctx = ssl._create_unverified_context()
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'}

def fetch_url(url, timeout=12, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=timeout) as res:
                return res.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == retries - 1:
                return None
            time.sleep(1 + attempt * 1.5)
    return None

def normalize_text(text: str) -> str:
    if not text:
        return ""
    # Normalize unicode accents
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().strip()
    # Normalize weight/volume units
    text = re.sub(r'(\d+)\s*,\s*(\d+)', r'\1.\2', text) # 4,5 -> 4.5
    text = re.sub(r'(\d+(?:\.\d+)?)\s*k(?:g|ilo|ilos)?\b', lambda m: f"{int(float(m.group(1))*1000)}g", text) # 4.5kg -> 4500g, 1kg -> 1000g
    text = re.sub(r'(\d+)\s*gr?\b', r'\1g', text) # 500gr -> 500g
    text = re.sub(r'(\d+)\s*tabs?\b', r'\1tabs', text)
    text = re.sub(r'(\d+)\s*gelules?\b', r'\1gelules', text)
    text = re.sub(r'(\d+)\s*caps(?:ules?)?\b', r'\1caps', text)
    text = re.sub(r'(\d+)\s*servings?\b', r'\1servings', text)
    # Remove punctuation
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def extract_weight_or_format(title: str) -> str:
    # 4.5kg, 500g, 60 gelules, 90 tabs, 30 servings, 500ml
    m = re.search(r'(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|tabs?|g[ée]lules?|caps(?:ules?)?|servings?|ml|l))\b', title, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return ""

def parse_product_page(url, html):
    if not html:
        return None
    soup = BeautifulSoup(html, 'html.parser')
    
    title = ""
    sku = ""
    brand = ""
    price_tnd = 0.0
    old_price_tnd = None
    avail_schema = ""
    images = []
    description = ""
    category_slug = ""
    
    # Extract from URL category slug: e.g. https://protein.tn/creatine/... -> creatine
    url_parts = url.replace("https://protein.tn/", "").split("/")
    if len(url_parts) >= 2:
        category_slug = url_parts[0]
        slug = url_parts[1]
    else:
        slug = url_parts[0]

    # JSON-LD extraction
    scripts = soup.find_all('script', type='application/ld+json')
    for s in scripts:
        try:
            d = json.loads(s.string)
            if isinstance(d, dict) and d.get('@type') == 'Product':
                title = d.get('name', '')
                sku = str(d.get('sku', '')).strip()
                b = d.get('brand', {})
                brand = b.get('name', '') if isinstance(b, dict) else str(b)
                offers = d.get('offers', {})
                if isinstance(offers, dict):
                    avail_schema = offers.get('availability', '')
                    p_str = str(offers.get('price', '0')).replace(',', '.')
                    try:
                        price_tnd = float(p_str)
                    except:
                        pass
                img_list = d.get('image', [])
                if isinstance(img_list, list):
                    images = img_list
                elif isinstance(img_list, str):
                    images = [img_list]
                description = d.get('description', '')
        except:
            pass

    # DOM Fallbacks
    if not title:
        h1 = soup.find('h1')
        title = h1.get_text(strip=True) if h1 else slug.replace('-', ' ').title()

    if not images:
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and 'storage/produits' in src and src not in images:
                images.append(src)

    # Check stock / availability
    text_lower = soup.get_text().lower()
    is_sur_commande = "sur commande" in text_lower or "preorder" in avail_schema.lower()
    is_out_of_stock = "outofstock" in avail_schema.lower() or "rupture" in text_lower
    
    if is_sur_commande:
        stock_status = "ON_ORDER"
    elif is_out_of_stock:
        stock_status = "OUT_OF_STOCK"
    else:
        stock_status = "IN_STOCK"

    # Extract old price / promotion if available in DOM
    old_price_el = soup.find(class_=re.compile(r'old-price|line-through|text-gray-400|regular-price', re.I))
    if old_price_el:
        m = re.search(r'(\d+(?:[.,]\d+)?)', old_price_el.get_text())
        if m:
            try:
                op = float(m.group(1).replace(',', '.'))
                if op > price_tnd:
                    old_price_tnd = op
            except:
                pass

    return {
        'sourceUrl': url,
        'slug': slug,
        'sourceSku': sku,
        'title': title,
        'normalizedTitle': normalize_text(title),
        'brand': brand.strip(),
        'normalizedBrand': normalize_text(brand),
        'categorySlug': category_slug,
        'priceTnd': price_tnd,
        'oldPriceTnd': old_price_tnd,
        'stockStatus': stock_status,
        'format': extract_weight_or_format(title),
        'images': images,
        'description': description.strip()
    }

def main():
    print("==================================================")
    print("PHASE 3: DISCOVERING PROTEIN.TN CATALOG")
    print("==================================================")
    
    cache_file = "scripts/protein_catalog_cache.json"
    products = []
    
    if os.path.exists(cache_file):
        print(f"Loading cached products from {cache_file}...")
        with open(cache_file, "r", encoding="utf-8") as f:
            products = json.load(f)
        print(f"✓ Loaded {len(products)} products from cache.")
    else:
        # 1. Fetch sitemaps
        sitemap_urls = [
            'https://protein.tn/sitemaps/products-0.xml',
            'https://protein.tn/sitemaps/products-1.xml',
            'https://protein.tn/sitemaps/products-2.xml',
        ]
        all_urls = set()
        for sm in sitemap_urls:
            print(f"Fetching sitemap {sm}...")
            xml = fetch_url(sm)
            if xml:
                urls = re.findall(r'<loc>([^<]+)</loc>', xml)
                print(f"  Found {len(urls)} URLs.")
                all_urls.update(urls)

        print(f"Total discovered unique product URLs: {len(all_urls)}")
        
        # 2. Parallel Crawl with Rate-limiting
        url_list = list(all_urls)
        print(f"Starting discovery crawl for all {len(url_list)} products (ThreadPool)...")
        
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_url = {executor.submit(lambda u: (u, fetch_url(u)), url): url for url in url_list}
            count = 0
            for future in as_completed(future_to_url):
                count += 1
                url, html = future.result()
                if html:
                    p = parse_product_page(url, html)
                    if p and p.get('title'):
                        products.append(p)
                if count % 250 == 0 or count == len(url_list):
                    print(f"  Progress: {count}/{len(url_list)} parsed ({len(products)} valid products)...")

        print(f"Discovery crawl finished in {time.time()-start_time:.1f}s. Total parsed: {len(products)}")
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"Saved to {cache_file}.")

    # Load existing ParaTunisie database products
    with open("src/lib/data/products.ts", "r", encoding="utf-8") as f:
        static_p_text = f.read()

    # Load VPS database products
    import paramiko
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)
    
    stdin, stdout, stderr = client.exec_command(
        'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug, name, \"brandId\", \"categoryId\" FROM \\"Product\\";"'
    )
    db_rows = stdout.read().decode('utf-8').strip().splitlines()
    client.close()

    existing_db_products = []
    for r in db_rows:
        if r.strip():
            parts = r.split('|')
            if len(parts) >= 3:
                existing_db_products.append({
                    'id': parts[0],
                    'slug': parts[1],
                    'name': parts[2],
                    'normalizedName': normalize_text(parts[2])
                })

    print(f"\nExisting ParaTunisie products in DB: {len(existing_db_products)}")

    # ==================================================
    # PHASE 5: RUN MULTI-LEVEL DUPLICATE DETECTION
    # ==================================================
    print("\n==================================================")
    print("PHASE 5: RUNNING MULTI-LEVEL DUPLICATE DETECTION")
    print("==================================================")

    matched_exact = []
    matched_fuzzy = []
    new_products = []
    potential_duplicates = []

    # Map existing slugs & normalized names
    existing_slugs = {p['slug']: p for p in existing_db_products}
    existing_norm_names = {p['normalizedName']: p for p in existing_db_products}

    for p in products:
        p_slug = p['slug']
        p_norm = p['normalizedTitle']
        p_brand_norm = p['normalizedBrand']
        
        # Level 1: Exact slug match
        if p_slug in existing_slugs:
            matched_exact.append({
                'source': p,
                'target': existing_slugs[p_slug],
                'reason': f"Exact Slug: {p_slug}"
            })
            continue

        # Level 2: Exact normalized name match
        if p_norm in existing_norm_names:
            matched_exact.append({
                'source': p,
                'target': existing_norm_names[p_norm],
                'reason': f"Exact Normalized Name: {p_norm}"
            })
            continue

        # Level 3: Fuzzy / Substring brand + key title tokens match
        fuzzy_match = None
        for ex in existing_db_products:
            ex_norm = ex['normalizedName']
            # If both contain brand and >75% of key tokens overlap
            p_tokens = set(p_norm.split())
            ex_tokens = set(ex_norm.split())
            overlap = p_tokens.intersection(ex_tokens)
            if len(p_tokens) > 0 and (len(overlap) / max(len(p_tokens), len(ex_tokens))) >= 0.75:
                fuzzy_match = (ex, len(overlap) / max(len(p_tokens), len(ex_tokens)))
                break

        if fuzzy_match:
            potential_duplicates.append({
                'source': p,
                'target': fuzzy_match[0],
                'confidence': f"{fuzzy_match[1]*100:.0f}%",
                'reason': f"Fuzzy Token Overlap ({fuzzy_match[1]*100:.0f}%)"
            })
        else:
            new_products.append(p)

    # Breakdown by Stock Status
    in_stock_new = [p for p in new_products if p['stockStatus'] == 'IN_STOCK']
    on_order_new = [p for p in new_products if p['stockStatus'] == 'ON_ORDER']
    out_of_stock_new = [p for p in new_products if p['stockStatus'] == 'OUT_OF_STOCK']

    # Brands breakdown
    brands_count = {}
    for p in products:
        b = p['brand'] or 'Non spécifiée'
        brands_count[b] = brands_count.get(b, 0) + 1

    # Categories breakdown
    categories_count = {}
    for p in products:
        c = p['categorySlug'] or 'Autres'
        categories_count[c] = categories_count.get(c, 0) + 1

    # ==================================================
    # PHASE 6: GENERATE DRY-RUN REPORT
    # ==================================================
    report = {
        'totalDiscovered': len(products),
        'existingDatabaseCount': len(existing_db_products),
        'alreadyExistingMatched': len(matched_exact),
        'potentialDuplicates': len(potential_duplicates),
        'newProductsToImport': len(new_products),
        'newInStock': len(in_stock_new),
        'newOnOrder': len(on_order_new),
        'newOutOfStock': len(out_of_stock_new),
        'totalBrandsDiscovered': len(brands_count),
        'topBrands': sorted(brands_count.items(), key=lambda x: x[1], reverse=True)[:15],
        'categoriesDiscovered': sorted(categories_count.items(), key=lambda x: x[1], reverse=True),
        'sampleMatches': matched_exact[:10],
        'samplePotentialDuplicates': potential_duplicates[:10],
        'sampleNewToImport': new_products[:10]
    }

    report_path = "scripts/dry_run_import_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("\n==================================================")
    print("DRY RUN SUMMARY REPORT GENERATED")
    print("==================================================")
    print(f"Total Discovered on Protein.tn : {report['totalDiscovered']}")
    print(f"Already Existing Matched (Safe) : {report['alreadyExistingMatched']}")
    print(f"Potential Duplicates (Review)  : {report['potentialDuplicates']}")
    print(f"New Products to Import         : {report['newProductsToImport']}")
    print(f" - In Stock                    : {report['newInStock']}")
    print(f" - Sur Commande (On Order)     : {report['newOnOrder']}")
    print(f" - Out of Stock                : {report['newOutOfStock']}")
    print(f"Total Brands Discovered        : {report['totalBrandsDiscovered']}")
    print(f"Total Categories Mapped        : {len(report['categoriesDiscovered'])}")
    print(f"\nDetailed report saved to: {report_path}")

if __name__ == '__main__':
    main()
