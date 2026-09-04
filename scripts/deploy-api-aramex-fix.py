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

def run(cmd):
    print("=" * 60)
    print(f"RUNNING: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace")
    print(out)
    return out

# Pull latest code
run("cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main")

# Build and restart paratunisie-api
run("cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml build paratunisie-api && docker compose -f docker-compose.prod.yml up -d paratunisie-api")

client.close()
