import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = 'cat /root/sobitas-project/test-aramex.js'
stdin, stdout, stderr = client.exec_command(cmd)
print("=== /root/sobitas-project/test-aramex.js ===")
print(stdout.read().decode(errors="replace"))

cmd2 = 'cat /root/sobitas-project/filament/config/aramex.php'
stdin, stdout, stderr = client.exec_command(cmd2)
print("=== /root/sobitas-project/filament/config/aramex.php ===")
print(stdout.read().decode(errors="replace"))

client.close()
