import paramiko

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=15)

def run_cmd(cmd):
    print(f"\n{'='*20} {cmd} {'='*20}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out.strip())
    if err.strip():
        print("STDERR:", err.strip())

commands = [
    "find / -name 'docker-compose*.yml' -o -name 'compose*.yml' 2>/dev/null",
    "docker inspect paratunisie-web --format '{{.Config.Labels}}'",
    "ls -la /root/paratunisie",
]

for cmd in commands:
    run_cmd(cmd)

client.close()
