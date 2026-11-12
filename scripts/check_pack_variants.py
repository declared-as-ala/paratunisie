import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \\"Product\\".id, \\"Product\\".name, \\"Product\\".slug, \\"ProductVariant\\".id as \\"variantId\\", \\"ProductVariant\\".\\"priceMillimes\\", \\"ProductVariant\\".stock, \\"ProductVariant\\".sku FROM \\"Product\\" JOIN \\"ProductVariant\\" ON \\"Product\\".id = \\"ProductVariant\\".\\"productId\\" WHERE \\"Product\\".slug IN (\'ashwagandha-60-gelules-biotech-usa\', \'magnesium-vitamin-b6-90-tablets\');"'

stdin, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
ssh.close()
