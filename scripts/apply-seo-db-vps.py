import paramiko
import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
import importlib.util
spec = importlib.util.spec_from_file_location("sync_articles_seo_db", os.path.join(os.path.dirname(__file__), "sync-articles-seo-db.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
articles_data = mod.articles_data

VPS_IP = "145.223.118.9"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=20)

print("Connected to VPS. Updating article SEO fields in PostgreSQL...")

sql_statements = []
for art in articles_data:
    slug = art["slug"].replace("'", "''")
    seo_title = art["seoTitle"].replace("'", "''")
    meta_desc = art["metaDescription"].replace("'", "''")
    canonical = art["canonicalUrl"].replace("'", "''")
    target_kw = art["targetKeyword"].replace("'", "''")
    og_title = art["ogTitle"].replace("'", "''")
    og_desc = art["ogDescription"].replace("'", "''")
    og_image = art["ogImage"].replace("'", "''")
    
    sql = f"""
    UPDATE "Article" SET
      "seoTitle" = '{seo_title}',
      "metaDescription" = '{meta_desc}',
      "canonicalUrl" = '{canonical}',
      "targetKeyword" = '{target_kw}',
      "ogTitle" = '{og_title}',
      "ogDescription" = '{og_desc}',
      "ogImage" = '{og_image}',
      "indexable" = true,
      "updatedAt" = NOW()
    WHERE "slug" = '{slug}';
    """
    sql_statements.append(sql)

full_sql = "\n".join(sql_statements)

# Execute in Postgres container
escaped_sql = full_sql.replace('"', '\\"').replace('$', '\\$')
cmd = f'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << \'EOF\'\n{full_sql}\nEOF'

stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

print("STDOUT:", out)
if err:
    print("STDERR:", err)

# Check count of updated articles
check_cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c \'SELECT slug, "seoTitle", "targetKeyword", "ogTitle" FROM "Article" LIMIT 5;\''
stdin, stdout, stderr = client.exec_command(check_cmd)
print("\nSample records in DB:\n", stdout.read().decode('utf-8', errors='ignore'))

client.close()
