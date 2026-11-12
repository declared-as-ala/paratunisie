import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

print("=== CHECKING IN-STOCK PRODUCTS ===")
stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT id, slug, name, \"inStock\", \"seoTitle\", \"seoDescription\"
FROM \\\"Product\\\"
WHERE \\\"inStock\\\" = true
LIMIT 10;
"''')
print(stdout.read().decode('utf-8', errors='replace'))

print("=== TOTAL PRODUCTS SUMMARY ===")
stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE \"inStock\" = true) as in_stock,
  COUNT(*) FILTER (WHERE \"inStock\" = true AND (\"seoTitle\" IS NULL OR length(\"seoTitle\") < 10)) as missing_seo_title,
  COUNT(*) FILTER (WHERE \"inStock\" = true AND (\"seoDescription\" IS NULL OR length(\"seoDescription\") < 30)) as missing_seo_desc
FROM \\\"Product\\\";
"''')
print(stdout.read().decode('utf-8', errors='replace'))

print("=== WHICH IN-STOCK PRODUCTS HAVE REVIEWS? ===")
stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT p.id, p.slug, p.name, COUNT(r.id) as review_count
FROM \\\"Product\\\" p
LEFT JOIN \\\"Review\\\" r ON r.\\\"productId\\\" = p.id
WHERE p.\\\"inStock\\\" = true
GROUP BY p.id, p.slug, p.name
ORDER BY review_count ASC
LIMIT 15;
"''')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
