import urllib.request
import re
import json

urls = [
    'https://protein.tn/creatine/creatine-monohydrate-100-pure-ostrovit',
    'https://protein.tn/whey-proteine/100-whey-gold-standard-optimum-nutrition',
    'https://protein.tn/vitamines/c-1000-zinc-now-foods',
    'https://protein.tn/bcaa/bcaa-2-1-1-ostrovit',
    'https://protein.tn/pre-workout/the-curse-jnx-sports'
]

ctx = urllib.request.ssl._create_unverified_context()
for u in urls:
    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as res:
            html = res.read().decode('utf-8', errors='ignore')
            print("=" * 60)
            print(f"URL: {u}")
            
            # 1. JSON-LD schema
            m_json = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
            for j_str in m_json:
                if "offers" in j_str or "availability" in j_str:
                    try:
                        j_data = json.loads(j_str)
                        print("  JSON-LD offers:", j_data.get('offers'))
                    except:
                        pass
            
            # 2. Check "Ajouter au panier" button in HTML
            has_add_button = bool(re.search(r'ajouter au panier|commander|btn-add-to-cart', html, re.I))
            print("  Has 'Ajouter au panier' in HTML:", has_add_button)

            # 3. Check stock badge text in HTML
            stock_snippets = re.findall(r'(.{0,40}(?:en stock|sur commande|rupture).{0,40})', html, re.I)
            print("  Stock text snippets in HTML:", stock_snippets[:3])

    except Exception as e:
        print(f"Error fetching {u}: {e}")
