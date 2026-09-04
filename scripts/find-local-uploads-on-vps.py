import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Check files on VPS host
cmd1 = 'find /opt/paratunisie -name "*.webp" | head -n 30'
stdin, stdout, stderr = client.exec_command(cmd1)
print("=== WEBP FILES IN /opt/paratunisie ===")
print(stdout.read().decode())

# Check files inside paratunisie-api container
cmd2 = 'docker exec paratunisie-api ls -la /app/public/uploads/products/ 2>/dev/null | head -n 30'
stdin, stdout, stderr = client.exec_command(cmd2)
print("=== FILES IN paratunisie-api /app/public/uploads/products/ ===")
print(stdout.read().decode())

# Check files inside paratunisie-web container
cmd3 = 'docker exec paratunisie-web ls -la /app/apps/web/public/uploads/products/ 2>/dev/null | head -n 30'
stdin, stdout, stderr = client.exec_command(cmd3)
print("=== FILES IN paratunisie-web /app/apps/web/public/uploads/products/ ===")
print(stdout.read().decode())

client.close()
