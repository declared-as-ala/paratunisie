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

cmd = """
docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT p.id, p.name, p.slug, p.image, p.\\"publishState\\", p.\\"inStock\\", pv.\\"priceMillimes\\", pv.stock, b.name as brand, c.name as category
FROM \\"Product\\" p
LEFT JOIN \\"ProductVariant\\" pv ON pv.\\"productId\\" = p.id
LEFT JOIN \\"Brand\\" b ON p.\\"brandId\\" = b.id
LEFT JOIN \\"Category\\" c ON p.\\"categoryId\\" = c.id
WHERE p.slug LIKE '%creatine%real%' OR p.name ILIKE '%real pharm%creatine%' OR p.slug = 'creatine-monohydrate-150gr-real-pharm';
"
"""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8"))

client.close()
