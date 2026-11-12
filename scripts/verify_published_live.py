import paramiko
import urllib.request

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def run_sql(sql):
    cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie'
    stdin, stdout, stderr = c.exec_command(cmd)
    stdin.write(sql)
    stdin.flush()
    stdin.channel.shutdown_write()
    return stdout.read().decode('utf-8')

print("--- Recently published articles ---")
out = run_sql('SELECT slug, "publishedAt" FROM "Article" WHERE status = \'PUBLISHED\' ORDER BY "publishedAt" DESC NULLS LAST LIMIT 12;')
print(out)

slugs = [line.split('|')[0].strip() for line in out.strip().split('\n')[2:10] if '|' in line]
print("Testing live URLs for published slugs:")
for s in slugs:
    url = f"https://paratunisie.com/conseils/{s}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"[OK 200] {url}")
    except Exception as e:
        print(f"[ERR] {url} -> {e}")

c.close()
