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
    # Components
    ('src/components/category/category-hero-showcase.tsx', f'{REMOTE_BASE}/src/components/category/category-hero-showcase.tsx'),
    ('src/components/category/category-filter-toolbar.tsx', f'{REMOTE_BASE}/src/components/category/category-filter-toolbar.tsx'),
    ('src/components/category/category-reassurance.tsx', f'{REMOTE_BASE}/src/components/category/category-reassurance.tsx'),
    ('src/components/category/category-guide-and-faq.tsx', f'{REMOTE_BASE}/src/components/category/category-guide-and-faq.tsx'),
    ('src/components/home/relax-side-panel.tsx', f'{REMOTE_BASE}/src/components/home/relax-side-panel.tsx'),
    ('src/components/home/home-category-tiles.tsx', f'{REMOTE_BASE}/src/components/home/home-category-tiles.tsx'),
    # App pages & config
    ('src/app/[category]/page.tsx', f'{REMOTE_BASE}/src/app/[category]/page.tsx'),
    ('src/app/bien-etre/page.tsx', f'{REMOTE_BASE}/src/app/bien-etre/page.tsx'),
    ('src/app/categories/[slug]/page.tsx', f'{REMOTE_BASE}/src/app/categories/[slug]/page.tsx'),
    ('next.config.ts', f'{REMOTE_BASE}/next.config.ts'),
]

def main():
    print("Connecting to VPS...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=15)
    sftp = ssh.open_sftp()

    # Ensure remote directories exist
    dirs_to_create = [
        f'{REMOTE_BASE}/src/components/category',
        f'{REMOTE_BASE}/src/app/bien-etre',
        f'{REMOTE_BASE}/src/app/categories',
        f'{REMOTE_BASE}/src/app/categories/[slug]',
    ]
    for d in dirs_to_create:
        try:
            sftp.mkdir(d)
        except Exception:
            pass

    for local_rel, remote_path in FILES:
        local_full = os.path.join(os.getcwd(), local_rel.replace('/', os.sep))
        print(f"Uploading {local_rel} -> {remote_path}...")
        sftp.put(local_full, remote_path)

    sftp.close()
    print("All files uploaded successfully.")

    print("Rebuilding Next.js frontend with new category template and /bien-etre...")
    ssh.exec_command('cd /root/paratunisie && nohup docker compose -f docker-compose.prod.yml build paratunisie-web > /root/web_deploy_cat_redesign.log 2>&1 &')

    for i in range(50):
        time.sleep(4)
        stdin, stdout, stderr = ssh.exec_command('tail -n 8 /root/web_deploy_cat_redesign.log')
        tail = stdout.read().decode('utf-8', errors='replace').strip()
        print(f"[{i*4}s] Build tail:")
        print(tail)
        if 'naming to docker.io' in tail or 'exporting to image' in tail:
            print("\nBuild completed! Stopping old container and restarting with new image...")
            ssh.exec_command('docker stop paratunisie-web && docker rm paratunisie-web')
            time.sleep(3)
            stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web')
            print(stdout.read().decode('utf-8', errors='replace'))
            break
        if 'ERROR' in tail or 'failed to solve' in tail:
            print("\nBuild error detected!")
            break

    ssh.close()
    print("Deployment finished successfully!")

if __name__ == '__main__':
    main()
