import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

_, out, _ = c.exec_command('docker exec paratunisie-web find / -name "whey-sans-lactose-tunisie.webp" 2>/dev/null')
print("find result:\n", out.read().decode('utf-8'))

_, out2, _ = c.exec_command('docker exec paratunisie-web ls /app/public/assets/blog')
files = out2.read().decode('utf-8').split()
print("Total files in /app/public/assets/blog:", len(files))
print("Sample files:", files[:10])

c.close()
