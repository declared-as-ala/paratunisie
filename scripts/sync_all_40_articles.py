import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
import paramiko
import re

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS)

with open("src/lib/data/articles.ts", "r", encoding="utf-8") as f:
    code = f.read()

# Match each object { ... } in the articles array
# Find all occurrences of slug: "..."
matches = list(re.finditer(r'slug:\s*"([^"]+)"', code))
print(f"Total article matches: {len(matches)}")

sql_statements = []
for i, m in enumerate(matches):
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else code.find("export const articleCategories")
    block = code[start:end]

    slug = m.group(1)
    title_m = re.search(r'title:\s*"([^"]+)"', block)
    excerpt_m = re.search(r'excerpt:\s*\n?\s*"([^"]+)"', block)
    category_m = re.search(r'category:\s*"([^"]+)"', block)
    readTime_m = re.search(r'readTime:\s*"([^"]+)"', block)
    date_m = re.search(r'date:\s*"([^"]+)"', block)
    author_m = re.search(r'authorName:\s*"([^"]+)"', block)
    img_m = re.search(r'featuredImage:\s*"([^"]+)"', block)
    focusKw_m = re.search(r'focusKeyword:\s*"([^"]+)"', block)
    seoTitle_m = re.search(r'seoTitle:\s*"([^"]+)"', block)
    seoDesc_m = re.search(r'seoDescription:\s*\n?\s*"([^"]+)"', block)

    title = title_m.group(1).replace("'", "''") if title_m else slug
    excerpt = excerpt_m.group(1).replace("'", "''") if excerpt_m else ""
    category = category_m.group(1).replace("'", "''") if category_m else "Conseils"
    readTime = readTime_m.group(1) if readTime_m else "5 min"
    date = date_m.group(1) if date_m else "2026-09-04"
    author = "Équipe éditoriale ParaTunisie"
    img = img_m.group(1) if img_m else f"/assets/blog/{slug}.webp"
    targetKw = focusKw_m.group(1).replace("'", "''") if focusKw_m else slug.replace("-", " ")
    seoTitle = seoTitle_m.group(1).replace("'", "''") if seoTitle_m else title
    seoDesc = seoDesc_m.group(1).replace("'", "''") if seoDesc_m else excerpt

    sql = f"""
INSERT INTO "Article" (
  id, slug, title, excerpt, category, "readTime", date, "authorName", "featuredImage",
  "targetKeyword", "seoTitle", "metaDescription", "canonicalUrl", indexable, status,
  "publishedAt", "updatedAt", content
) VALUES (
  'art_{slug.replace("-", "_")[:25]}',
  '{slug}',
  '{title}',
  '{excerpt}',
  '{category}',
  '{readTime}',
  '{date}',
  '{author}',
  '{img}',
  '{targetKw}',
  '{seoTitle}',
  '{seoDesc}',
  '/conseils/{slug}',
  true,
  'PUBLISHED',
  NOW(),
  NOW(),
  '[]'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  category = EXCLUDED.category,
  "readTime" = EXCLUDED."readTime",
  "authorName" = EXCLUDED."authorName",
  "featuredImage" = EXCLUDED."featuredImage",
  "targetKeyword" = EXCLUDED."targetKeyword",
  "seoTitle" = EXCLUDED."seoTitle",
  "metaDescription" = EXCLUDED."metaDescription",
  "canonicalUrl" = EXCLUDED."canonicalUrl",
  indexable = true,
  status = 'PUBLISHED',
  "updatedAt" = NOW();
"""
    sql_statements.append(sql)

full_sql = "\n".join(sql_statements)
sftp = client.open_sftp()
with sftp.file('/tmp/sync_articles.sql', 'w') as f:
    f.write(full_sql)
sftp.close()

stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/sync_articles.sql')
out = stdout.read().decode()

stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT COUNT(*) FROM \\"Article\\" WHERE indexable = true;"')
count = stdout.read().decode().strip()
print(f"Total indexable articles in Postgres now: {count}/40")

client.close()
