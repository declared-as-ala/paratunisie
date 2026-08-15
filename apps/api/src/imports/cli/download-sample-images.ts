import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { MediaService } from "../services/media.service";

async function downloadSampleImages() {
  console.log("=================================================");
  console.log(" DOWNLOADING 10 SAMPLE PRODUCT IMAGES ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const mediaService = app.get(MediaService);

  // Find 10 products with external URLs (starting with http)
  const products = await prisma.product.findMany({
    where: {
      image: { startsWith: "http" },
    },
    take: 10,
    include: { images: true },
  });

  console.log(`Found ${products.length} products with remote URLs.`);

  let successCount = 0;
  for (const product of products) {
    console.log(`\nProcessing: "${product.name}"`);
    console.log(` Remote URL: ${product.image}`);

    const result = await mediaService.downloadAndStoreImage(product.image, product.name, 0);
    if (result) {
      console.log(` ✓ Saved to local: ${result.url} (SHA-256 hash: ${result.hash.substring(0, 8)})`);

      // Update product primary image in DB
      await prisma.product.update({
        where: { id: product.id },
        data: { image: result.url },
      });

      // Update or create ProductImage record
      if (product.images.length > 0) {
        await prisma.productImage.update({
          where: { id: product.images[0].id },
          data: { url: result.url, alt: result.alt },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: result.url,
            alt: result.alt,
            position: 0,
          },
        });
      }
      successCount++;
    } else {
      console.log(` ❌ Failed to download image for "${product.name}"`);
    }
  }

  console.log("\n=================================================");
  console.log(` SUCCESS: Downloaded and stored ${successCount} / ${products.length} product images locally!`);
  console.log("=================================================");

  await app.close();
}

void downloadSampleImages();
