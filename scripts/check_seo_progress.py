import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT status, COUNT(*) FROM \\"Review\\" GROUP BY status;"')
print("Review status count:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT COUNT(*) FROM \\"Product\\" WHERE \\"inStock\\" = true AND \\"seoTitle\\" LIKE \'%en Tunisie%\';"')
print("In-stock products with enhanced SEO title:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
