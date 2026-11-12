import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('docker exec -i paratunisie-api env')
lines = stdout.read().decode('utf-8', errors='replace').splitlines()
for l in lines:
    if any(k in l for k in ['SMS', 'MAIL', 'ADMIN', 'URL']):
        print(l)

ssh.close()

