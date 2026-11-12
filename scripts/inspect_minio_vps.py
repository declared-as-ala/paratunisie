import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def run(cmd):
    _, out, err = c.exec_command(cmd)
    return out.read().decode('utf-8').strip()

print("--- paratunisie-api MINIO env ---")
print(run("docker exec paratunisie-api env | grep -i -E 's3|minio|media|bucket|endpoint'"))

print("\n--- paratunisie-web MINIO env ---")
print(run("docker exec paratunisie-web env | grep -i -E 's3|minio|media|bucket|endpoint'"))

print("\n--- paratunisie-minio env ---")
print(run("docker exec paratunisie-minio env | grep -i -E 'user|pass|root'"))

print("\n--- Nginx paratunisie-media location ---")
print(run("grep -A 10 'location /paratunisie-media' /etc/nginx/sites-available/paratunisie-domains.conf"))

c.close()
