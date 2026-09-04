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

cmd = """
docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c '
SELECT o.id, o.status, u.name, u.phone, o.gouvernorat, o."totalMillimes", o."createdAt", s.hawb, s."labelUrl"
FROM "Order" o
JOIN "User" u ON o."userId" = u.id
LEFT JOIN "Shipment" s ON s."orderId" = o.id
ORDER BY o."createdAt" DESC
LIMIT 5;
'
"""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8"))

client.close()
