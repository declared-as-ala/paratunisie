import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = 'curl -s http://127.0.0.1:3013/api/v1/orders'
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode(errors="replace")
print("=== LIVE GET /orders FROM API ===")
print(out[:1000])

client.close()
