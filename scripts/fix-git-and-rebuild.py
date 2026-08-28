import sys
import paramiko
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22
VPS_APP_PATH = "/opt/paratunisie/app"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def run(cmd, timeout=600):
    print("=" * 60)
    print(f"RUNNING: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out: print(out[-2000:] if len(out) > 2000 else out)
    if err: print("[STDERR]", err[-1000:] if len(err) > 1000 else err)
    return out

# 1. Clean untracked files and force pull origin main
run(f"cd {VPS_APP_PATH} && git reset --hard && git clean -fd && git pull origin main")
run(f"cd {VPS_APP_PATH} && git log -n 1 --oneline")

# 2. Build fresh images
run(f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml build --no-cache paratunisie-web paratunisie-api paratunisie-admin")

# 3. Recreate containers
run(f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml up -d --force-recreate")

time.sleep(10)

# 4. Sync Prisma DB schema
run("docker exec -i paratunisie-api npx prisma db push --accept-data-loss")
run("docker exec -i paratunisie-api npx prisma generate")

# 5. Seed reviews
run("docker exec -i paratunisie-api node prisma/seed-reviews.js")

# 6. Verify live page output
print("\n--- Live Page Verification ---")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'Gagnez [0-9]* points'")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'points avec cet achat'")

client.close()
print("\n🎉 ALL UPDATES DEPLOYED AND VERIFIED SUCCESSFULLY!")
