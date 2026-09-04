import urllib.request
import re
import json

test_urls = [
    "https://protein.tn/whey-proteine/nitro-tech-ripped-1-8-kg-muscletech",
    "https://protein.tn/creatine/creatine-monohydrate-100-pure-ostrovit",
    "https://protein.tn/immunite/nutribiotic-immunity-sodium-ascorbate-crystalline-powder-1-kg",
    "https://protein.tn/acides-amines/natural-factors-l-lysine-180-gelules-vegetales",
    "https://protein.tn/whey-proteine/real-whey-100-2-250-gr",
]

ctx = urllib.request.ssl._create_unverified_context()

for url in test_urls:
    print("=" * 60)
    print("ANALYZING URL:", url)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
            html = res.read().decode("utf-8", errors="ignore")
            
            # Look for JSON payload embedded in HTML (e.g. Next.js / Laravel / Inertia / Vue state)
            # Many modern stores embed: "rupture": false / true, "force_out_of_stock": true / false, "qte": ...
            props = re.findall(r'(\"(?:rupture|force_out_of_stock|in_stock|stock|qte|is_available|availability)\"\s*:\s*[^,}]+)', html)
            print("  Stock Props in HTML:", props[:10])

            # Check main buying box
            # Look for the primary action button for the main product (before related products)
            main_block = html[:html.find('id="related-products"')] if 'id="related-products"' in html else html[:100000]
            
            # Check if "Ce produit n'est pas en stock" is inside the main product description/details
            is_sur_commande = "Ce produit n'est pas en stock" in main_block or "Nous le commandons pour vous sur demande" in main_block
            print("  Is 'Sur commande / sur demande' in main block:", is_sur_commande)

            # Check if "En stock" badge is in main block
            has_en_stock_badge = bool(re.search(r'badge[^>]*>\s*En stock', main_block, re.I)) or ("En stock" in main_block and not is_sur_commande)
            print("  Has 'En stock' in main block:", has_en_stock_badge)

    except Exception as e:
        print("  Error:", e)
