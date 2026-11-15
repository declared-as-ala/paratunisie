/* Cache safety check for a locally started storefront (PUBLIC_CACHE_SECONDS>0). Usage: node ops/seo/cache-check.cjs <base> <secret>
 * 1. sample of sitemap product URLs all 200 (a no-store fetch inside an ISR page would 500)
 * 2. Googlebot UA vs mobile visitor UA receive identical HTML
 * 3. schema price == live API price == visible price on the page
 * 4. POST /api/revalidate expires cached entries immediately (MISS right after, HIT again afterwards)
 * Reads production API data (GET only); writes nothing.
 */
const BASE = process.argv[2] || "http://localhost:3100";
const SECRET = process.argv[3] || "";
const API = process.env.API_BASE || "https://paratunisie.com/api/v1";
const GB = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const VIS = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36";
const get = (u, ua) => fetch(u, { headers: { "user-agent": ua || VIS } });
const strip = (h) => h.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "").replace(/\s+/g, " ");
(async () => {
  let fail = 0; const bad = (m) => { fail++; console.log("FAIL", m); };
  const sm = await (await fetch("https://paratunisie.com/sitemap.xml")).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => p.startsWith("/produits/"));
  const sample = urls.filter((_, i) => i % Math.max(1, Math.floor(urls.length / 40)) === 0).slice(0, 40);
  let ok = 0; for (const p of sample) { const r = await get(BASE + p); if (r.status === 200) ok++; else bad(`${p} -> ${r.status}`); }
  console.log(`1. product sample 200: ${ok}/${sample.length}`);
  let same = 0, n = 0;
  for (const p of ["/", ...sample.slice(0, 8), "/creatine"]) {
    n++; const a = strip(await (await get(BASE + p, GB)).text()); const b = strip(await (await get(BASE + p, VIS)).text());
    if (a === b) same++; else bad(`UA mismatch ${p}`);
  }
  console.log(`2. Googlebot == visitor HTML: ${same}/${n}`);
  let pm = 0, pn = 0;
  for (const p of sample.slice(0, 10)) {
    const slug = p.split("/").pop(); pn++;
    const api = await (await fetch(`${API}/catalogue/products/${slug}`)).json();
    const live = api.variants?.[0]?.priceMillimes; const html = await (await get(BASE + p)).text();
    const m = html.match(/"price"\s*:\s*"?([0-9.]+)"?/); const sch = m ? Math.round(parseFloat(m[1]) * 1000) : null;
    if (live && sch === live) pm++; else bad(`price ${slug}: api ${live} schema ${sch}`);
  }
  console.log(`3. schema price == API price: ${pm}/${pn}`);
  if (SECRET) {
    const p = sample[0]; const hdr = async () => (await get(BASE + p)).headers.get("x-nextjs-cache");
    const before = await hdr(); const r = await fetch(BASE + "/api/revalidate", { method: "POST", headers: { "x-revalidate-secret": SECRET } });
    const after1 = await hdr(); const after2 = await hdr();
    console.log(`4. before=${before} flush=${r.status} next=${after1} then=${after2}`);
    if (!(r.status === 200 && after1 === "MISS" && after2 === "HIT")) bad("invalidation sequence");
  }
  console.log(fail ? `RESULT: ${fail} failure(s)` : "RESULT: all checks passed"); process.exit(fail ? 1 : 0);
})();
