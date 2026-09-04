import urllib.request
import re

url = 'https://protein.tn/whey-proteine/nitro-tech-ripped-1-8-kg-muscletech'
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode('utf-8', errors='ignore')

print("URL:", url)
# Check for "rupture", "en stock", "sur commande", "ajouter au panier"
print("Contains 'ajouter au panier':", bool(re.search(r'ajouter au panier', html, re.I)))
print("Contains 'en stock':", bool(re.search(r'en stock', html, re.I)))
print("Contains 'sur commande':", bool(re.search(r'sur commande', html, re.I)))
print("Contains 'rupture':", bool(re.search(r'rupture', html, re.I)))

# Print all buttons in main form
for m in re.finditer(r'<button[^>]*>(.*?)</button>', html, re.DOTALL | re.I):
    text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    print("BTN:", text)

# Print any script data or JSON-LD
for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL):
    print("JSON-LD:", m.group(1)[:200])
