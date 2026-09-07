import re

with open('src/lib/data/articles.ts', encoding='utf-8') as f:
    text = f.read()

# Match each article block
raw_articles = text.split('// ── ARTICLE ')
print(f"Total raw blocks: {len(raw_articles) - 1}")

articles_data = []
for block in raw_articles[1:]:
    slug_m = re.search(r'slug:\s*"([^"]+)"', block)
    title_m = re.search(r'title:\s*"([^"]+)"', block)
    h1_m = re.search(r'h1:\s*"([^"]+)"', block)
    kw_m = re.search(r'focusKeyword:\s*"([^"]+)"', block)
    cat_m = re.search(r'category:\s*"([^"]+)"', block)
    seo_title_m = re.search(r'seoTitle:\s*"([^"]+)"', block)
    
    slug = slug_m.group(1) if slug_m else "N/A"
    title = title_m.group(1) if title_m else "N/A"
    h1 = h1_m.group(1) if h1_m else "N/A"
    kw = kw_m.group(1) if kw_m else "N/A"
    cat = cat_m.group(1) if cat_m else "N/A"
    seo_title = seo_title_m.group(1) if seo_title_m else "N/A"
    
    articles_data.append({
        "slug": slug,
        "title": title,
        "h1": h1,
        "focusKeyword": kw,
        "category": cat,
        "seoTitle": seo_title
    })

for i, a in enumerate(articles_data, 1):
    print(f"#{i} | Slug: {a['slug']}")
    print(f"     Title: {a['title']}")
    print(f"     H1: {a['h1']}")
    print(f"     Focus KW: {a['focusKeyword']}")
    print(f"     Category: {a['category']}")
    print()
