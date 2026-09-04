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

test_script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const order = await prisma.order.findUnique({
    where: { id: 'cmtezellb0004rq01taom62br' },
    include: { user: true, items: { include: { product: true } }, shipment: true }
  });
  console.log('Order found:', order?.id, 'User:', order?.user?.name, 'City:', order?.gouvernorat);
}
run().catch(console.error).finally(() => prisma.$disconnect());
"""

sftp = client.open_sftp()
with sftp.open("/tmp/test_order_find.js", "w") as f:
    f.write(test_script)
sftp.close()

stdin, stdout, stderr = client.exec_command('cat /tmp/test_order_find.js | docker exec -i paratunisie-api node')
print("=== TEST PRISMA ORDER ===")
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
