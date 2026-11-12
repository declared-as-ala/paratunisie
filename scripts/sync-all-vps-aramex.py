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

commands = [
    "curl -s -X POST http://127.0.0.1:3013/orders/aramex/sync-all",
    "docker exec -i paratunisie-postgres psql -U sobitas_pg -d paratunisie_db -c 'SELECT id, \"orderId\", hawb, \"trackingStatus\", \"trackingLabel\", \"trackingCode\", \"trackingLocation\", \"lastAramexSync\" FROM \"Shipment\";'"
]

for cmd in commands:
    print(f"\nRUNNING: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode("utf-8"))
    err = stderr.read().decode("utf-8")
    if err.strip():
        print(f"STDERR: {err}")

client.close()
