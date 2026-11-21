# -*- coding: utf-8 -*-
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"
REMOTE_ROOT = "/root/paratunisie"

FILES = [
    "apps/api/src/catalogue/catalogue.controller.ts",
    "apps/api/src/catalogue/catalogue.service.ts",
]

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=30)
sftp = ssh.open_sftp()

for rel in FILES:
    print(f"Uploading {rel} ...")
    sftp.put(rel, f"{REMOTE_ROOT}/{rel}")
sftp.close()

print("Rebuilding & restarting paratunisie-api ...")
cmd = f"cd {REMOTE_ROOT} && docker compose -f docker-compose.prod.yml up -d --no-deps --build paratunisie-api"
stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")
rc = stdout.channel.recv_exit_status()
ssh.close()

if rc != 0:
    raise SystemExit(f"Deploy failed with exit code {rc}")
print("paratunisie-api rebuilt and restarted successfully!")
