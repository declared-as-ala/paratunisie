import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=120)

cmd = "gunzip -c /root/paratunisie/paratunisie_pg.sql.gz | docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie"
print("Restoring database...")
stdin, stdout, stderr = ssh.exec_command(cmd)
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')
print("Restore finished.")

cmd2 = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT count(*) FROM \\"Product\\";"'
stdin2, stdout2, stderr2 = ssh.exec_command(cmd2)
print("Count out:", stdout2.read().decode('utf-8', errors='ignore'))
print("Count err:", stderr2.read().decode('utf-8', errors='ignore'))

ssh.close()

