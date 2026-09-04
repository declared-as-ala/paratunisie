import re
import paramiko
import json

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

# Extract slugs from mega-menu.tsx and home-split-feature.tsx
with open("src/components/layout/navigation/mega-menu.tsx", "r", encoding="utf-8") as f:
    mm_text = f.read()

with open("src/components/home/home-split-feature.tsx", "r", encoding="utf-8") as f:
    hs_text = f.read()

slugs = set(re.findall(r'slug:\s*"([^"]+)"', mm_text))
slugs.update(re.findall(r'href:\s*"/produits/([^"]+)"', hs_text))
slugs.update(re.findall(r'href:\s*"/produits/([^"]+)"', mm_text))

print(f"Total product slugs found: {len(slugs)}")
print("Slugs:", slugs)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = f'''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT p.id, p.name, p.slug, b.name as brand, v.label, v.\\"priceMillimes\\", p.image
FROM \\"Product\\" p
LEFT JOIN \\"Brand\\" b ON b.id = p.\\"brandId\\"
LEFT JOIN \\"ProductVariant\\" v ON v.\\"productId\\" = p.id
WHERE p.slug IN ('{"','".join(slugs)}')
ORDER BY p.slug;
"'''

stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode("utf-8", errors="replace")
print(out)
client.close()
