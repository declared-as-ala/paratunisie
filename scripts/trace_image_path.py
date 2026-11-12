import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

_, out, _ = c.exec_command('docker exec paratunisie-web find / -name "creatine-femme.webp" 2>/dev/null')
print("find creatine-femme:\n", out.read().decode('utf-8'))

_, out2, _ = c.exec_command('curl -I -s http://localhost:3010/assets/blog/creatine-femme.webp')
print("curl localhost:3010:\n", out2.read().decode('utf-8')[:300])

_, out3, _ = c.exec_command('curl -I -s https://paratunisie.com/assets/blog/creatine-femme.webp')
print("curl paratunisie.com:\n", out3.read().decode('utf-8')[:300])

c.close()
