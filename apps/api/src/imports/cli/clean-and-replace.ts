import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";

async function cleanAndReplace() {
  console.log("=================================================");
  console.log(" CLEANING MOCK CATALOG & ALIGNING IMPORTED CATALOG ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  // 1. Get IDs of products that were created via imports
  const importedItems = await prisma.importedProduct.findMany({
    where: { productId: { not: null } },
    select: { productId: true },
  });
  const importedProductIds = new Set(importedItems.map((i) => i.productId).filter(Boolean));

  console.log(`Preserving ${importedProductIds.size} imported products...`);

  // 2. Find old mock products
  const oldProducts = await prisma.product.findMany({
    where: { id: { notIn: Array.from(importedProductIds as Set<string>) } },
    select: { id: true, name: true },
  });

  console.log(`Found ${oldProducts.length} old mock products to clean up.`);

  if (oldProducts.length > 0) {
    const oldIds = oldProducts.map((p) => p.id);

    // Delete referencing foreign key records first
    await prisma.orderItem.deleteMany({ where: { productId: { in: oldIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: oldIds } } });
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: oldIds } } });
    await prisma.routineItem.deleteMany({ where: { productId: { in: oldIds } } });
    await prisma.articleProduct.deleteMany({ where: { productId: { in: oldIds } } });
    await prisma.competitorPrice.deleteMany({ where: { productId: { in: oldIds } } });

    await prisma.product.deleteMany({
      where: { id: { in: oldIds } },
    });
    console.log(`Deleted ${oldProducts.length} old mock products.`);
  }

  // 3. Clean up unattached categories (categories with 0 products and 0 subcategories)
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true, children: true } } },
  });

  const unusedCategories = categories.filter((c) => c._count.products === 0 && c._count.children === 0);
  if (unusedCategories.length > 0) {
    await prisma.category.deleteMany({
      where: { id: { in: unusedCategories.map((c) => c.id) } },
    });
    console.log(`Cleaned up ${unusedCategories.length} unused mock categories.`);
  }

  const remainingCategories = await prisma.category.count();
  const remainingBrands = await prisma.brand.count();
  const remainingProducts = await prisma.product.count();

  console.log("\n--- CATALOG STATUS ---");
  console.log(`Active Categories: ${remainingCategories}`);
  console.log(`Active Brands: ${remainingBrands}`);
  console.log(`Active Products: ${remainingProducts}`);

  await app.close();
}

void cleanAndReplace();
