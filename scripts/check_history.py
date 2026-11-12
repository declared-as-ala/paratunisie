import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=15)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    if out: print(out)

run("ls -la /etc/letsencrypt/live/")
run("cat /root/.bash_history | tail -n 50")
run("find / -name 'paratunisie.conf' 2>/dev/null")
run("find / -name 'docker-compose.prod.yml' 2>/dev/null")

ssh.close()

