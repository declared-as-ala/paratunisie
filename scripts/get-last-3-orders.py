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

# Check last 3 orders
query = """
SELECT id, "status", "firstName", "lastName", "phone", "city", "totalMillimes", "createdAt"
FROM "Order"
ORDER BY "createdAt" DESC
LIMIT 5;
"""

cmd = f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c '{query}'"
stdin, stdout, stderr = client.exec_command(cmd)
print("Last orders:")
print(stdout.read().decode("utf-8"))

# Check shipments in Shipment table
query_shipments = """
SELECT s.id, s."orderId", s."trackingNumber", s."labelUrl", s."carrier", s."createdAt"
FROM "Shipment" s
ORDER BY s."createdAt" DESC
LIMIT 5;
"""
cmd2 = f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c '{query_shipments}'"
stdin, stdout, stderr = client.exec_command(cmd2)
print("Last shipments:")
print(stdout.read().decode("utf-8"))

client.close()
