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

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def run(cmd):
    print("=" * 60)
    print(f"COMMAND: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out: print(out[:1000])
    if err: print("[STDERR]", err[:500])
    return out

run("docker network connect sobitas-full-project_sobitas-net paratunisie-web || true")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-api || true")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-admin || true")

# Reload nginx proxy manager
run("docker restart sobitas-npm")
time.sleep(6)

print("\n--- Verifying Live Domain Uploads and Points ---")
run("curl -sI https://paratunisie.com/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp | head -n 10")
run("curl -sI https://paratunisie.com/ | head -n 5")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'Gagnez [0-9]* points'")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'points avec cet achat'")

client.close()
print("\n✓ Network and proxy reload completed!")
