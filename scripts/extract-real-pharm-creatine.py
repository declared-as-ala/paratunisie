import requests
import json
import re

url = "https://protein.tn/creatine/creatine-monohydrate-150gr-real-pharm"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(url, headers=headers)
html = r.text

# Try to find Next.js self.__next_f or JSON-LD
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
json_lds = []
for s in scripts:
    if 'schema.org' in s and 'Product' in s:
        try:
            json_lds.append(json.loads(s))
        except:
            pass

print("=== JSON-LD PRODUCT ===")
for j in json_lds:
    print(json.dumps(j, indent=2, ensure_ascii=False))

# Look for next f strings containing product data
chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html)
full_f = "".join(chunks).replace('\\"', '"').replace('\\\\', '\\')

# Find prices, variants, images, descriptions
prices = re.findall(r'(\d+)\s*DT', html)
print("\n=== PRICES IN HTML ===")
print(set(prices))

# Search for images
images = re.findall(r'https://admin\.protein\.tn/storage/produits/[^"\'\s]+', html)
print("\n=== PRODUCT IMAGES ===")
print(list(set(images)))

# Extract description and details
with open("scripts/protein_creatine_realpharm.html", "w", encoding="utf-8") as f:
    f.write(html)

print("\nHTML saved to scripts/protein_creatine_realpharm.html")
