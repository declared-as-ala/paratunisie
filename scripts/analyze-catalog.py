import json
from collections import Counter

with open("c:/Users/Ala/Desktop/parapharmacie/scripts/real_products_catalog.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Total published products: {len(products)}")

by_cat = Counter(p.get("category_slug") for p in products)
print("\nProducts per category:")
for cat, count in by_cat.most_common():
    print(f"  {cat}: {count}")

in_stock_count = sum(1 for p in products if p.get("inStock"))
print(f"\nIn-stock products: {in_stock_count} / {len(products)}")
