import urllib.request
import re

url = "https://paratunisie.com/produits/100-creatine-monohydrate-300g-biotech-usa"
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode("utf-8", errors="ignore")

# Find all img tags and Next.js image sources
imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
print("=== IMG SRCS ON PDP ===")
for src in imgs:
    print(" ", src)

# Check for Next.js image optimizer URLs (_next/image?url=...)
next_imgs = re.findall(r'/_next/image\?url=([^&"]+)', html)
print("=== NEXT IMAGE URLS ===")
for u in next_imgs:
    import urllib.parse
    decoded = urllib.parse.unquote(u)
    print(" ", decoded)
