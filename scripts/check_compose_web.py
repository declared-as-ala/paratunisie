import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('cat /root/paratunisie/docker-compose.prod.yml | grep -A 10 "paratunisie-web:"')
print("=== DOCKER COMPOSE WEB ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
