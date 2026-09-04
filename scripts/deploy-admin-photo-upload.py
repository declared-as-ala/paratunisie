import paramiko
import time

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
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    print(out)
    if err:
        print("[STDERR]", err)
    return out

# 1. Pull latest code
run("cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main")

# 2. Build and restart api & admin
run("cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml build paratunisie-api paratunisie-admin && docker compose -f docker-compose.prod.yml up -d paratunisie-api paratunisie-admin")

# 3. Check health
time.sleep(5)
run("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -i paratunisie")

client.close()
