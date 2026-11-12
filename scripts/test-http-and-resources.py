import paramiko
import sys

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

def run_cmd(cmd):
    print(f"\n{'='*20} {cmd} {'='*20}", flush=True)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out.strip(), flush=True)
    if err.strip():
        print("STDERR:", err.strip(), flush=True)

commands = [
    "curl -k -I -m 5 https://paratunisie.com",
    "curl -k -I -m 5 https://admin.paratunisie.com",
    "curl -I -m 5 http://127.0.0.1:3010",
    "curl -I -m 5 http://127.0.0.1:3013/api/v1/catalogue/categories",
    "curl -I -m 5 http://127.0.0.1:3014",
    "df -h /",
    "free -m",
]

for cmd in commands:
    try:
        run_cmd(cmd)
    except Exception as e:
        print(f"Error on {cmd}: {e}", flush=True)

client.close()
