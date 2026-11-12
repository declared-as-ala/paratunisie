import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

sql = '''
SELECT p.id, p.name, b.name as brand, p.slug, p.image, c.name as category, pv."priceMillimes"
FROM "Product" p
LEFT JOIN "Brand" b ON p."brandId" = b.id
LEFT JOIN "Category" c ON p."categoryId" = c.id
LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id
WHERE p."inStock" = true 
  AND p.slug != 'ashwagandha-60-gelules-biotech-usa'
ORDER BY p.id ASC
LIMIT 30;
'''

stdin, stdout, stderr = ssh.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql}"')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
