import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def run_sql(sql):
    cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie'
    stdin, stdout, stderr = c.exec_command(cmd)
    stdin.write(sql)
    stdin.flush()
    stdin.channel.shutdown_write()
    return stdout.read().decode('utf-8')

print("--- Slugs with creatine ---")
print(run_sql("SELECT slug, status FROM \"Article\" WHERE slug LIKE '%creatine%';"))

c.close()
