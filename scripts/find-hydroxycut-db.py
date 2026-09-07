import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)

def run_psql(sql):
    stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie')
    stdin.write(sql)
    stdin.channel.shutdown_write()
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    if out:
        print(out)
    if err:
        print("[STDERR]", err)
    return out, err

sql = """
SELECT DISTINCT image FROM "Product" WHERE image IS NOT NULL;
"""

run_psql(sql)
client.close()
