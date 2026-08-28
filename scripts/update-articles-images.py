import os
import re

articles_file = "src/lib/data/articles.ts"
with open(articles_file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace featuredImage in each article with its slug
# Example: slug: "meilleure-creatine-tunisie", ... featuredImage: "/assets/hero-paratunisie.webp" -> "/assets/blog/meilleure-creatine-tunisie.webp"

def replacer(match):
    slug = match.group(1)
    return f'slug: "{slug}",\n    title: {match.group(2)},\n    h1: {match.group(3)},\n    excerpt:\n      {match.group(4)},\n    category: {match.group(5)},\n    readTime: {match.group(6)},\n    date: {match.group(7)},\n    updatedAt: {match.group(8)},\n    authorName: {match.group(9)},\n    featuredImage: "/assets/blog/{slug}.webp"'

# Using a simpler line-by-line or regex pattern
# We can find all blocks and set featuredImage: `/assets/blog/${slug}.webp`
lines = content.splitlines()
new_lines = []
current_slug = None

for line in lines:
    slug_match = re.search(r'slug:\s*"([^"]+)"', line)
    if slug_match:
        current_slug = slug_match.group(1)
    
    if 'featuredImage:' in line and current_slug:
        indent = line[:line.find('featuredImage:')]
        new_lines.append(f'{indent}featuredImage: "/assets/blog/{current_slug}.webp",')
    else:
        new_lines.append(line)

with open(articles_file, "w", encoding="utf-8") as f:
    f.write("\n".join(new_lines))

print("Updated src/lib/data/articles.ts with 20 distinct images!")
