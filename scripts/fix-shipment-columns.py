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

sql = """
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "hawb" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "labelUrl" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "pickupGuid" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "lastTrackingUpdate" TIMESTAMP;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "rawResponse" TEXT;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "weightKg" DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "pieces" INTEGER DEFAULT 1;
ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "codAmountMillimes" INTEGER;
"""

sftp = client.open_sftp()
with sftp.open("/tmp/alter_shipment.sql", "w") as f:
    f.write(sql)
sftp.close()

stdin, stdout, stderr = client.exec_command('cat /tmp/alter_shipment.sql | docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie')
print("=== ALTER SHIPMENT TABLE RESULT ===")
print(stdout.read().decode(errors="replace"))
print(stderr.read().decode(errors="replace"))

# Now verify Prisma query on paratunisie-api
test_query = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } },
      shipment: true,
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Successfully fetched real orders from Prisma! Count:', orders.length);
  for (const o of orders) {
    console.log(`- Order ${o.id.slice(-6)} | Client: ${o.user?.name} | Phone: ${o.user?.phone} | Status: ${o.status} | Total: ${o.totalMillimes/1000} DT`);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
"""

sftp = client.open_sftp()
with sftp.open("/tmp/test_fetch_orders.js", "w") as f:
    f.write(test_query)
sftp.close()

stdin, stdout, stderr = client.exec_command('cat /tmp/test_fetch_orders.js | docker exec -i paratunisie-api node')
print("=== TEST PRISMA FETCH ORDERS ===")
print(stdout.read().decode(errors="replace"))
print(stderr.read().decode(errors="replace"))

client.close()
