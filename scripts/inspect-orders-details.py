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

# Check all orders in PostgreSQL with details
cmd = '''
docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT 
  o.id,
  u.name as client,
  u.phone,
  o.gouvernorat as ville,
  o.status,
  o.\\"totalMillimes\\" / 1000.0 as total_dt,
  o.\\"createdAt\\"
FROM \\"Order\\" o
LEFT JOIN \\"User\\" u ON u.id = o.\\"userId\\"
ORDER BY o.\\"createdAt\\" DESC;
"
'''
stdin, stdout, stderr = client.exec_command(cmd)
print("=== CURRENT REAL ORDERS IN POSTGRES ===")
print(stdout.read().decode(errors="replace"))

client.close()
