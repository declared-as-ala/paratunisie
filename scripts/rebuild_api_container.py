import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

print("Copying reviews.service.ts into container...")
ssh.exec_command('docker cp /root/paratunisie/apps/api/src/reviews/reviews.service.ts paratunisie-api:/app/src/reviews/reviews.service.ts')

print("Running npm run build inside paratunisie-api...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-api npm run build')
print("Stdout:", stdout.read().decode('utf-8', errors='replace').strip())
print("Stderr:", stderr.read().decode('utf-8', errors='replace').strip())

print("Restarting paratunisie-api...")
stdin, stdout, stderr = ssh.exec_command('docker restart paratunisie-api')
print("Restart output:", stdout.read().decode('utf-8', errors='replace').strip())

import time
time.sleep(5)

print("Testing API Rating for OstroVit Creatine (cmtadbgak000zuqi0wz6142f9)...")
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9/rating')
print("API Rating output:", stdout.read().decode('utf-8', errors='replace').strip())

print("Testing API Reviews for OstroVit Creatine...")
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9 | head -c 300')
print("API Reviews sample:\n", stdout.read().decode('utf-8', errors='replace').strip())

ssh.close()
