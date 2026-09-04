import urllib.request
import re
import json

ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

in_stock_products = []
in_stock_slugs = []

EXCLUDE_PREFIXES = (
    "/_next", "/assets", "/shop", "/category", "/marques", "/conseils", "/diagnostic",
    "/contact", "/a-propos", "/panier", "/checkout", "/compte", "/mentions-legales",
    "/politique-de-confidentialite", "/livraison", "/retours", "/aide", "/besoins"
)

# Total 147 items on protein.tn = Pages 1 through 7 (last page has remaining 3 items)
for page in range(1, 8):
    url = f"https://protein.tn/shop?inStock=true&page={page}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with opener.open(req, timeout=15) as res:
            html = res.read().decode("utf-8", errors="ignore")
            
            # Find product cards
            # On protein.tn each card has <h3 ...>Name</h3> and href="/cat/slug"
            # Extract (category, slug, title)
            cards = re.findall(r'<a[^>]+href=["\'](/[^"\']+)["\'][^>]*>.*?<h3[^>]*>(.*?)</h3>', html, re.DOTALL | re.I)
            
            seen_in_page = set()
            for href, title in cards:
                if href.startswith(EXCLUDE_PREFIXES):
                    continue
                parts = href.strip("/").split("/")
                if len(parts) == 2:
                    cat, slug = parts[0], parts[1]
                    clean_title = re.sub(r'<[^>]+>', '', title).strip()
                    if slug not in seen_in_page:
                        seen_in_page.add(slug)
                        in_stock_slugs.append(slug)
                        in_stock_products.append({
                            'page': page,
                            'category': cat,
                            'slug': slug,
                            'title': clean_title
                        })

            print(f"Page {page}: found {len(seen_in_page)} products.")

    except Exception as e:
        print(f"Error on page {page}: {e}")

print("=" * 60)
print(f"TOTAL EXACT IN-STOCK PRODUCTS ON PROTEIN.TN: {len(in_stock_products)} ({len(set(in_stock_slugs))} unique slugs)")
print("=" * 60)

with open("scripts/exact_146_in_stock_products.json", "w", encoding="utf-8") as f:
    json.dump(in_stock_products, f, indent=2, ensure_ascii=False)

for p in in_stock_products[:15]:
    print(f"  - {p['title']} ({p['slug']})")
