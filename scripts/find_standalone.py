import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

cmd = 'docker exec paratunisie-web find / -name "creatine-femme.webp"'
_, out, _ = c.exec_command(cmd)
print("All locations of creatine-femme.webp:\n", out.read().decode('utf-8'))

cmd2 = 'docker exec paratunisie-web find / -name "standalone" -type d'
_, out2, _ = c.exec_command(cmd2)
print("Standalone directories:\n", out2.read().decode('utf-8'))

c.close()
