import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import paramiko
import time

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def exec_cmd(cmd, cwd=None):
    if cwd:
        full_cmd = f"cd {cwd} && {cmd}"
    else:
        full_cmd = cmd
    print(f"\n>>> Running: {full_cmd}")
    stdin, stdout, stderr = client.exec_command(full_cmd, get_pty=True)
    out = stdout.read().decode("utf-8", errors="replace")
    print(out)
    return out

# 1. Pull Git in /opt/paratunisie/app
exec_cmd("git fetch origin && git reset --hard origin/seo/full-remediation-2026", cwd="/opt/paratunisie/app")

# 2. Build and restart paratunisie-web
exec_cmd("docker compose -f docker-compose.prod.yml build paratunisie-web", cwd="/opt/paratunisie/app")
exec_cmd("docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web", cwd="/opt/paratunisie/app")

print("\nWaiting 10s for web to be healthy...")
time.sleep(10)

exec_cmd("docker ps --filter name=paratunisie-web")

client.close()
