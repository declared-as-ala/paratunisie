import sys
import paramiko
import time
import urllib.request
import json
import ssl

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

print("Connecting to VPS via SSH...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

commands = [
    "cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main",
    # Push database schema updates to postgres
    "cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml run --rm paratunisie-api npx prisma db push",
    # Rebuild and restart API & Admin containers
    "cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml build paratunisie-api paratunisie-admin",
    "cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-api paratunisie-admin",
    "docker network connect sobitas-full-project_sobitas-net paratunisie-api 2>/dev/null || true",
    "docker network connect sobitas-full-project_sobitas-net paratunisie-admin 2>/dev/null || true",
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
print("\n✅ Deployment to VPS completed!")
