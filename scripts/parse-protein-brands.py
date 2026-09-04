import re
import ssl
import urllib.request
import sys
from bs4 import BeautifulSoup
import json

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

# Look for all script tags that might contain brand json or Next.js state
soup = BeautifulSoup(html, "html.parser")
scripts = soup.find_all("script")
print(f"Total scripts: {len(scripts)}")
for i, s in enumerate(scripts):
    text = s.string or ""
    if "admin.protein.tn/storage/brands" in text:
        print(f"Script {i} contains brand image references! Length: {len(text)}")
        # Let's search for JSON or brand objects
        with open(f"scripts/script_{i}.txt", "w", encoding="utf-8") as f:
            f.write(text)

# Also let's extract all brand links from HTML
brands_found = []
for a in soup.find_all("a"):
    img = a.find("img")
    text = a.get_text(strip=True)
    href = a.get("href", "")
    if img or "/brand" in href or "/marque" in href or "/shop" in href or "/products" in href:
        img_src = ""
        if img:
            img_src = img.get("src") or img.get("data-src") or ""
        alt = img.get("alt") if img else ""
        if "storage/brands" in img_src or "storage%2Fbrands" in img_src or "storage/brands" in str(a):
            brands_found.append({
                "href": href,
                "text": text,
                "alt": alt,
                "img": img_src,
                "html": str(a)[:300]
            })

print(f"\nFound {len(brands_found)} brand elements from HTML links!")
with open("scripts/protein_brands_extracted.json", "w", encoding="utf-8") as f:
    json.dump(brands_found, f, indent=2, ensure_ascii=False)
print("Saved to scripts/protein_brands_extracted.json")
