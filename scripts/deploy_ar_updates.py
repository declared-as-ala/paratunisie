# -*- coding: utf-8 -*-
import os
import glob
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"
REMOTE_ROOT = "/root/paratunisie"

CODE_FILES = [
    "src/app/conseils/[slug]/page.tsx",
    "src/components/blog/blog-hub-client.tsx",
    "src/lib/seo/schema.ts",
]

print("Connecting to VPS via SSH/SFTP...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=30)
sftp = ssh.open_sftp()

# Skip upload if --rebuild-only is passed
import sys
if "--rebuild-only" not in sys.argv:
    for rel_path in CODE_FILES:
        remote_path = f"{REMOTE_ROOT}/{rel_path}"
        print(f"Uploading {rel_path} -> {remote_path}")
        sftp.put(rel_path, remote_path)

    webp_files = sorted(glob.glob("public/assets/blog/*-tn-ar.webp"))
    print(f"Uploading {len(webp_files)} Tunisian Arabic WebP covers...")
    for local_p in webp_files:
        fname = os.path.basename(local_p)
        remote_p = f"{REMOTE_ROOT}/public/assets/blog/{fname}"
        sftp.put(local_p, remote_p)

sftp.close()
print("Detecting web service and rebuilding...")

_, out_svc, _ = ssh.exec_command(f"docker inspect paratunisie-web --format '{{{{index .Config.Labels \"com.docker.compose.project.config_files\"}}}}'")
cfg_files = out_svc.read().decode().strip()
print("Compose config_files:", cfg_files)

_, out_ls, _ = ssh.exec_command(f"ls -la {REMOTE_ROOT}/*.yml {REMOTE_ROOT}/*.sh 2>/dev/null || true")
print(out_ls.read().decode())

# Use docker compose with explicit config file if detected, and --no-deps to avoid touching api env
if cfg_files:
    f_flags = " ".join(f"-f {p.strip()}" for p in cfg_files.split(",") if p.strip())
    cmd = f"cd {REMOTE_ROOT} && docker compose {f_flags} up -d --no-deps --build paratunisie-web"
else:
    cmd = f"cd {REMOTE_ROOT} && docker compose up -d --no-deps --build paratunisie-web"
stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")
rc = stdout.channel.recv_exit_status()
ssh.close()

if rc != 0:
    raise SystemExit(f"Deploy failed with exit code {rc}")
print("Deploy completed successfully!")
