import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

cmd = "docker exec paratunisie-web ls -la /app/public/assets/blog/creatine-femme.webp /app/public/assets/blog/whey-sans-lactose-tunisie.webp"
_, out, err = c.exec_command(cmd)
print("File details:\n", out.read().decode('utf-8'))
print("Err:\n", err.read().decode('utf-8'))

c.close()
