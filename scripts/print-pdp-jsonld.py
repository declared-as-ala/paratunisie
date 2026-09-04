import urllib.request
import json
import re

url = 'https://protein.tn/whey-proteine/nitro-tech-ripped-1-8-kg-muscletech'
ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
    html = res.read().decode('utf-8', errors='ignore')

for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL):
    j_str = m.group(1)
    if '"Product"' in j_str:
        j = json.loads(j_str)
        print("PRODUCT JSON-LD:")
        print(json.dumps(j, indent=2))
