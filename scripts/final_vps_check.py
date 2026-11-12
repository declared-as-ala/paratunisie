import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def exec_cmd(cmd):
    _, out, _ = c.exec_command(cmd)
    return out.read().decode('utf-8').strip()

print("=== Containers ===")
print(exec_cmd('docker ps --format "table {{.Names}}\t{{.Status}}"'))

print("\n=== Article counts by status ===")
print(exec_cmd('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -c "SELECT status, COUNT(*) FROM \\\"Article\\\" GROUP BY status;"'))

print("\n=== Sitemap URL count ===")
print(exec_cmd('curl -s https://paratunisie.com/sitemap.xml | grep -c "<loc>"'))

print("\n=== WWW Redirect test ===")
print(exec_cmd('curl -I -s https://www.paratunisie.com | head -n 3'))

print("\n=== Live Article test ===")
print(exec_cmd('curl -I -s https://paratunisie.com/conseils/whey-sans-lactose-tunisie | head -n 3'))

c.close()
