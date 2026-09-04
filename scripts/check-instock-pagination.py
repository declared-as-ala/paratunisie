import urllib.request
import re
import json

url = "https://protein.tn/shop?inStock=true"
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode("utf-8", errors="ignore")

# Find serverPagination
m = re.search(r'\"serverPagination\"\s*:\s*(\{[^}]+\})', html)
if m:
    print("serverPagination:", m.group(1))

m_instock = re.search(r'\"inStockCount\"\s*:\s*(\d+)', html)
if m_instock:
    print("inStockCount:", m_instock.group(1))

# Let's find the totalPages for inStock
m_tp = re.search(r'\"totalPages\"\s*:\s*(\d+)', html)
if m_tp:
    print("totalPages:", m_tp.group(1))
