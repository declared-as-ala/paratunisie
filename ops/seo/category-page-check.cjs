"use strict";
/**
 * Category landing-page check (read-only): technical SEO + content structure for the flagship categories.
 *   node ops/seo/category-page-check.cjs [slug ...]      (default: the priority categories)
 * Checks: HTTP 200, exactly one H1, self canonical, robots, title/description length, FAQPage / BreadcrumbList / CollectionPage /
 * ItemList present, ItemList entries are products that are really listed on the page, no fake rating markup, guide + FAQ present
 * for categories that have one, live comparison table prices equal the catalogue API, Googlebot HTML = visitor HTML.
 * Exit code 1 when any rule fails.
 */
const BASE = (process.env.BASE || "https://paratunisie.com").replace(/\/$/, "");
const API = `${BASE}/api/v1`;
const UA_G = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const UA_V = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36";
const DEFAULT = ["creatine", "whey-proteine", "whey-isolate", "bcaa", "pre-workout", "gainers-proteines", "magnesium", "vitamines", "omega-3", "collagene"];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
let failures = 0;
const check = (ok, label, detail = "") => { if (!ok) failures++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  [" + detail + "]" : ""}`); };
const get = async (url, ua) => { const r = await fetch(url, { headers: { "user-agent": ua } }); return { status: r.status, text: await r.text() }; };
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/\s+/g, " ");
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => { try { const v = JSON.parse(m[1]); return Array.isArray(v) ? v : v["@graph"] || [v]; } catch { return []; } });

(async () => {
  for (const slug of slugs) {
    console.log(`\n== /${slug}`);
    const url = `${BASE}/${slug}`;
    const [g, v] = [await get(url, UA_G), await get(url, UA_V)];
    const h = v.text;
    const title = ((h.match(/<title>([^<]*)/) || [])[1] || "").replace(/&amp;/g, "&");
    const desc = (h.match(/<meta name="description" content="([^"]*)/) || [])[1] || "";
    const robots = (h.match(/<meta name="robots" content="([^"]*)/) || [])[1] || "";
    const canon = (h.match(/rel="canonical" href="([^"]*)/) || [])[1] || "";
    const nodes = ld(h);
    const types = nodes.map((n) => n["@type"]);
    check(v.status === 200, "HTTP 200", String(v.status));
    check((h.match(/<h1/g) || []).length === 1, "exactly one H1");
    check(canon === url, "self-referencing canonical", canon);
    check(/^index/.test(robots), "indexable", robots);
    check(title.length >= 25 && title.length <= 70, "title length 25-70", `${title.length}: ${title}`);
    check(desc.length >= 90 && desc.length <= 165, "meta description length 90-165", String(desc.length));
    check(["BreadcrumbList", "CollectionPage", "ItemList"].every((t) => types.includes(t)), "BreadcrumbList + CollectionPage + ItemList", types.join(","));
    check(!JSON.stringify(nodes).match(/aggregateRating|"review"/), "no rating or review markup on the category page");
    const list = nodes.find((n) => n["@type"] === "ItemList");
    const listed = (list?.itemListElement || []).map((i) => i.url || i.item?.url);
    check(listed.length > 0 && listed.every((u) => h.includes(new URL(u, BASE).pathname)), "every ItemList product is really displayed on the page", `${listed.length} items`);
    check(strip(g.text) === strip(v.text), "Googlebot HTML = visitor HTML");
    const hasGuide = h.includes('id="guide"');
    if (hasGuide) {
      check(h.includes("category-faq-title") && types.includes("FAQPage"), "FAQ section + FAQPage markup");
      const tocLinks = [...h.matchAll(/href="#([a-z0-9-]+)"/g)].map((m) => m[1]);
      check(tocLinks.every((id) => h.includes(`id="${id}"`)), "every in-page quick link points to an existing anchor", `${tocLinks.length} links`);
      const guideH2 = (h.match(/id="guide-[a-z0-9-]+"/g) || []).length;
      check(guideH2 >= 5, "guide has at least 5 titled sections", String(guideH2));
    }
    if (h.includes('id="comparatif-prix"')) {
      const rows = [...h.matchAll(/href="\/produits\/([^"]+)"[^>]*>[^<]*<\/a>(?:(?!<\/tr>)[\s\S])*?font-tabular font-bold[^>]*>([\d.,\s]+)\s*DT/g)];
      let ok = rows.length > 0; const bad = [];
      for (const [, pslug, price] of rows) {
        const live = await (await fetch(`${API}/catalogue/products/${pslug}`)).json();
        const cents = Math.round(parseFloat(price.replace(/\s/g, "").replace(",", ".")) * 1000);
        if (live.variants?.[0]?.priceMillimes !== cents) { ok = false; bad.push(pslug); }
      }
      check(ok, "comparison table prices equal the catalogue API", `${rows.length} rows ${bad.join(",")}`);
      check(!/Whey Testo|testo/i.test((h.match(/id="comparatif-prix"[\s\S]*?<\/table>/) || [""])[0]), "no hormone-related product in the comparison table");
    }
  }
  console.log(failures ? `\nRESULT: ${failures} failure(s)` : "\nRESULT: all checks passed");
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
