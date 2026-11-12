import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

sql_others = 'SELECT p.name, b.name as brand, p.slug, p.image, pv.\\"priceMillimes\\" FROM \\"Product\\" p LEFT JOIN \\"Brand\\" b ON p.\\"brandId\\" = b.id LEFT JOIN \\"ProductVariant\\" pv ON pv.\\"productId\\" = p.id WHERE p.\\"inStock\\" = true LIMIT 10;'

stdin, stdout, stderr = ssh.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql_others}"')
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("=== IN STOCK PRODUCTS ===")
print("OUT:\n", out)
if err: print("ERR:\n", err)

sql_cat = 'SELECT name, slug FROM \\"Category\\" WHERE name ILIKE \'%creatine%\' OR slug ILIKE \'%creatine%\';'
stdin, stdout, stderr = ssh.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql_cat}"')
print("=== CREATINE CATEGORY ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
