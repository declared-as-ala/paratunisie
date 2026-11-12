import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== 1. HOMEPAGE CHECKS ===")
req = urllib.request.Request('https://paratunisie.com/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')

print("Original Hero Present:", "Commencez par votre besoin" in html or "nutrition sportive" in html.lower())
print("Original Footer Present:", "ParaTunisie. Tous droits réservés" in html)
print("À la une Present:", "À la une" in html)
print("ProActive Present in À la une:", "anabolic-whey-80" in html.lower() or "proactive" in html.lower())

for cat in ['creatine', 'gainers-proteines', 'whey-proteine', 'ashwagandha', 'vitamines']:
    print(f"Category /{cat} present in category section:", f'href="/{cat}"' in html)

print("\n=== 2. PRODUCT REVIEWS & STAR RATING SCHEMA ===")
req2 = urllib.request.Request('https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr', headers={'User-Agent': 'Mozilla/5.0'})
p_html = urllib.request.urlopen(req2, timeout=15).read().decode('utf-8')

scripts = re.findall(r'<script type="application/ld\+json">(.*?)</script>', p_html, re.DOTALL)
for s in scripts:
    try:
        data = json.loads(s)
        if data.get('@type') == 'Product':
            print("Product Name:", data.get('name'))
            print("aggregateRating:", json.dumps(data.get('aggregateRating'), ensure_ascii=False))
            reviews = data.get('review', [])
            print(f"Reviews Count in JSON-LD: {len(reviews)}")
            if len(reviews) > 0:
                print("First Review in JSON-LD:", json.dumps(reviews[0], ensure_ascii=False))
    except Exception:
        pass
