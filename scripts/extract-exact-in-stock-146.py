import urllib.request
import re
import json

ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

all_in_stock_slugs = set()
all_in_stock_titles = []

# There are ~146 items, with ~24 or 36 items per page, so around 5 to 7 pages
for page in range(1, 10):
    url = f"https://protein.tn/shop?inStock=true&page={page}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with opener.open(req, timeout=15) as res:
            html = res.read().decode("utf-8", errors="ignore")
            
            # Find the server-rendered items in the page
            # Look for links to product pages /<category>/<slug>
            # On protein.tn, cards have href="/<cat>/<slug>"
            card_matches = re.findall(r'href="https://protein\.tn/([a-z0-9\-]+)/([a-z0-9\-]+)"[^>]*>.*?<h3[^>]*>(.*?)</h3>', html, re.DOTALL | re.I)
            if not card_matches:
                # Try finding product links
                card_matches = re.findall(r'<a[^>]+href="https://protein\.tn/([a-z0-9\-]+)/([a-z0-9\-]+)"', html)
            
            page_slugs = set()
            for item in card_matches:
                if isinstance(item, tuple):
                    cat, slug = item[0], item[1]
                else:
                    slug = item
                if cat not in ['shop', 'category', 'marques', 'blog', 'conseils', 'diagnostic', 'politique-de-confidentialite', 'a-propos', 'contact']:
                    page_slugs.add(slug)
            
            # Also extract JSON data
            json_matches = re.findall(r'\"slug\"\s*:\s*\"([a-z0-9\-]+)\"', html)
            for s in json_matches:
                if s not in ['shop', 'nutrition-sportive', 'complements-alimentaires', 'accessoires']:
                    page_slugs.add(s)

            print(f"Page {page}: found {len(page_slugs)} unique slugs (Total accumulated: {len(all_in_stock_slugs.union(page_slugs))})")
            
            if not page_slugs or len(page_slugs.difference(all_in_stock_slugs)) == 0:
                print(f"No new items on page {page}, stopping.")
                break
                
            all_in_stock_slugs.update(page_slugs)

    except Exception as e:
        print(f"Error page {page}: {e}")

print("=" * 60)
print(f"FOUND {len(all_in_stock_slugs)} EXACT IN-STOCK SLUGS FROM PROTEIN.TN")
print("=" * 60)

with open("scripts/exact_protein_in_stock_slugs.json", "w", encoding="utf-8") as f:
    json.dump(list(all_in_stock_slugs), f, indent=2)

print("Saved to scripts/exact_protein_in_stock_slugs.json")
