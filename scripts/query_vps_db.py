import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')
sql = 'SELECT p.name, b.name as brand, p.slug, p.image, pv.\\"priceMillimes\\" FROM \\"Product\\" p LEFT JOIN \\"Brand\\" b ON p.\\"brandId\\" = b.id LEFT JOIN \\"ProductVariant\\" pv ON pv.\\"productId\\" = p.id WHERE p.name ILIKE \'%Ashwagandha%\' LIMIT 10;'
stdin, stdout, stderr = ssh.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql}"')
out = stdout.read().decode('utf-8', errors='replace')
print("OUT:\n", out)
ssh.close()
