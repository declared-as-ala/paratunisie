import urllib.request
import re
import json

ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

in_stock_slugs = set()
in_stock_items = []

# Exclude non-product path prefixes
EXCLUDE_PREFIXES = (
    "/_next", "/assets", "/shop", "/category", "/marques", "/conseils", "/diagnostic",
    "/contact", "/a-propos", "/panier", "/checkout", "/compte", "/mentions-legales",
    "/politique-de-confidentialite", "/livraison", "/retours", "/aide", "/besoins"
)

for page in range(1, 20):
    url = f"https://protein.tn/shop?inStock=true&page={page}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with opener.open(req, timeout=15) as res:
            html = res.read().decode("utf-8", errors="ignore")
            
            hrefs = re.findall(r'href=["\'](/[^"\']+)["\']', html)
            page_slugs = set()
            for h in hrefs:
                if h.startswith(EXCLUDE_PREFIXES):
                    continue
                parts = h.strip("/").split("/")
                if len(parts) == 2:
                    cat_slug, prod_slug = parts[0], parts[1]
                    page_slugs.add(prod_slug)
            
            new_slugs = page_slugs.difference(in_stock_slugs)
            print(f"Page {page}: {len(page_slugs)} product links on page, {len(new_slugs)} new. Total so far: {len(in_stock_slugs) + len(new_slugs)}")
            
            if not new_slugs:
                print(f"No new products on page {page}, stopping.")
                break
                
            in_stock_slugs.update(new_slugs)

    except Exception as e:
        print(f"Error on page {page}: {e}")
        break

print("=" * 60)
print(f"TOTAL EXACT IN-STOCK PRODUCTS FROM PROTEIN.TN: {len(in_stock_slugs)}")
print("=" * 60)

with open("scripts/exact_protein_in_stock_slugs.json", "w", encoding="utf-8") as f:
    json.dump(sorted(list(in_stock_slugs)), f, indent=2)

print("Saved to scripts/exact_protein_in_stock_slugs.json")
