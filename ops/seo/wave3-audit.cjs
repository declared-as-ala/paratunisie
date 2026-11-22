/* Wave 3 audit (READ-ONLY). Run inside the API container:
 *   docker exec -e NODE_PATH=/app/node_modules paratunisie-api node /tmp/wave3-audit.cjs > audit.json
 * Emits one record per PUBLISHED product that is currently NOT indexable, with the production quality gate result and the
 * extra Wave 3 screens (medical-claim wording, price sanity, unverified stock, duplicate description, excluded categories,
 * held products). Nothing is written to the database.
 */
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { evaluateProductSeoQuality } = require("/app/dist/catalogue/product-seo-quality.js");
const prisma = new PrismaClient();

const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
// Wording that makes a health/medical statement. Conservative on purpose: any hit => human review, never auto-indexed.
const MEDICAL = /(\btrait(e|ent|ement)s?\b|\bgu[ée]ri\w*|\bsoigne\w*|\bcure\b|anti-?cancer|\bcancer\b|diab[eè]te|hypertension|arthrose|alzheimer|d[ée]pression|infection|antibiotique|antiviral|covid|\bmaladies?\b|pathologie|chute de cheveux|alop[ée]cie|ost[ée]oporose|ordonnance|m[ée]dicament|th[ée]rapeut|anti-?inflammatoire|d[ée]tox|cholest[ée]rol|ulc[èe]re|an[ée]mie|migraine|insomnie|eczema|psoriasis|thyro[iï]de|prostate|m[ée]nopause|fertilit[ée]|[ée]rectile|libido|testost[ée]rone)/i;
const EXCLUDED_CATEGORIES = new Set(["materiel-de-musculation", "cardio-fitness", "boosters-hormonaux"]);
const HELD = /(8-station-multi-gym|squat-rack-jx-fitness|allmax-classic-allwhey|hydroxycut-hardcore-super-elite|allmax-essentials|animal-fury|now-foods.*l-theanine.*chew|now-foods-l-citrulline|now-foods-potassium-chloride|swanson.*fenugreek|youtheory.*turmeric)/;

(async () => {
  const products = await prisma.product.findMany({ include: { brand: true, category: true, variants: true }, orderBy: { id: "asc" } });
  const titleCounts = new Map(), descCounts = new Map();
  for (const p of products) {
    if (p.publishState !== "PUBLISHED") continue;
    titleCounts.set(norm(p.name), (titleCounts.get(norm(p.name)) || 0) + 1);
    const k = crypto.createHash("md5").update(norm(p.description).slice(0, 400)).digest("hex");
    descCounts.set(k, (descCounts.get(k) || 0) + 1);
  }
  const out = [];
  for (const p of products) {
    if (p.publishState !== "PUBLISHED" || p.indexable) continue;
    const q = evaluateProductSeoQuality({ ...p, duplicateTitle: (titleCounts.get(norm(p.name)) || 0) > 1 });
    const prices = p.variants.map((v) => v.priceMillimes).filter((x) => x > 0);
    const price = prices.length ? Math.min(...prices) : 0;
    const text = `${p.name} ${p.description} ${p.benefit} ${p.usage}`;
    const dk = crypto.createHash("md5").update(norm(p.description).slice(0, 400)).digest("hex");
    out.push({
      slug: p.slug, name: p.name, brand: p.brand?.name, cat: p.category?.slug, catIndexable: p.category?.indexable,
      inStock: p.inStock, stock: p.totalStock, price, variants: p.variants.length,
      imageOwn: /paratunisie-media|^\/(?!assets)/.test(p.image || ""), descLen: (p.description || "").length,
      gate: q.eligible, issues: q.issues.filter((i) => i.severity === "BLOCKER").map((i) => i.code),
      medical: MEDICAL.test(text) ? (text.match(MEDICAL) || [""])[0].toLowerCase() : null,
      priceSuspect: price > 0 && (price < 3000 || price > 800000),
      stockUnverified: p.inStock && (p.totalStock === 100 || p.totalStock >= 500),
      dupDesc: descCounts.get(dk) || 0, excludedCat: EXCLUDED_CATEGORIES.has(p.category?.slug),
      held: HELD.test(p.slug),
    });
  }
  process.stdout.write(JSON.stringify(out));
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
