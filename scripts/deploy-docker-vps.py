import sys
import subprocess
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22
VPS_APP_PATH = "/opt/paratunisie/app"

def run_ssh(client, command, timeout=600):
    print(f"\n>>> {command}")
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out: print(out)
    if err: print("[STDERR]", err)
    return out, err

def main():
    print("===============================================================")
    print("🚀 PARATUNISIE DOCKER PRODUCTION DEPLOYMENT (145.223.118.9)")
    print("===============================================================")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
    print("✓ SSH connected successfully to root@145.223.118.9")

    # 1. Pull latest git code
    run_ssh(client, f"cd {VPS_APP_PATH} && git pull origin main")

    # 2. Rebuild and restart docker compose production containers
    print("\n--- Building and launching Docker Compose services ---")
    run_ssh(client, f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml build")
    run_ssh(client, f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml up -d")

    # 3. Wait for API to be healthy
    print("\n--- Waiting for API container to initialize ---")
    time.sleep(10)

    # 4. Run Prisma schema update inside API container
    print("\n--- Syncing Database Schema with Prisma ---")
    run_ssh(client, "docker exec -i paratunisie-api npx prisma db push --accept-data-loss")
    run_ssh(client, "docker exec -i paratunisie-api npx prisma generate")

    # 5. Seed reviews into production PostgreSQL database
    print("\n--- Seeding 50 Reviews per Product into Production Database ---")
    run_ssh(client, "docker exec -i paratunisie-api node prisma/seed-reviews.js")

    # 6. Restart API and Web to pick up all changes cleanly
    print("\n--- Reloading Docker services ---")
    run_ssh(client, "docker restart paratunisie-api paratunisie-web paratunisie-admin")
    time.sleep(10)

    # 7. Check container statuses
    print("\n--- Docker Containers Status ---")
    run_ssh(client, f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml ps")

    # 8. Live smoke test
    print("\n--- Live Production Smoke Tests ---")
    run_ssh(client, "curl -sI https://paratunisie.com/ | head -n 5")
    run_ssh(client, "curl -s https://paratunisie.com/api/v1/loyalty/admin/stats | head -c 250")
    run_ssh(client, "curl -s https://paratunisie.com/api/v1/reviews/admin/list?pageSize=2 | head -c 250")

    client.close()
    print("\n===============================================================")
    print("🎉 DOCKER PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!")
    print("===============================================================")

if __name__ == "__main__":
    main()
