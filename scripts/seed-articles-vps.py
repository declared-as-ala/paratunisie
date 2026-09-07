import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

print("Running seed-articles.js on VPS...")
stdin, stdout, stderr = client.exec_command('cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml exec -T paratunisie-api node prisma/seed-articles.js')
out = stdout.read().decode('utf-8')
err = stderr.read().decode('utf-8')
print("OUT:", out)
if err:
    print("ERR:", err)

client.close()
