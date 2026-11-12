import paramiko
import os

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

files_to_upload = [
    ("src/lib/landing.ts", f"{REMOTE_PATH}/src/lib/landing.ts"),
    ("src/components/layout/chrome-gate.tsx", f"{REMOTE_PATH}/src/components/layout/chrome-gate.tsx"),
    ("src/components/landing/pack-anti-stress-page.tsx", f"{REMOTE_PATH}/src/components/landing/pack-anti-stress-page.tsx"),
    ("src/components/home/relax-side-panel.tsx", f"{REMOTE_PATH}/src/components/home/relax-side-panel.tsx"),
]

print(f"Connecting to {HOST}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=20)

sftp = ssh.open_sftp()

for local, remote in files_to_upload:
    print(f"Uploading {local} -> {remote} ...")
    remote_dir = os.path.dirname(remote).replace("\\", "/")
    try:
        ssh.exec_command(f"mkdir -p {remote_dir}")
    except Exception:
        pass
    sftp.put(local, remote)
    print(f"Uploaded {local} successfully.")

sftp.close()

# Rebuilding web container
build_cmd = f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml build paratunisie-web && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web"
print(f"Running on VPS: {build_cmd}...")
stdin, stdout, stderr = ssh.exec_command(build_cmd, get_pty=True)

while True:
    line = stdout.readline()
    if not line:
        break
    try:
        print(line.encode('ascii', errors='replace').decode('ascii'), end="")
    except Exception:
        pass

ssh.close()
print("\nRebuild and deploy finished!")

