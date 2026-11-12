import paramiko
import os

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=20)

sftp = ssh.open_sftp()

files = [
    ("Dockerfile", f"{REMOTE_PATH}/Dockerfile"),
    ("apps/api/Dockerfile", f"{REMOTE_PATH}/apps/api/Dockerfile"),
    ("apps/admin/Dockerfile", f"{REMOTE_PATH}/apps/admin/Dockerfile"),
]

for local, remote in files:
    print(f"Uploading {local} -> {remote} ...")
    remote_dir = os.path.dirname(remote).replace("\\", "/")
    try:
        ssh.exec_command(f"mkdir -p {remote_dir}")
    except Exception:
        pass
    sftp.put(local, remote)
    print(f"Uploaded {local} successfully.")

sftp.close()
ssh.close()
print("All Dockerfiles uploaded!")

