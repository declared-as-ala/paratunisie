import re

with open('src/lib/data/articles.ts', encoding='utf-8') as f:
    text = f.read()

slugs = re.findall(r'slug:\s*"([^"]+)"', text)
print("Articles in articles.ts:")
for s in slugs:
    print(" -", s)
