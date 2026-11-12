import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

print("Checking Review table in database...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT COUNT(*) FROM \\"Review\\";"')
print("Review count:\n", stdout.read().decode('utf-8', errors='replace'))

print("Checking Review table structure...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "\d \\"Review\\""')
print("Review structure:\n", stdout.read().decode('utf-8', errors='replace'))

print("Checking products with reviews...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \\"productId\\", COUNT(*) FROM \\"Review\\" GROUP BY \\"productId\\";"')
print("Reviews per product:\n", stdout.read().decode('utf-8', errors='replace'))

print("Checking in-stock products count...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT COUNT(*) FROM \\"Product\\" WHERE \\"inStock\\" = true;"')
print("In-stock products count:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
