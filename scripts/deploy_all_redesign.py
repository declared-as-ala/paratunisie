import paramiko
import os

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_PATH = "/root/paratunisie"

files_to_upload = [
    ("public/assets/hero-pack-anti-stress.webp", f"{REMOTE_PATH}/public/assets/hero-pack-anti-stress.webp"),
    ("public/assets/pack-anti-stress.jpg", f"{REMOTE_PATH}/public/assets/pack-anti-stress.jpg"),
    ("public/assets/pack-anti-stress-poster.jpg", f"{REMOTE_PATH}/public/assets/pack-anti-stress-poster.jpg"),
    ("public/assets/pack-anti-stress-tile.jpg", f"{REMOTE_PATH}/public/assets/pack-anti-stress-tile.jpg"),
    ("src/components/home/home-page.tsx", f"{REMOTE_PATH}/src/components/home/home-page.tsx"),
    ("src/components/home/home-hero.tsx", f"{REMOTE_PATH}/src/components/home/home-hero.tsx"),
    ("src/components/home/home-category-tiles.tsx", f"{REMOTE_PATH}/src/components/home/home-category-tiles.tsx"),
    ("src/components/landing/pack-anti-stress-page.tsx", f"{REMOTE_PATH}/src/components/landing/pack-anti-stress-page.tsx"),
    ("src/lib/api/client.ts", f"{REMOTE_PATH}/src/lib/api/client.ts"),
    ("src/lib/landing.ts", f"{REMOTE_PATH}/src/lib/landing.ts"),
    ("src/components/layout/chrome-gate.tsx", f"{REMOTE_PATH}/src/components/layout/chrome-gate.tsx"),
    ("apps/api/src/orders/orders.controller.ts", f"{REMOTE_PATH}/apps/api/src/orders/orders.controller.ts"),
    ("apps/api/src/orders/orders.service.ts", f"{REMOTE_PATH}/apps/api/src/orders/orders.service.ts"),
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

# Rebuilding both api and web containers
build_cmd = f"cd {REMOTE_PATH} && docker compose -f docker-compose.prod.yml build paratunisie-api paratunisie-web && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-api paratunisie-web"
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

