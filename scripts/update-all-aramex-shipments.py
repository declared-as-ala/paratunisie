import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

update_script = """
const { AramexService } = require('/app/dist/shipping/aramex.service');
const { PrismaService } = require('/app/dist/prisma/prisma.service');

async function updateOrders() {
  const prisma = new PrismaService();
  await prisma.$connect();
  const service = new AramexService(prisma);

  const orderIds = [
    'cmtezellb0004rq01taom62br', // nhidi sarah (Gabes)
    'cmtfbr4zy0002pk010d5427jl', // Tarek Weslati (Siliana)
    'cmtfsvh2e000dpk01f37krym1', // Issam Mekki (Ben Arous)
    'cmtcnvqow000mpo019wxam4fm', // yassine aridhi (Tunis)
  ];

  for (const id of orderIds) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true, items: { include: { product: true } } }
      });
      if (!order) continue;

      const subtotal = order.items.reduce((s, it) => s + (it.priceMillimes * it.quantity), 0);
      const totalDt = Math.round((subtotal + 10000) / 1000); // Items + 10 DT shipping

      console.log(`Updating Aramex shipment for ${order.user?.name} (#${id.slice(-6)})...`);
      const res = await service.createShipment(id, {
        nom: order.user?.name,
        phone: order.user?.phone,
        adresse: order.fullAddress,
        ville: order.gouvernorat,
        codAmount: totalDt,
        weight: 1.0,
        pieces: 1
      });

      console.log(`✅ Updated Order #${id.slice(-6)} | HAWB: ${res.hawb} | PDF: ${res.labelUrl}`);
    } catch (e) {
      console.error(`❌ Error updating order ${id}:`, e.message || e);
    }
  }

  await prisma.$disconnect();
}

updateOrders();
"""

sftp = client.open_sftp()
with sftp.open("/tmp/update_aramex_shipments.js", "w") as f:
    f.write(update_script)
sftp.close()

stdin, stdout, stderr = client.exec_command('cat /tmp/update_aramex_shipments.js | docker exec -i paratunisie-api node')
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
