import sys
import paramiko

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

cmd = '''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT p.name, p.slug, b.name as brand, v.label, v.\\"priceMillimes\\"
FROM \\"Product\\" p
LEFT JOIN \\"Brand\\" b ON b.id = p.\\"brandId\\"
LEFT JOIN \\"ProductVariant\\" v ON v.\\"productId\\" = p.id
ORDER BY p.name;
"'''

stdin, stdout, stderr = client.exec_command(cmd)
output = stdout.read().decode("utf-8", errors="replace")

# Save to a local json mapping
lines = output.splitlines()
print(f"Total lines: {len(lines)}")

client.close()

with open("scripts/db_product_prices.txt", "w", encoding="utf-8") as f:
    f.write(output)

print("Saved database products and prices!")
