import json
import re
import ssl
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
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        html = resp.read().decode("utf-8")
    print(f"HTML Length: {len(html)}")
    
    soup = BeautifulSoup(html, "html.parser")
    
    # Check title and headings
    print("Page Title:", soup.title.string if soup.title else "No title")
    
    # Look for brand cards or links
    brand_links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/brands/" in href or "/brand/" in href or "/marque/" in href or "/marques/" in href:
            img = a.find("img")
            img_src = img["src"] if img and img.has_attr("src") else (img["data-src"] if img and img.has_attr("data-src") else "")
            name = a.get_text(strip=True) or (img.get("alt") if img else "")
            brand_links.append({
                "href": href,
                "name": name,
                "img": img_src
            })
    
    print(f"\nFound {len(brand_links)} brand links matching pattern.")
    for b in brand_links[:20]:
        print(f"  • {b['name']} -> {b['href']} | Img: {b['img']}")
        
    # Also find any images on the page
    images = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        alt = img.get("alt") or ""
        if "brand" in src.lower() or "marque" in src.lower() or "logo" in src.lower() or "brand" in alt.lower():
            images.append({"src": src, "alt": alt})
    print(f"\nFound {len(images)} potential brand logo images.")
    for im in images[:20]:
        print(f"  • [{im['alt']}] {im['src']}")
        
except Exception as e:
    print(f"Error fetching: {e}")
