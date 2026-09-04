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

cmd = """
cd /opt/paratunisie/app
rm -f .git/index.lock .git/refs/remotes/origin/main.lock /tmp/paratunisie-deploy.lock
git gc --prune=now || true
git fetch --prune --force origin main
git reset --hard origin/main
git status
"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8"))
err = stderr.read().decode("utf-8")
if err.strip():
    print(f"STDERR: {err}")

client.close()
