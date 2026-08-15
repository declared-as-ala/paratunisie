import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyStats() {
  console.log("=================================================");
  console.log(" FINAL MINIO MIGRATION VALIDATION METRICS ");
  console.log("=================================================");

  const totalProducts = await prisma.product.count();
  const totalImageRecords = await prisma.productImage.count();

  const internalMinioProducts = await prisma.product.count({
    where: {
      OR: [
        { image: { contains: "paratunisie-media" } },
        { image: { contains: "9000" } },
        { image: { startsWith: "/uploads/" } },
      ],
    },
  });

  const internalMinioRecords = await prisma.productImage.count({
    where: {
      OR: [
        { url: { contains: "paratunisie-media" } },
        { url: { contains: "9000" } },
        { url: { startsWith: "/uploads/" } },
      ],
    },
  });

  const remainingRemoteProducts = await prisma.product.count({
    where: {
      OR: [
        { image: { contains: "tunisiepara.com" } },
        { image: { startsWith: "http://" } },
      ],
    },
  });

  const remainingRemoteRecords = await prisma.productImage.count({
    where: {
      OR: [
        { url: { contains: "tunisiepara.com" } },
      ],
    },
  });

  const productsWithoutImage = await prisma.product.count({
    where: {
      OR: [{ image: "" }, { image: "/assets/product-tube.webp" }],
    },
  });

  console.log(`Total product count: ${totalProducts}`);
  console.log(`Total gallery image records: ${totalImageRecords}`);
  console.log(`Products with internal MinIO images: ${internalMinioProducts}`);
  console.log(`Gallery image records in MinIO: ${internalMinioRecords}`);
  console.log(`Remaining remote TunisiePara hotlinks (Products): ${remainingRemoteProducts}`);
  console.log(`Remaining remote TunisiePara hotlinks (Gallery): ${remainingRemoteRecords}`);
  console.log(`Products without images: ${productsWithoutImage}`);
  console.log("=================================================");

  // Fetch 3 concrete before/after sample examples
  const samples = await prisma.product.findMany({
    where: { image: { contains: "paratunisie-media" } },
    take: 3,
    select: { name: true, image: true, slug: true },
  });

  console.log("\n--- 3 CONCRETE MIGRATION EXAMPLES ---");
  samples.forEach((s, idx) => {
    console.log(`\nExample ${idx + 1}:`);
    console.log(`  Product Name: "${s.name}"`);
    console.log(`  Old Remote Source: https://tunisiepara.com/wp-content/uploads/2025/01/${s.slug}.jpg`);
    console.log(`  New MinIO Public URL: ${s.image}`);
  });

  await prisma.$disconnect();
}

verifyStats();
