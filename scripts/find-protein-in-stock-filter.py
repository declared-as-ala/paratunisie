import urllib.request
import re
import json

test_urls = [
    "https://protein.tn/en-stock",
    "https://protein.tn/disponible",
    "https://protein.tn/shop?stock=in_stock",
    "https://protein.tn/shop?in_stock=1",
    "https://protein.tn/shop?disponibilite=en-stock",
    "https://protein.tn/boutique?stock=in_stock",
    "https://protein.tn/api/products?in_stock=true"
]

ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

for u in test_urls:
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with opener.open(req, timeout=10) as res:
            html = res.read().decode("utf-8", errors="ignore")
            print(f"URL [{res.getcode()}]: {u} -> Final: {res.geturl()} (Length: {len(html)})")
            # Count products on page
            prods = re.findall(r'class="[^"]*product-card[^"]*"', html)
            print(f"  Product cards found: {len(prods)}")
    except Exception as e:
        print(f"URL [ERR]: {u} -> {e}")
