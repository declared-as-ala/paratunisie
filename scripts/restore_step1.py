import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print("STDERR:", err)

# 1. Copy snapshot to /root/paratunisie
run("cp -a /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/1908/fs/app /root/paratunisie")

# 2. Copy .env to /root/paratunisie/.env
run("cp /root/.env.bak-20261021 /root/paratunisie/.env")

# 3. Verify /root/paratunisie contents
run("ls -la /root/paratunisie")

ssh.close()

