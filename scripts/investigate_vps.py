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
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print("STDERR:", err)

run("grep -rn 'paratunisie' /etc/nginx/ 2>/dev/null")
run("cat /etc/nginx/sites-available/sobitas-domains.conf")
run("find /root -maxdepth 2 -type d")
run("docker ps -a")
run("find / -name '*paratunisie*' 2>/dev/null | head -n 30")

ssh.close()

