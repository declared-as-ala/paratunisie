import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-api ls -la /app')
print("API /app directory:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-api ls -la /app/dist')
print("API /app/dist directory:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
