import urllib.request
import re

url = "https://protein.tn/shop?inStock=true"
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode("utf-8", errors="ignore")

# Find all hrefs in the shop page
hrefs = re.findall(r'href=["\'](/[^"\']+)["\']', html)
print(f"Total relative hrefs found: {len(hrefs)}")
prod_hrefs = [h for h in hrefs if len(h.strip("/").split("/")) == 2 and not h.startswith(("/_next", "/assets", "/shop", "/category", "/marques", "/conseils", "/diagnostic", "/contact"))]
print(f"Product hrefs found ({len(prod_hrefs)}):")
for h in prod_hrefs[:20]:
    print(" ", h)
