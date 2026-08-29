import re

with open('src/lib/data/products.ts', 'r', encoding='utf-8') as f:
    text = f.read()

slugs = re.findall(r'"slug":\s*"([^"]+)"', text)
print(f"Products in src/lib/data/products.ts: {len(slugs)}")
for s in slugs[:10]:
    print(" -", s)

with open('src/lib/data/categories.ts', 'r', encoding='utf-8') as f:
    ctext = f.read()

cslugs = re.findall(r'"slug":\s*"([^"]+)"', ctext)
print(f"Categories in src/lib/data/categories.ts: {len(cslugs)}")
for c in cslugs:
    print(" -", c)
