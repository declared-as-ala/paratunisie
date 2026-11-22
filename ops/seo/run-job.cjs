/* Run inside the API container: create a SEO job through the same service the admin uses, follow it, print the outcome.
 *   node /tmp/run-job.cjs '{"kind":"product-optimize","mode":"dry-run","scope":"purchasable"}' [--detail] */
const { PrismaClient } = require("@prisma/client");
const { SeoScoreService } = require("/app/dist/catalogue/seo-score.service.js");
const { SeoJobService } = require("/app/dist/catalogue/seo-job.service.js");
(async () => {
  const prisma = new PrismaClient();
  const jobs = new SeoJobService(prisma, new SeoScoreService(prisma));
  const input = JSON.parse(process.argv[2] || "{}");
  const job = await jobs.create(input);
  const start = Date.now();
  let j;
  for (;;) {
    await new Promise((r) => setTimeout(r, 2000));
    j = await jobs.get(job.id);
    if (!["QUEUED", "RUNNING"].includes(j.status)) break;
  }
  const out = { id: j.id, status: j.status, mode: j.mode, scope: j.scope, total: j.total, processed: j.processed, succeeded: j.succeeded, skipped: j.skipped, failed: j.failed, backupTable: j.backupTable, seconds: Math.round((Date.now() - start) / 1000) };
  console.log(JSON.stringify(out));
  const by = {};
  for (const r of j.results || []) by[r.action] = (by[r.action] || 0) + 1;
  console.log("results by action:", JSON.stringify(by));
  if (process.argv.includes("--detail")) console.log(JSON.stringify(j.results.filter((r) => r.action !== "skip").slice(0, 400)));
  if (j.errors.length) console.log("errors:", JSON.stringify(j.errors.slice(0, 5)));
  await prisma.$disconnect();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
