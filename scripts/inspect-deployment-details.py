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
    # Check Nginx domain routing
    "ls -la /etc/nginx/sites-enabled/ /etc/nginx/conf.d/",
    "cat /etc/nginx/sites-enabled/*",
    # Check paratunisie git status & branch
    "cd /root/paratunisie && git status -s && git branch -a && git log -n 3 --oneline",
    # Check docker-compose status for paratunisie
    "cd /root/paratunisie && docker compose ps",
    # Check sobitas git status & branch just in case
    "cd /root/sobitas-project && git status -s 2>/dev/null && git branch 2>/dev/null && git log -n 2 --oneline 2>/dev/null",
    # Check recent docker logs for paratunisie
    "docker logs --tail 25 paratunisie-web",
    "docker logs --tail 25 paratunisie-api",
    "docker logs --tail 25 paratunisie-admin",
]

for cmd in commands:
    run_cmd(cmd)

client.close()
