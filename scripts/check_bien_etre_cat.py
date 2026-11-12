import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@')

sql = 'SELECT id, name, slug FROM \\"Category\\" ORDER BY name ASC;'
stdin, stdout, stderr = ssh.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql}"')
print("=== ALL CATEGORIES IN DB ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
