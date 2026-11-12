import paramiko
import tarfile
import os
import time

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

TAR_PATH = "scripts/full_codebase_sync.tar.gz"

print("1. Creating tar archive of source directories...")
with tarfile.open(TAR_PATH, "w:gz") as tar:
    for item in ["src", "apps", "packages", "public", "next.config.ts", "package.json", "package-lock.json", "tsconfig.json", "docker-compose.prod.yml"]:
        if os.path.exists(item):
            print(f"  Adding {item}...")
            tar.add(item)

print(f"Tar archive created: {os.path.getsize(TAR_PATH) / 1024 / 1024:.2f} MB")

print(f"2. Connecting to {HOST}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)

sftp = ssh.open_sftp()
remote_tar = f"{REMOTE_PATH}/sync.tar.gz"
print(f"3. Uploading archive to {remote_tar}...")
sftp.put(TAR_PATH, remote_tar)
sftp.close()
print("Archive uploaded.")

def run_stream(cmd):
    print(f"\n>>> Running on VPS: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        try:
            print(line.encode('ascii', errors='replace').decode('ascii'), end="")
        except Exception:
            pass

# 4. Extract tar on VPS
run_stream(f"cd {REMOTE_PATH} && tar -xzf sync.tar.gz && rm -f sync.tar.gz")

# 5. Build and restart containers
build_cmd = f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml build paratunisie-api paratunisie-web paratunisie-admin && docker compose -f docker-compose.prod.yml up -d"
run_stream(build_cmd)

# 6. Check status
run_stream(f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml ps")

ssh.close()
print("\nFull stack deployment completed!")

