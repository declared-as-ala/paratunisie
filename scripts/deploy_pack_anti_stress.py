import paramiko
import os

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

files_to_upload = [
    ("public/assets/pack-anti-stress.jpg", f"{REMOTE_PATH}/public/assets/pack-anti-stress.jpg"),
    ("public/assets/pack-anti-stress-poster.jpg", f"{REMOTE_PATH}/public/assets/pack-anti-stress-poster.jpg"),
    ("public/assets/pack-anti-stress.mp4", f"{REMOTE_PATH}/public/assets/pack-anti-stress.mp4"),
    ("src/app/pack-anti-stress/page.tsx", f"{REMOTE_PATH}/src/app/pack-anti-stress/page.tsx"),
    ("src/components/landing/pack-anti-stress-page.tsx", f"{REMOTE_PATH}/src/components/landing/pack-anti-stress-page.tsx"),
]

print(f"Connecting to {HOST}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=20)

sftp = ssh.open_sftp()

for local, remote in files_to_upload:
    print(f"Uploading {local} -> {remote} ...")
    remote_dir = os.path.dirname(remote).replace("\\", "/")
    # ensure directory exists
    try:
        ssh.exec_command(f"mkdir -p {remote_dir}")
    except Exception:
        pass
    sftp.put(local, remote)
    print(f"Uploaded {local} successfully.")

sftp.close()

# Rebuilding web container
build_cmd = f"cd {REMOTE_PATH} && docker compose build web && docker compose up -d web"
print(f"Running on VPS: {build_cmd}...")
stdin, stdout, stderr = ssh.exec_command(build_cmd, get_pty=True)

for line in stdout:
    print(line, end="")

ssh.close()
print("Done!")

