/* Run inside the API container. Gap-filling optimisation of ALL categories through the same service as the admin button.
 * Creates a backup table first. Existing text is never replaced; only empty / out-of-range / wrong-canonical fields are filled. */
const { PrismaClient } = require("@prisma/client");
const { SeoChecklistService } = require("/app/dist/catalogue/seo-checklist.service.js");
(async () => {
  const prisma = new PrismaClient();
  const svc = new SeoChecklistService(prisma, { invalidate() {}, scoreProducts: async () => [] });
  const apply = process.argv.includes("--apply");
  const before = await svc.report("category");
  const stat = (r) => ({ avg: Math.round(r.items.reduce((s, i) => s + i.score, 0) / r.items.length), ge90: r.items.filter((i) => i.score >= 90).length, ge70: r.items.filter((i) => i.score >= 70).length, lt50: r.items.filter((i) => i.score < 50).length });
  console.log("BEFORE", JSON.stringify(stat(before)));
  if (apply) {
    const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    await prisma.$executeRawUnsafe(`CREATE TABLE "_backup_category_seo_${stamp}" AS SELECT id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoKeywords","canonicalUrl","ogTitle","ogDescription","ogImage","imageAlt","updatedAt" FROM "Category"`);
    console.log("backup table: _backup_category_seo_" + stamp);
    let changed = 0, failed = 0;
    for (const item of before.items) {
      try { const r = await svc.optimize("category", item.id, true); if (r.changedFields?.length) changed++; } catch (e) { failed++; console.log("FAIL", item.name, e.message); }
    }
    console.log(JSON.stringify({ changed, failed }));
    const after = await svc.report("category");
    console.log("AFTER ", JSON.stringify(stat(after)));
    const rows = after.items.map((i) => ({ name: i.name, score: i.score, failed: i.checks.filter((c) => !c.passed).map((c) => c.id) }));
    process.stdout.write("DETAIL " + JSON.stringify(rows) + "\n");
  }
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
