const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const [products, categories, brands, articles, redirects] = await Promise.all([
    p.product.findMany({ include: { variants: true, images: true, brand: true, category: true } }),
    p.category.findMany(), p.brand.findMany(), p.article.findMany(), p.seoRedirect.findMany(),
  ]);
  process.stdout.write(JSON.stringify({ exportedAt: new Date().toISOString(), products, categories, brands, articles, redirects }));
})().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => p.$disconnect());
