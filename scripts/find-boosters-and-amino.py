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

req = urllib.request.Request("https://paratunisie.com/api/v1/catalogue/products?limit=300")
with urllib.request.urlopen(req, context=ctx) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    products = data.get("data", [])

print(f"Total products: {len(products)}")

for p in products:
    name_lower = (p.get("name") or "").lower()
    slug_lower = (p.get("slug") or "").lower()
    cat_slug = ((p.get("category") or {}).get("slug") or "").lower()
    if any(k in name_lower or k in slug_lower or k in cat_slug for k in ["pre-workout", "rage", "psychotic", "booster", "carnitine", "lipo", "bcaa", "eaa", "amino", "glutamine", "arginine"]):
        price = p.get('priceMillimes') or (p.get('sizes', [{}])[0].get('priceMillimes', 0) if p.get('sizes') else 0)
        print(f"[{cat_slug}] {p['name']} | {p.get('brand', {}).get('name')} | {p['slug']} | {price/1000} DT | {p.get('image')}")
