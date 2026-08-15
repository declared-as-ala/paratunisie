import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { ImportsService } from "../services/imports.service";
import * as fs from "fs";
import * as path from "path";

async function runFullPipeline() {
  console.log("=================================================");
  console.log(" FULL CATALOG SCRAPE, DATABASE IMPORT & MEDIA DOWNLOAD ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const importsService = app.get(ImportsService);

  const args = process.argv.slice(2);
  let limit = 5000;
  let maxPages = 500;

  args.forEach((arg) => {
    if (arg.startsWith("--limit=")) limit = parseInt(arg.split("=")[1], 10);
    if (arg.startsWith("--maxPages=")) maxPages = parseInt(arg.split("=")[1], 10);
  });

  console.log(`Config: Limit = ${limit} products, Max Pages = ${maxPages}`);

  // STAGE 1: Discover & Register Catalog Items in DB
  console.log("\n[STAGE 1] Discovering catalog from TunisiePara.com...");
  const discovery = await importsService.discoverCatalog({
    providerCode: "tunisiepara",
    limit,
  });
  console.log(`✓ Discovered ${discovery.discoveredCount} total items (${discovery.newCount} new, ${discovery.updateCount} updated).`);

  // STAGE 2: Batch Import into Database + Image Downloads + Original SEO Generation
  console.log("\n[STAGE 2] Importing products, downloading images & generating SEO...");
  const batchResult = await importsService.runImportBatch({
    providerCode: "tunisiepara",
    limit,
    downloadImages: true,
    generateSeo: true,
    autoPublish: false, // Remains draft for admin review
  });

  console.log(`✓ Batch Import Finished!`);
  console.log(`  Processed: ${batchResult.processed}`);
  console.log(`  Success:   ${batchResult.successCount}`);
  console.log(`  Failures:  ${batchResult.failCount}`);

  // STAGE 3: Export Scraped Catalog to JSON Backup File
  console.log("\n[STAGE 3] Exporting imported catalog snapshot to JSON...");
  const importedDbItems = await importsService.getImportedProducts({ pageSize: 5000 });
  const outputPath = path.join(__dirname, "../../../scraped-catalog.json");
  fs.writeFileSync(outputPath, JSON.stringify(importedDbItems.items, null, 2), "utf-8");

  console.log(`💾 Saved catalog snapshot to: ${outputPath}`);

  console.log("\n=================================================");
  console.log(" PIPELINE COMPLETED SUCCESSFULLY ");
  console.log(" Review & approve products at: http://localhost:3002/admin/importation");
  console.log("=================================================");

  await app.close();
}

void runFullPipeline();
