import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('cat /etc/nginx/sites-enabled/*')
print("=== NGINX CONF ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker ps')
print("=== DOCKER PS ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3000/ | grep -i "RELAX" | head -n 3')
print("=== PORT 3000 ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3010/ | grep -i "RELAX" | head -n 3')
print("=== PORT 3010 ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
