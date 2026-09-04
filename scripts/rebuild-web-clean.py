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

print("Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

commands = """
cd /opt/paratunisie/app
git fetch origin main
git reset --hard origin/main

echo "=== Building paratunisie-web ==="
docker compose build paratunisie-web
docker compose up -d paratunisie-web

echo "=== paratunisie-web updated successfully ==="
docker ps --filter "name=paratunisie-web"
"""

stdin, stdout, stderr = client.exec_command(commands, get_pty=True)
for line in stdout:
    print(line, end="")

client.close()
print("\n🎉 Web container updated on VPS!")
