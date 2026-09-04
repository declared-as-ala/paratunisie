import urllib.request
import re
import json

with open("scripts/protein_catalog_cache.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products in cache: {len(products)}")

# Let's test 50 product pages and check their exact schema availability
ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

results = {"InStock": 0, "BackOrder": 0, "OutOfStock": 0, "Other": 0}
sample_in_stock = []
sample_backorder = []

for i, p in enumerate(products[:40]):
    url = p['sourceUrl']
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with opener.open(req, timeout=10) as res:
            html = res.read().decode("utf-8", errors="ignore")
            # Extract JSON-LD availability
            m = re.search(r'\"availability\"\s*:\s*\"https?://schema\.org/([^\"]+)\"', html)
            if m:
                avail = m.group(1)
                results[avail] = results.get(avail, 0) + 1
                if avail == "InStock":
                    sample_in_stock.append(p['title'])
                elif avail == "BackOrder":
                    sample_backorder.append(p['title'])
            else:
                results["Other"] += 1
    except Exception as e:
        pass

print("Schema Availability Distribution in sample:", results)
print("Sample InStock products:", sample_in_stock[:5])
print("Sample BackOrder products:", sample_backorder[:5])
