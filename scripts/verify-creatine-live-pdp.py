import requests
import json
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

url = "https://paratunisie.com/produits/creatine-monohydrate-150gr-real-pharm"
print(f"Testing live PDP: {url} ...")
r = requests.get(url, timeout=15)
print(f"Status Code: {r.status_code}")
print(f"Contains 'CREATINE MONOHYDRATE 150GR': {'CREATINE MONOHYDRATE 150GR' in r.text or 'Creatine Monohydrate' in r.text}")
print(f"Contains '59': {'59' in r.text}")
print(f"Contains 'Real Pharm': {'Real Pharm' in r.text}")
print(f"Contains image: {'gtKdsfqVL9xlxfcE9sxI.webp' in r.text}")

print("\nTesting API /catalogue/products/creatine-monohydrate-150gr-real-pharm ...")
r2 = requests.get("https://paratunisie.com/api/v1/catalogue/products/creatine-monohydrate-150gr-real-pharm", timeout=15)
print(f"API Status Code: {r2.status_code}")
if r2.ok:
    d = r2.json()
    print("Product Name:", d.get("name"))
    print("Price:", d.get("variants", [{}])[0].get("priceMillimes", 0) / 1000, "DT")
    print("Stock:", d.get("variants", [{}])[0].get("stock"))
    print("SEO Title:", d.get("seoTitle"))
    print("SEO H1:", d.get("seoH1"))
    print("SEO Description:", d.get("seoDescription"))
    print("SEO Score:", d.get("seoScore"))

print("\n✅ Verification complete!")
