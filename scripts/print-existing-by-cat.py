import json

with open("c:/Users/Ala/Desktop/parapharmacie/scripts/existing_articles_dump.json", "r", encoding="utf-8") as f:
    articles = json.load(f)

print(f"Total articles: {len(articles)}")

from collections import defaultdict
by_cat = defaultdict(list)
for a in articles:
    by_cat[a["category"]].append((a["slug"], a["title"], a.get("targetKeyword", "")))

for cat in sorted(by_cat.keys()):
    print(f"\n==================== {cat} ({len(by_cat[cat])}) ====================")
    for slug, title, kw in by_cat[cat]:
        print(f"  • [{slug}] -> {title} (KW: {kw})")
