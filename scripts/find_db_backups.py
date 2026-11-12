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

run("find / -name '*paratunisie*.sql*' 2>/dev/null")
run("find /root/backups -type f 2>/dev/null")
run("ls -lh /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/*/fs/app/paratunisie_pg.sql.gz 2>/dev/null")

ssh.close()

