import paramiko
import tarfile
import os

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

TAR_PATH = "scripts/code_update.tar.gz"

print("1. Creating tar archive of updated code...")
with tarfile.open(TAR_PATH, "w:gz") as tar:
    tar.add("src")
    tar.add("apps/api/src", arcname="apps/api/src")
    tar.add("apps/api/prisma", arcname="apps/api/prisma")
    tar.add("public")

print(f"Tar size: {os.path.getsize(TAR_PATH) / 1024 / 1024:.2f} MB")

print("2. Connecting to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=20)

sftp = ssh.open_sftp()
remote_tar = f"{REMOTE_PATH}/update.tar.gz"
print(f"3. Uploading to {remote_tar}...")
sftp.put(TAR_PATH, remote_tar)
sftp.close()

stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_PATH} && tar -xzf update.tar.gz && rm -f update.tar.gz")
print("Extracted update:", stdout.read().decode())
err = stderr.read().decode()
if err: print("Extract err:", err)

ssh.close()
print("Latest code uploaded and extracted!")

