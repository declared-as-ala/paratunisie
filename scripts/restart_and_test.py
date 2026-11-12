import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

print("Restarting paratunisie-web container...")
c.exec_command('docker restart paratunisie-web')
time.sleep(5)

cmd = 'curl -I -s http://localhost:3010/assets/blog/whey-sans-lactose-tunisie.webp'
_, out, _ = c.exec_command(cmd)
print("Curl localhost:3010 after restart:\n", out.read().decode('utf-8'))

cmd2 = 'curl -I -s https://paratunisie.com/assets/blog/whey-sans-lactose-tunisie.webp'
_, out2, _ = c.exec_command(cmd2)
print("Curl paratunisie.com after restart:\n", out2.read().decode('utf-8'))

c.close()
