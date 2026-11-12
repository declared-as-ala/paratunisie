import paramiko
import sys

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

print(f"Connecting to {ip} as {user}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(ip, port=22, username=user, password=password, timeout=15)
    print("SSH Connection successful!\n")
except Exception as e:
    print(f"Failed to connect: {e}")
    sys.exit(1)

def run_cmd(cmd):
    print(f"=== Running: {cmd} ===")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out.strip())
    if err.strip():
        print("STDERR:", err.strip())
    print()

commands = [
    "uname -a",
    "uptime",
    "docker ps -a",
    "docker compose version",
    "ss -tulpn",
    "ls -la /var/www",
    "ls -la /opt",
    "ls -la /home",
    "ls -la /root",
    "find /var/www /opt /root /srv -maxdepth 3 -type d 2>/dev/null",
]

for cmd in commands:
    run_cmd(cmd)

client.close()
