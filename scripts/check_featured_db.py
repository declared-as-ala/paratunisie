import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, slug, name, brand FROM \\"Product\\" WHERE slug LIKE \'%proactive%\' OR name ILIKE \'%proactive%\';"')
print("ProActive product in DB:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT * FROM \\"HomepageFeaturedConfig\\";"')
print("HomepageFeaturedConfig:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
