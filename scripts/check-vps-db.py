import sys
import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

commands = [
    # Check docker inspect for postgres env
    "docker inspect paratunisie-postgres --format '{{json .Config.Env}}'",
    # Run sync via paratunisie-api container using node
    """docker exec -i paratunisie-api node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const shipments = await prisma.shipment.findMany({
    select: { id: true, orderId: true, hawb: true, tracking: true, trackingStatus: true, trackingLabel: true }
  });
  console.log('Total shipments in DB:', shipments.length);
  console.log(shipments);
}
main().catch(console.error).finally(() => prisma.$disconnect());
" """
]

for cmd in commands:
    print(f"\nRUNNING: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode("utf-8"))
    err = stderr.read().decode("utf-8")
    if err.strip():
        print(f"STDERR: {err}")

client.close()
