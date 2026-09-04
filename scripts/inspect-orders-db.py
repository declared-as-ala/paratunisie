import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def run(cmd):
    print("=" * 60)
    print(f"RUN: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    print(out)
    return out

# 1. Count Orders in Postgres
run('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT count(*) FROM \\"Order\\";"')

# 2. View all Orders in Postgres
run('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT o.id, o.\\"totalMillimes\\", o.status, o.\\"gouvernorat\\", o.\\"createdAt\\", u.name, u.phone FROM \\"Order\\" o LEFT JOIN \\"User\\" u ON u.id = o.\\"userId\\" ORDER BY o.\\"createdAt\\" DESC LIMIT 20;"')

# 3. Check for SQL backup files on VPS
run('find /opt /var/backups /root -name "*.sql" -o -name "*.dump" 2>/dev/null | head -n 30')

# 4. Check if there are orders in mysql or other tables
run('docker ps --format "{{.Names}}"')

client.close()
