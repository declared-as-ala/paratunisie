import re
import json

with open('src/lib/data/articles.ts', encoding='utf-8') as f:
    text = f.read()

raw_articles = text.split('// ── ARTICLE ')

results = []
for i, block in enumerate(raw_articles[1:], 1):
    slug = re.search(r'slug:\s*"([^"]+)"', block)
    title = re.search(r'title:\s*"([^"]+)"', block)
    h1 = re.search(r'h1:\s*"([^"]+)"', block)
    kw = re.search(r'focusKeyword:\s*"([^"]+)"', block)
    cat = re.search(r'category:\s*"([^"]+)"', block)
    
    # Extract markdown links in sections
    links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', block)
    rel_cats = re.findall(r'\{ name:\s*"([^"]+)", url:\s*"([^"]+)" \}', block)
    
    results.append({
        "id": i,
        "slug": slug.group(1) if slug else "",
        "title": title.group(1) if title else "",
        "focusKeyword": kw.group(1) if kw else "",
        "category": cat.group(1) if cat else "",
        "inTextLinks": links,
        "relatedCategories": rel_cats
    })

print(f"Total parsed articles: {len(results)}\n")
for r in results:
    print(f"Article #{r['id']}: [{r['slug']}]")
    print(f"  Title: {r['title']}")
    print(f"  Keyword: {r['focusKeyword']}")
    print(f"  In-Text Links ({len(r['inTextLinks'])}): {r['inTextLinks']}")
    print(f"  Related Categories: {r['relatedCategories']}")
    print("-" * 60)
