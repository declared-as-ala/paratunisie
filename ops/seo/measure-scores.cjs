/* Run inside the API container. Measures the NEW paginated score path and runs the full score-refresh job.
 *   node /tmp/measure-scores.cjs            -> page timings (cold + warm), SQL query counts
 *   node /tmp/measure-scores.cjs job        -> also creates the score-refresh job and follows it to completion */
const { PrismaClient } = require("@prisma/client");
const { SeoScoreService } = require("/app/dist/catalogue/seo-score.service.js");
const { SeoJobService } = require("/app/dist/catalogue/seo-job.service.js");
(async () => {
  const prisma = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
  let q = 0; prisma.$on("query", () => { q++; });
  const scores = new SeoScoreService(prisma);
  const t = async (label, fn) => { q = 0; const s = Date.now(); const r = await fn(); console.log(JSON.stringify({ label, ms: Date.now() - s, queries: q })); return r; };
  const page = await t("adminList page 1 (25 rows, default order)", () => scores.adminList({ page: 1, limit: 25 }));
  const ids = page.data.map((p) => p.id);
  await t("scoreProducts 25 ids (cold: builds uniqueness index)", () => scores.scoreProducts(ids, false));
  await t("scoreProducts 25 ids (warm)", () => scores.scoreProducts(ids, false));
  await t("adminList sorted by seo_asc + filter stock=purchasable", () => scores.adminList({ page: 1, limit: 25, sort: "seo_asc", stock: "purchasable" }));
  await t("adminList filter seoMax=69 sort seo_desc page 40", () => scores.adminList({ page: 40, limit: 25, seoMax: "69", sort: "seo_desc" }));
  await t("stockStats", () => scores.stockStats());
  console.log(JSON.stringify({ rssMB: Math.round(process.memoryUsage().rss / 1048576) }));
  if (process.argv[2] === "job") {
    const jobs = new SeoJobService(prisma, scores);
    const job = await jobs.create({ kind: "score-refresh" });
    const start = Date.now();
    console.log("job created", job.id, "total", job.total);
    for (;;) {
      await new Promise((r) => setTimeout(r, 5000));
      const j = await jobs.get(job.id);
      console.log(JSON.stringify({ t: Math.round((Date.now() - start) / 1000), status: j.status, processed: j.processed, percent: j.percent, failed: j.failed }));
      if (!["QUEUED", "RUNNING"].includes(j.status)) break;
    }
  }
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
