import paramiko
import json

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

# Query existing articles
sql = "SELECT id, slug, title, category, status, \"targetKeyword\", \"publishedAt\" FROM \"Article\" ORDER BY id;"
cmd = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c \'{sql}\''
out, err = run_cmd(cmd)
print("=== EXISTING ARTICLES IN DB ===")
print(out)

# Query 1 article content sample
sql_sample = "SELECT id, slug, \"authorName\", \"expertReviewer\", LEFT(content, 500) as content_preview FROM \"Article\" LIMIT 2;"
cmd_sample = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c \'{sql_sample}\''
out_sample, _ = run_cmd(cmd_sample)
print("=== ARTICLE CONTENT SAMPLE ===")
print(out_sample)

# Query total count of products and categories
sql_counts = "SELECT (SELECT COUNT(*) FROM \"Product\") as products_count, (SELECT COUNT(*) FROM \"Category\") as categories_count, (SELECT COUNT(*) FROM \"Brand\") as brands_count, (SELECT COUNT(*) FROM \"Article\") as articles_count;"
cmd_counts = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c \'{sql_counts}\''
out_counts, _ = run_cmd(cmd_counts)
print("=== CATALOG COUNTS ===")
print(out_counts)

client.close()
