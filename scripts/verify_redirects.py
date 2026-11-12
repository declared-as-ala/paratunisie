import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('curl -sIL https://paratunisie.com/categories/bien-etre | grep -iE "HTTP|location"')
print("=== REDIRECT FOR /categories/bien-etre ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('curl -sIL https://paratunisie.com/bien-etre | grep -iE "HTTP|location"')
print("=== REDIRECT FOR /bien-etre ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
