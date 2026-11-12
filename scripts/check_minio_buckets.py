import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def run(cmd):
    _, out, err = c.exec_command(cmd)
    return out.read().decode('utf-8').strip()

print("--- Buckets in MinIO storage directory ---")
print(run("docker exec paratunisie-minio ls -la /data"))

c.close()
