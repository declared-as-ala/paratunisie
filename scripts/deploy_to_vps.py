import os
import sys
import time
import paramiko

VPS_HOST = '187.53.136.225'
VPS_USER = 'root'
VPS_PASS = 'Maleksobitas20@'
REMOTE_BASE = '/root/paratunisie'

FILES_TO_UPLOAD = [
    ('src/components/home/home-hero.tsx', f'{REMOTE_BASE}/src/components/home/home-hero.tsx'),
    ('src/components/layout/site-footer.tsx', f'{REMOTE_BASE}/src/components/layout/site-footer.tsx'),
    ('public/assets/hero-split-creatine.webp', f'{REMOTE_BASE}/public/assets/hero-split-creatine.webp'),
    ('public/assets/hero-split-whey.webp', f'{REMOTE_BASE}/public/assets/hero-split-whey.webp'),
    ('public/assets/hero-split-mass.webp', f'{REMOTE_BASE}/public/assets/hero-split-mass.webp'),
    ('public/assets/hero-split-vitamines.webp', f'{REMOTE_BASE}/public/assets/hero-split-vitamines.webp'),
]

def deploy():
    print(f"Connecting to {VPS_HOST} via SSH/SFTP...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=15)
    
    sftp = ssh.open_sftp()
    
    for local_rel, remote_path in FILES_TO_UPLOAD:
        local_full = os.path.join(os.getcwd(), local_rel.replace('/', os.sep))
        print(f"Uploading {local_rel} -> {remote_path}...")
        sftp.put(local_full, remote_path)
    
    sftp.close()
    print("Files successfully uploaded via SFTP.")

    # Also copy the 4 images directly into the running container just in case
    print("Copying images directly into paratunisie-web container...")
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-creatine.webp paratunisie-web:/app/public/assets/')
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-whey.webp paratunisie-web:/app/public/assets/')
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-mass.webp paratunisie-web:/app/public/assets/')
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-vitamines.webp paratunisie-web:/app/public/assets/')

    print("Rebuilding paratunisie-web with docker compose...")
    build_cmd = 'cd /root/paratunisie && docker compose -f docker-compose.prod.yml build paratunisie-web'
    stdin, stdout, stderr = ssh.exec_command(build_cmd, get_pty=True)
    
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    print("\nRestarting paratunisie-web container...")
    up_cmd = 'cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web'
    stdin, stdout, stderr = ssh.exec_command(up_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))
    print(stderr.read().decode('utf-8', errors='replace'))

    print("Waiting 10s for container healthcheck...")
    time.sleep(10)

    # Copy the images into the newly created container to guarantee they are present in /app/public/assets/
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-creatine.webp paratunisie-web:/app/public/assets/')
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-whey.webp paratunisie-web:/app/public/assets/')
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-mass.webp paratunisie-web:/app/public/assets/')
    ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-vitamines.webp paratunisie-web:/app/public/assets/')

    stdin, stdout, stderr = ssh.exec_command('docker ps --filter "name=paratunisie-web" --format "{{.Names}}: {{.Status}}"')
    print("Container status:", stdout.read().decode('utf-8', errors='replace').strip())

    # Test HTTP 200 on localhost:3010
    stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/')
    http_code = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"HTTP Status code on homepage: {http_code}")

    ssh.close()
    print("Deployment completed successfully!")

if __name__ == '__main__':
    deploy()
