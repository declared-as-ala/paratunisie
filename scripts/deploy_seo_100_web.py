# -*- coding: utf-8 -*-
import os
import json
import tarfile
import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
    manifest = json.load(f)

TAR_PATH = "scripts/seo_100_web_sync.tar.gz"
print("1. Creating tar archive of updated web files + 100 blog WebP covers...")
with tarfile.open(TAR_PATH, "w:gz") as tar:
    tar.add("src/app/conseils/[slug]/page.tsx")
    tar.add("src/components/category/category-supporting-guides.tsx")
    tar.add("src/components/category/category-catalog-view.tsx")
    for item in manifest:
        p = "public/" + item["local_image_path"].lstrip("/")
        if os.path.exists(p):
            tar.add(p)

print(f"Tar size: {os.path.getsize(TAR_PATH) / 1024 / 1024:.2f} MB")

print("2. Connecting to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)

sftp = ssh.open_sftp()
remote_tar = f"{REMOTE_PATH}/seo_web_sync.tar.gz"
print(f"3. Uploading to {remote_tar}...")
sftp.put(TAR_PATH, remote_tar)
sftp.close()

def run_stream(cmd):
    print(f">>> {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        try:
            print(line.encode("ascii", errors="replace").decode("ascii"), end="")
        except Exception:
            pass

run_stream(f"cd {REMOTE_PATH} && tar -xzf seo_web_sync.tar.gz && rm -f seo_web_sync.tar.gz")
run_stream(f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml build paratunisie-web && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web")
run_stream(f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml ps")

ssh.close()
print("\nWeb deployment of 100 SEO articles + Category hubs completed!")
