import paramiko

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

# Categories with >= 10 products that need indexable = true and canonicalUrl
update_sql = """
UPDATE "Category"
SET 
  indexable = true,
  "canonicalUrl" = 'https://paratunisie.com/' || slug
WHERE id IN (
  SELECT c.id FROM "Category" c
  WHERE (SELECT COUNT(*) FROM "Product" p WHERE p."categoryId" = c.id) >= 10
);

-- Also ensure canonicalUrl is set for all categories
UPDATE "Category"
SET "canonicalUrl" = 'https://paratunisie.com/' || slug
WHERE "canonicalUrl" IS NULL OR "canonicalUrl" = '';

SELECT slug, name, indexable, "canonicalUrl",
       (SELECT COUNT(*) FROM "Product" p WHERE p."categoryId" = c.id) as product_count
FROM "Category" c
ORDER BY product_count DESC;
"""

stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie', timeout=15)
stdin.write(update_sql)
stdin.channel.shutdown_write()

out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')

print("=== CATEGORIES AFTER SEO INDEXATION FIX ===")
print(out)
if err.strip():
    print("STDERR:", err.strip())

client.close()
