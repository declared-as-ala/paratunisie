import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = """
cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main &&
docker compose -f docker-compose.prod.yml build paratunisie-api &&
docker compose -f docker-compose.prod.yml up -d paratunisie-api &&
docker network connect sobitas-full-project_sobitas-net paratunisie-api || true
"""

stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())
client.close()
