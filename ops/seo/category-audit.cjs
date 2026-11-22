/* Run inside the API container (read-only): category SEO checklist for all categories + catalogue facts. */
const { PrismaClient } = require("@prisma/client");
const { SeoChecklistService } = require("/app/dist/catalogue/seo-checklist.service.js");
(async () => {
  const prisma = new PrismaClient();
  const svc = new SeoChecklistService(prisma, {});
  const report = await svc.report("category");
  const facts = await prisma.$queryRaw`SELECT c.id, c.slug, c."parentId", c.indexable, c.status, length(coalesce(c."seoContent",'')) AS content_len, coalesce(c."seoTitle",'') AS title, coalesce(c."seoH1",'') AS h1,
     (SELECT count(*)::int FROM "Product" p WHERE p."categoryId"=c.id AND p."publishState"='PUBLISHED') AS pub,
     (SELECT count(*)::int FROM "Product" p WHERE p."categoryId"=c.id AND p."publishState"='PUBLISHED' AND p.indexable) AS idx,
     (SELECT count(*)::int FROM "Product" p WHERE p."categoryId"=c.id AND p."publishState"='PUBLISHED' AND p."inStock") AS instock
     FROM "Category" c`;
  const byId = new Map(facts.map((f) => [f.id, f]));
  const rows = report.items.map((i) => { const f = byId.get(i.id); return { slug: f.slug, parent: f.parentId ? "child" : "root", score: i.score, indexable: f.indexable, pub: f.pub, idx: f.idx, instock: f.instock, contentLen: f.content_len, failed: i.checks.filter((c) => !c.passed).map((c) => c.id) }; });
  process.stdout.write(JSON.stringify(rows));
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
