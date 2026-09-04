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
    print(f"RUN: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    print(out)
    return out

# 1. Inspect CommandeResource.php
run("head -n 50 /root/sobitas-project/filament/app/Filament/Resources/CommandeResource.php")

# 2. Inspect Commande Model
run("head -n 50 /root/sobitas-project/filament/app/Models/Commande.php")

# 3. Check custom views or commande-form.blade.php
run("find /root/sobitas-project/filament/resources/views -name '*commande*'")

# 4. Check docker containers running this filament app
run("cd /root/sobitas-project && docker compose ps")

client.close()
