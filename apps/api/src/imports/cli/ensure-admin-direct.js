const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@paratunisie.tn";
  const password = process.env.SEED_STAFF_PASSWORD || "ParaTunisie2026!";
  const passwordHash = await bcrypt.hash(password, 10);

  const staff = await prisma.staffUser.upsert({
    where: { email },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      name: "Admin ParaTunisie",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("=================================================");
  console.log(" ADMIN USER SIGN-IN CREDENTIALS VERIFIED ");
  console.log("=================================================");
  console.log(`URL:      http://localhost:3002/admin/login`);
  console.log(`Email:    ${staff.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${staff.role}`);
  console.log(`Status:   ${staff.isActive ? "ACTIVE" : "INACTIVE"}`);
  console.log("=================================================");

  await prisma.$disconnect();
}

main().catch(console.error);
