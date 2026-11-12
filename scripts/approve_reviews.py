import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

print("Updating Review status to APPROVED...")
stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "UPDATE \\"Review\\" SET status = 'APPROVED', verified = true;"''')
print("Stdout:", stdout.read().decode('utf-8', errors='replace'))
print("Stderr:", stderr.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT status, COUNT(*) FROM \\"Review\\" GROUP BY status;"')
print("Review status count:\n", stdout.read().decode('utf-8', errors='replace'))

# Test API rating for OstroVit
stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9/rating')
print("API rating output:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
