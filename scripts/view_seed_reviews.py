import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('head -n 40 /root/paratunisie/apps/api/prisma/seed-reviews.js 2>/dev/null || cat /root/paratunisie/apps/api/prisma/quarantine-unverifiable-reviews.js')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
