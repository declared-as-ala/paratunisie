const fs = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  await prisma.$transaction(async (tx) => {
    for (const item of data.brands) {
      await tx.brand.upsert({ where: { id: item.id }, create: item, update: item });
    }
    for (const item of data.categories) {
      await tx.category.upsert({ where: { id: item.id }, create: item, update: item });
    }
    for (const item of data.products) {
      const { variant, images, ...product } = item;
      await tx.product.upsert({ where: { id: product.id }, create: product, update: product });
      const variantData = { ...variant, productId: product.id };
      await tx.productVariant.upsert({ where: { id: variant.id }, create: variantData, update: variantData });
      for (const image of images) {
        const imageData = { ...image, productId: product.id };
        await tx.productImage.upsert({ where: { id: image.id }, create: imageData, update: imageData });
      }
    }
  }, { timeout: 300000, maxWait: 30000 });
  console.log(JSON.stringify({ products: await prisma.product.count(), published: await prisma.product.count({ where: { publishState: 'PUBLISHED' } }), images: await prisma.productImage.count(), brands: await prisma.brand.count(), categories: await prisma.category.count() }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
