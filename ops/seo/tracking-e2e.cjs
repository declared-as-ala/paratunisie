/* Tracking parity test: Meta Pixel + Google Ads events with trackers loaded eagerly (legacy) vs deferred (DEFER_TRACKERS=1).
 *
 * Usage: node ops/seo/tracking-e2e.cjs <baseUrl> [label]
 * Safety: the real fbevents.js / gtag.js files are allowed to LOAD, but every request that would SEND data (facebook.com/tr,
 * google-analytics / googleadservices / doubleclick collect + conversion beacons, our own tracking + order endpoints) is aborted
 * and only recorded. Nothing reaches Meta, Google, the production analytics or the orders API, and no order is created.
 * Output: one JSON document on stdout.
 */
const { chromium } = require("playwright-core");

const BASE = process.argv[2] || "http://localhost:3100";
const LABEL = process.argv[3] || BASE;
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const SEND = [
  /facebook\.com\/tr/, /google-analytics\.com\/(g\/)?collect/, /analytics\.google\.com/, /googleadservices\.com/,
  /doubleclick\.net/, /google\.com\/(pagead|ccm|measurement)/, /googletagmanager\.com\/(a|td|ccm)\b/,
  /\/api\/v1\/(tracking|analytics|orders|meta)/,
];
const LOAD = [/connect\.facebook\.net\/.*fbevents\.js/, /googletagmanager\.com\/gtag\/js/];

function metaEvent(url, body) {
  const u = new URL(url);
  let ev = u.searchParams.get("ev");
  let value = u.searchParams.get("cd[value]");
  if (body) {
    const text = (() => { try { return decodeURIComponent(body); } catch { return body; } })();
    if (!ev) { const m = /(?:^|[&\s])ev=([A-Za-z]+)/.exec(text) || /name="ev"\s+([A-Za-z]+)/.exec(text); ev = m ? m[1] : null; }
    if (!value) { const m = /cd\[value\]=([0-9.]+)/.exec(text) || /name="cd\[value\]"\s+([0-9.]+)/.exec(text); value = m ? m[1] : null; }
  }
  return { kind: "meta", event: ev, value: value || undefined };
}

function classify(url, body) {
  try {
    const u = new URL(url);
    if (/facebook\.com\/tr/.test(url)) return metaEvent(url, body);
    if (/googleadservices|doubleclick|google\.com\/(pagead|ccm)/.test(url)) return { kind: "gads", event: u.searchParams.get("en") || u.pathname.split("/").slice(-2).join("/") };
    if (/google-analytics|analytics\.google|googletagmanager\.com\/(a|td|ccm)/.test(url)) return { kind: "ga", event: u.searchParams.get("en") };
    if (/\/api\/v1\/tracking/.test(url)) return { kind: "capi-relay", event: "meta-event" };
    if (/\/api\/v1\/analytics/.test(url)) return { kind: "first-party-analytics", event: u.pathname };
    if (/\/api\/v1\/orders/.test(url)) return { kind: "orders-api", event: u.pathname };
  } catch {}
  return { kind: "other", event: null };
}

async function scenario(browser, name, fn) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36" });
  const t0 = Date.now();
  const sent = [];
  const loads = [];
  await ctx.route("**/*", (route) => {
    const url = route.request().url();
    if (LOAD.some((r) => r.test(url))) loads.push({ t: Date.now() - t0, url: url.split("?")[0] + (url.includes("gtag/js") ? "?id=" + new URL(url).searchParams.get("id") : "") });
    if (SEND.some((r) => r.test(url)) && !LOAD.some((r) => r.test(url))) {
      sent.push({ t: Date.now() - t0, ...classify(url, route.request().postData()) });
      return route.abort();
    }
    return route.continue();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));
  const result = await fn(page, () => Date.now() - t0);
  await page.waitForTimeout(1500);
  await ctx.close();
  return { name, loads, sent, errors, ...result };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const out = { label: LABEL, base: BASE, scenarios: [] };

  // 1. Home, no interaction (like a lab test / a visitor who just reads)
  out.scenarios.push(await scenario(browser, "home_no_interaction_9s", async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(9000);
    return {};
  }));

  // 2. Home, first interaction (scroll) at ~1s
  out.scenarios.push(await scenario(browser, "home_scroll_at_1s", async (page, now) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const at = now();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(3000);
    return { interactionAt: at };
  }));

  // 3. Events fired by page code before the trackers load: same API surface the app uses for purchase / conversion.
  out.scenarios.push(await scenario(browser, "events_fired_before_load_then_idle", async (page) => {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const api = await page.evaluate(() => {
      const r = { fbq: typeof window.fbq, gtag: typeof window.gtag, dataLayer: Array.isArray(window.dataLayer) };
      if (typeof window.fbq === "function") window.fbq("track", "Purchase", { value: 99.5, currency: "TND", content_type: "product", content_ids: ["TEST"] });
      if (typeof window.gtag === "function") window.gtag("event", "conversion", { send_to: "AW-18415809993/ht1fCMLgzOkcEMnrq81E", value: 99.5, currency: "TND", transaction_id: "TEST-NOT-A-REAL-ORDER" });
      return r;
    });
    await page.waitForTimeout(9000);
    return { stubsDefinedAtDomContentLoaded: api };
  }));

  // 4. Product page: view + real add-to-cart click (cart is client side; no order is placed)
  out.scenarios.push(await scenario(browser, "product_view_and_add_to_cart", async (page) => {
    await page.goto(BASE + "/produits/100-whey-gold-standard-2-27kg", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const btn = page.getByRole("button", { name: /ajouter (au|à) (panier|ma commande)|ajouter/i }).first();
    let clicked = false;
    try { await btn.click({ timeout: 5000 }); clicked = true; } catch {}
    await page.waitForTimeout(6000);
    return { addToCartClicked: clicked };
  }));

  // 5. Cart page opens and stays private
  out.scenarios.push(await scenario(browser, "panier_loads", async (page) => {
    const res = await page.goto(BASE + "/panier", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    return { status: res.status(), cacheControl: res.headers()["cache-control"] || null };
  }));

  out.scenarios.push(await scenario(browser, "checkout_loads_no_interaction", async (page) => {
    const res = await page.goto(BASE + "/checkout", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    return { status: res.status() };
  }));

  await browser.close();
  // Summary: the set of (kind:event) pairs per scenario
  for (const s of out.scenarios) {
    s.eventSet = [...new Set(s.sent.map((x) => `${x.kind}:${x.event}${x.value ? "(value=" + x.value + ")" : ""}`))].sort();
    s.firstLoadMs = s.loads.length ? Math.min(...s.loads.map((l) => l.t)) : null;
  }
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
