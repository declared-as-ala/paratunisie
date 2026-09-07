import re
import json

with open('src/lib/data/articles.ts', encoding='utf-8') as f:
    articles_text = f.read()

# Extract article objects
article_blocks = re.findall(r'\{\s*id:\s*(\d+),.*?slug:\s*"([^"]+)".*?title:\s*"([^"]+)".*?focusKeyword:\s*"([^"]+)".*?category:\s*"([^"]+)"', articles_text, re.DOTALL)

print(f"Total articles found in articles.ts: {len(article_blocks)}")
for id_num, slug, title, kw, cat in article_blocks:
    print(f"[{id_num}] {slug}")
    print(f"    Title: {title}")
    print(f"    Focus KW: {kw}")
    print(f"    Category: {cat}")
