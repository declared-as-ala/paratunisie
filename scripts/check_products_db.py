import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

def run_sql(sql):
    escaped = sql.replace('"', '\\"')
    cmd = f'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "{escaped}"'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print("STDOUT:\n", stdout.read().decode('utf-8', errors='replace'))

run_sql("""
SELECT p.id as product_id, p.name, p.slug, p."inStock", pv.id as variant_id, pv.label, pv."priceMillimes", pv.stock 
FROM "Product" p 
LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id 
WHERE p.slug IN ('ashwagandha-60-gelules-biotech-usa', 'magnesium-vitamin-b6-90-tablets');
""")

ssh.close()
