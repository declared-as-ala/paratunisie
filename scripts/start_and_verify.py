import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=15)

print("Starting paratunisie-web container with new build...")
stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web')
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
stdin, stdout, stderr = ssh.exec_command('curl -s -D - http://127.0.0.1:3010/ -o /tmp/home.html && head -n 15 /tmp/home.html && grep -o "hero-split-4" /tmp/home.html')
print("Curl output:\n", stdout.read().decode('utf-8', errors='replace'))

print("Checking for Créatine and Footer elements in output...")
stdin, stdout, stderr = ssh.exec_command('grep -E "CRÉATINE|WHEY PROTÉINE|MASS GAINER|VITAMINES & ASHWAGANDHA|Paiement à la Livraison" /tmp/home.html | head -n 10')
print("Elements found:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
print("Done!")
