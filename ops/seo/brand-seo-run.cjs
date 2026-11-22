/* Run inside the API container: node /tmp/brand-run.cjs <audit|dry|apply> [json options]. Uses the compiled service. */
const { PrismaClient } = require("@prisma/client");
const { BrandSeoService } = require("/app/dist/catalogue/brand-seo.service.js");
(async () => {
  const prisma = new PrismaClient();
  const svc = new BrandSeoService(prisma);
  const cmd = process.argv[2] || "audit";
  const opts = process.argv[3] ? JSON.parse(process.argv[3]) : {};
  const out = cmd === "audit" ? await svc.audit() : await svc.run({ ...opts, mode: cmd === "apply" ? "apply" : "dry-run" });
  process.stdout.write(JSON.stringify(out));
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
