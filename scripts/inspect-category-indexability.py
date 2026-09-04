import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=30)

cmd = """docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT slug, name, indexable FROM \\"Category\\" ORDER BY slug;" """
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
client.close()
