import paramiko
import sys
import time

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

print("Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = """
cd /opt/paratunisie/app
git fetch origin main
git reset --hard origin/main

echo "=== Building paratunisie-web with new phone number ==="
docker compose -f docker-compose.prod.yml build paratunisie-web
docker compose -f docker-compose.prod.yml up -d --force-recreate paratunisie-web
sleep 2
docker ps --filter "name=paratunisie-web"
"""

stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
for line in stdout:
    try:
        print(line, end="")
    except Exception:
        pass

client.close()
print("\n🎉 Web container updated on VPS with new phone number!")
