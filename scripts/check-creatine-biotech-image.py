import paramiko
import urllib.request

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, slug, name, image FROM \\"Product\\" WHERE slug LIKE \'%100-creatine%\' OR slug LIKE \'%biotech%\' LIMIT 5;"'
stdin, stdout, stderr = client.exec_command(cmd)
print("=== DATABASE PRODUCT IMAGES ===")
print(stdout.read().decode())

# Check ProductImage table
cmd2 = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT pi.url, p.slug FROM \\"ProductImage\\" pi JOIN \\"Product\\" p ON p.id = pi.\\"productId\\" WHERE p.slug LIKE \'%100-creatine%\' LIMIT 5;"'
stdin, stdout, stderr = client.exec_command(cmd2)
print("=== PRODUCT IMAGE TABLE ===")
print(stdout.read().decode())

client.close()
