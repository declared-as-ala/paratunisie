
const { PrismaClient } = require('@prisma/client');
const { MeiliSearch } = require('meilisearch');

async function sync() {
  const prisma = new PrismaClient();
  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || 'http://paratunisie-meilisearch:7700',
    apiKey: process.env.MEILISEARCH_KEY || 'paratunisie_meili_master_key_2026!'
  });

  const p = await prisma.product.findUnique({
    where: { slug: 'creatine-monohydrate-150gr-real-pharm' },
    include: { brand: true, category: true, variants: true }
  });

  if (p) {
    const index = client.index('products');
    const doc = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      benefit: p.benefit,
      description: p.description,
      brand: p.brand ? p.brand.name : null,
      brandSlug: p.brand ? p.brand.slug : null,
      category: p.category ? p.category.name : null,
      categorySlug: p.category ? p.category.slug : null,
      image: p.image,
      priceMillimes: p.variants[0] ? p.variants[0].priceMillimes : 59000,
      price: p.variants[0] ? p.variants[0].priceMillimes / 1000 : 59,
      inStock: p.inStock,
      publishState: p.publishState
    };
    await index.addDocuments([doc]);
    console.log('✅ Successfully indexed product in Meilisearch:', doc.name, doc.price + ' DT');
  }

  await prisma.$disconnect();
}

sync().catch(console.error);
