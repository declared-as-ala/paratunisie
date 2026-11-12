import paramiko
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HOST = "187.53.136.225"
PORT = 22
USER = "root"
PASS = "Maleksobitas20@"
REMOTE_ROOT = "/root/paratunisie"

FILES_TO_UPLOAD = [
    "src/app/layout.tsx",
    "src/app/[category]/page.tsx",
    "src/app/bien-etre/page.tsx",
    "src/components/category/category-product-card.tsx",
    "src/components/category/category-catalog-view.tsx",
    "src/components/layout/navigation/mobile-tab-bar.tsx",
    "src/components/layout/site-header.tsx",
    "src/components/layout/site-footer.tsx",
    "src/components/home/home-page.tsx",
    "src/components/home/home-hero.tsx",
    "src/components/home/featured-side-panel.tsx",
    "src/components/home/relax-side-panel.tsx",
    "src/components/home/featured-product-actions.tsx",
    "src/components/home/home-category-tiles.tsx",
    "src/components/home/home-trust-strip.tsx",
    "src/components/home/home-promo-banners.tsx",
    "src/components/home/home-best-sellers.tsx",
    "src/components/home/home-featured-brands.tsx",
    "src/components/home/home-fitness-split.tsx",
    "src/components/home/home-blog-preview.tsx",
    "src/components/home/home-newsletter.tsx",
    "src/components/product/product-card.tsx",
]

def ensure_remote_dir(sftp, remote_dir):
    dirs = []
    while remote_dir not in ("/", ""):
        dirs.append(remote_dir)
        remote_dir = os.path.dirname(remote_dir)
    for d in reversed(dirs):
        try:
            sftp.stat(d)
        except FileNotFoundError:
            sftp.mkdir(d)

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()

    for rel_path in FILES_TO_UPLOAD:
        local_path = os.path.join(os.getcwd(), rel_path.replace("/", os.sep))
        remote_path = f"{REMOTE_ROOT}/{rel_path}"
        remote_dir = os.path.dirname(remote_path)
        ensure_remote_dir(sftp, remote_dir)
        print(f"Uploading {rel_path} -> {remote_path}")
        sftp.put(local_path, remote_path)

    sftp.close()

    cmd = (
        f"cd {REMOTE_ROOT} && "
        "DOCKER_BUILDKIT=1 docker compose -f docker-compose.prod.yml build --progress=plain paratunisie-web && "
        "docker stop paratunisie-web && "
        "docker rm paratunisie-web && "
        "docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web && "
        "sleep 4 && "
        "docker ps --filter name=paratunisie-web --format '{{.Names}} {{.Status}}'"
    )
    print("Building and restarting paratunisie-web on VPS...")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=False)
    for line in iter(stdout.readline, ""):
        print(line, end="")
    err_out = stderr.read().decode("utf-8", errors="replace")
    if err_out:
        print(err_out[-2000:])
    exit_status = stdout.channel.recv_exit_status()
    print(f"\nDeploy exit status: {exit_status}")
    ssh.close()

if __name__ == "__main__":
    main()

