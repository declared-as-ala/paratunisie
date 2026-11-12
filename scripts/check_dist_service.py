import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-api sed -n "80,150p" /app/dist/reviews/reviews.service.js')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
