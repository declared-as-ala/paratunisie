import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Check for Laravel projects on VPS
cmd1 = 'find / -name "CommandeResource.php" 2>/dev/null'
stdin, stdout, stderr = client.exec_command(cmd1)
print("=== CommandeResource.php locations on VPS ===")
print(stdout.read().decode())

cmd2 = 'find / -name "test-aramex.js" 2>/dev/null'
stdin, stdout, stderr = client.exec_command(cmd2)
print("=== test-aramex.js locations on VPS ===")
print(stdout.read().decode())

client.close()
