import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor

with open("scripts/protein_catalog_cache.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from cache.")

def check_url(p):
    url = p['sourceUrl']
    ctx = urllib.request.ssl._create_unverified_context()
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as res:
            html = res.read().decode("utf-8", errors="ignore")
            m = re.search(r'\"availability\"\s*:\s*\"https?://schema\.org/([^\"]+)\"', html)
            avail = m.group(1) if m else "Unknown"
            
            # Also check if "Ce produit n'est pas en stock" is present
            is_sur_commande = "Ce produit n'est pas en stock" in html
            has_add_cart = bool(re.search(r'Ajouter au panier', html, re.I))
            return {
                'title': p['title'],
                'url': url,
                'schema': avail,
                'isSurCommande': is_sur_commande,
                'hasAddCart': has_add_cart
            }
    except Exception as e:
        return {'title': p['title'], 'url': url, 'schema': 'Error', 'error': str(e)}

# Test 100 products in parallel with 20 workers
with ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(check_url, products[:100]))

schema_counts = {}
sur_commande_counts = {}
for r in results:
    s = r.get('schema', 'Unknown')
    schema_counts[s] = schema_counts.get(s, 0) + 1
    sc = r.get('isSurCommande', False)
    sur_commande_counts[sc] = sur_commande_counts.get(sc, 0) + 1

print("=" * 60)
print("FAST PARALLEL AUDIT OF 100 PROTEIN.TN PRODUCTS")
print("=" * 60)
print("Schema Availability Breakdown:", schema_counts)
print("Text 'Ce produit n'est pas en stock' Breakdown:", sur_commande_counts)

in_stock_items = [r for r in results if r.get('schema') == 'InStock' or not r.get('isSurCommande')]
print(f"\nItems that are actually IN STOCK ({len(in_stock_items)}):")
for item in in_stock_items[:10]:
    print(f"  - {item['title']} ({item['url']}) [schema={item.get('schema')}]")
