import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

stdin, stdout, stderr = client.exec_command('''curl -s -X POST http://127.0.0.1:3013/api/v1/admin-auth/login -H "Content-Type: application/json" -d '{"email":"admin@paratunisie.tn","password":"ParaTunisie2026!"}' ''')
print("Local API Login Test:", stdout.read().decode())

client.close()
