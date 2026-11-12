import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=15)

print("Starting clean build on VPS via nohup...")
ssh.exec_command('cd /root/paratunisie && nohup docker compose -f docker-compose.prod.yml build paratunisie-web > /root/build.log 2>&1 &')

# Monitor /root/build.log
for i in range(40):
    time.sleep(5)
    stdin, stdout, stderr = ssh.exec_command('tail -n 10 /root/build.log')
    tail = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"[{i*5}s] Build log tail:\n{tail}\n")
    if "exporting to image" in tail or "naming to docker.io" in tail or "FINISHED" in tail or "Successfully tagged" in tail:
        print("Build completed!")
        break
    if "ERROR" in tail:
        print("Build error detected!")
        break

# Once built, recreate container
print("Recreating container...")
stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps paratunisie-web')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

time.sleep(10)

# Copy the 4 hero images to public/assets in container
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-creatine.webp paratunisie-web:/app/public/assets/')
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-whey.webp paratunisie-web:/app/public/assets/')
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-mass.webp paratunisie-web:/app/public/assets/')
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-vitamines.webp paratunisie-web:/app/public/assets/')

# Verify curl
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3010/ -o /tmp/home_test.html && grep -o "hero-split-4" /tmp/home_test.html')
result = stdout.read().decode('utf-8', errors='replace').strip()
print(f"Result for 'hero-split-4': '{result}'")

ssh.close()
