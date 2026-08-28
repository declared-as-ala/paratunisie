import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = """docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT id, status, \\\"userId\\\", \\\"loyaltyPointsEarned\\\", \\\"totalMillimes\\\", \\\"createdAt\\\" FROM \\\"Order\\\" ORDER BY \\\"createdAt\\\" DESC LIMIT 10;
" """

stdin, stdout, stderr = client.exec_command(cmd)
print("=== DB OUTPUT ===")
print(stdout.read().decode())
print(stderr.read().decode())
client.close()
