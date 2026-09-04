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

slugs = [
    'micronised-creatine-optimum-nutrition-317g',
    'anabolic-whey-80-2-25kg-proactive',
    'one-a-day-biotech-usa',
    'lipo-6-black-ultra-concentrate-60caps'
]

slug_list_str = "','".join(slugs)

cmd = f'''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT p.name, p.slug, b.name as brand, v.label, v.\\"priceMillimes\\", p.image
FROM \\"Product\\" p
LEFT JOIN \\"Brand\\" b ON b.id = p.\\"brandId\\"
LEFT JOIN \\"ProductVariant\\" v ON v.\\"productId\\" = p.id
WHERE p.slug IN ('{slug_list_str}')
ORDER BY p.name;
"'''

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
