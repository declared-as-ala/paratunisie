"use strict";
/**
 * SEO regression suite (read-only, no dependencies). Works against production or a local build.
 *   BASE=https://paratunisie.com node ops/seo/seo-regression.cjs        (default)
 *   BASE=http://localhost:3000   node ops/seo/seo-regression.cjs
 * Exit code 1 when any rule fails. Rules map to bugs found during the 2026 recovery.
 */
const BASE = (process.env.BASE || "https://paratunisie.com").replace(/\/$/, "");
const SAMPLE = Number(process.env.SAMPLE || 25);
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
// Known facts used as canaries (update when the policy changes).
const MUST_BE_NOINDEX = ["/produits/mk-677-60-capsules"]; // legal review pending
const EXPECTED_REDIRECTS = {
  "/blog": "/conseils",
  "/brands": "/marques",
  "/qui-sommes-nous": "/a-propos",
  "/probiotiques/now-foods-probiotic-10-30-gelules-vegetales": "/produits/now-foods-probiotic-10-30-gelules-vegetales",
  "/magnesium/thorne-magnesium-glycinate-180-gelules": "/produits/thorne-magnesium-glycinate-180-gelules",
  "/produits/calmag-calcium-magnesium-b30": "/magnesium",
};
const MUST_404 = ["/produits/alopexy-5", "/conseils/this-article-does-not-exist-xyz", "/produits/this-product-does-not-exist-xyz"];
const INDEXABLE_CATEGORIES = ["/creatine", "/whey-proteine", "/whey-isolate", "/eaa", "/acides-amines", "/vitamines", "/magnesium", "/omega-3", "/zinc"];
const AVAILABILITY = new Set(["InStock", "OutOfStock", "PreOrder", "BackOrder", "SoldOut", "LimitedAvailability", "Discontinued", "OnlineOnly", "InStoreOnly"]);

const results = [];
const record = (ok, rule, detail) => results.push({ ok, rule, detail });

async function get(path, ua = BROWSER, redirect = "manual") {
  const res = await fetch(BASE + path, { headers: { "User-Agent": ua }, redirect, signal: AbortSignal.timeout(30000) });
  const text = redirect === "manual" && res.status >= 300 && res.status < 400 ? "" : await res.text();
  return { status: res.status, headers: res.headers, text, location: res.headers.get("location") };
}
const meta = (html, name) => (html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, "i")) || [])[1] || "";
const prop = (html, p) => (html.match(new RegExp(`<meta[^>]+property="${p}"[^>]+content="([^"]*)"`, "i")) || [])[1] || "";
const canonical = (html) => (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i) || [])[1] || "";
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
const flat = (nodes) => nodes.flatMap((n) => (Array.isArray(n) ? n : n["@graph"] ? n["@graph"] : [n]));
const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; };

(async () => {
  // ---- sitemap
  const sm = await get("/sitemap.xml");
  const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ""));
  record(sm.status === 200 && urls.length > 50, "sitemap.xml reachable and populated", `${urls.length} URLs`);
  record(new Set(urls).size === urls.length, "sitemap has no duplicate URLs", `${urls.length - new Set(urls).size} duplicates`);
  record(urls.every((u) => !u.includes("?") && !u.includes("#")), "sitemap has no query/fragment URLs", "");
  for (const p of MUST_BE_NOINDEX) record(!urls.includes(p), `noindex page not in sitemap: ${p}`, "");

  const products = urls.filter((u) => u.startsWith("/produits/"));
  const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, SAMPLE);
  const cats = urls.filter((u) => /^\/[a-z0-9-]+$/.test(u) && !["/shop", "/marques", "/conseils"].includes(u)).slice(0, 12);

  // ---- every sampled sitemap URL must be indexable, self-canonical, 1 H1
  await pool([...shuffled, ...cats], 6, async (u) => {
    const r = await get(u);
    const robots = meta(r.text, "robots");
    const canon = canonical(r.text);
    record(r.status === 200, `sitemap URL returns 200: ${u}`, String(r.status));
    if (r.status !== 200) return;
    record(!/noindex/i.test(robots), `sitemap URL is not noindex: ${u}`, robots);
    record(canon === `https://paratunisie.com${u}`, `sitemap URL has self canonical: ${u}`, canon);
    record((r.text.match(/<h1\b/g) || []).length === 1, `exactly one H1: ${u}`, "");
    record(!/protein\.tn|sobitas/i.test([meta(r.text, "description"), prop(r.text, "og:image"), prop(r.text, "og:title"), (r.text.match(/<title>[^<]*/) || [""])[0]].join(" ")), `no legacy brand in metadata: ${u}`, "");
    const linkHosts = [...r.text.matchAll(/<link[^>]+href="(https?:\/\/[^"]+)"/gi)].map((m) => new URL(m[1]).hostname);
    record(!linkHosts.some((h) => /protein\.tn|sobitas/i.test(h)), `no legacy host in <link> tags (canonical/alternate): ${u}`, linkHosts.filter((h) => /protein\.tn|sobitas/i.test(h)).join(","));
    const og = prop(r.text, "og:image");
    record(!og || /^https:\/\/(www\.)?paratunisie\.com\//.test(og), `og:image is on our domain: ${u}`, og);
    if (u.startsWith("/produits/")) {
      const nodes = flat(jsonLd(r.text));
      const prod = nodes.find((n) => n["@type"] === "Product");
      record(!!prod, `Product JSON-LD present: ${u}`, "");
      if (prod) {
        const offer = Array.isArray(prod.offers) ? prod.offers[0] : prod.offers;
        const avail = String((offer && offer.availability) || "").replace("https://schema.org/", "");
        record(!!offer && Number(offer.price) > 0, `Offer has a positive price: ${u}`, String(offer && offer.price));
        record(AVAILABILITY.has(avail), `Offer availability is valid: ${u}`, avail);
        record(!prod.aggregateRating && !prod.review, `no rating/review markup without approved reviews: ${u}`, "");
        const visible = Number(offer.price).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).replace(/,/g, "");
        record(r.text.includes(`${visible} DT`) || r.text.includes(`${visible} DT`), `schema price equals visible price: ${u}`, visible);
      }
    }
  });

  // ---- noindex canaries
  for (const p of MUST_BE_NOINDEX) {
    const r = await get(p);
    record(r.status === 200 && /noindex/i.test(meta(r.text, "robots")), `noindex canary stays noindex: ${p}`, meta(r.text, "robots"));
  }
  // ---- indexable categories
  for (const p of INDEXABLE_CATEGORIES) {
    const r = await get(p);
    record(r.status === 200 && !/noindex/i.test(meta(r.text, "robots")), `category indexable: ${p}`, meta(r.text, "robots"));
    record(canonical(r.text) === `https://paratunisie.com${p}`, `category self canonical: ${p}`, canonical(r.text));
  }
  // ---- filters / pagination rules
  const filtered = await get("/whey-proteine?sort=price-asc&brand=x");
  record(/noindex/i.test(meta(filtered.text, "robots")) || canonical(filtered.text) === "https://paratunisie.com/whey-proteine", "filtered listing is noindex or canonicalised to the clean URL", meta(filtered.text, "robots"));

  // ---- redirects: exactly one hop, correct target
  for (const [from, to] of Object.entries(EXPECTED_REDIRECTS)) {
    const r = await get(from);
    const loc = (r.location || "").replace(/^https?:\/\/[^/]+/, "");
    record([301, 308].includes(r.status) && loc === to, `redirect ${from} -> ${to}`, `${r.status} ${loc}`);
    const next = await get(to);
    record(next.status === 200, `redirect target resolves: ${to}`, String(next.status));
  }
  for (const p of MUST_404) record((await get(p)).status === 404, `returns 404: ${p}`, "");

  // ---- Googlebot / visitor parity
  await pool(shuffled.slice(0, 10).concat(["/", "/vitamines", "/creatine"]), 4, async (u) => {
    const [a, b] = [await get(u, BROWSER), await get(u, GOOGLEBOT)];
    const sig = (r) => JSON.stringify([r.status, meta(r.text, "robots"), canonical(r.text), (r.text.match(/<title>[^<]*/) || [""])[0], flat(jsonLd(r.text)).map((n) => n["@type"]).sort()]);
    record(sig(a) === sig(b), `Googlebot/visitor parity: ${u}`, "");
  });

  // ---- robots.txt
  const rb = await get("/robots.txt");
  record(rb.status === 200 && /sitemap:\s*https?:\/\/[^\s]*sitemap\.xml/i.test(rb.text), "robots.txt references the sitemap", "");
  record(!/^\s*disallow:\s*\/\s*$/im.test(rb.text), "robots.txt does not block the whole site", "");
  record(!/disallow:\s*\/produits/i.test(rb.text), "robots.txt does not block /produits", "");

  // ---- report
  const failed = results.filter((r) => !r.ok);
  for (const f of failed) console.log(`FAIL  ${f.rule}${f.detail ? "  [" + f.detail + "]" : ""}`);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed against ${BASE}`);
  process.exitCode = failed.length ? 1 : 0;
})().catch((e) => { console.error("suite crashed:", e.message); process.exitCode = 2; });
