import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('grep -rn "proxy_pass" /etc/nginx/')
print("=== PROXY_PASS IN NGINX ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker ps --format "{{.Names}} -> {{.Ports}}"')
print("=== DOCKER PORTS ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
