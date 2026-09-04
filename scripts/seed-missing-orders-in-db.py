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

script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sampleUsers = [
    { email: 'raed@email.tn', name: 'RAED Y', phone: '27578505', city: 'Bizerte', address: 'JARJOUNA BALADIYET WED ROMEN', total: 58900, status: 'CONFIRMEE' },
    { email: 'amira@email.tn', name: 'Amira Ben Salah', phone: '22765421', city: 'Tunis', address: 'Avenue Habib Bourguiba, Le Kram', total: 36900, status: 'EN_ATTENTE' },
    { email: 'mohamed@email.tn', name: 'Mohamed Karoui', phone: '29522746', city: 'Sfax', address: 'Route de Teniour Km 3', total: 42500, status: 'TENTATIVE_CONTACT' },
    { email: 'fatma@email.tn', name: 'Fatma Slimani', phone: '28694036', city: 'Sousse', address: 'Kantaoui Center', total: 91000, status: 'ANNULEE' }
  ];

  // Find a product variant for order items
  const variant = await prisma.productVariant.findFirst();

  for (const u of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, phone: u.phone },
      create: { email: u.email, name: u.name, phone: u.phone, password: 'guest' }
    });

    const existingOrder = await prisma.order.findFirst({
      where: { userId: user.id }
    });

    if (!existingOrder) {
      await prisma.order.create({
        data: {
          userId: user.id,
          totalMillimes: u.total,
          gouvernorat: u.city,
          fullAddress: u.address,
          status: u.status,
          payment: { create: { method: 'cod', amount: u.total, status: 'pending' } },
          shipment: { create: { carrier: 'aramex', status: 'pending' } },
          items: variant ? {
            create: [{
              productId: variant.productId,
              productVariantId: variant.id,
              quantity: 1,
              priceMillimes: u.total
            }]
          } : undefined
        }
      });
      console.log('Seeded order for:', u.name);
    } else {
      console.log('Order already exists for:', u.name);
    }
  }

  const allOrders = await prisma.order.findMany({
    include: { user: true }
  });
  console.log('Total Orders in Database now:', allOrders.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
"""

sftp = client.open_sftp()
with sftp.open("/tmp/seed_orders.js", "w") as f:
    f.write(script)
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-api node < /tmp/seed_orders.js")
print(stdout.read().decode(errors="replace"))

client.close()
