import urllib.request
import re
import json

url = "https://protein.tn/creatine/creatine-monohydrate-150gr-real-pharm"
ctx = urllib.request.ssl._create_unverified_context()
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)

req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with opener.open(req, timeout=15) as res:
        final_url = res.geturl()
        html = res.read().decode("utf-8", errors="ignore")
        print("Final URL:", final_url)
        print("HTML length:", len(html))

        # 1. JSON-LD data
        json_ld_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
        product_json_ld = None
        for j_str in json_ld_matches:
            if '"Product"' in j_str:
                try:
                    product_json_ld = json.loads(j_str)
                    print("Found Product JSON-LD:")
                    print(json.dumps(product_json_ld, indent=2))
                except Exception as e:
                    print("JSON load error:", e)

        # 2. Extract DOM elements if needed
        # Title
        title = ""
        m_title = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.I)
        if m_title:
            title = re.sub(r'<[^>]+>', '', m_title.group(1)).strip()
        print("DOM Title:", title)

        # Price
        price_m = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:DT|TND|dt)', html, re.I)
        print("Price matched:", price_m.group(0) if price_m else "None")

        # Images
        images = re.findall(r'https://admin\.protein\.tn/storage/produits/[^"\'\s]+', html)
        images = list(dict.fromkeys(images))
        print("Images found:", images)

        # In stock vs Sur commande
        is_sur_commande = "Ce produit n'est pas en stock" in html or "sur demande" in html
        print("Is sur commande:", is_sur_commande)

except Exception as e:
    print("Error fetching product:", e)
