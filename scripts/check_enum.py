import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT enum_range(NULL::\\"ReviewStatus\\");"')
print("Enum values:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
