"use strict";
/**
 * Product structured-data dashboard (read-only). Fetches every product URL of the public sitemap (or SLUGS=a,b,c) and checks
 * the Product / Offer JSON-LD against Google's Product snippet + Merchant listing requirements and against the live catalogue.
 *   node ops/seo/product-schema-audit.cjs                -> prints the dashboard, writes docs/seo/PRODUCT_SCHEMA_REPORT.json
 * Errors = a rich result is not eligible or the data is wrong. Warnings = recommended data is missing.
 * Limits: this is a local rule check, not Google's Rich Results Test; use that tool (or Search Console) for the official verdict.
 */
const fs = require("fs");
const path = require("path");
const BASE = (process.env.BASE || "https://paratunisie.com").replace(/\/$/, "");
const API = process.env.API_BASE || `${BASE}/api/v1`;
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const AVAILABILITY = new Set(["InStock", "OutOfStock", "PreOrder", "BackOrder", "SoldOut", "LimitedAvailability", "Discontinued", "OnlineOnly", "InStoreOnly"]);

const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; };
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => { try { const v = JSON.parse(m[1]); return Array.isArray(v) ? v : v["@graph"] ? v["@graph"] : [v]; } catch { return [{ "@type": "INVALID_JSON" }]; } });
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

async function audit(slug) {
  const url = `${BASE}/produits/${slug}`;
  const errors = [], warnings = [], info = [];
  let status = 0;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    status = res.status;
    const html = await res.text();
    if (status !== 200) return { slug, status, errors: [`HTTP ${status}`], warnings, info };
    const nodes = jsonLd(html);
    if (nodes.some((n) => n["@type"] === "INVALID_JSON")) errors.push("JSON-LD invalide (non parsable)");
    const products = nodes.filter((n) => n["@type"] === "Product");
    if (products.length === 0) { errors.push("Aucun Product JSON-LD"); return { slug, status, errors, warnings, info }; }
    if (products.length > 1) errors.push("Plusieurs Product JSON-LD sur la page");
    const p = products[0];
    if (!p.name) errors.push("name manquant");
    if (!(Array.isArray(p.image) ? p.image.length : p.image)) errors.push("image manquante");
    else {
      const img = Array.isArray(p.image) ? p.image[0] : p.image;
      try { const r = await fetch(img, { method: "HEAD", signal: AbortSignal.timeout(15000) }); if (!r.ok) errors.push(`image inaccessible (${r.status})`); } catch { errors.push("image inaccessible"); }
    }
    const offers = Array.isArray(p.offers) ? p.offers[0] : p.offers;
    let live = null;
    try { live = await (await fetch(`${API}/catalogue/products/${slug}`, { signal: AbortSignal.timeout(20000) })).json(); } catch { warnings.push("catalogue API illisible: cohérence non vérifiée"); }
    if (!offers) errors.push("Offer manquant");
    else {
      const price = Number(offers.price);
      if (!(price > 0)) errors.push("price absent ou nul");
      if (offers.priceCurrency !== "TND") errors.push(`priceCurrency ≠ TND (${offers.priceCurrency})`);
      const avail = String(offers.availability || "").replace(/^https?:\/\/schema\.org\//, "");
      if (!AVAILABILITY.has(avail)) errors.push(`availability invalide (${offers.availability})`);
      if (offers.url && offers.url !== url) errors.push("offers.url ≠ URL canonique");
      if (live && live.variants?.length) {
        const v = live.variants[0];
        if (Math.round(price * 1000) !== v.priceMillimes) errors.push(`prix JSON-LD ${price} ≠ catalogue ${v.priceMillimes / 1000}`);
        const inStock = live.variants.some((x) => x.stock > 0);
        if ((avail === "InStock") !== inStock) errors.push(`disponibilité incohérente (JSON-LD ${avail}, stock ${inStock ? ">0" : "0"})`);
      }
      if (!offers.shippingDetails) warnings.push("shippingDetails absent (annonces marchands)");
      if (!offers.hasMerchantReturnPolicy) warnings.push("hasMerchantReturnPolicy absent (annonces marchands)");
      if (!offers.seller) warnings.push("seller absent");
    }
    if (typeof p.description === "string") {
      if (/(^|\s)#{1,6}\s|\*\*|__|\]\(/.test(p.description)) errors.push("description contient du Markdown");
      if (p.description.length < 50) warnings.push("description très courte");
    } else warnings.push("description absente");
    if (!p.brand?.name) warnings.push("brand absent");
    if (!p.sku) warnings.push("sku absent");
    else if (p.sku === slug) errors.push("sku = slug (valeur de remplacement)");
    const hasGtin = ["gtin", "gtin8", "gtin12", "gtin13", "gtin14", "isbn"].some((k) => p[k]);
    if (!hasGtin) info.push("GTIN/EAN absent");
    if (!p.mpn) info.push("MPN absent");
    // Review markup must match what a visitor can read
    const visible = text(html);
    if (p.aggregateRating) {
      const n = Number(p.aggregateRating.reviewCount ?? p.aggregateRating.ratingCount);
      if (!(n > 0)) errors.push("aggregateRating sans nombre d'avis");
      if (!/avis/i.test(visible)) errors.push("aggregateRating non visible sur la page");
    }
    for (const r of [].concat(p.review || [])) {
      if (!r.author?.name) errors.push("review sans auteur");
      if (!r.reviewBody && !r.name) errors.push("review sans texte");
      if (/Très satisfait de ce produit, excellente qualité/.test(JSON.stringify(r))) errors.push("review au texte générique (fabriqué)");
    }
    if (!p.aggregateRating && !p.review) info.push("aucun avis (aucun balisage d'avis publié)");
    if (!nodes.some((n) => n["@type"] === "BreadcrumbList")) warnings.push("BreadcrumbList absent");
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
    if (h1 && p.name && h1.replace(/<[^>]+>/g, "").trim().toLowerCase() !== String(p.name).trim().toLowerCase()) info.push("H1 ≠ name du Product (toléré)");
  } catch (e) { errors.push(`échec: ${e.message}`); }
  return { slug, status, errors, warnings, info };
}

(async () => {
  let slugs = (process.env.SLUGS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!slugs.length) {
    const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
    slugs = [...sm.matchAll(/<loc>[^<]*\/produits\/([^<]+)<\/loc>/g)].map((m) => decodeURIComponent(m[1]));
  }
  const results = await pool(slugs, 6, audit);
  const count = (pred) => results.filter(pred).length;
  const has = (needle) => (r) => [...r.errors, ...r.warnings, ...r.info].some((x) => x.includes(needle));
  const dashboard = {
    date: new Date().toISOString(), pages: results.length,
    valid: count((r) => r.errors.length === 0),
    validWithWarnings: count((r) => r.errors.length === 0 && r.warnings.length > 0),
    invalid: count((r) => r.errors.length > 0),
    missingGtin: count(has("GTIN/EAN absent")), missingBrand: count(has("brand absent")), missingSku: count(has("sku absent")),
    missingImage: count(has("image manquante")) + count(has("image inaccessible")), missingOffer: count(has("Offer manquant")),
    priceMismatch: count(has("≠ catalogue")), availabilityMismatch: count(has("disponibilité incohérente")),
    reviewMarkupIssues: count((r) => r.errors.some((x) => /review|aggregateRating/.test(x))), markdownInDescription: count(has("Markdown")),
    pagesWithReviewMarkup: count((r) => !has("aucun avis")(r)),
  };
  const topErrors = {};
  for (const r of results) for (const e of r.errors) topErrors[e.replace(/\d[\d.,]*/g, "N")] = (topErrors[e.replace(/\d[\d.,]*/g, "N")] || 0) + 1;
  const out = { dashboard, topErrors, failing: results.filter((r) => r.errors.length).slice(0, 60) };
  const file = path.join(__dirname, "..", "..", "docs", "seo", "PRODUCT_SCHEMA_REPORT.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(dashboard, null, 1));
  console.log("top errors:", JSON.stringify(topErrors, null, 1));
  process.exitCode = dashboard.invalid ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(2); });
