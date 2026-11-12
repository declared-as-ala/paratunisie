import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def run(cmd):
    _, out, err = c.exec_command(cmd)
    return out.read().decode('utf-8').strip()

print("Test 1: Image via /assets/blog/:")
print(run("curl -I -s 'https://paratunisie.com/_next/image?url=%2Fassets%2Fblog%2Fwhey-sans-lactose-tunisie.webp&w=1200&q=75' | head -n 5"))

print("\nTest 2: Image via /paratunisie-media/blog/:")
print(run("curl -I -s 'https://paratunisie.com/_next/image?url=%2Fparatunisie-media%2Fblog%2Fwhey-sans-lactose-tunisie.webp&w=1200&q=75' | head -n 5"))

print("\nTest 3: Full absolute URL to MinIO:")
print(run("curl -I -s 'https://paratunisie.com/_next/image?url=https%3A%2F%2Fparatunisie.com%2Fparatunisie-media%2Fblog%2Fwhey-sans-lactose-tunisie.webp&w=1200&q=75' | head -n 5"))

c.close()
