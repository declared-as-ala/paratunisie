import sys
sys.stdout.reconfigure(encoding="utf-8")
import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)

stdin, stdout, stderr = client.exec_command("docker ps --filter name=paratunisie --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
print("=== DOCKER CONTAINERS ===")
print(stdout.read().decode(errors="replace"))

verify_sql = """
SELECT u.id, u.email, u.name, la.id as account_id, la.points, la.tier
FROM "User" u
LEFT JOIN "LoyaltyAccount" la ON la."userId" = u.id
WHERE u.email = 'kongeminam@gmail.com';
"""

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
stdin.write(verify_sql)
stdin.channel.shutdown_write()

print("=== USER & LOYALTY STATUS ===")
print(stdout.read().decode(errors="replace"))

client.close()
