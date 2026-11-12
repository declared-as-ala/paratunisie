import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

_, out, _ = c.exec_command('cat /etc/nginx/sites-available/paratunisie-domains.conf')
content = out.read().decode('utf-8', errors='replace')
print("=== Nginx conf ===")
print(content)

c.close()
