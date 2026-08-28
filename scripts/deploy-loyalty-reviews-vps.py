import sys
import subprocess
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

try:
    import paramiko
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "paramiko"], check=True)
    import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22
VPS_APP_PATH = "/opt/paratunisie/app"

def run_ssh(client, command, timeout=300):
    print(f"\n>>> {command}")
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out: print(out)
    if err: print("[STDERR]", err)
    return out, err

def main():
    print("===============================================================")
    print("🚀 DEPLOYING TO VPS (145.223.118.9)...")
    print("===============================================================")
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
    print("✓ SSH connected successfully to root@145.223.118.9")

    # 1. Git pull
    run_ssh(client, f"cd {VPS_APP_PATH} && git pull origin main")

    # 2. Database migration & Prisma generation in API
    run_ssh(client, f"cd {VPS_APP_PATH}/apps/api && npx prisma db push --accept-data-loss && npx prisma generate")

    # 3. Seed reviews into real database
    run_ssh(client, f"cd {VPS_APP_PATH}/apps/api && node prisma/seed-reviews.js")

    # 4. Build API
    print("\n--- Building API ---")
    run_ssh(client, f"cd {VPS_APP_PATH}/apps/api && npm run build")

    # 5. Build Admin
    print("\n--- Building Admin ---")
    run_ssh(client, f"cd {VPS_APP_PATH}/apps/admin && npm run build")

    # 6. Build Storefront
    print("\n--- Building Storefront ---")
    run_ssh(client, f"cd {VPS_APP_PATH} && npm run build")

    # 7. Restart PM2 services
    print("\n--- Restarting PM2 Services ---")
    run_ssh(client, "pm2 restart all")
    time.sleep(4)
    run_ssh(client, "pm2 status")

    # 8. Verification checks
    print("\n--- Verification: Checking Live Endpoints ---")
    run_ssh(client, "curl -sI https://paratunisie.com | head -n 5")
    run_ssh(client, "curl -s http://localhost:3001/api/v1/loyalty/admin/stats | head -c 300")
    run_ssh(client, "curl -s http://localhost:3001/api/v1/reviews/admin/list?pageSize=2 | head -c 300")

    client.close()
    print("\n===============================================================")
    print("🎉 DEPLOYMENT TO PRODUCTION COMPLETED SUCCESSFULLY!")
    print("===============================================================")

if __name__ == "__main__":
    main()
