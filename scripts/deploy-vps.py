"""
VPS deployment script for ParaTunisie accessoires update
Uses paramiko (Python SSH library) for reliable Windows SSH
"""
import subprocess
import sys
import os
import tarfile
import time

# Try to import paramiko, install if not available
try:
    import paramiko
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "paramiko"], check=True)
    import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22
VPS_APP_PATH = "/opt/paratunisie/app"

WORKSPACE = r"c:\Users\Ala\Desktop\parapharmacie"

def run_ssh(client, command, timeout=300):
    print(f"\n>>> {command}")
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out: print(out)
    if err: print("[STDERR]", err)
    return out, err

def create_tar():
    """Pack changed files into a tar"""
    tar_path = os.path.join(WORKSPACE, "deploy_update.tar.gz")
    files_to_pack = [
        ("src/components/home/home-hero.tsx", "src/components/home/home-hero.tsx"),
        ("src/components/home/home-split-feature.tsx", "src/components/home/home-split-feature.tsx"),
        ("src/components/home/home-gammes-grid.tsx", "src/components/home/home-gammes-grid.tsx"),
        ("src/components/home/home-page.tsx", "src/components/home/home-page.tsx"),
        ("src/components/layout/navigation/mega-menu.tsx", "src/components/layout/navigation/mega-menu.tsx"),
        ("src/lib/data/categories.ts", "src/lib/data/categories.ts"),
        ("apps/api/prisma/seed-accessoires.ts", "apps/api/prisma/seed-accessoires.ts"),
        ("apps/api/prisma/sync-meili.js", "apps/api/prisma/sync-meili.js"),
    ]
    
    with tarfile.open(tar_path, "w:gz") as tar:
        for local_rel, arc_name in files_to_pack:
            local_abs = os.path.join(WORKSPACE, local_rel)
            if os.path.exists(local_abs):
                tar.add(local_abs, arcname=arc_name)
                print(f"  + Packed: {arc_name}")
            else:
                print(f"  ! Missing: {local_abs}")
    
    print(f"\nTar created: {tar_path} ({os.path.getsize(tar_path) // 1024} KB)")
    return tar_path

def upload_file(sftp, local_path, remote_path):
    print(f"Uploading {os.path.basename(local_path)} -> {remote_path}")
    sftp.put(local_path, remote_path)
    print("  Done.")

def main():
    print("=== ParaTunisie VPS Deployment ===\n")
    
    # 1. Create deployment tar
    tar_path = create_tar()
    
    # 2. Connect to VPS
    print(f"\nConnecting to {VPS_HOST}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
    print("Connected!")
    
    # 3. Get VPS app path
    out, _ = run_ssh(client, f"ls {VPS_APP_PATH} | head -5 && echo 'PATH OK'")
    if "PATH OK" not in out:
        # Try alternative path
        out2, _ = run_ssh(client, "find /opt /root /home -name 'docker-compose*.yml' -maxdepth 4 2>/dev/null | head -5")
        print("Found compose files:", out2)
        vps_path = out2.strip().split('\n')[0].rsplit('/', 1)[0] if out2.strip() else VPS_APP_PATH
        print(f"Using path: {vps_path}")
    else:
        vps_path = VPS_APP_PATH
    
    # 4. Upload tar via SFTP
    print(f"\nUploading deployment package to {vps_path}/...")
    sftp = client.open_sftp()
    remote_tar = f"{vps_path}/deploy_update.tar.gz"
    upload_file(sftp, tar_path, remote_tar)
    sftp.close()
    
    # 5. Extract on VPS
    run_ssh(client, f"cd {vps_path} && tar -xzf deploy_update.tar.gz && echo 'Extracted OK'")
    
    # 6. Run accessoires seeder on VPS
    print("\nRunning accessoires seeder on VPS...")
    run_ssh(client, f"cd {vps_path}/apps/api && npx tsx prisma/seed-accessoires.ts 2>&1 | tail -20", timeout=120)
    
    # 7. Sync Meilisearch
    print("\nSyncing Meilisearch on VPS...")
    run_ssh(client, f"cd {vps_path}/apps/api && node prisma/sync-meili.js 2>&1", timeout=60)
    
    # 8. Rebuild web container
    print("\nRebuilding web container on VPS...")
    compose_file = "docker-compose.prod.yml"
    # Check which compose file exists
    out, _ = run_ssh(client, f"ls {vps_path}/docker-compose*.yml 2>/dev/null")
    if out.strip():
        compose_file = out.strip().split('\n')[0].split('/')[-1]
        print(f"Using compose file: {compose_file}")
    
    run_ssh(client, 
        f"cd {vps_path} && docker compose -f {compose_file} up -d --build --no-deps paratunisie-web 2>&1 | tail -20",
        timeout=600
    )
    
    # 9. Verify
    print("\nVerifying deployment...")
    out, _ = run_ssh(client, "docker ps --format '{{.Names}} - {{.Status}} - {{.Ports}}'")
    
    # 10. Test HTTP
    time.sleep(5)
    out, _ = run_ssh(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/accessoires 2>/dev/null || curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null")
    print(f"\nHTTP status: {out}")
    
    client.close()
    os.remove(tar_path)
    print("\n=== DEPLOYMENT COMPLETE ===")

if __name__ == "__main__":
    main()
