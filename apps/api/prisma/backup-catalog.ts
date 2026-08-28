import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting catalog database backup...");
  
  const [products, variants, images, categories, brands, concerns, importedProducts, seoLogs] = await Promise.all([
    prisma.product.findMany({ include: { variants: true, images: true, brand: true, category: true, concerns: true } }),
    prisma.productVariant.findMany(),
    prisma.productImage.findMany(),
    prisma.category.findMany({ include: { children: true } }),
    prisma.brand.findMany(),
    prisma.concern.findMany(),
    prisma.importedProduct.findMany().catch(() => []),
    prisma.seoGenerationLog.findMany().catch(() => []),
  ]);

  const backupData = {
    timestamp: new Date().toISOString(),
    counts: {
      products: products.length,
      variants: variants.length,
      images: images.length,
      categories: categories.length,
      brands: brands.length,
      concerns: concerns.length,
      importedProducts: importedProducts.length,
      seoLogs: seoLogs.length,
    },
    products,
    categories,
    brands,
    concerns,
    importedProducts,
    seoLogs,
  };

  const backupDir = path.join(__dirname, "..", "..", "..", "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `catalog-backup-${dateStr}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf8");

  console.log(`Backup successfully created at ${backupFile}`);
  console.log(`Total backed up: ${products.length} products, ${categories.length} categories, ${brands.length} brands.`);
}

main()
  .catch((e) => {
    console.error("Backup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
