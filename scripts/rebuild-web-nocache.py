import paramiko
import requests

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = """
cd /opt/paratunisie/app
docker compose -f docker-compose.prod.yml build --no-cache paratunisie-web
docker compose -f docker-compose.prod.yml up -d --force-recreate paratunisie-web
"""
stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
for line in stdout:
    print(line, end="")

client.close()

# Verify live page
print("\nVerifying live page at https://paratunisie.com/pack-anti-stress ...")
r = requests.get("https://paratunisie.com/pack-anti-stress", timeout=15)
print("Status:", r.status_code)
print("Hero showcase text 'PACK ANTI-STRESS COMPLET' in page:", "PACK ANTI-STRESS COMPLET" in r.text)
