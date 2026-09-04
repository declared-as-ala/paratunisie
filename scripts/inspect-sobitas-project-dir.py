import paramiko
import time

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

def get_client():
    for i in range(3):
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
            return client
        except Exception as e:
            print(f"Retry connection {i+1}: {e}")
            time.sleep(2)
    raise Exception("Could not connect to SSH")

client = get_client()

# Check mounts of sobitas containers
stdin, stdout, stderr = client.exec_command('docker inspect sobitas-backend-v2 --format "{{json .Mounts}}"')
print("=== sobitas-backend-v2 MOUNTS ===")
print(stdout.read().decode())

# Check where filament is
stdin, stdout, stderr = client.exec_command('ls -la /srv/sobitas-project /root/sobitas-project 2>/dev/null')
print("=== SOBITAS PROJECT DIRS ===")
print(stdout.read().decode())

# Check test-aramex.js
stdin, stdout, stderr = client.exec_command('cat /srv/sobitas-project/test-aramex.js /root/sobitas-project/test-aramex.js 2>/dev/null')
print("=== test-aramex.js ===")
print(stdout.read().decode())

client.close()
