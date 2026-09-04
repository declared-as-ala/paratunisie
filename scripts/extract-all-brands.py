import json
import re
import ssl
import urllib.parse
import urllib.request
import sys
from bs4 import BeautifulSoup

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request("https://protein.tn/brands", headers=headers)
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    html = resp.read().decode("utf-8")

soup = BeautifulSoup(html, "html.parser")

# Find all cards/links
brands = []
for a in soup.find_all("a"):
    img = a.find("img")
    href = a.get("href", "").strip()
    if not href or href == "#" or href == "/":
        continue
    
    # Check if there is an image with storage/brands
    img_src = ""
    if img:
        raw_src = img.get("src") or img.get("data-src") or ""
        if "url=" in raw_src:
            m = re.search(r"url=([^&]+)", raw_src)
            if m:
                img_src = urllib.parse.unquote(m.group(1))
        elif "storage/brands" in raw_src:
            img_src = raw_src

    alt = img.get("alt", "") if img else ""
    
    # Extract brand name
    # Usually in alt "Name — marque de compléments..." or in card text
    name = ""
    if " — marque" in alt:
        name = alt.split(" — marque")[0].strip()
    elif alt:
        name = alt.strip()
    
    # If no name from alt, get text
    text = a.get_text(separator=" ", strip=True)
    if not name and text:
        name = text.split("produit")[0].strip()
    
    if img_src and name:
        slug = href.lstrip("/")
        brands.append({
            "name": name,
            "slug": slug,
            "logo": img_src,
            "rawText": text,
            "href": href
        })

print(f"Extracted {len(brands)} unique brands with direct logos!")
# Deduplicate by slug
seen = set()
unique_brands = []
for b in brands:
    if b["slug"] not in seen:
        seen.add(b["slug"])
        unique_brands.append(b)

print(f"Unique brands: {len(unique_brands)}")
for b in unique_brands[:30]:
    print(f"  • [{b['slug']}] {b['name']} -> Logo: {b['logo']}")

with open("scripts/all_protein_brands.json", "w", encoding="utf-8") as f:
    json.dump(unique_brands, f, indent=2, ensure_ascii=False)
print("Saved to scripts/all_protein_brands.json")
