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

print("=== PRE-WORKOUT & FAT BURNERS ===")
for p in products:
    cat = (p.get("category", {}) or {}).get("slug") or ""
    if cat in ["pre-workout", "l-carnitine", "bruleur-de-graisse", "energie"]:
        price = p.get('priceMillimes') or (p.get('sizes', [{}])[0].get('priceMillimes', 0) if p.get('sizes') else 0)
        print(f"  • [{p['id']}] {p['name']} | Marque: {p.get('brand', {}).get('name')} | Slug: {p['slug']} | Prix: {price/1000} DT | Img: {p.get('image')}")

print("\n=== BCAA & ACIDES AMINES ===")
for p in products:
    cat = (p.get("category", {}) or {}).get("slug") or ""
    if cat in ["bcaa", "acides-amines", "recuperation", "glutamine"]:
        price = p.get('priceMillimes') or (p.get('sizes', [{}])[0].get('priceMillimes', 0) if p.get('sizes') else 0)
        print(f"  • [{p['id']}] {p['name']} | Marque: {p.get('brand', {}).get('name')} | Slug: {p['slug']} | Prix: {price/1000} DT | Img: {p.get('image')}")
