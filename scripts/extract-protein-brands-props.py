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
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    html = resp.read().decode("utf-8")

soup = BeautifulSoup(html, "html.parser")
next_data = soup.find("script", id="__NEXT_DATA__")
if next_data:
    data = json.loads(next_data.string)
    props = data.get("props", {}).get("pageProps", {})
    print("Keys in pageProps:", props.keys())
    with open("scripts/protein_brands_props.json", "w", encoding="utf-8") as f:
        json.dump(props, f, indent=2, ensure_ascii=False)
    print("Wrote protein_brands_props.json")
else:
    print("No __NEXT_DATA__ found, checking HTML structure...")
    # Look for cards
    cards = soup.find_all("div", class_=re.compile(r"brand|card|grid", re.I))
    print(f"Found {len(cards)} elements")
