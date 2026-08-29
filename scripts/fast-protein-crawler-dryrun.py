import urllib.request
import re
import json
import ssl
import os
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
import paramiko

ctx = ssl._create_unverified_context()
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'}

def log(msg):
    try:
        print(msg.encode('ascii', errors='replace').decode('ascii'), flush=True)
    except Exception:
        pass

def fetch_url(url, timeout=8):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as res:
            return res.read().decode('utf-8', errors='ignore')
    except Exception:
        return None

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().strip()
    text = re.sub(r'(\d+)\s*,\s*(\d+)', r'\1.\2', text)
    text = re.sub(r'(\d+(?:\.\d+)?)\s*k(?:g|ilo|ilos)?\b', lambda m: f"{int(float(m.group(1))*1000)}g", text)
    text = re.sub(r'(\d+)\s*gr?\b', r'\1g', text)
    text = re.sub(r'(\d+)\s*tabs?\b', r'\1tabs', text)
    text = re.sub(r'(\d+)\s*gelules?\b', r'\1gelules', text)
    text = re.sub(r'(\d+)\s*caps(?:ules?)?\b', r'\1caps', text)
    text = re.sub(r'(\d+)\s*servings?\b', r'\1servings', text)
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def extract_format(title: str) -> str:
    m = re.search(r'(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|tabs?|g[ée]lules?|caps(?:ules?)?|servings?|ml|l))\b', title, re.IGNORECASE)
    return m.group(1).strip() if m else ""

def parse_product(url, html):
    if not html:
        return None
    
    # Fast regex-based JSON-LD search
    scripts = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
    title = ""
    sku = ""
    brand = ""
    price_tnd = 0.0
    old_price_tnd = None
    avail = ""
    images = []
    
    for s in scripts:
        try:
            d = json.loads(s)
            if isinstance(d, dict) and d.get('@type') == 'Product':
                title = d.get('name', '')
                sku = str(d.get('sku', '')).strip()
                b = d.get('brand', {})
                brand = b.get('name', '') if isinstance(b, dict) else str(b)
                offers = d.get('offers', {})
                if isinstance(offers, dict):
                    avail = offers.get('availability', '')
                    try:
                        price_tnd = float(str(offers.get('price', '0')).replace(',', '.'))
                    except:
                        pass
                img = d.get('image', [])
                if isinstance(img, list):
                    images = img
                elif isinstance(img, str):
                    images = [img]
        except:
            pass

    if not title:
        m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
        if m:
            title = re.sub(r'<[^>]+>', '', m.group(1)).strip()

    if not title:
        return None

    # Stock status
    text_lower = html.lower()
    if "sur commande" in text_lower or "preorder" in avail.lower():
        stock_status = "ON_ORDER"
    elif "outofstock" in avail.lower() or "rupture" in text_lower:
        stock_status = "OUT_OF_STOCK"
    else:
        stock_status = "IN_STOCK"

    # Category slug from URL
    url_clean = url.replace("https://protein.tn/", "").strip("/")
    parts = url_clean.split("/")
    category_slug = parts[0] if len(parts) >= 2 else "autres"
    slug = parts[1] if len(parts) >= 2 else parts[0]

    return {
        'sourceUrl': url,
        'slug': slug,
        'sourceSku': sku,
        'title': title,
        'normalizedTitle': normalize_text(title),
        'brand': brand.strip() or "Non spécifiée",
        'normalizedBrand': normalize_text(brand),
        'categorySlug': category_slug,
        'priceTnd': price_tnd,
        'stockStatus': stock_status,
        'format': extract_format(title),
        'images': images
    }

def main():
    log("==================================================")
    log("PHASE 3: DISCOVERING PROTEIN.TN CATALOG")
    log("==================================================")

    cache_file = "scripts/protein_catalog_cache.json"
    products = {}

    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached_list = json.load(f)
                for p in cached_list:
                    products[p['sourceUrl']] = p
            log(f"✓ Loaded {len(products)} products from previous cache.")
        except Exception as e:
            log(f"Cache load error: {e}")

    # Fetch sitemaps
    sitemaps = [
        'https://protein.tn/sitemaps/products-0.xml',
        'https://protein.tn/sitemaps/products-1.xml',
        'https://protein.tn/sitemaps/products-2.xml',
    ]
    all_urls = set()
    for sm in sitemaps:
        log(f"Fetching sitemap: {sm}...")
        xml = fetch_url(sm, timeout=15)
        if xml:
            urls = re.findall(r'<loc>([^<]+)</loc>', xml)
            log(f"  Found {len(urls)} URLs.")
            all_urls.update(urls)

    log(f"Total Unique Product URLs in Sitemaps: {len(all_urls)}")
    to_crawl = [u for u in all_urls if u not in products]
    log(f"URLs remaining to crawl: {len(to_crawl)}")

    if to_crawl:
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=35) as executor:
            future_to_url = {executor.submit(lambda u: (u, fetch_url(u)), url): url for url in to_crawl}
            count = 0
            for future in as_completed(future_to_url):
                count += 1
                url, html = future.result()
                if html:
                    p = parse_product(url, html)
                    if p:
                        products[url] = p
                
                if count % 200 == 0 or count == len(to_crawl):
                    elapsed = time.time() - start_time
                    log(f"  Progress: {count}/{len(to_crawl)} ({len(products)} valid products, {count/elapsed:.1f} req/s)")
                    # Save checkpoint
                    with open(cache_file, "w", encoding="utf-8") as f:
                        json.dump(list(products.values()), f, ensure_ascii=False, indent=2)

        log(f"✓ Crawl completed. Total products collected: {len(products)}")
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(list(products.values()), f, ensure_ascii=False, indent=2)

    product_list = list(products.values())

    # ==================================================
    # PHASE 4 & 5: NORMALIZATION & MULTI-LEVEL DUPLICATE DETECTION
    # ==================================================
    log("\n==================================================")
    log("PHASE 5: MULTI-LEVEL DUPLICATE DETECTION")
    log("==================================================")

    # Fetch production database products
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)
    stdin, stdout, stderr = client.exec_command(
        'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug, name FROM \\"Product\\";"'
    )
    db_rows = stdout.read().decode('utf-8').strip().splitlines()
    client.close()

    existing_db = []
    for r in db_rows:
        if r.strip():
            parts = r.split('|')
            if len(parts) >= 3:
                existing_db.append({
                    'id': parts[0],
                    'slug': parts[1],
                    'name': parts[2],
                    'normalizedName': normalize_text(parts[2])
                })
    log(f"Existing ParaTunisie DB Products: {len(existing_db)}")

    existing_slugs = {p['slug']: p for p in existing_db}
    existing_names = {p['normalizedName']: p for p in existing_db}

    matched_exact = []
    potential_duplicates = []
    new_products = []

    for p in product_list:
        p_slug = p['slug']
        p_norm = p['normalizedTitle']

        # Level 1: Exact Slug Match
        if p_slug in existing_slugs:
            matched_exact.append({
                'source': p,
                'target': existing_slugs[p_slug],
                'rule': 'LEVEL 1: Exact Slug Match'
            })
            continue

        # Level 2: Exact Normalized Title Match
        if p_norm in existing_names:
            matched_exact.append({
                'source': p,
                'target': existing_names[p_norm],
                'rule': 'LEVEL 2: Exact Normalized Name Match'
            })
            continue

        # Level 3: Fuzzy Overlap (>75% token overlap)
        fuzzy_match = None
        p_tokens = set(p_norm.split())
        for ex in existing_db:
            ex_tokens = set(ex['normalizedName'].split())
            if not p_tokens or not ex_tokens:
                continue
            overlap = p_tokens.intersection(ex_tokens)
            score = len(overlap) / max(len(p_tokens), len(ex_tokens))
            if score >= 0.75:
                fuzzy_match = (ex, score)
                break

        if fuzzy_match:
            potential_duplicates.append({
                'source': p,
                'target': fuzzy_match[0],
                'confidence': f"{fuzzy_match[1]*100:.0f}%",
                'rule': f"LEVEL 3: Fuzzy Token Overlap ({fuzzy_match[1]*100:.0f}%)"
            })
        else:
            new_products.append(p)

    # Stats
    in_stock_count = sum(1 for p in new_products if p['stockStatus'] == 'IN_STOCK')
    on_order_count = sum(1 for p in new_products if p['stockStatus'] == 'ON_ORDER')
    out_of_stock_count = sum(1 for p in new_products if p['stockStatus'] == 'OUT_OF_STOCK')

    brands_map = {}
    for p in product_list:
        b = p['brand']
        brands_map[b] = brands_map.get(b, 0) + 1

    cats_map = {}
    for p in product_list:
        c = p['categorySlug']
        cats_map[c] = cats_map.get(c, 0) + 1

    # ==================================================
    # PHASE 6: DRY RUN REPORT GENERATION
    # ==================================================
    report = {
        'totalDiscovered': len(product_list),
        'existingDatabaseCount': len(existing_db),
        'alreadyExistingMatched': len(matched_exact),
        'potentialDuplicates': len(potential_duplicates),
        'newProductsToImport': len(new_products),
        'breakdown': {
            'inStock': in_stock_count,
            'onOrder_SurCommande': on_order_count,
            'outOfStock': out_of_stock_count,
        },
        'totalBrands': len(brands_map),
        'topBrands': sorted(brands_map.items(), key=lambda x: x[1], reverse=True)[:20],
        'categories': sorted(cats_map.items(), key=lambda x: x[1], reverse=True),
        'sampleMatches': matched_exact[:10],
        'samplePotentialDuplicates': potential_duplicates[:10],
        'sampleNewProducts': new_products[:10]
    }

    report_file = "scripts/dry_run_import_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    log("\n==================================================")
    log("PHASE 6: DRY-RUN REPORT COMPLETED")
    log("==================================================")
    log(f"✓ Total Discovered on Protein.tn : {report['totalDiscovered']}")
    log(f"✓ Existing DB Products           : {report['existingDatabaseCount']}")
    log(f"✓ Already Existing Matched (Safe): {report['alreadyExistingMatched']}")
    log(f"✓ Potential Duplicates (Review) : {report['potentialDuplicates']}")
    log(f"✓ NEW Products to Import         : {report['newProductsToImport']}")
    log(f"   - En Stock (IN_STOCK)         : {in_stock_count}")
    log(f"   - Sur Commande (ON_ORDER)     : {on_order_count}")
    log(f"   - Rupture (OUT_OF_STOCK)      : {out_of_stock_count}")
    log(f"✓ Total Brands Discovered        : {len(brands_map)}")
    log(f"✓ Total Categories Discovered    : {len(cats_map)}")
    log(f"\nReport JSON written to: {report_file}")

if __name__ == '__main__':
    main()
