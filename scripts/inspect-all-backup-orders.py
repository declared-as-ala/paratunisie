import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Check all tables in paratunisie postgres
cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, \\"totalMillimes\\", status, \\"gouvernorat\\", \\"createdAt\\" FROM \\"Order\\";"'
stdin, stdout, stderr = client.exec_command(cmd)
print("=== ALL ORDERS IN PARATUNISIE POSTGRES ===")
print(stdout.read().decode())

# Check all users in paratunisie postgres
cmd2 = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, email, name, phone, \\"createdAt\\" FROM \\"User\\" ORDER BY \\"createdAt\\" DESC LIMIT 10;"'
stdin, stdout, stderr = client.exec_command(cmd2)
print("=== USERS IN PARATUNISIE POSTGRES ===")
print(stdout.read().decode())

client.close()
