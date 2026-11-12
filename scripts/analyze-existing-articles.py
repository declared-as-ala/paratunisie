import json
from collections import Counter

with open("c:/Users/Ala/Desktop/parapharmacie/scripts/existing_articles_dump.json", "r", encoding="utf-8") as f:
    articles = json.load(f)

print(f"Total existing articles in DB: {len(articles)}")

cats = Counter(a["category"] for a in articles)
print("\n=== Existing Categories ===")
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")

print("\n=== Sample of existing slugs and target keywords ===")
existing_slugs = set()
existing_keywords = set()
missing_seo_titles = 0
missing_meta_desc = 0
meta_desc_too_long = 0
missing_images = 0

for a in articles:
    existing_slugs.add(a["slug"])
    if a.get("targetKeyword"):
        existing_keywords.add(a["targetKeyword"].lower().strip())
    if not a.get("seoTitle"):
        missing_seo_titles += 1
    if not a.get("metaDescription"):
        missing_meta_desc += 1
    elif len(a["metaDescription"]) > 255:
        meta_desc_too_long += 1
    if not a.get("featuredImage"):
        missing_images += 1

print(f"\nUnique slugs: {len(existing_slugs)}")
print(f"Unique target keywords: {len(existing_keywords)}")
print(f"Missing SEO titles: {missing_seo_titles}")
print(f"Missing Meta descriptions: {missing_meta_desc}")
print(f"Meta descriptions > 255 chars: {meta_desc_too_long}")
print(f"Missing featured images: {missing_images}")
