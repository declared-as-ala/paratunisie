import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

print("Stopping and removing old paratunisie-web container...")
ssh.exec_command('docker stop paratunisie-web && docker rm paratunisie-web')
time.sleep(3)

print("Starting paratunisie-web with newly built image...")
stdin, stdout, stderr = ssh.exec_command('cd /root/paratunisie && docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web')
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))

time.sleep(5)
stdin, stdout, stderr = ssh.exec_command('docker ps --filter name=paratunisie-web --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"')
print("=== DOCKER PS ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3010/ | grep -i "RELAX" | head -n 2')
print("=== LOCALHOST 3010 RELAX ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
