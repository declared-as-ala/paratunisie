import https from "node:https";
import http from "node:http";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const TEST_ROUTES = [
  { path: "/", expectIndex: true, desc: "Homepage" },
  { path: "/shop", expectIndex: true, desc: "Shop Root (Page 1)" },
  { path: "/shop?page=2", expectIndex: true, desc: "Shop Page 2 (Sequential Pagination)" },
  { path: "/creatine", expectIndex: true, desc: "Category: Créatine" },
  { path: "/whey-proteine", expectIndex: true, desc: "Category: Whey Protéine" },
  { path: "/pre-workout", expectIndex: true, desc: "Category: Pré-Workout" },
  { path: "/nutrition-sportive", expectIndex: true, desc: "Category: Nutrition Sportive" },
  { path: "/complements-alimentaires", expectIndex: true, desc: "Category: Compléments Alimentaires" },
  { path: "/ashwagandha", expectIndex: true, desc: "Category: Ashwagandha" },
  { path: "/omega-3", expectIndex: true, desc: "Category: Oméga 3" },
  { path: "/produits/creatine-monohydrate-ostrovit-500gr", expectIndex: true, desc: "Product PDP: Creatine OstroVit" },
  { path: "/conseils/meilleure-creatine-tunisie", expectIndex: true, desc: "Article: Meilleure Créatine en Tunisie 2026" },
  { path: "/mentions-legales", expectIndex: true, desc: "Legal: Mentions Légales" },
  { path: "/politique-editoriale", expectIndex: true, desc: "E-E-A-T: Politique Éditoriale" },
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, html: data }));
    });
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractAllTags(html, regex) {
  const results = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

async function run() {
  console.log("==================================================================");
  console.log(`PARATUNISIE — SEO HARDENING & VERIFICATION (${BASE_URL})`);
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  for (const route of TEST_ROUTES) {
    const fullUrl = `${BASE_URL}${route.path}`;
    try {
      const res = await fetchHtml(fullUrl);
      const is200 = res.status === 200;

      // Title check
      const title = extractTag(res.html, /<title[^>]*>(.*?)<\/title>/is);
      const hasDoubleBrand = title && title.includes("ParaTunisie | ParaTunisie");

      // Canonical check
      const canonical = extractTag(res.html, /<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/is);
      const canonicalHostOk = canonical && canonical.startsWith("https://paratunisie.com");

      // Robots check
      const robotsMeta = extractTag(res.html, /<meta[^>]*name=["']robots["'][^>]*content=["'](.*?)["']/is);
      const isNoindex = robotsMeta ? robotsMeta.toLowerCase().includes("noindex") : false;

      // H1 check
      const h1s = extractAllTags(res.html, /<h1[^>]*>(.*?)<\/h1>/gis);
      const cleanH1 = h1s.length > 0 ? h1s[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "NONE";

      // JSON-LD check
      const jsonLdBlocks = extractAllTags(res.html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
      let jsonLdParsed = true;
      const jsonLdTypes = [];
      for (const block of jsonLdBlocks) {
        try {
          const parsed = JSON.parse(block);
          if (parsed["@type"]) jsonLdTypes.push(parsed["@type"]);
          if (parsed["@graph"]) {
            for (const item of parsed["@graph"]) {
              if (item["@type"]) jsonLdTypes.push(item["@type"]);
            }
          }
        } catch {
          jsonLdParsed = false;
        }
      }

      // Check forbidden fake discount terms
      const hasFakeDiscountStrings = res.html.includes("oldPriceMillimes") || res.html.includes("-15% old price");

      const routePass =
        is200 &&
        title &&
        !hasDoubleBrand &&
        canonical &&
        canonicalHostOk &&
        (route.expectIndex ? !isNoindex : isNoindex) &&
        h1s.length > 0 &&
        jsonLdParsed &&
        !hasFakeDiscountStrings;

      if (routePass) {
        passed++;
        console.log(`[PASS] ${route.path}`);
        console.log(`       Desc: ${route.desc}`);
        console.log(`       Status: ${res.status} | Title: ${title}`);
        console.log(`       Canonical: ${canonical}`);
        console.log(`       Robots: ${robotsMeta || "index,follow (default)"}`);
        console.log(`       H1: ${cleanH1}`);
        console.log(`       JSON-LD Types: ${jsonLdTypes.join(", ") || "None"}\n`);
      } else {
        failed++;
        console.log(`[FAIL] ${route.path}`);
        console.log(`       Status: ${res.status} (Expected: 200)`);
        console.log(`       Title: ${title} (Double brand: ${hasDoubleBrand})`);
        console.log(`       Canonical: ${canonical} (Host OK: ${canonicalHostOk})`);
        console.log(`       Robots: ${robotsMeta || "index,follow"} (Expected Index: ${route.expectIndex})`);
        console.log(`       H1s found: ${h1s.length} (${cleanH1})`);
        console.log(`       JSON-LD valid: ${jsonLdParsed}\n`);
      }
    } catch (err) {
      failed++;
      console.log(`[ERROR] ${route.path}: ${err.message}\n`);
    }
  }

  console.log("------------------------------------------------------------------");
  console.log(`SUMMARY: ${passed} Passed | ${failed} Failed | Total: ${TEST_ROUTES.length}`);
  console.log("------------------------------------------------------------------");

  if (failed > 0) process.exit(1);
}

run();
