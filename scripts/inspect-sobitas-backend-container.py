import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Check working directory and Filament files inside sobitas-backend-v2 container
cmd = 'docker exec sobitas-backend-v2 pwd && docker exec sobitas-backend-v2 find . -name "CommandeResource.php" -o -name "Commande.php" -o -name "*aramex*"'
stdin, stdout, stderr = client.exec_command(cmd)
print("=== FILES IN sobitas-backend-v2 CONTAINER ===")
print(stdout.read().decode())

client.close()
