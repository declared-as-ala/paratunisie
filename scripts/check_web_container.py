import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker inspect paratunisie-web --format "{{json .Mounts}}"')
print("=== MOUNTS ===")
print(stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('docker inspect paratunisie-web --format "{{json .Config.Image}}"')
print("=== IMAGE ===")
print(stdout.read().decode())

ssh.close()
