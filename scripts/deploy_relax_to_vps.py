import os
import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

VPS_HOST = '187.53.136.225'
VPS_USER = 'root'
VPS_PASS = 'Maleksobitas20@'
REMOTE_BASE = '/root/paratunisie'

FILES = [
    ('src/components/home/relax-side-panel.tsx', f'{REMOTE_BASE}/src/components/home/relax-side-panel.tsx'),
    ('src/components/home/home-hero.tsx', f'{REMOTE_BASE}/src/components/home/home-hero.tsx'),
    ('src/components/home/home-page.tsx', f'{REMOTE_BASE}/src/components/home/home-page.tsx'),
]

def main():
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=15)
    sftp = ssh.open_sftp()

    for local_rel, remote_path in FILES:
        local_full = os.path.join(os.getcwd(), local_rel.replace('/', os.sep))
        print(f"Uploading {local_rel} -> {remote_path}...")
        sftp.put(local_full, remote_path)

    sftp.close()
    print("Files uploaded successfully.")

    print("Rebuilding Next.js frontend...")
    ssh.exec_command('cd /root/paratunisie && nohup docker compose -f docker-compose.prod.yml build paratunisie-web > /root/web_deploy_relax.log 2>&1 &')

    for i in range(45):
        time.sleep(4)
        stdin, stdout, stderr = ssh.exec_command('tail -n 8 /root/web_deploy_relax.log')
        tail = stdout.read().decode('utf-8', errors='replace').strip()
        print(f"[{i*4}s] Build tail:")
        print(tail)
        if 'naming to docker.io' in tail or 'exporting to image' in tail:
            print("\nBuild completed! Recreating container...")
            stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps paratunisie-web')
            print(stdout.read().decode('utf-8', errors='replace'))
            break
        if 'ERROR' in tail or 'failed to solve' in tail:
            print("\nBuild error detected!")
            break

    ssh.close()
    print("Done!")

if __name__ == '__main__':
    main()
