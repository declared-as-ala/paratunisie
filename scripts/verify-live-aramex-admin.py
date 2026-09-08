import sys
import paramiko
import json
import urllib.request
import ssl

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

print("Connecting to VPS to run batch sync and inspect live orders...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Run a python script inside VPS or query API
sync_script = """
import urllib.request, json, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Query all shipments in DB
import psycopg2, psycopg2.extras
conn = psycopg2.connect('postgresql://sobitas_pg:sobitas_pg_pass_2026@127.0.0.1:5433/paratunisie_db')
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
cur.execute('SELECT id, "orderId", hawb, tracking, status, "trackingStatus", "trackingLabel", "trackingCode", "trackingLocation", "lastTrackingUpdate", "lastAramexSync" FROM "Shipment" ORDER BY "createdAt" DESC;')
shipments = cur.fetchall()
print(f"SHIPMENTS IN DB ({len(shipments)}):")
for s in shipments:
    print(f"  Order: {s['orderId'][:8]} | HAWB: {s['hawb'] or s['tracking']} | Status: {s['trackingStatus']} ({s['trackingLabel']}) | Code: {s['trackingCode']} | Loc: {s['trackingLocation']} | Sync: {s['lastAramexSync']}")
"""

cmd = f"python3 -c \"{sync_script}\""
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
print(out)
if err.strip():
    print("STDERR:", err)

client.close()
