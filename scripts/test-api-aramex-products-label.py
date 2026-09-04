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
    const res = await service.createShipment('cmtfsvh2e000dpk01f37krym1', {
      weight: 1.0,
      pieces: 1,
      codAmount: 102,
      ville: 'Ben Arous'
    });
    console.log('Shipment created successfully with full product details!');
    console.log('HAWB:', res.hawb);
    console.log('Label URL:', res.labelUrl);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
"""

sftp = client.open_sftp()
with sftp.open("/tmp/test_aramex_products_label.js", "w") as f:
    f.write(test_script)
sftp.close()

stdin, stdout, stderr = client.exec_command('cat /tmp/test_aramex_products_label.js | docker exec -i paratunisie-api node')
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
