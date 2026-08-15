import * as fs from "fs";
import * as path from "path";
import { TunisieParaProvider } from "../provider/tunisiepara.provider";

async function scrapeCatalogToJson() {
  console.log("=================================================");
  console.log(" STARTING TUNISIEPARA CATALOG SCRAPING TO JSON   ");
  console.log("=================================================");

  const provider = new TunisieParaProvider();
  const outputPath = path.join(__dirname, "../../../scraped-catalog.json");

  // Options: limit can be set via command line argument, e.g. --limit=50 or --maxPages=100
  const args = process.argv.slice(2);
  let limit = 5000;
  let maxPages = 100;

  args.forEach((arg) => {
    if (arg.startsWith("--limit=")) limit = parseInt(arg.split("=")[1], 10);
    if (arg.startsWith("--maxPages=")) maxPages = parseInt(arg.split("=")[1], 10);
  });

  console.log(`Config: Max Products Limit = ${limit}, Max Catalog Pages = ${maxPages}`);
  console.log("Discovering catalog URLs from https://tunisiepara.com/boutique/...\n");

  const discovered = await provider.discoverProducts({ limit, maxPages });
  console.log(`✓ Total Products Discovered: ${discovered.length}\n`);

  const results: any[] = [];
  const startTime = Date.now();

  for (let i = 0; i < discovered.length; i++) {
    const item = discovered[i];
    const progressStr = `[${i + 1}/${discovered.length}]`;

    try {
      console.log(`${progressStr} Scraping: ${item.sourceTitle}...`);
      const details = await provider.scrapeProduct(item.sourceUrl);

      const record = {
        externalId: details.externalId,
        sourceUrl: details.sourceUrl,
        sourceTitle: details.sourceTitle,
        sourceBrand: details.sourceBrand || null,
        sourceCategory: details.sourceCategory || null,
        sourcePriceMillimes: details.sourcePriceMillimes || null,
        sourcePriceFormatted: details.sourcePriceMillimes
          ? `${(details.sourcePriceMillimes / 1000).toFixed(3)} DT`
          : null,
        sourceOldPriceMillimes: details.sourceOldPriceMillimes || null,
        sourceOldPriceFormatted: details.sourceOldPriceMillimes
          ? `${(details.sourceOldPriceMillimes / 1000).toFixed(3)} DT`
          : null,
        volumeSize: details.volumeSize || null,
        description: details.description || null,
        usage: details.usage || null,
        ingredients: details.ingredients || null,
        mainImage: details.mainImage || null,
        galleryImages: details.galleryImages || [],
        scrapedAt: new Date().toISOString(),
      };

      results.push(record);

      // Save progress incrementally every 10 products
      if (results.length % 10 === 0 || i === discovered.length - 1) {
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
        console.log(`💾 Saved ${results.length} products to ${outputPath}`);
      }
    } catch (err) {
      console.error(`❌ Error scraping ${item.sourceUrl}: ${(err as Error).message}`);
    }
  }

  const durationMin = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
  console.log("\n=================================================");
  console.log(` SCRAPING COMPLETED IN ${durationMin} MINUTES `);
  console.log(` Total Products Saved: ${results.length}`);
  console.log(` File Saved At: ${outputPath}`);
  console.log("=================================================");
}

void scrapeCatalogToJson();
