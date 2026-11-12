import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT id, email, \"firstName\", \"lastName\", role FROM \\\"User\\\" LIMIT 5;
"''')
print("Users:\n", stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('''docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT r.id, r.rating, r.title, r.body, r.status, u.\"firstName\", u.\"lastName\"
FROM \\\"Review\\\" r
LEFT JOIN \\\"User\\\" u ON u.id = r.\\\"userId\\\"
WHERE r.\\\"productId\\\" = (SELECT id FROM \\\"Product\\\" WHERE slug = 'creatine-monohydrate-ostrovit-500gr' LIMIT 1)
LIMIT 5;
"''')
print("Sample reviews for creatine-monohydrate-ostrovit-500gr:\n", stdout.read().decode('utf-8', errors='replace'))

ssh.close()
