import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import * as Minio from "minio";

const prisma = new PrismaClient();

// MinIO S3 Client
const endPoint = process.env.MINIO_ENDPOINT || "localhost";
const port = Number(process.env.MINIO_PORT) || 9000;
const useSSL = process.env.MINIO_USE_SSL === "true";
const accessKey = process.env.MINIO_ROOT_USER || "paratunisie_dev";
const secretKey = process.env.MINIO_ROOT_PASSWORD || "paratunisie_dev_secret";
const bucketName = process.env.MINIO_BUCKET || "paratunisie-media";
const minioPublicBase = process.env.MINIO_PUBLIC_URL || "http://localhost:9000";

const minioClient = new Minio.Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanRemoteUrl(url: string): string {
  let cleaned = url.trim();
  cleaned = cleaned.replace(/-\d{3,4}x\d{3,4}(\.(jpg|jpeg|png|webp|gif))$/i, "$1");
  return cleaned;
}

async function ensureBucket() {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`Created bucket "${bucketName}" with public read policy.`);
  }
}

async function downloadWithRetry(url: string, retries = 3): Promise<{ buffer: Buffer; contentType: string } | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 404 && url !== cleanRemoteUrl(url)) {
          return downloadWithRetry(cleanRemoteUrl(url), 1);
        }
        throw new Error(`HTTP status ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        throw new Error("Zero length buffer received");
      }

      return { buffer, contentType };
    } catch (err) {
      if (attempt === retries) {
        return null;
      }
      await new Promise((r) => setTimeout(r, attempt * 300));
    }
  }
  return null;
}

async function migrateImages() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitArgIdx = args.indexOf("--limit");
  const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1], 10) : undefined;
  const retryFailed = args.includes("--retry-failed");

  console.log("=================================================");
  console.log(" PRODUCT IMAGE MIGRATION TO MINIO STORAGE ");
  console.log(` Options: dryRun=${dryRun}, limit=${limit || "ALL"}, retryFailed=${retryFailed}`);
  console.log("=================================================");

  if (!dryRun) {
    await ensureBucket();
  }

  const hashMap = new Map<string, string>();

  const productsWhere: any = retryFailed
    ? {}
    : {
        OR: [
          { image: { contains: "tunisiepara.com" } },
          { image: { startsWith: "http" } },
        ],
      };

  const products = await prisma.product.findMany({
    where: productsWhere,
    take: limit,
    include: { images: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Audited ${products.length} products to process.`);

  let downloadedCount = 0;
  let reusedHashCount = 0;
  let minioUploadedCount = 0;
  let failedCount = 0;
  let updatedProductsCount = 0;

  const sampleResults: { name: string; oldUrl: string; newUrl: string; hash: string }[] = [];

  const BATCH_SIZE = 8;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE);

    await Promise.all(
      chunk.map(async (product) => {
        const originalPrimaryUrl = product.image;
        if (!retryFailed && originalPrimaryUrl.includes(bucketName)) {
          return;
        }

        const cleanedPrimaryUrl = cleanRemoteUrl(originalPrimaryUrl);

        if (dryRun) {
          updatedProductsCount++;
          return;
        }

        let newPrimaryUrl: string | null = null;
        const downloadRes = await downloadWithRetry(cleanedPrimaryUrl);

        if (downloadRes) {
          downloadedCount++;
          const { buffer, contentType } = downloadRes;

          const hash = crypto.createHash("sha256").update(buffer).digest("hex");
          const shortHash = hash.substring(0, 8);

          if (hashMap.has(hash)) {
            newPrimaryUrl = hashMap.get(hash)!;
            reusedHashCount++;
          } else {
            const ext = contentType.includes("png")
              ? "png"
              : contentType.includes("webp")
              ? "webp"
              : "jpg";
            const baseSlug = slugify(product.name) || "product";
            const objectKey = `products/${baseSlug}-${shortHash}.${ext}`;

            const exists = await minioClient
              .statObject(bucketName, objectKey)
              .then(() => true)
              .catch(() => false);

            if (!exists) {
              await minioClient.putObject(bucketName, objectKey, buffer, buffer.length, {
                "Content-Type": contentType,
              });
              minioUploadedCount++;
            }

            newPrimaryUrl = `${minioPublicBase}/${bucketName}/${objectKey}`;
            hashMap.set(hash, newPrimaryUrl);
          }

          if (sampleResults.length < 5) {
            sampleResults.push({
              name: product.name,
              oldUrl: originalPrimaryUrl,
              newUrl: newPrimaryUrl,
              hash: shortHash,
            });
          }
        } else {
          failedCount++;
        }

        // Additional gallery images
        const updatedGalleryImages: { id: string; url: string }[] = [];
        for (const galleryImg of product.images) {
          if (!galleryImg.url || galleryImg.url.includes(bucketName)) continue;

          const cleanedGalleryUrl = cleanRemoteUrl(galleryImg.url);
          const gRes = await downloadWithRetry(cleanedGalleryUrl);

          if (gRes) {
            const gHash = crypto.createHash("sha256").update(gRes.buffer).digest("hex");
            const gShortHash = gHash.substring(0, 8);

            let gMinioUrl: string;
            if (hashMap.has(gHash)) {
              gMinioUrl = hashMap.get(gHash)!;
            } else {
              const gExt = gRes.contentType.includes("png") ? "png" : "jpg";
              const gKey = `products/${slugify(product.name)}-g${galleryImg.position}-${gShortHash}.${gExt}`;

              const gExists = await minioClient
                .statObject(bucketName, gKey)
                .then(() => true)
                .catch(() => false);

              if (!gExists) {
                await minioClient.putObject(bucketName, gKey, gRes.buffer, gRes.buffer.length, {
                  "Content-Type": gRes.contentType,
                });
                minioUploadedCount++;
              }
              gMinioUrl = `${minioPublicBase}/${bucketName}/${gKey}`;
              hashMap.set(gHash, gMinioUrl);
            }

            updatedGalleryImages.push({ id: galleryImg.id, url: gMinioUrl });
          }
        }

        // Save DB updates
        if (newPrimaryUrl) {
          await prisma.product.update({
            where: { id: product.id },
            data: { image: newPrimaryUrl },
          });

          for (const gImg of updatedGalleryImages) {
            await prisma.productImage.update({
              where: { id: gImg.id },
              data: { url: gImg.url },
            });
          }

          updatedProductsCount++;
        }
      })
    );

    if ((i + BATCH_SIZE) % 80 === 0 || i + BATCH_SIZE >= products.length) {
      console.log(`Processed ${Math.min(i + BATCH_SIZE, products.length)} / ${products.length} products... (Uploaded ${minioUploadedCount} objects, Reused ${reusedHashCount} hashes)`);
    }
  }

  console.log("\n=================================================");
  console.log(" MINIO MIGRATION COMPLETE SUMMARY ");
  console.log(` Processed Products: ${updatedProductsCount} / ${products.length}`);
  console.log(` Images Downloaded: ${downloadedCount}`);
  console.log(` Images Reused via SHA-256: ${reusedHashCount}`);
  console.log(` MinIO Objects Created: ${minioUploadedCount}`);
  console.log(` Failed Downloads: ${failedCount}`);
  console.log("=================================================");

  if (sampleResults.length > 0) {
    console.log("\n--- CONCRETE SAMPLE EXAMPLES ---");
    sampleResults.forEach((s, idx) => {
      console.log(`\nExample ${idx + 1}:`);
      console.log(`  Product: "${s.name}"`);
      console.log(`  Old Source URL: ${s.oldUrl}`);
      console.log(`  New MinIO URL: ${s.newUrl}`);
      console.log(`  SHA-256: ${s.hash}`);
    });
  }
}

migrateImages()
  .catch((e) => {
    console.error("Fatal migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
