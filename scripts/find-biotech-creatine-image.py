import urllib.request
import re
import json

url = "https://protein.tn/shop?q=creatine+biotech"
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
        html = res.read().decode("utf-8", errors="ignore")
        # Find product links and images
        matches = re.findall(r'href="([^"]*creatine[^"]*biotech[^"]*)"', html, re.I)
        print("Matches in shop search:", matches)
        
        # Look for images
        images = re.findall(r'https://admin\.protein\.tn/storage/produits/[^"\'\s]+', html)
        print("Images in search:", list(set(images))[:5])
except Exception as e:
    print("Error:", e)
