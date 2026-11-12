import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

print("Checking Review statuses in database...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT status, COUNT(*) FROM \\"Review\\" GROUP BY status;"')
print("Status counts:\n", stdout.read().decode('utf-8', errors='replace'))

print("Testing API endpoint for reviews for one of the products...")
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9')
print("API reviews output:\n", stdout.read().decode('utf-8', errors='replace')[:300])

print("Testing API endpoint for rating...")
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9/rating')
print("API rating output:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
