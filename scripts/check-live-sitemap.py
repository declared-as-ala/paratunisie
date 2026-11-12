import paramiko

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

stdin, stdout, stderr = client.exec_command('curl -s -m 10 https://paratunisie.com/sitemap.xml | head -n 40', timeout=15)
out = stdout.read().decode('utf-8')
print("=== SITEMAP PREVIEW (first 40 lines) ===")
print(out)

stdin2, stdout2, _ = client.exec_command('curl -s -m 10 https://paratunisie.com/sitemap.xml | grep -c "<url>"', timeout=15)
count = stdout2.read().decode('utf-8').strip()
print(f"Total URLs in live sitemap: {count}")

client.close()
