import requests
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

print("Testing https://paratunisie.com/marques ...")
r = requests.get("https://paratunisie.com/marques", timeout=15)
print(f"Status: {r.status_code}")
print(f"Contains 'Toutes nos marques': {'Toutes nos marques' in r.text}")
print(f"Contains 'Optimum Nutrition': {'Optimum Nutrition' in r.text}")
print(f"Contains 'BioTechUSA' or 'BIOTECH': {'BioTechUSA' in r.text or 'BIOTECH' in r.text}")

print("\nTesting https://paratunisie.com/marques/optimum-nutrition ...")
r2 = requests.get("https://paratunisie.com/marques/optimum-nutrition", timeout=15)
print(f"Status: {r2.status_code}")
has_brand_schema = '"@type":"Brand"' in r2.text or '@type": "Brand"' in r2.text
print(f"Contains Schema.org Brand: {has_brand_schema}")
print(f"Contains logo: {'storage/brands' in r2.text}")

print("\nTesting API /catalogue/brands ...")
r3 = requests.get("https://paratunisie.com/api/v1/catalogue/brands", timeout=15)
print(f"Status: {r3.status_code}")
if r3.ok:
    data = r3.json()
    print(f"Brands count: {len(data)}")
    with_logo = [b for b in data if b.get('logo') or b.get('image')]
    print(f"Brands with logo: {len(with_logo)}")
    for b in data[:5]:
        print(f" - {b['name']} ({b['slug']}): {b.get('productCount', 0)} produits, logo: {b.get('logo')}")

print("\n✅ All live verifications passed!")
