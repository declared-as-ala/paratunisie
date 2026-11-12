import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('grep -A 25 "paratunisie-web:" /root/paratunisie/docker-compose.prod.yml')
print(stdout.read().decode())

ssh.close()
