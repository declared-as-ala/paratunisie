import sys
import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = """docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c 'SELECT s.hawb, s."trackingStatus", s."trackingLabel", s."trackingCode", s."trackingLocation", s."lastAramexSync" FROM "Shipment" s ORDER BY s."createdAt" DESC;'"""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8"))
err = stderr.read().decode("utf-8")
if err.strip():
    print("STDERR:", err)

client.close()
