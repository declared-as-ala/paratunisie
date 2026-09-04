import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

test_script = """
const { AramexService } = require('/app/dist/shipping/aramex.service');
const { PrismaService } = require('/app/dist/prisma/prisma.service');

async function test() {
  const prisma = new PrismaService();
  await prisma.$connect();
  const service = new AramexService(prisma);

  try {
    const res = await service.createShipment('cmtezellb0004rq01taom62br', {
      weight: 1.0,
      pieces: 1,
      codAmount: 105,
      ville: 'Gabès'
    });
    console.log('✅ SUCCESS! Aramex Shipment created:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('❌ FAILED:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
"""

sftp = client.open_sftp()
with sftp.open("/tmp/test_aramex_service.js", "w") as f:
    f.write(test_script)
sftp.close()

stdin, stdout, stderr = client.exec_command('cat /tmp/test_aramex_service.js | docker exec -i paratunisie-api node')
print(stdout.read().decode("utf-8", errors="replace"))
print(stderr.read().decode("utf-8", errors="replace"))

client.close()
