import { PrismaClient } from "@prisma/client";
import { MeiliSearch } from "meilisearch";

const prisma = new PrismaClient();
const meili = new MeiliSearch({
  host: process.env.MEILI_HOST || "http://127.0.0.1:7700",
  apiKey: process.env.MEILI_API_KEY || "paratunisie_dev_meili_key",
});

async function main() {
  console.log("Reindexing Meilisearch...");
  const products = await prisma.product.findMany({
    where: { publishState: "PUBLISHED" },
    include: {
      brand: true,
      category: true,
      variants: true,
      images: true,
    },
  });

  const docs = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand.name,
    brandSlug: p.brand.slug,
    category: p.category.name,
    categorySlug: p.category.slug,
    description: p.description,
    priceMillimes: p.variants[0]?.priceMillimes || 0,
    inStock: p.variants.some((v) => v.stock > 0),
    image: p.images[0]?.url || "/assets/product-tube.webp",
  }));

  try {
    const index = meili.index("products");
    await index.deleteAllDocuments();
    await index.addDocuments(docs);
    console.log(`Successfully indexed ${docs.length} products in Meilisearch.`);
  } catch (err) {
    console.error("Meilisearch indexing error:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
