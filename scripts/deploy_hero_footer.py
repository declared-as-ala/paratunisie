import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
print("=== DOCKER CONTAINERS ===")
print(stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('find /root /var/www /home -maxdepth 3 -name "*paratunisie*" -type d 2>/dev/null')
print("=== DIRECTORIES ===")
print(stdout.read().decode())

ssh.close()
