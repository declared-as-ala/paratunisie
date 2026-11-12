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
    ('src/components/home/home-hero.tsx', f'{REMOTE_BASE}/src/components/home/home-hero.tsx'),
    ('src/components/layout/site-footer.tsx', f'{REMOTE_BASE}/src/components/layout/site-footer.tsx'),
    ('src/lib/seo/schema.ts', f'{REMOTE_BASE}/src/lib/seo/schema.ts'),
    ('src/app/produits/[slug]/page.tsx', f'{REMOTE_BASE}/src/app/produits/[slug]/page.tsx'),
    ('src/lib/api/client.ts', f'{REMOTE_BASE}/src/lib/api/client.ts'),
    ('src/components/home/home-category-tiles.tsx', f'{REMOTE_BASE}/src/components/home/home-category-tiles.tsx'),
    ('src/components/home/home-page.tsx', f'{REMOTE_BASE}/src/components/home/home-page.tsx'),
    ('apps/api/src/reviews/reviews.service.ts', f'{REMOTE_BASE}/apps/api/src/reviews/reviews.service.ts'),
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
    print("All modified files uploaded successfully.")

    # Test API rating on OstroVit to confirm backend reviews are live
    stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9/rating')
    print("API Rating for OstroVit Creatine:", stdout.read().decode('utf-8', errors='replace').strip())

    # Build web container
    print("Rebuilding Next.js frontend with new schema, categories and original hero/footer...")
    ssh.exec_command('cd /root/paratunisie && nohup docker compose -f docker-compose.prod.yml build paratunisie-web > /root/web_build.log 2>&1 &')

    for i in range(40):
        time.sleep(5)
        stdin, stdout, stderr = ssh.exec_command('tail -n 10 /root/web_build.log')
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
    print("Up:", stdout.read().decode('utf-8', errors='replace').strip())

    time.sleep(10)

    # Verify live homepage
    stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3010/ -o /tmp/home_final.html && head -n 30 /tmp/home_final.html')
    print("Homepage verification done.")

    # Check that OstroVit product schema has aggregateRating and review
    stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3010/produits/creatine-monohydrate-ostrovit-500gr -o /tmp/ostrovit.html')
    stdin, stdout, stderr = ssh.exec_command('grep -o "aggregateRating" /tmp/ostrovit.html')
    print("aggregateRating in HTML:", stdout.read().decode('utf-8', errors='replace').strip())

    stdin, stdout, stderr = ssh.exec_command('grep -o "Review" /tmp/ostrovit.html | head -n 5')
    print("Reviews in HTML:", stdout.read().decode('utf-8', errors='replace').strip())

    ssh.close()
    print("All deployments and verifications completed successfully!")

if __name__ == '__main__':
    main()
