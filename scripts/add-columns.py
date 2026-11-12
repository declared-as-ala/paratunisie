import sys
import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

sql = """
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "trackingStatus" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "trackingCode" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "trackingLabel" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "trackingDescription" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "trackingLocation" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "trackingEvents" JSONB;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "lastAramexSync" TIMESTAMP(3);
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "lastTrackingUpdate" TIMESTAMP(3);
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "returnedAt" TIMESTAMP(3);
"""

cmd = f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c '{sql}'"
stdin, stdout, stderr = client.exec_command(cmd)
print("STDOUT:", stdout.read().decode("utf-8"))
print("STDERR:", stderr.read().decode("utf-8"))

client.close()
