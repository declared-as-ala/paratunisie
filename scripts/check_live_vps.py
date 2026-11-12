import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('docker ps --filter name=paratunisie-web --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"')
print("=== DOCKER PS ===\n", stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3010/ | grep -i "RELAX"')
print("=== CURL LOCALHOST:3010 FOR RELAX ===\n", stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('tail -n 35 /root/web_deploy_relax.log')
print("=== BUILD LOG ===\n", stdout.read().decode())

ssh.close()
