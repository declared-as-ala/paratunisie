/**
 * Sync the ParaTunisie catalogue with the live Sobitas (protein.tn) catalogue.
 *
 *   node sobitas-sync.cjs db       [--apply]   products, brands, categories (one transaction)
 *   node sobitas-sync.cjs images               mirror product images into MinIO (resumable)
 *
 * Input: TSV exports of the Sobitas MySQL tables in $SYNC_DIR (mysql -B -N output).
 * Existing products are matched by variant SKU (= Sobitas product id), then by slug, and
 * updated in place so orders, reviews and article links keep working. Products Sobitas does
 * not publish are hidden (DRAFT), never deleted. Without --apply the transaction is rolled back.
 */
"use strict";
const fs = require("fs");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const DIR = process.env.SYNC_DIR || "/tmp/sobitas-export";
const STORAGE = "https://admin.protein.tn/storage/";
const prisma = new PrismaClient();

/* ── parsing helpers ─────────────────────────────────────────────── */
const unesc = (s) =>
  s === "NULL" ? null : s.replace(/\\(.)/g, (m, c) => (c === "n" ? "\n" : c === "t" ? "\t" : c === "0" ? "\0" : c === "r" ? "\r" : c));

function readTsv(name, cols) {
  return fs
    .readFileSync(`${DIR}/${name}`, "utf8")
    .split("\n")
    .filter((l) => l.length)
    .map((line) => {
      const f = line.split("\t");
      const o = {};
      cols.forEach((c, i) => (o[c] = unesc(f[i] ?? "NULL")));
      return o;
    });
}

const ENT = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", agrave: "à", acirc: "â",
  auml: "ä", ccedil: "ç", icirc: "î", iuml: "ï", ocirc: "ô", ouml: "ö", ugrave: "ù", ucirc: "û", uuml: "ü", Eacute: "É", Egrave: "È",
  Agrave: "À", Ccedil: "Ç", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", hellip: "…", ndash: "–", mdash: "—", laquo: "«", raquo: "»",
  deg: "°", euro: "€", oelig: "œ", reg: "®", copy: "©", trade: "™", micro: "µ", times: "×", middot: "·", bull: "•",
};
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (ENT[n] !== undefined ? ENT[n] : m));
const strip = (t) => decode(t.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function htmlToMd(html) {
  if (!html) return "";
  let s = html.replace(/\r/g, "").replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (m, t) => `\n\n### ${strip(t)}\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, t) => `\n- ${strip(t)}`);
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, t) => {
    const inner = strip(t);
    return inner ? `**${inner}**` : "";
  });
  s = s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|ul|ol|div|tr)>/gi, "\n\n");
  s = decode(s.replace(/<[^>]+>/g, ""));
  return s
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Sobitas copy speaks as protein.tn: re-brand it and drop claims that are not ParaTunisie policy (free delivery, Sousse shop, protein.tn phones). */
const DROP_LINE = /gratuit|\boffert[es]?\b|\b(?:100|200|300)\s?DT\b|(?:boutique|magasin|showroom)[^.\n]{0,40}Sousse|Sousse[^.\n]{0,40}(?:boutique|magasin|showroom)|73\s?200\s?169|22\s?464\s?315|URL canonique|https?:\/\/(?:www\.)?protein\.tn/i;
function rebrand(text) {
  return text
    .replace(/(?<!hey )(?<!aker )Prot[eé]ine Tunisie/g, "ParaTunisie")
    .replace(/Protein Tunisie/g, "ParaTunisie")
    .replace(/(?<![./\w@-])Protein\.tn/g, "ParaTunisie")
    .replace(/(?<![./\w@-])protein\.tn/g, "paratunisie.com");
}
// Any line that names the legacy shop (any case, with/without www, inside **bold**) is self-promotion for another
// brand: drop it BEFORE re-branding. Regression: "chez **PROTEIN.TN**", "www.protein.tn", "CONSEIL DE L'EXPERT PROTEIN.TN".
const LEGACY_BRAND_LINE = /protein\.tn|sobitas/i;
function clean(md) {
  return rebrand(
    md
      .split("\n")
      .filter((l) => !LEGACY_BRAND_LINE.test(l) && !DROP_LINE.test(l))
      .join("\n"),
  )
    .split("\n")
    .filter((l) => !DROP_LINE.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
const plain = (html) => strip(html || "");
const slugify = (v) =>
  (v || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const newId = () => "sob" + crypto.randomBytes(11).toString("hex");

const SIZE_RE = /(\d+(?:[.,]\d+)?)\s?(kg|g|mg|ml|l|oz|lbs?|gélules?(?: végétales?)?|capsules?(?: végétales?| molles?)?|comprimés?|tablets?|softgels?|gommes|sachets?|doses?|portions?|servings?)\b/gi;
function variantLabel(name) {
  const all = [...name.matchAll(SIZE_RE)];
  if (!all.length) return "Format standard";
  const m = all[all.length - 1];
  return `${m[1]} ${m[2]}`.replace(/\s+/g, " ").trim();
}

function parseFaq(raw) {
  if (!raw) return [];
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => ({
        question: plain(String(x.question ?? x.q ?? x.title ?? "")),
        answer: plain(String(x.answer ?? x.a ?? x.reponse ?? x.content ?? "")),
      }))
      .map((x) => ({ question: rebrand(x.question), answer: rebrand(x.answer) }))
      .filter((x) => x.question && x.answer && !DROP_LINE.test(x.question) && !DROP_LINE.test(x.answer) && !LEGACY_BRAND_LINE.test(x.question) && !LEGACY_BRAND_LINE.test(x.answer));
  } catch {
    return [];
  }
}

function coverUrl(cover) {
  if (!cover) return null;
  if (/^https?:\/\//i.test(cover)) return cover;
  return STORAGE + cover.replace(/^\/+/, "").replace(/^(?:storage\/)+/, "");
}

const DEPT_ROOT = { 1: "complements-alimentaires", 2: "complements-alimentaires", 4: "nutrition-sportive", 5: "nutrition-sportive", 6: "nutrition-sportive", 8: "nutrition-sportive" };
const CATEGORY_ALIAS = { "mass-gainers": "gainers-proteines" };

/* ── DB phase ────────────────────────────────────────────────────── */
async function syncDb(apply) {
  const products = readTsv("products.tsv", [
    "id", "name", "slug", "cover", "qte", "prix", "promo", "promoExp", "description", "publier", "brandId", "subId", "code", "altCover", "seoTitle", "seoDescription", "faq", "isNew", "bestSeller",
  ]);
  const brands = readTsv("brands.tsv", ["id", "name", "slug", "logo", "description"]);
  const subs = readTsv("subcats.tsv", ["id", "categId", "name", "slug"]);
  console.log(`export: ${products.length} products, ${brands.length} brands, ${subs.length} subcategories`);

  const stats = { catsCreated: 0, brandsCreated: 0, matchedSku: 0, matchedSlug: 0, created: 0, hidden: 0, updated: 0 };
  const nowMs = Date.now();

  await prisma.$transaction(
    async (tx) => {
      /* categories */
      const ptCats = await tx.category.findMany({ select: { id: true, slug: true, name: true } });
      const catBySlug = new Map(ptCats.map((c) => [c.slug, c.id]));
      const catNames = new Set(ptCats.map((c) => c.name.toLowerCase()));
      const subToCat = new Map();
      for (const s of subs) {
        const slug0 = slugify(s.slug || s.name);
        const slug = CATEGORY_ALIAS[slug0] || slug0;
        let id = catBySlug.get(slug);
        if (!id) {
          const parentSlug = DEPT_ROOT[s.categId] || "nutrition-sportive";
          let name = (s.name || slug).trim();
          if (catNames.has(name.toLowerCase())) name += " (Sobitas)";
          const created = await tx.category.create({
            data: { name, slug, parentId: catBySlug.get(parentSlug) || null, status: "ACTIVE", indexable: false },
            select: { id: true },
          });
          id = created.id;
          catBySlug.set(slug, id);
          catNames.add(name.toLowerCase());
          stats.catsCreated++;
        }
        subToCat.set(s.id, id);
      }
      const fallbackCat = catBySlug.get("accessoires") || [...catBySlug.values()][0];

      /* brands */
      const ptBrands = await tx.brand.findMany({ select: { id: true, slug: true, name: true } });
      const brandBySlug = new Map(ptBrands.map((b) => [b.slug, b.id]));
      const brandByName = new Map(ptBrands.map((b) => [b.name.toLowerCase().trim(), b.id]));
      const brandNames = new Set(brandByName.keys());
      const brandSlugs = new Set(brandBySlug.keys());
      const sobBrand = new Map();
      for (const b of brands) {
        const name = (b.name || "").trim();
        if (!name) continue;
        const slug = slugify(b.slug || name) || `marque-${b.id}`;
        let id = brandBySlug.get(slug) || brandByName.get(name.toLowerCase());
        if (!id) {
          let uniqueName = name;
          if (brandNames.has(name.toLowerCase())) uniqueName = `${name} (${b.id})`;
          let uniqueSlug = slug;
          if (brandSlugs.has(uniqueSlug)) uniqueSlug = `${slug}-${b.id}`;
          const created = await tx.brand.create({
            data: { name: uniqueName, slug: uniqueSlug, image: b.logo ? STORAGE + b.logo : null, description: plain(b.description) || null, status: "ACTIVE" },
            select: { id: true },
          });
          id = created.id;
          brandNames.add(uniqueName.toLowerCase());
          brandSlugs.add(uniqueSlug);
          stats.brandsCreated++;
        }
        sobBrand.set(b.id, id);
      }
      let unknownBrand = brandBySlug.get("autres-marques");
      if (!unknownBrand) {
        unknownBrand = (await tx.brand.create({ data: { name: "Autres marques", slug: "autres-marques", status: "ACTIVE" }, select: { id: true } })).id;
        stats.brandsCreated++;
      }

      /* match existing products */
      const pt = await tx.product.findMany({
        select: { id: true, slug: true, seoFaq: true, variants: { select: { id: true, sku: true }, orderBy: { id: "asc" }, take: 1 }, images: { select: { id: true }, orderBy: { position: "asc" }, take: 1 } },
      });
      const bySku = new Map();
      const bySlug = new Map();
      for (const p of pt) {
        bySlug.set(p.slug, p);
        const sku = p.variants[0]?.sku;
        if (sku && !bySku.has(sku)) bySku.set(sku, p);
      }
      const claimed = new Set();
      const matchOf = new Map();
      for (const s of products) {
        const m = bySku.get(String(s.id));
        if (m && !claimed.has(m.id)) {
          claimed.add(m.id);
          matchOf.set(s.id, m);
          stats.matchedSku++;
        }
      }
      for (const s of products) {
        if (matchOf.has(s.id)) continue;
        const m = bySlug.get(s.slug);
        if (m && !claimed.has(m.id)) {
          claimed.add(m.id);
          matchOf.set(s.id, m);
          stats.matchedSlug++;
        }
      }

      /* rows */
      const usedSlugs = new Set(pt.map((p) => p.slug));
      const newProducts = [];
      const newVariants = [];
      const newImages = [];
      const updates = [];

      for (const s of products) {
        const name = (s.name || `Produit ${s.id}`).trim();
        const price = Number(s.prix) || 0;
        const promo = Number(s.promo) || 0;
        const promoActive = promo > 0 && promo < price && (!s.promoExp || new Date(s.promoExp.replace(" ", "T") + "Z").getTime() > nowMs);
        const priceMillimes = Math.round((promoActive ? promo : price) * 1000);
        const stock = Math.max(0, parseInt(s.qte, 10) || 0);
        const brandId = sobBrand.get(s.brandId) || unknownBrand;
        const categoryId = subToCat.get(s.subId) || fallbackCat;
        const src = coverUrl(s.cover);
        const md = clean(htmlToMd(s.description));
        const faq = parseFaq(s.faq);
        const match = matchOf.get(s.id);

        if (match) {
          updates.push({ match, name, md, brandId, categoryId, stock, priceMillimes, src, faq, sku: String(s.id) });
          continue;
        }
        let slug = slugify(s.slug || name) || `produit-${s.id}`;
        if (usedSlugs.has(slug)) slug = `${slug}-${s.id}`;
        usedSlugs.add(slug);
        const pid = newId();
        const brandName = brands.find((b) => b.id === s.brandId)?.name || "";
        const intro = clean(plain(s.description)).slice(0, 160).replace(/\s+\S*$/, "");
        newProducts.push({
          id: pid, slug, name, description: md || `${name}${brandName ? ` — ${brandName}` : ""}.`, benefit: intro || name, usage: "",
          image: src || "/assets/product-unavailable.svg", brandId, categoryId, inStock: stock > 0, totalStock: stock, publishState: "PUBLISHED", indexable: false,
          seoTitle: `${name} en Tunisie | ParaTunisie`.slice(0, 110), seoDescription: (intro || name).slice(0, 200), seoFaq: JSON.stringify(faq),
        });
        newVariants.push({ id: newId(), productId: pid, label: variantLabel(name), priceMillimes, sku: String(s.id), stock });
        newImages.push({ id: newId(), productId: pid, url: src || "/assets/product-unavailable.svg", alt: name, position: 0 });
        stats.created++;
      }

      for (let i = 0; i < newProducts.length; i += 400) {
        await tx.product.createMany({ data: newProducts.slice(i, i + 400) });
        await tx.productVariant.createMany({ data: newVariants.slice(i, i + 400) });
        await tx.productImage.createMany({ data: newImages.slice(i, i + 400) });
      }

      let n = 0;
      for (const u of updates) {
        const data = { name: u.name, brandId: u.brandId, categoryId: u.categoryId, publishState: "PUBLISHED", inStock: u.stock > 0, totalStock: u.stock };
        if (u.md && u.md.length >= 40) data.description = u.md;
        if (u.src) data.image = u.src;
        if (u.faq.length && (!u.match.seoFaq || u.match.seoFaq === "[]")) data.seoFaq = JSON.stringify(u.faq);
        await tx.product.update({ where: { id: u.match.id }, data });
        const v = u.match.variants[0];
        if (v) await tx.productVariant.update({ where: { id: v.id }, data: { priceMillimes: u.priceMillimes, stock: u.stock, sku: u.sku } });
        else await tx.productVariant.create({ data: { productId: u.match.id, label: variantLabel(u.name), priceMillimes: u.priceMillimes, sku: u.sku, stock: u.stock } });
        const img = u.match.images[0];
        if (u.src) {
          if (img) await tx.productImage.update({ where: { id: img.id }, data: { url: u.src } });
          else await tx.productImage.create({ data: { productId: u.match.id, url: u.src, alt: u.name, position: 0 } });
        }
        stats.updated++;
        if (++n % 1000 === 0) console.log(`  updated ${n}/${updates.length}`);
      }

      const orphanIds = pt.filter((p) => !claimed.has(p.id)).map((p) => p.id);
      if (orphanIds.length) {
        await tx.product.updateMany({ where: { id: { in: orphanIds } }, data: { publishState: "DRAFT" } });
        stats.hidden = orphanIds.length;
      }

      if (!apply) throw new Error("DRY-RUN-ROLLBACK");
    },
    { timeout: 7_200_000, maxWait: 120_000 },
  ).catch((e) => {
    if (e.message !== "DRY-RUN-ROLLBACK") throw e;
    console.log("dry run: transaction rolled back");
  });

  console.log(JSON.stringify(stats, null, 2));
}

/* ── images phase ────────────────────────────────────────────────── */
async function syncImages() {
  const Minio = require("minio");
  const bucket = process.env.MINIO_BUCKET || "paratunisie-media";
  const publicBase = (process.env.MINIO_PUBLIC_URL || "https://paratunisie.com/paratunisie-media").replace(/\/$/, "");
  const client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT, port: Number(process.env.MINIO_PORT) || 9000, useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER, secretKey: process.env.MINIO_ROOT_PASSWORD,
  });
  if (!(await client.bucketExists(bucket))) throw new Error("bucket missing: " + bucket);
  await client.setBucketPolicy(
    bucket,
    JSON.stringify({ Version: "2012-10-17", Statement: [{ Effect: "Allow", Principal: "*", Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${bucket}/products/*`] }] }),
  );

  const todo = await prisma.product.findMany({
    where: { NOT: { image: { contains: "paratunisie-media" } }, image: { startsWith: "http" }, publishState: "PUBLISHED" },
    select: { id: true, slug: true, image: true },
    orderBy: { id: "asc" },
  });
  console.log(`images to mirror: ${todo.length}`);
  const failed = fs.createWriteStream("/tmp/sync-images-failed.log", { flags: "a" });
  let done = 0, ok = 0, bad = 0, next = 0;

  async function one(p) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(p.image, { headers: { "User-Agent": "Mozilla/5.0 ParaTunisieMirror" }, signal: AbortSignal.timeout(25000) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const type = (res.headers.get("content-type") || "").split(";")[0].trim();
        if (!type.startsWith("image/")) throw new Error("not an image: " + type);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 200) throw new Error("empty body");
        const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : type === "image/gif" ? "gif" : "jpg";
        const key = `products/${p.slug}.${ext}`;
        await client.putObject(bucket, key, buf, buf.length, { "Content-Type": type });
        const url = `${publicBase}/${key}`;
        await prisma.product.update({ where: { id: p.id }, data: { image: url } });
        await prisma.productImage.updateMany({ where: { productId: p.id, url: p.image }, data: { url } });
        ok++;
        return;
      } catch (e) {
        if (attempt === 3) {
          bad++;
          failed.write(`${p.slug}\t${p.image}\t${e.message}\n`);
        } else await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
  }
  async function worker() {
    while (next < todo.length) {
      const p = todo[next++];
      await one(p);
      if (++done % 250 === 0) console.log(`  ${done}/${todo.length} (ok ${ok}, failed ${bad})`);
    }
  }
  await Promise.all(Array.from({ length: Number(process.env.IMG_CONCURRENCY) || 8 }, worker));
  console.log(`images finished: ok ${ok}, failed ${bad}`);
}

module.exports = { clean, rebrand };

if (require.main === module) (async () => {
  const mode = process.argv[2];
  if (mode === "db") await syncDb(process.argv.includes("--apply"));
  else if (mode === "images") await syncImages();
  else throw new Error("usage: sobitas-sync.cjs db [--apply] | images");
})()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
