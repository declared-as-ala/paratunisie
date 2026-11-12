import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, \\"productId\\", rating, status FROM \\"Review\\" WHERE \\"productId\\" = \'cmtadbgak000zuqi0wz6142f9\' LIMIT 5;"')
print("Reviews for cmtadbgak000zuqi0wz6142f9:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT slug, name FROM \\"Product\\" WHERE id = \'cmtadbgak000zuqi0wz6142f9\';"')
print("Product for cmtadbgak000zuqi0wz6142f9:\n", stdout.read().decode('utf-8', errors='replace'))

# Check how reviews service in NestJS is implemented
stdin, stdout, stderr = ssh.exec_command('grep -rn "getRating\|calculateRating\|ReviewStatus" /root/paratunisie/apps/api 2>/dev/null || grep -rn "ReviewStatus" /root/paratunisie/src 2>/dev/null')
print("NestJS review logic:\n", stdout.read().decode('utf-8', errors='replace')[:400])

ssh.close()
