/* Additive, repeatable table setup for an existing Prisma installation.
 * Run with the same backup/deployment procedure as the content migration.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SeoChecklistAudit" (
  "key" TEXT PRIMARY KEY,
  "sourceHash" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)`).then(() => console.log('SEO audit table ready')).finally(() => prisma.$disconnect());
