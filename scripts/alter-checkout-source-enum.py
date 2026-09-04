import paramiko
import sys

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

cmd = """
docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "
DO \$\$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CheckoutSource') THEN
        ALTER TYPE \\"CheckoutSource\\" ADD VALUE IF NOT EXISTS 'PACK_ANTI_STRESS';
    END IF;
END \$\$;
"
"""

stdin, stdout, stderr = client.exec_command(cmd)
print("Postgres Alter Type:")
print(stdout.read().decode("utf-8"))
err = stderr.read().decode("utf-8")
if err.strip():
    print("ERR:", err)

client.close()
