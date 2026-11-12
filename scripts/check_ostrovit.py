import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT id, slug, name, \"inStock\", \"seoTitle\", \"seoDescription\"
FROM \\\"Product\\\"
WHERE slug LIKE '%ostrovit%' OR slug LIKE '%creatine%';
"''')
print("OstroVit / Creatine products:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT p.slug, r.status, COUNT(*)
FROM \\\"Product\\\" p
JOIN \\\"Review\\\" r ON r.\\\"productId\\\" = p.id
WHERE p.slug LIKE '%ostrovit%' OR p.slug LIKE '%creatine%'
GROUP BY p.slug, r.status;
"''')
print("Reviews for OstroVit / Creatine:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
