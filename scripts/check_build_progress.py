import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('tail -n 25 /root/build.log 2>/dev/null')
print("=== TAIL OF BUILD LOG ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker ps --filter "name=paratunisie-web" --format "{{.Names}}: {{.Status}}"')
print("=== CONTAINER STATUS ===")
print(stdout.read().decode('utf-8', errors='replace').strip())

ssh.close()
