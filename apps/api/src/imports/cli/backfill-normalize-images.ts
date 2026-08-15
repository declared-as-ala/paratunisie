import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanImageUrl(url: string | null | undefined): string {
  if (!url) return "/assets/product-tube.webp";

  let cleaned = url.trim();

  // Strip WordPress image dimension suffixes like -510x510.jpg, -300x300.png, -1000x1000.webp
  cleaned = cleaned.replace(/-\d{3,4}x\d{3,4}(\.(jpg|jpeg|png|webp|gif))$/i, "$1");

  return cleaned;
}

async function backfillNormalizeImages() {
  console.log("=================================================");
  console.log(" BACKFILLING AND NORMALIZING PRODUCT IMAGES ");
  console.log("=================================================");

  const products = await prisma.product.findMany({
    include: { images: true },
  });

  console.log(`Found ${products.length} products to audit and normalize.`);

  let updatedCount = 0;
  const batchSize = 100;

  for (let i = 0; i < products.length; i += batchSize) {
    const chunk = products.slice(i, i + batchSize);

    await prisma.$transaction(
      chunk.map((product) => {
        const primaryImage = cleanImageUrl(product.image);

        // Clean images relation & remove duplicates
        const seenUrls = new Set<string>();
        const cleanedImages: { url: string; alt: string; position: number }[] = [];

        // Primary image first
        if (primaryImage && !primaryImage.includes("product-tube.webp")) {
          seenUrls.add(primaryImage);
          cleanedImages.push({
            url: primaryImage,
            alt: product.name,
            position: 0,
          });
        }

        // Add additional images, skipping duplicate URLs
        (product.images || []).forEach((img) => {
          const cUrl = cleanImageUrl(img.url);
          if (cUrl && !seenUrls.has(cUrl)) {
            seenUrls.add(cUrl);
            cleanedImages.push({
              url: cUrl,
              alt: img.alt || product.name,
              position: cleanedImages.length,
            });
          }
        });

        // Delete old image relations and recreate cleaned ones
        return prisma.$executeRaw`
          UPDATE "Product" 
          SET "image" = ${primaryImage} 
          WHERE "id" = ${product.id}
        `;
      })
    );

    // Also clean ProductImage table directly
    for (const product of chunk) {
      const existing = product.images;
      for (const img of existing) {
        const cleaned = cleanImageUrl(img.url);
        if (cleaned !== img.url) {
          await prisma.productImage.update({
            where: { id: img.id },
            data: { url: cleaned },
          });
        }
      }
    }

    updatedCount += chunk.length;
    console.log(`Processed ${updatedCount} / ${products.length} products...`);
  }

  console.log("=================================================");
  console.log(` SUCCESS: Normalized images for ${products.length} products!`);
  console.log("=================================================");
}

backfillNormalizeImages()
  .catch((e) => {
    console.error("Error normalizing product images:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
