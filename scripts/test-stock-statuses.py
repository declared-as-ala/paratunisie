import urllib.request
import re
import json
import ssl
from bs4 import BeautifulSoup
import time

ctx = ssl._create_unverified_context()

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            return res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return None

# Fetch products-0.xml and sample 50 products to find out-of-stock and in-stock examples
xml = fetch('https://protein.tn/sitemaps/products-0.xml')
urls = re.findall(r'<loc>([^<]+)</loc>', xml)
print(f"Testing sample of 40 URLs from {len(urls)} total...")

in_stock_count = 0
out_of_stock_count = 0
sur_commande_count = 0
samples_found = []

for u in urls[:40]:
    html = fetch(u)
    if not html:
        continue
    soup = BeautifulSoup(html, 'html.parser')
    
    # Check JSON-LD
    avail = "UNKNOWN"
    price = "0"
    title = ""
    brand = ""
    sku = ""
    images = []
    
    scripts = soup.find_all('script', type='application/ld+json')
    for s in scripts:
        try:
            d = json.loads(s.string)
            if isinstance(d, dict) and d.get('@type') == 'Product':
                title = d.get('name', '')
                sku = d.get('sku', '')
                b = d.get('brand', {})
                brand = b.get('name', '') if isinstance(b, dict) else str(b)
                offers = d.get('offers', {})
                if isinstance(offers, dict):
                    avail = offers.get('availability', '')
                    price = offers.get('price', '')
                images = d.get('image', [])
        except:
            pass

    # Check DOM text for "sur commande" or "rupture"
    text_lower = soup.get_text().lower()
    is_sur_commande = "sur commande" in text_lower or "preorder" in avail.lower()
    is_out_of_stock = "outofstock" in avail.lower() or "rupture" in text_lower or "indisponible" in text_lower

    status = "IN_STOCK"
    if is_sur_commande:
        status = "ON_ORDER"
        sur_commande_count += 1
    elif is_out_of_stock:
        status = "OUT_OF_STOCK"
        out_of_stock_count += 1
    else:
        in_stock_count += 1

    samples_found.append({
        'url': u,
        'title': title,
        'brand': brand,
        'sku': sku,
        'price': price,
        'status': status,
        'images_count': len(images)
    })

print(f"\nSample results: In Stock: {in_stock_count}, Out of Stock: {out_of_stock_count}, Sur Commande: {sur_commande_count}")
print("\nFirst 10 samples:")
for s in samples_found[:10]:
    print(f" - [{s['status']}] {s['title']} ({s['brand']}) - {s['price']} TND - SKU: {s['sku']} ({s['url']})")
