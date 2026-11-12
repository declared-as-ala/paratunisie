import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

stdin, stdout, stderr = ssh.exec_command('curl -s -k https://paratunisie.com/ | grep -i "RELAX"')
res_https = stdout.read().decode('utf-8', errors='replace')
print("HTTPS paratunisie.com contains RELAX?", "RELAX" in res_https)

stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3010/ | grep -i "RELAX"')
res_http = stdout.read().decode('utf-8', errors='replace')
print("HTTP 127.0.0.1:3010 contains RELAX?", "RELAX" in res_http)

stdin, stdout, stderr = ssh.exec_command('systemctl reload nginx')
print("Nginx reloaded.")

ssh.close()
