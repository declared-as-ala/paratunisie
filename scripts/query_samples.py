import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

def query(sql):
    cmd = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql}"'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("Users:")
print(query('SELECT id, email, \\"firstName\\", \\"lastName\\" FROM \\"User\\" LIMIT 5;'))

print("Sample Reviews:")
print(query('SELECT id, \\"productId\\", rating, title, status FROM \\"Review\\" LIMIT 5;'))

ssh.close()
