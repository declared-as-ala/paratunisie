import paramiko
import json

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

query = """
SELECT json_agg(t) FROM (
  SELECT 
    p.id, p.slug, p.name, p."inStock",
    b.name as brand_name,
    c.slug as category_slug,
    (SELECT pv."priceMillimes" FROM "ProductVariant" pv WHERE pv."productId" = p.id LIMIT 1) as price_millimes
  FROM "Product" p
  LEFT JOIN "Brand" b ON b.id = p."brandId"
  LEFT JOIN "Category" c ON c.id = p."categoryId"
  WHERE p."publishState" = 'PUBLISHED'
  ORDER BY c.slug, p.name
) t;
"""

stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -t -A', timeout=30)
stdin.write(query)
stdin.channel.shutdown_write()

out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')

if err.strip():
    print("STDERR:", err.strip())

with open("c:/Users/Ala/Desktop/parapharmacie/scripts/real_products_catalog.json", "w", encoding="utf-8") as f:
    f.write(out.strip())

print(f"Dumped real published products. Size: {len(out)} chars")
client.close()
