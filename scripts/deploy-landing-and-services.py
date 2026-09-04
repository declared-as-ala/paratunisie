import paramiko
import sys
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

print("Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

commands = """
cd /opt/paratunisie/app
git fetch origin main
git reset --hard origin/main

# 1. Rebuild web container
echo "=== Building paratunisie-web ==="
docker compose build paratunisie-web
docker compose up -d paratunisie-web

# 2. Rebuild api container
echo "=== Building paratunisie-api ==="
docker compose build paratunisie-api
docker compose up -d paratunisie-api

# 3. Rebuild admin container
echo "=== Building paratunisie-admin ==="
docker compose build paratunisie-admin
docker compose up -d paratunisie-admin

echo "=== All containers updated ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
"""

stdin, stdout, stderr = client.exec_command(commands, get_pty=True)
for line in stdout:
    print(line, end="")

client.close()
print("\n🎉 Deployment completed on VPS!")
