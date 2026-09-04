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

build_cmd = """
set -e
cd /opt/paratunisie/app
rm -f .git/index.lock .git/refs/remotes/origin/main.lock
git fetch --prune --force origin main
git reset --hard origin/main
docker compose -f docker-compose.prod.yml build paratunisie-api
docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-api
"""

print("Updating and building paratunisie-api on VPS...")
stdin, stdout, stderr = client.exec_command(build_cmd, get_pty=True)
for line in iter(stdout.readline, ""):
    print(line, end="")

print("\nWaiting 5 seconds for API container to be fully ready...")
time.sleep(5)

# Now write a node script inside the container to re-generate the Aramex shipment for the last 3 orders
node_script = """
const { PrismaClient } = require('@prisma/client');
const { AramexService } = require('./dist/shipping/aramex.service');

async function run() {
  const prisma = new PrismaClient();
  const aramex = new AramexService(prisma);

  const orders = await prisma.order.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { user: true, items: { include: { product: true, productVariant: true } } }
  });

  console.log(`Found ${orders.length} orders to re-ship with Sobitas:`);
  
  const results = [];

  for (const order of orders) {
    console.log(`Processing Order ${order.id} (${order.user?.name || 'Client'})...`);
    try {
      // Re-create shipment with Aramex
      const shipmentResult = await aramex.createShipment(order.id, {});
      console.log(` -> SUCCESS! HAWB: ${shipmentResult.hawb}`);
      console.log(` -> Label URL: ${shipmentResult.labelUrl}`);
      results.push({
        orderId: order.id,
        orderRef: `CMD-${order.id.slice(-6).toUpperCase()}`,
        client: order.user?.name,
        phone: order.user?.phone,
        city: order.gouvernorat,
        total: (order.totalMillimes / 1000) + ' DT',
        hawb: shipmentResult.hawb,
        labelUrl: shipmentResult.labelUrl
      });
    } catch (err) {
      console.error(` -> Error creating shipment for ${order.id}:`, err.message || err);
    }
  }

  console.log('\\n=== FINAL 3 BORDEREAUX LINKS (SOBITAS) ===');
  console.log(JSON.stringify(results, null, 2));

  await prisma.$disconnect();
}

run().catch(console.error);
"""

# Upload and execute script inside paratunisie-api
sftp = client.open_sftp()
with sftp.open("/tmp/reship_last_3.js", "w") as f:
    f.write(node_script)
sftp.close()

exec_cmd = "docker cp /tmp/reship_last_3.js paratunisie-api:/app/reship_last_3.js && docker exec paratunisie-api node /app/reship_last_3.js"
stdin, stdout, stderr = client.exec_command(exec_cmd)
output = stdout.read().decode("utf-8")
err = stderr.read().decode("utf-8")
print(output)
if err.strip():
    print("ERR:", err)

client.close()
