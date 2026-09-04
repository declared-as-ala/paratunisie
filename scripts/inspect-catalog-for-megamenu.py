import json
import ssl
import urllib.request
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://paratunisie.com/api/v1/catalogue/products?limit=150")
with urllib.request.urlopen(req, context=ctx) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    products = data.get("data", [])

print(f"Total products fetched: {len(products)}")

categories = {}
for p in products:
    cat = p.get("category", {}).get("slug") or "uncategorized"
    categories.setdefault(cat, []).append(p)

for cat, prods in sorted(categories.items()):
    print(f"\n=== CATEGORY: {cat} ({len(prods)} products) ===")
    for p in prods:
        price = p.get('priceMillimes') or (p.get('sizes', [{}])[0].get('priceMillimes', 0) if p.get('sizes') else 0)
        print(f"  • [{p['id']}] {p['name']} | Marque: {p.get('brand', {}).get('name')} | Slug: {p['slug']} | Prix: {price/1000} DT | Img: {p.get('image')}")
