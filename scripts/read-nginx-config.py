import paramiko

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

stdin, stdout, stderr = client.exec_command('cat /etc/nginx/sites-available/paratunisie-domains.conf', timeout=15)
out = stdout.read().decode('utf-8')
print("=== /etc/nginx/sites-available/paratunisie-domains.conf ===")
print(out)

client.close()
