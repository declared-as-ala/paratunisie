import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = """
cd /opt/paratunisie/app
ls -la docker-compose*
docker compose -f docker-compose.prod.yml up -d --build paratunisie-web
sleep 2
docker ps --filter "name=paratunisie-web"
"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode("utf-8"))
client.close()
