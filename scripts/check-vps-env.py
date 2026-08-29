import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    return out, err

out, _ = run_cmd("cat /opt/paratunisie/app/.env | grep DATABASE_URL")
print("DATABASE_URL:", out)

out, _ = run_cmd("cat /opt/paratunisie/app/docker-compose.prod.yml | grep -A 10 postgres:")
print("Postgres config:", out)

client.close()
