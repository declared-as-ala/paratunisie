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

stdin, stdout, stderr = client.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, \\"orderId\\", carrier, hawb, \\"labelUrl\\", status FROM \\"Shipment\\";"')
print("=== SHIPMENT IN DATABASE ===")
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
