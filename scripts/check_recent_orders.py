import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

query = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, \\"totalMillimes\\", \\"createdAt\\" FROM \\"Order\\" ORDER BY \\"createdAt\\" DESC LIMIT 5;"'
stdin, stdout, stderr = ssh.exec_command(query)
print("Latest orders:\n", stdout.read().decode('utf-8', errors='replace').strip())

query_items = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \\"orderId\\", \\"productId\\", \\"quantity\\", \\"priceMillimes\\" FROM \\"OrderItem\\" ORDER BY id DESC LIMIT 10;"'
stdin, stdout, stderr = ssh.exec_command(query_items)
print("Latest order items:\n", stdout.read().decode('utf-8', errors='replace').strip())

ssh.close()

