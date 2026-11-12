import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

c.exec_command('docker exec paratunisie-minio mkdir -p /data/paratunisie-media/blog')
c.exec_command("docker exec paratunisie-minio sh -c 'echo \"hello-minio\" > /data/paratunisie-media/blog/test.txt'")

_, out, _ = c.exec_command('curl -i -s https://paratunisie.com/paratunisie-media/blog/test.txt')
print("Minio test curl response:\n", out.read().decode('utf-8'))

c.close()
