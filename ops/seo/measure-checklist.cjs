/* Run inside the API container: measures the product checklist report (time, payload, SQL query count, memory). */
const { PrismaClient } = require("@prisma/client");
const { SeoChecklistService } = require("/app/dist/catalogue/seo-checklist.service.js");
(async () => {
  const prisma = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
  let queries = 0; prisma.$on("query", () => { queries++; });
  const svc = new SeoChecklistService(prisma);
  const type = process.argv[2] || "product";
  const m0 = process.memoryUsage().rss; const t0 = Date.now();
  const report = await svc.report(type);
  const ms = Date.now() - t0; const json = JSON.stringify(report);
  console.log(JSON.stringify({ type, ms, queries, items: report.items.length, payloadMB: +(json.length / 1048576).toFixed(1), rssMB: Math.round(process.memoryUsage().rss / 1048576), rssDeltaMB: Math.round((process.memoryUsage().rss - m0) / 1048576), perfect: report.perfect }));
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
