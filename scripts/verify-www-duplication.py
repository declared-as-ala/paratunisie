import paramiko

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

out1, _ = run_cmd("curl -k -I -m 5 https://www.paratunisie.com/")
print("=== https://www.paratunisie.com/ ===")
print(out1)

out2, _ = run_cmd("curl -k -I -m 5 https://paratunisie.com/")
print("=== https://paratunisie.com/ ===")
print(out2)

client.close()
