import urllib.request
import re
import json
import ssl
from bs4 import BeautifulSoup

ctx = ssl._create_unverified_context()

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
            return res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[ERR] {url}: {e}")
        return None

samples = [
    "https://protein.tn/creatine/creatine-monohydrate-ostrovit-500gr",
    "https://protein.tn/whey-proteine/anabolic-whey-80-2-25kg-proactive",
    "https://protein.tn/ashwagandha/ashwagandha-60-gelules-biotech-usa",
    "https://protein.tn/gainers-proteines/thunder-gainer-5-4kg-challenger-nutrition"
]

for url in samples:
    html = fetch(url)
    if not html:
        continue
    soup = BeautifulSoup(html, 'html.parser')
    
    print(f"\n==========================================")
    print(f"URL: {url}")
    print(f"==========================================")
    
    # Title
    title = soup.find('h1')
    print("H1 Title:", title.get_text(strip=True) if title else "NONE")
    
    # JSON-LD Schema
    scripts = soup.find_all('script', type='application/ld+json')
    for s in scripts:
        try:
            data = json.loads(s.string)
            if isinstance(data, dict) and data.get('@type') in ['Product', 'ItemPage', 'WebPage']:
                print("JSON-LD @type:", data.get('@type'))
                if data.get('@type') == 'Product':
                    print(" - Name:", data.get('name'))
                    print(" - Brand:", data.get('brand'))
                    print(" - SKU:", data.get('sku'))
                    print(" - Offers:", data.get('offers'))
                    print(" - Image:", data.get('image'))
        except:
            pass

    # Check Next.js __NEXT_DATA__ or React state if present
    next_data = soup.find('script', id='__NEXT_DATA__')
    if next_data:
        try:
            nd = json.loads(next_data.string)
            print("✓ Found __NEXT_DATA__ payload with pageProps keys:", list(nd.get('props', {}).get('pageProps', {}).keys()))
            product_data = nd.get('props', {}).get('pageProps', {}).get('product') or nd.get('props', {}).get('pageProps', {}).get('data')
            if product_data:
                print("  Product Keys:", list(product_data.keys()) if isinstance(product_data, dict) else type(product_data))
                if isinstance(product_data, dict):
                    print("  - Title:", product_data.get('title') or product_data.get('name'))
                    print("  - Price:", product_data.get('price'))
                    print("  - Regular/Old Price:", product_data.get('regular_price') or product_data.get('oldPrice'))
                    print("  - Stock/Availability:", product_data.get('in_stock') or product_data.get('stock') or product_data.get('availability'))
                    print("  - Brand:", product_data.get('brand'))
                    print("  - Category:", product_data.get('category'))
        except Exception as e:
            print("Error parsing __NEXT_DATA__:", e)
