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

cmd = """
set -e
cd /opt/paratunisie/app
rm -f .git/index.lock .git/refs/remotes/origin/main.lock
git fetch --prune --force origin main
git reset --hard origin/main
docker compose -f docker-compose.prod.yml build paratunisie-web paratunisie-admin
docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web paratunisie-admin
"""

print("Running deployment on VPS...")
stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)

for line in iter(stdout.readline, ""):
    print(line, end="")

print("\nVerifying containers status:")
stdin, stdout, stderr = client.exec_command("docker ps --filter 'name=paratunisie' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
print(stdout.read().decode("utf-8"))

client.close()
print("✅ Done!")
