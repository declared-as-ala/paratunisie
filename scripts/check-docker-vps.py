import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    if out:
        print(out)
    if err:
        print("[STDERR]", err)
    return out, err

run_cmd("docker ps")
client.close()
