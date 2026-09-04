import urllib.request
import re

url = 'https://protein.tn/immunite/nutribiotic-immunity-sodium-ascorbate-crystalline-powder-1-kg'
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode('utf-8', errors='ignore')

# Search for any text indicating stock
print("--- ALL BUTTONS ---")
for m in re.finditer(r'<button[^>]*>(.*?)</button>', html, re.DOTALL | re.I):
    btn_text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    if btn_text:
        print("BTN:", btn_text)

print("--- TEXT NEAR 'COMMANDE' OR 'STOCK' ---")
for m in re.finditer(r'([^<>]{1,50}(?:commande|stock|disponible|panier)[^<>]{1,50})', html, re.I):
    print("MATCH:", m.group(1).strip())
