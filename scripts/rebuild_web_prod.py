import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

print(f"Connecting to {HOST}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)

cmd = f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml build paratunisie-web && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web"
print(f"Executing: {cmd}...")
stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)

while True:
    line = stdout.readline()
    if not line:
        break
    try:
        print(line.encode('ascii', errors='replace').decode('ascii'), end="")
    except Exception:
        pass

ssh.close()
print("\nRebuild command completed.")
