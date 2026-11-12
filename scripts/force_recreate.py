import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=15)

print("Forcing recreate of paratunisie-web container...")
stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps paratunisie-web')
print("Stdout:", stdout.read().decode('utf-8', errors='replace'))
print("Stderr:", stderr.read().decode('utf-8', errors='replace'))

print("Waiting 10s for container to boot...")
time.sleep(10)

print("Ensuring hero split images exist inside the container...")
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-creatine.webp paratunisie-web:/app/public/assets/')
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-whey.webp paratunisie-web:/app/public/assets/')
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-mass.webp paratunisie-web:/app/public/assets/')
ssh.exec_command('docker cp /root/paratunisie/public/assets/hero-split-vitamines.webp paratunisie-web:/app/public/assets/')

stdin, stdout, stderr = ssh.exec_command('docker ps --filter "name=paratunisie-web" --format "{{.Names}}: {{.Status}}"')
print("Container Status:", stdout.read().decode('utf-8', errors='replace').strip())

print("Testing curl to http://127.0.0.1:3010/...")
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3010/ -o /tmp/home_new.html && grep -o "hero-split-4" /tmp/home_new.html')
print("Hero check:", stdout.read().decode('utf-8', errors='replace'))

print("Checking 4 pillars text...")
stdin, stdout, stderr = ssh.exec_command('grep -E "CRÉATINE|WHEY PROTÉINE|MASS GAINER|VITAMINES & ASHWAGANDHA" /tmp/home_new.html')
print("Pillars found:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
print("Done!")
