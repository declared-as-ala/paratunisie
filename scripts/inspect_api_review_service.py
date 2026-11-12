import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('find /root/paratunisie/apps/api -name "*review*"')
print("Review files in apps/api:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('cat $(find /root/paratunisie/apps/api -name "*review*service*.ts" | head -n 1)')
print("Review service content:\n", stdout.read().decode('utf-8', errors='replace')[:1200])

ssh.close()
