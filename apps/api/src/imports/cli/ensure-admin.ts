import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";

async function ensureAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

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
  console.log(`Email:    ${staff.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${staff.role}`);
  console.log(`Status:   ${staff.isActive ? "ACTIVE" : "INACTIVE"}`);
  console.log("=================================================");

  await app.close();
}

void ensureAdmin();
