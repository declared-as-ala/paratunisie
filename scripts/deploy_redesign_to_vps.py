import os
import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

VPS_HOST = '187.53.136.225'
VPS_USER = 'root'
VPS_PASS = 'Maleksobitas20@'
REMOTE_BASE = '/root/paratunisie'

FILES_TO_UPLOAD = [
    # Assets
    ('public/assets/hero-fitness-athlete.webp', f'{REMOTE_BASE}/public/assets/hero-fitness-athlete.webp'),
    ('public/assets/fitness-athlete-shaker.webp', f'{REMOTE_BASE}/public/assets/fitness-athlete-shaker.webp'),
    # Header, Footer, Search
    ('src/components/layout/site-header.tsx', f'{REMOTE_BASE}/src/components/layout/site-header.tsx'),
    ('src/components/layout/site-footer.tsx', f'{REMOTE_BASE}/src/components/layout/site-footer.tsx'),
    ('src/components/layout/navigation/search-overlay.tsx', f'{REMOTE_BASE}/src/components/layout/navigation/search-overlay.tsx'),
    # Home components
    ('src/components/home/home-hero.tsx', f'{REMOTE_BASE}/src/components/home/home-hero.tsx'),
    ('src/components/home/featured-side-panel.tsx', f'{REMOTE_BASE}/src/components/home/featured-side-panel.tsx'),
    ('src/components/home/home-category-tiles.tsx', f'{REMOTE_BASE}/src/components/home/home-category-tiles.tsx'),
    ('src/components/home/home-trust-strip.tsx', f'{REMOTE_BASE}/src/components/home/home-trust-strip.tsx'),
    ('src/components/home/home-promo-banners.tsx', f'{REMOTE_BASE}/src/components/home/home-promo-banners.tsx'),
    ('src/components/home/home-best-sellers.tsx', f'{REMOTE_BASE}/src/components/home/home-best-sellers.tsx'),
    ('src/components/home/home-featured-brands.tsx', f'{REMOTE_BASE}/src/components/home/home-featured-brands.tsx'),
    ('src/components/home/home-fitness-split.tsx', f'{REMOTE_BASE}/src/components/home/home-fitness-split.tsx'),
    ('src/components/home/home-blog-preview.tsx', f'{REMOTE_BASE}/src/components/home/home-blog-preview.tsx'),
    ('src/components/home/home-newsletter.tsx', f'{REMOTE_BASE}/src/components/home/home-newsletter.tsx'),
    ('src/components/home/home-page.tsx', f'{REMOTE_BASE}/src/components/home/home-page.tsx'),
    # Product card & page
    ('src/components/product/product-card.tsx', f'{REMOTE_BASE}/src/components/product/product-card.tsx'),
    ('src/app/page.tsx', f'{REMOTE_BASE}/src/app/page.tsx'),
]

def main():
    print("Connecting to VPS via SSH/SFTP...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=15)
    sftp = ssh.open_sftp()

    for local_rel, remote_path in FILES_TO_UPLOAD:
        local_full = os.path.join(os.getcwd(), local_rel.replace('/', os.sep))
        print(f"Uploading {local_rel} -> {remote_path}...")
        sftp.put(local_full, remote_path)

    sftp.close()
    print("All files uploaded successfully.")

    # Rebuild Next.js web container
    print("Rebuilding Next.js frontend with complete redesign...")
    ssh.exec_command('cd /root/paratunisie && nohup docker compose -f docker-compose.prod.yml build paratunisie-web > /root/web_build.log 2>&1 &')

    for i in range(50):
        time.sleep(5)
        stdin, stdout, stderr = ssh.exec_command('tail -n 12 /root/web_build.log')
        tail = stdout.read().decode('utf-8', errors='replace').strip()
        print(f"[{i*5}s] Build log tail:\n{tail}\n")
        if "exporting to image" in tail or "naming to docker.io" in tail or "Successfully tagged" in tail:
            print("Frontend build completed!")
            break
        if "ERROR" in tail:
            print("Frontend build error detected!")
            break

    print("Recreating paratunisie-web container...")
    stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps paratunisie-web')
    print("Up output:", stdout.read().decode('utf-8', errors='replace').strip())

    time.sleep(8)

    print("Verifying live homepage HTTP response...")
    stdin, stdout, stderr = ssh.exec_command('curl -sI https://paratunisie.com/ | head -n 10')
    print("Live HTTPS Response Headers:\n", stdout.read().decode('utf-8', errors='replace').strip())

    ssh.close()
    print("Redesign deployment completed successfully!")

if __name__ == '__main__':
    main()
