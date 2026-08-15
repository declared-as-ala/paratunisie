/**
 * Standalone bootstrap for the Meilisearch product index — same pattern as
 * seed-diagnostic-questions.ts (kept separate from prisma/seed.ts, which
 * wipes orders/inventory and would be destructive to run against real
 * imported data). Safe to re-run any time; the admin-guarded
 * POST /search/reindex endpoint does the same thing for ongoing use.
 *   npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/reindex-search.ts
 */
import { PrismaClient } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Meilisearch } = require("meilisearch");

const prisma = new PrismaClient();

async function main() {
  const client = new Meilisearch({
    host: process.env.MEILI_HOST || "http://127.0.0.1:7700",
    apiKey: process.env.MEILI_API_KEY,
  });

  await client.createIndex("products", { primaryKey: "id" }).catch(() => {});
  const index = client.index("products");
  await index.updateSettings({
    searchableAttributes: ["name", "brandName", "categoryName", "benefit", "description"],
    filterableAttributes: ["publishState", "brandSlug", "categorySlug"],
    sortableAttributes: [],
  });

  const products = await prisma.product.findMany({ include: { brand: true, category: true } });
  const docs = products.map((p) => ({
    id: p.id,
    name: p.name,
    brandName: p.brand.name,
    brandSlug: p.brand.slug,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    description: p.description ?? "",
    benefit: p.benefit ?? "",
    publishState: p.publishState,
  }));

  const BATCH_SIZE = 1000;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    await index.addDocuments(docs.slice(i, i + BATCH_SIZE));
    console.log(`Queued ${Math.min(i + BATCH_SIZE, docs.length)} / ${docs.length}`);
  }

  console.log(`Reindex queued for ${docs.length} products. Meilisearch processes documents asynchronously — check /search/reindex or wait a few seconds before testing search.`);
}

main()
  .catch((e) => {
    console.error("Reindex failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
