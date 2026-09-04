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
  SELECT p.*, pv.\\"priceMillimes\\", pv.stock, pv.sku, b.name as brand_name, c.name as category_name
  FROM \\"Product\\" p
  LEFT JOIN \\"ProductVariant\\" pv ON pv.\\"productId\\" = p.id
  LEFT JOIN \\"Brand\\" b ON p.\\"brandId\\" = b.id
  LEFT JOIN \\"Category\\" c ON p.\\"categoryId\\" = c.id
  WHERE p.slug = 'creatine-monohydrate-150gr-real-pharm'
) t;
"
"""
stdin, stdout, stderr = client.exec_command(cmd)
output = stdout.read().decode("utf-8")
print("Product JSON in DB:")
for line in output.splitlines():
    if line.strip().startswith("{"):
        try:
            d = json.loads(line)
            print(json.dumps(d, indent=2, ensure_ascii=False))
        except:
            print(line)

client.close()
