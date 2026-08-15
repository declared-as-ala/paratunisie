import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { ImportsService } from "../services/imports.service";
import { TunisieParaProvider } from "../provider/tunisiepara.provider";
import { MediaService } from "../services/media.service";
import { SeoGeneratorService } from "../services/seo-generator.service";

async function testLive() {
  console.log("=================================================");
  console.log(" 1. TESTING REAL CONNECTIVITY TO TUNISIEPARA.COM ");
  console.log("=================================================");

  const startTime = Date.now();
  const provider = new TunisieParaProvider();

  try {
    const res = await fetch("https://tunisiepara.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    console.log(`Content-Type: ${res.headers.get("content-type")}`);
    console.log(`Redirected: ${res.redirected}`);
    if (res.redirected) console.log(`Final URL: ${res.url}`);

    const html = await res.text();
    console.log(`HTML Length Received: ${html.length} bytes`);
    console.log(`Cloudflare / Anti-bot Blocked: ${html.includes("Just a moment...") || html.includes("cf-browser-verification") ? "YES" : "NO"}`);
    console.log(`JSON-LD Found: ${html.includes("application/ld+json") ? "YES" : "NO"}`);
    console.log(`Server-Rendered WooCommerce Products Found: ${html.includes("product") ? "YES" : "NO"}`);

  } catch (err) {
    console.error("Connectivity error:", err);
    process.exit(1);
  }

  console.log("\n=================================================");
  console.log(" 2. DISCOVER REAL CATEGORIES ");
  console.log("=================================================");

  const categories = await provider.discoverCategories();
  console.log(`Total Categories Discovered: ${categories.length}`);
  categories.slice(0, 15).forEach((c: any, i: number) => {
    console.log(` ${i + 1}. ${c.name} -> ${c.sourceUrl}`);
  });

  console.log("\n=================================================");
  console.log(" 3. REAL DRY-RUN — 10 PRODUCTS ");
  console.log("=================================================");

  const dryProducts = await provider.discoverProducts({ limit: 10, maxPages: 2 });
  console.log(`Products Discovered in Dry Run: ${dryProducts.length}`);

  const detailedScraped: any[] = [];
  for (let i = 0; i < Math.min(10, dryProducts.length); i++) {
    const item = dryProducts[i];
    console.log(`\n--- Scraping Product ${i + 1}/${Math.min(10, dryProducts.length)} ---`);
    console.log(`Title: ${item.sourceTitle}`);
    console.log(`URL: ${item.sourceUrl}`);

    try {
      const details = await provider.scrapeProduct(item.sourceUrl);
      detailedScraped.push(details);

      console.log(`  Brand: ${details.sourceBrand || "Non spécifié"}`);
      console.log(`  Category: ${details.sourceCategory || "Non spécifié"}`);
      console.log(`  Price (Millimes): ${details.sourcePriceMillimes || "N/A"} (${details.sourcePriceMillimes ? (details.sourcePriceMillimes / 1000).toFixed(3) + " DT" : "N/A"})`);
      console.log(`  Old Price (Millimes): ${details.sourceOldPriceMillimes || "N/A"}`);
      console.log(`  Main Image: ${details.mainImage || "N/A"}`);
      console.log(`  Gallery Count: ${details.galleryImages?.length || 0}`);
      console.log(`  Volume/Size: ${details.volumeSize || "N/A"}`);
      console.log(`  Ingredients Found: ${details.ingredients ? "YES (" + details.ingredients.substring(0, 40) + "...)" : "NO"}`);
      console.log(`  Usage Found: ${details.usage ? "YES (" + details.usage.substring(0, 40) + "...)" : "NO"}`);
    } catch (err) {
      console.error(`  Error scraping ${item.sourceUrl}:`, (err as Error).message);
    }
  }

  console.log("\n=================================================");
  console.log(" 4. TESTING NESTJS API IMPORT & IMAGE DE-DUPLICATION ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const importsService = app.get(ImportsService);
  const mediaService = app.get(MediaService);
  const seoService = app.get(SeoGeneratorService);

  console.log("\n--- Executing Real 10-Product Import ---");
  const importResult1 = await importsService.discoverCatalog({ limit: 10 });
  console.log("Catalog Discovery Result:", importResult1);

  const batchResult1 = await importsService.runImportBatch({ limit: 10, downloadImages: true, generateSeo: true });
  console.log("Batch Import 1 Result:", batchResult1);

  console.log("\n--- Testing Image SHA-256 Deduplication ---");
  if (detailedScraped[0]?.mainImage) {
    const img1 = await mediaService.downloadAndStoreImage(detailedScraped[0].mainImage, detailedScraped[0].sourceTitle, 0);
    const img2 = await mediaService.downloadAndStoreImage(detailedScraped[0].mainImage, detailedScraped[0].sourceTitle, 0);
    console.log(`Image 1 Hash: ${img1?.hash}`);
    console.log(`Image 2 Hash: ${img2?.hash}`);
    console.log(`Hashes match: ${img1?.hash === img2?.hash ? "YES (Deduplication confirmed)" : "NO"}`);
    console.log(`Image Public Path: ${img1?.url}`);
  }

  console.log("\n--- Executing Duplicate Protection Test (Importing Same 10 Products Again) ---");
  const batchResult2 = await importsService.runImportBatch({ limit: 10, downloadImages: true, generateSeo: true });
  console.log("Batch Import 2 Result (Second Pass):", batchResult2);

  console.log("\n=================================================");
  console.log(" 5. INSPECTING GENERATED SEO & SOURCE SEPARATION ");
  console.log("=================================================");

  const importedDbItems = await importsService.getImportedProducts({ pageSize: 3 });
  for (let i = 0; i < importedDbItems.items.length; i++) {
    const item = importedDbItems.items[i];
    const product = item.product;
    const sourceData = JSON.parse(item.sourceData || "{}");

    console.log(`\n=================== PRODUCT ${i + 1} ===================`);
    console.log(`Source Title: ${item.sourceTitle}`);
    console.log(`Source URL: ${item.sourceUrl}`);
    console.log(`Source Description (First 100 chars): ${sourceData.description?.substring(0, 100) || "N/A"}...`);
    console.log(`-------------------------------------------------`);
    console.log(`ParaTunisie Title: ${product?.name}`);
    console.log(`ParaTunisie Slug: ${product?.slug}`);
    console.log(`ParaTunisie Meta Title: ${product?.seoTitle}`);
    console.log(`ParaTunisie Meta Description: ${product?.seoDescription}`);
    console.log(`ParaTunisie SEO Score: ${product?.seoScore} / 100`);
    console.log(`ParaTunisie Keywords: ${product?.seoKeywords}`);
    console.log(`ParaTunisie Image: ${product?.image}`);
    console.log(`ParaTunisie Long Description (Snippet):\n${product?.description?.substring(0, 250)}...\n`);
    console.log(`ParaTunisie FAQ:\n${product?.seoFaq}`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n=================================================`);
  console.log(` LIVE VALIDATION COMPLETED IN ${durationSec} SECONDS `);
  console.log(`=================================================`);

  await app.close();
}

void testLive();
