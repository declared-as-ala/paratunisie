import paramiko
import json

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

query = """
SELECT json_agg(t) FROM (
  SELECT 
    id,
    slug,
    title,
    category,
    status,
    "targetKeyword",
    "seoTitle",
    "metaDescription",
    "canonicalUrl",
    indexable,
    "featuredImage",
    "authorName",
    "expertReviewer",
    "publishedAt",
    "updatedAt",
    LENGTH(content) as content_length,
    (SELECT COUNT(*) FROM "ArticleProduct" ap WHERE ap."articleId" = "Article".id) as products_count,
    (SELECT COUNT(*) FROM "ArticleFaq" af WHERE af."articleId" = "Article".id) as faqs_count
  FROM "Article"
  ORDER BY category, title
) t;
"""

cmd = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c \'{query}\''
out, err = run_cmd(cmd)

with open("c:/Users/Ala/Desktop/parapharmacie/scripts/existing_articles_dump.json", "w", encoding="utf-8") as f:
    f.write(out.strip())

print(f"Dumped existing articles. File size: {len(out)} chars")
client.close()
