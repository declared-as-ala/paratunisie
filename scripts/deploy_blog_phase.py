import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
import paramiko
import os
import json
import re

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS)

sftp = client.open_sftp()

# 1. Ensure remote blog asset dir exists
try:
    sftp.mkdir("/opt/paratunisie/app/public/assets")
except Exception:
    pass
try:
    sftp.mkdir("/opt/paratunisie/app/public/assets/blog")
except Exception:
    pass

# 2. Upload all images from local public/assets/blog/
local_blog_dir = "public/assets/blog"
uploaded_images = 0
for f in os.listdir(local_blog_dir):
    if f.endswith(".webp") or f.endswith(".png") or f.endswith(".jpg"):
        local_p = os.path.join(local_blog_dir, f)
        remote_p = f"/opt/paratunisie/app/public/assets/blog/{f}"
        sftp.put(local_p, remote_p)
        uploaded_images += 1

print(f"Uploaded {uploaded_images} blog images to VPS host!")
sftp.close()

# 3. Copy images into paratunisie-web container
stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-web mkdir -p /app/public/assets/blog && docker cp /opt/paratunisie/app/public/assets/blog/. paratunisie-web:/app/public/assets/blog/')
print("Container copy stdout:", stdout.read().decode())
print("Container copy stderr:", stderr.read().decode())

# 4. Sync articles into Postgres
# Read all articles from src/lib/data/articles.ts
with open("src/lib/data/articles.ts", "r", encoding="utf-8") as f:
    code = f.read()

# Parse article blocks
article_blocks = re.split(r'// ── ARTICLE \d+ ──', code)[1:]
print(f"Found {len(article_blocks)} articles in data file to sync with DB.")

sql_statements = []

for block in article_blocks:
    slug_m = re.search(r'slug:\s*"([^"]+)"', block)
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

    if not slug_m or not title_m:
        continue

    slug = slug_m.group(1)
    title = title_m.group(1).replace("'", "''")
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

print("Applying article upserts to Postgres...")
stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/sync_articles.sql')
print(stdout.read().decode())
print(stderr.read().decode())

# 5. Verify indexable article count in DB
stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT COUNT(*) FROM \\"Article\\" WHERE indexable = true;"')
count = stdout.read().decode().strip()
print(f"Total indexable articles in Postgres now: {count}")

client.close()
