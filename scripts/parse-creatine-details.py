import requests
import json
import re

with open("scripts/protein_creatine_realpharm.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's search for price patterns, original_price, discount, etc.
matches = re.findall(r'(\{[^{}]*"name"\s*:\s*"CREATINE MONOHYDRATE 150GR[^{}]*\})', html)
for m in matches[:5]:
    print("MATCH:", m)

# Let's search for "prix", "price", "promo", "description", "arome", "parfum"
next_data = re.findall(r'self\.__next_f\.push\(\[1,"(.*)"\]\)', html)
for line in next_data:
    if "CREATINE MONOHYDRATE 150GR" in line:
        # unescape
        clean = line.encode('utf-8').decode('unicode_escape', 'ignore')
        with open("scripts/next_f_creatine.txt", "w", encoding="utf-8") as out:
            out.write(clean)
        print("Wrote next_f_creatine.txt")
        break

# Parse JSON strings in text
with open("scripts/next_f_creatine.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Find product object
for p_match in re.finditer(r'\{"id":\s*(\d+).*?"name":\s*"([^"]+)".*?\}', text):
    print("Found product:", p_match.group(0)[:300])
    break
