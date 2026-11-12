import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

test_script = """
import urllib.request
url = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&fit=crop&q=80'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    data = resp.read()
    print('VPS downloaded bytes:', len(data))
except Exception as e:
    print('VPS download error:', e)
"""

stdin, stdout, stderr = c.exec_command('python3 -')
stdin.write(test_script)
stdin.flush()
stdin.channel.shutdown_write()

print("STDOUT:\n", stdout.read().decode('utf-8'))
print("STDERR:\n", stderr.read().decode('utf-8'))

c.close()
