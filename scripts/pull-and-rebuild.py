import sys
import paramiko
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
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
    if out: print(out[-1500:] if len(out) > 1500 else out)
    if err: print("[STDERR]", err[-1000:] if len(err) > 1000 else err)
    return out

# 1. Pull latest git code
run(f"cd {VPS_APP_PATH} && git pull origin main")
run(f"cd {VPS_APP_PATH} && git log -n 1 --oneline")

# 2. Rebuild images with latest code
run(f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml build --no-cache paratunisie-web paratunisie-api paratunisie-admin")

# 3. Recreate and restart containers
run(f"cd {VPS_APP_PATH} && docker compose -f docker-compose.prod.yml up -d --force-recreate")

time.sleep(8)

# 4. Verify rendered points in HTML
print("\n--- Verifying Rendered Points and Reviews on Live Page ---")
run("curl -s http://127.0.0.1:3010/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'Gagnez [0-9]* points'")
run("curl -s http://127.0.0.1:3010/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'points avec cet achat'")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'Gagnez [0-9]* points'")

client.close()
print("\n✓ Verification complete!")
