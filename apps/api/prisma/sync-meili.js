const { Meilisearch } = require('meilisearch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  try {
    const client = new Meilisearch({ host: 'http://127.0.0.1:7700', apiKey: 'paratunisie_dev_meili_key' });
    await client.createIndex('products', { primaryKey: 'id' }).catch(() => {});
    const index = client.index('products');
    const all = await prisma.product.findMany({
      where: { publishState: 'PUBLISHED' },
      include: { brand: true, category: true }
    });
    const docs = all.map(p => ({
      id: p.id,
      name: p.name,
      brandName: p.brand.name,
      brandSlug: p.brand.slug,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      description: p.description || '',
      benefit: p.benefit || ''
    }));
    await index.deleteAllDocuments().catch(() => {});
    if (docs.length > 0) {
      await index.addDocuments(docs);
    }
    console.log('Indexed', docs.length, 'products in Meilisearch');
  } catch(e) {
    console.warn('Meilisearch note:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

sync().catch(e => { console.error(e); process.exit(1); });
