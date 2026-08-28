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
    print(f"COMMAND: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    print(out[:1000])
    if err: print("[STDERR]", err[:500])
    return out

run("curl -sI https://paratunisie.com/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp | head -n 10")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'Gagnez [0-9]* points'")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o '20 points = 1 DT'")
run("curl -s https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr | grep -o 'Donner votre avis'")

client.close()
