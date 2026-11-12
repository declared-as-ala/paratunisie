import paramiko
import sys

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

print(f"Connecting to {HOST}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)

cmd = f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml up -d --build paratunisie-api paratunisie-web"
print(f"Running: {cmd}...")
stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)

while True:
    line = stdout.readline()
    if not line:
        break
    try:
        sys.stdout.write(line.encode('ascii', errors='replace').decode('ascii'))
        sys.stdout.flush()
    except Exception:
        pass

ssh.close()
print("\nBuild and up command finished.")

