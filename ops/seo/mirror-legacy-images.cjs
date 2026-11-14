"use strict";
/**
 * Mirror remaining third-party (admin.protein.tn) image references into our MinIO bucket and repoint the DB.
 * Run inside the API container:  NODE_PATH=/app/node_modules node mirror-legacy-images.cjs [--apply]
 * Dry run by default (downloads and validates, writes nothing). With --apply: uploads, backs up the old values in
 * table _backup_legacy_images, then updates exactly the rows found. Brand logos go under brands/, the rest under products/.
 */
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const Minio = require("minio");

const APPLY = process.argv.includes("--apply");
const p = new PrismaClient();
const bucket = process.env.MINIO_BUCKET || "paratunisie-media";
const publicBase = (process.env.MINIO_PUBLIC_URL || "https://paratunisie.com/paratunisie-media").replace(/\/$/, "");
const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg", "image/gif": "gif", "image/avif": "avif" };
const LEGACY = /protein\.tn|sobitas/i;

(async () => {
  const jobs = [];
  for (const b of await p.brand.findMany({ select: { slug: true, image: true, heroImage: true, mobileHeroImage: true, ogImage: true } })) {
    for (const f of ["image", "heroImage", "mobileHeroImage", "ogImage"]) {
      if (b[f] && LEGACY.test(b[f])) jobs.push({ table: "Brand", key: b.slug, field: f, url: b[f], dir: "brands", name: `${b.slug}${f === "image" ? "" : "-" + f}` });
    }
  }
  for (const i of await p.productImage.findMany({ where: { url: { contains: "protein.tn" } }, select: { id: true, url: true } })) {
    jobs.push({ table: "ProductImage", key: i.id, field: "url", url: i.url, dir: "products", name: `pi-${i.id}` });
  }
  for (const i of await p.product.findMany({ where: { image: { contains: "protein.tn" } }, select: { slug: true, image: true } })) {
    jobs.push({ table: "Product", key: i.slug, field: "image", url: i.image, dir: "products", name: i.slug });
  }
  console.log(`${jobs.length} references to mirror (${APPLY ? "APPLY" : "dry run"})`);

  const downloaded = [];
  for (const j of jobs) {
    const res = await fetch(j.url, { signal: AbortSignal.timeout(20000) });
    const ct = (res.headers.get("content-type") || "").split(";")[0];
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.status !== 200 || !EXT[ct] || buf.length < 500) throw new Error(`invalid source ${j.url}: ${res.status} ${ct} ${buf.length}`);
    downloaded.push({ ...j, buf, ct, ext: EXT[ct], sha: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12) });
  }
  console.log("all sources valid; total KB:", Math.round(downloaded.reduce((s, d) => s + d.buf.length, 0) / 1024));
  if (!APPLY) return;

  const client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT, port: Number(process.env.MINIO_PORT) || 9000, useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER, secretKey: process.env.MINIO_ROOT_PASSWORD,
  });
  // keep existing public read on products/*, add brands/*
  await client.setBucketPolicy(bucket, JSON.stringify({
    Version: "2012-10-17",
    Statement: [{ Effect: "Allow", Principal: "*", Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${bucket}/products/*`, `arn:aws:s3:::${bucket}/brands/*`] }],
  }));
  await p.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS _backup_legacy_images (tbl text, key text, field text, old_url text, new_url text, at timestamptz default now())`);
  for (const d of downloaded) {
    const object = `${d.dir}/${d.name}.${d.ext}`;
    await client.putObject(bucket, object, d.buf, d.buf.length, { "Content-Type": d.ct, "Cache-Control": "public, max-age=31536000, immutable" });
    const newUrl = `${publicBase}/${object}`;
    const check = await fetch(newUrl);
    if (check.status !== 200) throw new Error(`mirrored object not publicly readable: ${newUrl} (${check.status})`);
    await p.$executeRaw`INSERT INTO _backup_legacy_images (tbl, key, field, old_url, new_url) VALUES (${d.table}, ${d.key}, ${d.field}, ${d.url}, ${newUrl})`;
    if (d.table === "Brand") await p.brand.update({ where: { slug: d.key }, data: { [d.field]: newUrl } });
    else if (d.table === "ProductImage") await p.productImage.update({ where: { id: d.key }, data: { url: newUrl } });
    else await p.product.update({ where: { slug: d.key }, data: { image: newUrl } });
  }
  console.log("mirrored and repointed:", downloaded.length);
})().catch((e) => { console.error("FAILED:", e.message); process.exitCode = 1; }).finally(() => p.$disconnect());
