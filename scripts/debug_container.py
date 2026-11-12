import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('docker inspect paratunisie-web | grep -i "image"')
print("=== DOCKER INSPECT IMAGE ===")
print(stdout.read().decode('utf-8', errors='replace')[:400])

stdin, stdout, stderr = ssh.exec_command('docker images | grep paratunisie')
print("=== DOCKER IMAGES ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('grep -rn "RelaxSidePanel" /root/paratunisie/src/')
print("=== GREP ON VPS FILESYSTEM ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
