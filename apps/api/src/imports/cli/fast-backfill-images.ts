import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fastBackfill() {
  console.log("Running fast SQL image normalization...");
  
  // 1. Clean primary product image URLs in PostgreSQL
  const res1 = await prisma.$executeRawUnsafe(`
    UPDATE "Product" 
    SET "image" = REGEXP_REPLACE("image", '-\\d{3,4}x\\d{3,4}(\\.(jpg|jpeg|png|webp|gif))', '\\1', 'gi')
    WHERE "image" ~ '-\\d{3,4}x\\d{3,4}\\.';
  `);
  console.log(`Updated ${res1} product main images.`);

  // 2. Clean ProductImage relations in PostgreSQL
  const res2 = await prisma.$executeRawUnsafe(`
    UPDATE "ProductImage" 
    SET "url" = REGEXP_REPLACE("url", '-\\d{3,4}x\\d{3,4}(\\.(jpg|jpeg|png|webp|gif))', '\\1', 'gi')
    WHERE "url" ~ '-\\d{3,4}x\\d{3,4}\\.';
  `);
  console.log(`Updated ${res2} product gallery image relations.`);

  console.log("Fast image normalization complete!");
}

fastBackfill()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
