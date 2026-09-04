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

# Check image formats distribution
cmd = '''
docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT 
  CASE 
    WHEN image LIKE 'https://admin.protein.tn/%' THEN 'protein.tn remote'
    WHEN image LIKE 'https://%' THEN 'Other https'
    WHEN image LIKE '/uploads/%' THEN 'Local /uploads/'
    WHEN image IS NULL OR image = '' THEN 'Empty / Null'
    ELSE 'Other'
  END as image_type,
  count(*) 
FROM \\"Product\\"
GROUP BY 1;
"
'''
stdin, stdout, stderr = client.exec_command(cmd)
print("=== IMAGE TYPE DISTRIBUTION IN DATABASE ===")
print(stdout.read().decode())

# Check all products that have local /uploads/ or missing
cmd2 = '''
docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT id, slug, name, image FROM \\"Product\\" WHERE image LIKE '/uploads/%' OR image IS NULL OR image = '' LIMIT 20;
"
'''
stdin, stdout, stderr = client.exec_command(cmd2)
print("=== PRODUCTS WITH LOCAL /UPLOADS/ OR MISSING ===")
print(stdout.read().decode())

client.close()
