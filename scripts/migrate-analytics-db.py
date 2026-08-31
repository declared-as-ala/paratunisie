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
    "cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main",
    "cd /opt/paratunisie/app/apps/api && npx prisma db push --accept-data-loss",
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml build paratunisie-api paratunisie-web paratunisie-admin",
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml up -d --no-deps paratunisie-api paratunisie-web paratunisie-admin",
]

for cmd in commands:
    print(f"\n{'='*60}\nRUNNING: {cmd}\n{'='*60}")
    stdin, stdout, stderr = client.exec_command(cmd)
    for line in iter(stdout.readline, ""):
        print(line, end="")
    err = stderr.read().decode("utf-8", errors="replace")
    if err.strip():
        print(f"STDERR: {err}")

client.close()
print("\n✅ Analytics database migration and service deployment completed!")
