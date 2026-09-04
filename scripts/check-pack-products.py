import paramiko
import sys
import json

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
SELECT row_to_json(t) FROM (
  SELECT p.id, p.name, p.slug, p.image, p.benefit, p.description, p.usage, p.\\"inStock\\", p.\\"totalStock\\",
         pv.id as variant_id, pv.label as variant_label, pv.\\"priceMillimes\\", pv.stock as variant_stock,
         b.name as brand_name, c.name as category_name
  FROM \\"Product\\" p
  LEFT JOIN \\"ProductVariant\\" pv ON pv.\\"productId\\" = p.id
  LEFT JOIN \\"Brand\\" b ON p.\\"brandId\\" = b.id
  LEFT JOIN \\"Category\\" c ON p.\\"categoryId\\" = c.id
  WHERE p.slug IN ('magnesium-vitamin-b6-90-tablets', 'ashwagandha-60-gelules-biotech-usa')
) t;
"
"""

stdin, stdout, stderr = client.exec_command(cmd)
output = stdout.read().decode("utf-8")
print("Found products in DB:")
for line in output.splitlines():
    if line.strip().startswith("{"):
        try:
            d = json.loads(line)
            print(json.dumps(d, indent=2, ensure_ascii=False))
        except:
            print(line)

client.close()
