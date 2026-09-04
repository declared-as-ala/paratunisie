import urllib.request
import re
import json

ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

in_stock_products = []

for page in range(1, 15):
    url = f"https://protein.tn/shop?inStock=true&page={page}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with opener.open(req, timeout=15) as res:
            html = res.read().decode("utf-8", errors="ignore")
            
            # Extract products embedded in state / cards
            # Look for JSON arrays of products in page
            m_items = re.findall(r'\"slug\"\s*:\s*\"([^\"]+)\"[^}]*\"designation_fr\"\s*:\s*\"([^\"]+)\"', html)
            if not m_items:
                m_items = re.findall(r'\"designation_fr\"\s*:\s*\"([^\"]+)\"[^}]*\"slug\"\s*:\s*\"([^\"]+)\"', html)
                m_items = [(slug, name) for name, slug in m_items]
            
            # Also extract from links
            links = re.findall(r'href="https://protein\.tn/([^/"]+)/([^/"]+)"', html)
            
            print(f"Page {page}: found {len(m_items)} JSON items, {len(links)} links")

            # Look for Next.js __NEXT_DATA__ or state
            m_next = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
            if m_next:
                try:
                    data = json.loads(m_next.group(1))
                    page_prods = data.get('props', {}).get('pageProps', {}).get('products', [])
                    print(f"  __NEXT_DATA__ products: {len(page_prods)}")
                except:
                    pass

    except Exception as e:
        print(f"Page {page} Error: {e}")
