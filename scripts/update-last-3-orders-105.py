import paramiko
import sys
import json
import time

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

print("Connecting to VPS...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# 1. Update database totalMillimes to 105000 for the last 3 orders
update_sql = """
UPDATE "Order"
SET "totalMillimes" = 105000
WHERE id IN (
  'cmtfsvh2e000dpk01f37krym1',
  'cmtfbr4zy0002pk010d5427jl',
  'cmtezellb0004rq01taom62br'
);
"""

cmd_sql = f'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "{update_sql}"'
stdin, stdout, stderr = client.exec_command(cmd_sql)
print("Updated orders in DB:")
print(stdout.read().decode("utf-8"))

# 2. Re-create Aramex shipments with COD = 105 DT
node_script = """
const { PrismaClient } = require('@prisma/client');
const { AramexService } = require('./dist/shipping/aramex.service');

async function run() {
  const prisma = new PrismaClient();
  const aramex = new AramexService(prisma);

  const orderIds = [
    'cmtfsvh2e000dpk01f37krym1',
    'cmtfbr4zy0002pk010d5427jl',
    'cmtezellb0004rq01taom62br'
  ];

  const results = [];

  for (const id of orderIds) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true, items: { include: { product: true, productVariant: true } } }
    });
    
    if (!order) continue;
    console.log(`Processing Order ${order.id} (${order.user?.name}) with COD 105 DT...`);
    
    try {
      const shipmentResult = await aramex.createShipment(order.id, { codAmount: 105 });
      console.log(` -> SUCCESS! HAWB: ${shipmentResult.hawb}`);
      console.log(` -> Label URL: ${shipmentResult.labelUrl}`);
      results.push({
        orderId: order.id,
        orderRef: `CMD-${order.id.slice(-6).toUpperCase()}`,
        client: order.user?.name,
        phone: order.user?.phone,
        city: order.gouvernorat,
        total: '105 DT',
        hawb: shipmentResult.hawb,
        labelUrl: shipmentResult.labelUrl
      });
    } catch (err) {
      console.error(` -> Error creating shipment for ${order.id}:`, err.message || err);
    }
  }

  console.log('\\n=== FINAL 3 BORDEREAUX LINKS (105 DT - SOBITAS) ===');
  console.log(JSON.stringify(results, null, 2));

  await prisma.$disconnect();
}

run().catch(console.error);
"""

sftp = client.open_sftp()
with sftp.open("/tmp/reship_105.js", "w") as f:
    f.write(node_script)
sftp.close()

exec_cmd = "docker cp /tmp/reship_105.js paratunisie-api:/app/reship_105.js && docker exec paratunisie-api node /app/reship_105.js"
stdin, stdout, stderr = client.exec_command(exec_cmd)
output = stdout.read().decode("utf-8")
err = stderr.read().decode("utf-8")
print(output)
if err.strip():
    print("ERR:", err)

client.close()
