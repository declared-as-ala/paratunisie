import sys
import paramiko
import json

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

py_script = '''
import psycopg2
conn = psycopg2.connect('postgresql://sobitas_pg:sobitas_pg_pass_2026@127.0.0.1:5433/paratunisie_db')
cur = conn.cursor()

columns = [
    ('trackingStatus', 'TEXT'),
    ('trackingCode', 'TEXT'),
    ('trackingLabel', 'TEXT'),
    ('trackingDescription', 'TEXT'),
    ('trackingLocation', 'TEXT'),
    ('trackingEvents', 'TEXT'),
    ('lastAramexSync', 'TIMESTAMP(3)'),
    ('deliveredAt', 'TIMESTAMP(3)'),
    ('returnedAt', 'TIMESTAMP(3)'),
]

for col_name, col_type in columns:
    cur.execute(f'ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "{col_name}" {col_type};')
    print(f"  ✓ Column {col_name} checked")

conn.commit()
print("All Shipment tracking columns ensured in PostgreSQL DB!")
'''

cmd = f"python3 -c {json.dumps(py_script)}"
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
print(out)
if err.strip():
    print("STDERR:", err)

client.close()
