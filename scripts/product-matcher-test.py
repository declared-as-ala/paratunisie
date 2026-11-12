import json
import csv
import re

# Load real products catalog
with open("c:/Users/Ala/Desktop/parapharmacie/scripts/real_products_catalog.json", "r", encoding="utf-8") as f:
    real_products = json.load(f)

# Group products by category
products_by_cat = {}
for p in real_products:
    cat = p.get("category_slug")
    if cat not in products_by_cat:
        products_by_cat[cat] = []
    products_by_cat[cat].append(p)

def find_products_for_topic(category_slug, keywords, count=2):
    """Find the best matching products from the real DB catalog."""
    pool = products_by_cat.get(category_slug, [])
    if not pool:
        # fallback to related categories
        for alt_cat in ["whey-proteine", "creatine", "vitamines", "magnesium", "nutrition-sportive"]:
            if alt_cat in products_by_cat:
                pool.extend(products_by_cat[alt_cat][:5])
    
    matches = []
    kw_words = [w.lower() for w in keywords if len(w) > 3]
    for p in pool:
        name_lower = p["name"].lower()
        score = sum(1 for w in kw_words if w in name_lower)
        if p.get("inStock"):
            score += 2
        matches.append((score, p))
    
    matches.sort(key=lambda x: x[0], reverse=True)
    selected = [m[1] for m in matches[:count]]
    return selected

print(f"Product finder ready. Loaded {len(real_products)} products across {len(products_by_cat)} categories.")
