import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

type SeoEntityType = "product" | "category" | "brand";

// The production image keeps compiled files in dist/, while local development
// runs this script against TypeScript sources.
const { CatalogueSeoService } = fs.existsSync(path.resolve(process.cwd(), "dist/catalogue/catalogue-seo.service.js"))
  ? require("../dist/catalogue/catalogue-seo.service")
  : require("../src/catalogue/catalogue-seo.service");

const prisma = new PrismaClient();

async function seedType(service: InstanceType<typeof CatalogueSeoService>, type: SeoEntityType, mode: "missing" | "all" = "missing") {
  let cursor: string | undefined;
  const totals = { processed: 0, succeeded: 0, failed: 0 };
  do {
    const result = await service.generateBulk(type, mode, cursor, 100);
    totals.processed += result.processed;
    totals.succeeded += result.succeeded;
    totals.failed += result.failures.length;
    cursor = result.nextCursor || undefined;
    if (result.done) break;
  } while (cursor);
  return totals;
}

async function main() {
  await prisma.$connect();
  const backupDir = path.resolve(process.cwd(), "..", "..", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const before = {
    timestamp: new Date().toISOString(),
    products: await prisma.product.findMany(),
    categories: await prisma.category.findMany(),
    brands: await prisma.brand.findMany(),
  };
  const backupPath = path.join(backupDir, `seo-fields-before-generation-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 2), "utf8");

  // Existing explicit manual overrides remain protected.
  const productsWithOverrides = await prisma.product.findMany({ select: { id: true, manualOverrides: true } });
  const protectedIds = productsWithOverrides.filter((item) => {
    try { return JSON.parse(item.manualOverrides || "[]").length > 0; } catch { return false; }
  }).map((item) => item.id);
  if (protectedIds.length) await prisma.product.updateMany({ where: { id: { in: protectedIds } }, data: { seoIsCustom: true } });

  const service = new CatalogueSeoService(prisma as any);
  const generated = {
    products: await seedType(service, "product", "all"),
    categories: await seedType(service, "category", "all"),
    brands: await seedType(service, "brand", "all"),
  };
  const report = await service.report();
  const examples = {
    products: await prisma.product.findMany({ take: 3, orderBy: { name: "asc" }, select: { name: true, slug: true, seoTitle: true, seoDescription: true, seoH1: true, seoIntro: true, canonicalUrl: true } }),
    categories: await prisma.category.findMany({ take: 3, orderBy: { name: "asc" }, select: { name: true, slug: true, seoTitle: true, seoDescription: true, seoH1: true, seoIntro: true, canonicalUrl: true } }),
    brands: await prisma.brand.findMany({ take: 2, orderBy: { name: "asc" }, select: { name: true, slug: true, seoTitle: true, seoDescription: true, seoH1: true, seoIntro: true, canonicalUrl: true } }),
  };
  const reportPath = path.join(backupDir, `seo-generation-report-${stamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ generated, report, examples }, null, 2), "utf8");
  console.log(JSON.stringify({ backupPath, reportPath, generated, report, examples }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
