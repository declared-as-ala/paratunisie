const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
async function main() {
  if (!process.env.SEED_STAFF_PASSWORD) throw new Error('SEED_STAFF_PASSWORD is required');
  const email = 'admin@paratunisie.tn';
  await prisma.staffUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Administrator',
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash(process.env.SEED_STAFF_PASSWORD, 12),
    },
  });
  console.log('Administrator account is ready.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
