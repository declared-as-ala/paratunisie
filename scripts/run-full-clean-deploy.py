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
    # Remove any stale lock
    "rm -f /tmp/paratunisie-deploy.lock",
    "cd /opt/paratunisie/app && git fetch origin main && git reset --hard origin/main",
    # 1. Build and restart paratunisie-api
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml build paratunisie-api",
    "docker rm -f paratunisie-api || true",
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml up -d --no-deps paratunisie-api",
    "docker exec paratunisie-api npx prisma db push --accept-data-loss",
    # 2. Build and restart paratunisie-admin
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml build paratunisie-admin",
    "docker rm -f paratunisie-admin || true",
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml up -d --no-deps paratunisie-admin",
    # 3. Build and restart paratunisie-web
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml build paratunisie-web",
    "docker rm -f paratunisie-web || true",
    "docker compose -f /opt/paratunisie/app/docker-compose.prod.yml up -d --no-deps paratunisie-web",
    # Ensure proxy networks
    "docker network connect sobitas-full-project_sobitas-net paratunisie-web 2>/dev/null || true",
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
print("\n✅ Deployment completed successfully!")
