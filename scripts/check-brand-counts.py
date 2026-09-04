import paramiko
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Query brands and product counts
query = """
SELECT b.name, b.slug, b.image, count(p.id) as product_count
FROM "Brand" b
LEFT JOIN "Product" p ON p."brandId" = b.id
WHERE b.image IS NOT NULL
GROUP BY b.id, b.name, b.slug, b.image
ORDER BY product_count DESC, b.name ASC;
"""

cmd = f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c '{query}'"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8"))

client.close()
