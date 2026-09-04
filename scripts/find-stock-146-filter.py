import urllib.request
import re
import json

url = "https://protein.tn/shop"
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode("utf-8", errors="ignore")

# Find all occurrences of 146 or stock filters
print("--- SEARCHING FOR 146 OR STOCK FILTER IN SHOP HTML ---")
for m in re.finditer(r'([^<>]{1,60}(?:146|stock|disponib|disponible)[^<>]{1,60})', html, re.I):
    print("MATCH:", m.group(1).strip())
