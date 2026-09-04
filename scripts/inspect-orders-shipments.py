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

cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, status, \\"firstName\\", \\"lastName\\", phone, city, \\"createdAt\\" FROM \\"Order\\" ORDER BY \\"createdAt\\" DESC LIMIT 10;"'
stdin, stdout, stderr = client.exec_command(cmd)
print("Orders:")
print(stdout.read().decode("utf-8"))
err = stderr.read().decode("utf-8")
if err:
    print("ERR:", err)

cmd2 = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, \\"orderId\\", \\"trackingNumber\\", \\"labelUrl\\", \\"createdAt\\" FROM \\"Shipment\\" ORDER BY \\"createdAt\\" DESC LIMIT 10;"'
stdin, stdout, stderr = client.exec_command(cmd2)
print("Shipments:")
print(stdout.read().decode("utf-8"))
err2 = stderr.read().decode("utf-8")
if err2:
    print("ERR2:", err2)

client.close()
