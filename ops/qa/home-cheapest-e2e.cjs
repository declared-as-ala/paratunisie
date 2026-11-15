/* UI test for the homepage "À LA UNE — Les petits prix par catégorie" module (desktop tab panel + product grid).
 * Usage: node ops/qa/home-cheapest-e2e.cjs <baseUrl> [screenshotDir]
 * Safety: read-only against the production API (GET). Add-to-cart only writes the visitor's localStorage cart; checkout is
 * never opened and no order is created. All outgoing tracking beacons are aborted.
 */
const { chromium } = require("playwright-core");
const fs = require("fs");
const BASE = process.argv[2] || "http://localhost:3102";
const SHOTS = process.argv[3] || "docs/seo/screenshots";
const API = process.env.API_BASE || "https://paratunisie.com/api/v1";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const SEND = [/facebook\.com\/tr/, /google-analytics\.com/, /analytics\.google\.com/, /googleadservices\.com/, /doubleclick\.net/, /\/api\/v1\/(tracking|analytics|orders)/];
const gotoHome = async (pg, base) => {
  // A local server talking to the remote production API can exceed the app's 5 s fetch timeout (the module is then omitted by design): retry.
  await pg.goto(base + "/", { waitUntil: "load" });
  for (let attempt = 0; attempt < 5 && (await pg.locator("#home-cheapest").count()) === 0; attempt++) await pg.reload({ waitUntil: "load" });
};
const dt = (millimes) => millimes / 1000;
const parsePrice = (txt) => Math.round(parseFloat(txt.replace(/[^\d,.]/g, "").replace(/\s/g, "").replace(",", ".")) * 1000);

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const api = await (await fetch(`${API}/homepage/cheapest-by-category`)).json();
  check("API returns entries", api.length >= 2, `${api.length} categories`);
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  // ───────────── Desktop ─────────────
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await dctx.route("**/*", (r) => (SEND.some((x) => x.test(r.request().url())) ? r.abort() : r.continue()));
  const page = await dctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));
  await gotoHome(page, BASE);
  const tabs = page.getByRole("tab");
  await tabs.first().waitFor({ timeout: 15000 });
  check("desktop: one tab per API category", (await tabs.count()) === api.length, `${await tabs.count()} tabs`);
  check("desktop: header labels present", (await page.getByText("À LA UNE", { exact: true }).count()) > 0 && (await page.getByText("Les petits prix par catégorie").count()) > 0);
  await page.screenshot({ path: `${SHOTS}/home-desktop-hero.png` });

  // every category: displayed name + price equal the API variant
  const panel = page.getByRole("tabpanel");
  let allMatch = true; const mismatches = [];
  for (let i = 0; i < api.length; i++) {
    await tabs.nth(i).click();
    await page.waitForTimeout(120);
    const name = (await panel.locator("h3").innerText()).trim();
    const priceText = await panel.locator(".font-tabular").first().innerText();
    const shown = parsePrice(priceText);
    const exp = api[i].product;
    const okName = name === exp.name, okPrice = shown === exp.variant.priceMillimes;
    if (!okName || !okPrice) { allMatch = false; mismatches.push(`${api[i].category.slug}: shown ${name}/${shown} vs api ${exp.name}/${exp.variant.priceMillimes}`); }
    check(`desktop: tab "${api[i].category.name}" shows the API product and price`, okName && okPrice, `${dt(shown)} DT`);
    const selected = await tabs.nth(i).getAttribute("aria-selected");
    if (selected !== "true") allMatch = false;
  }
  check("desktop: every selected tab exposes aria-selected", allMatch, mismatches.join(" | "));
  await tabs.nth(0).click();

  // stock label / size label rules
  const first = api[0];
  check("desktop: 'En stock' shown", (await panel.getByText("En stock", { exact: false }).count()) > 0);
  const sizeChip = await panel.getByText(/^Format :/).count();
  check("desktop: size chip shown only when a safe label exists", (sizeChip === 1) === !!first.product.displaySize);
  // junk-label categories must not show the bogus size
  const mag = api.findIndex((e) => e.category.slug === "magnesium");
  if (mag >= 0) {
    await tabs.nth(mag).click(); await page.waitForTimeout(150);
    check("desktop: junk catalogue label ('6l') is not displayed for magnésium", (await panel.getByText(/Format : 6l/i).count()) === 0);
    await tabs.nth(0).click();
  }
  // 'cheapest' claim only when proven
  for (let i = 0; i < api.length; i++) {
    await tabs.nth(i).click(); await page.waitForTimeout(100);
    const claim = await panel.getByText(/Prix le plus bas en stock/).count();
    if ((claim > 0) !== api[i].cheapestProven) check(`desktop: cheapest claim only when proven (${api[i].category.slug})`, false);
  }
  check("desktop: 'cheapest' claim matches API cheapestProven for every category", true);
  await tabs.nth(0).click();

  // keyboard navigation (roving tabindex)
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  check("keyboard: ArrowRight selects and focuses next tab", (await tabs.nth(1).getAttribute("aria-selected")) === "true" && (await page.evaluate(() => document.activeElement?.getAttribute("role"))) === "tab");
  await page.keyboard.press("End");
  check("keyboard: End selects last tab", (await tabs.nth(api.length - 1).getAttribute("aria-selected")) === "true");
  await page.keyboard.press("Home");
  check("keyboard: Home selects first tab", (await tabs.nth(0).getAttribute("aria-selected")) === "true");
  check("keyboard: only the selected tab is in the tab order", (await tabs.nth(1).getAttribute("tabindex")) === "-1" && (await tabs.nth(0).getAttribute("tabindex")) === "0");

  // add to cart consistency: price + variant label that are stored equal API variant
  await tabs.nth(0).click();
  await page.evaluate(() => localStorage.removeItem("paratunisie-cart"));
  const shownPrice = parsePrice(await panel.locator(".font-tabular").first().innerText());
  await panel.getByRole("button", { name: /Ajouter au panier/ }).click();
  await page.waitForTimeout(500);
  const cart = JSON.parse(await page.evaluate(() => localStorage.getItem("paratunisie-cart") || "[]"));
  const line = cart[0] || {};
  check("cart: one line added", cart.length === 1);
  check("cart: line price == displayed price == API variant price", line.priceMillimes === shownPrice && line.priceMillimes === first.product.variant.priceMillimes, `${line.priceMillimes}`);
  check("cart: line size label == API variant label (no re-pricing to another variant)", line.sizeLabel === first.product.variant.label, `${line.sizeLabel}`);
  check("cart: product id matches", line.productId === first.product.id);

  // links
  const href = await panel.getByRole("link", { name: "Voir le produit" }).getAttribute("href");
  check("desktop: 'Voir le produit' links to the product page", href === `/produits/${first.product.slug}`, href);

  // reduced motion
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await rctx.route("**/*", (r) => (SEND.some((x) => x.test(r.request().url())) ? r.abort() : r.continue()));
  const rpage = await rctx.newPage();
  await gotoHome(rpage, BASE);
  await rpage.getByRole("tab").first().waitFor({ timeout: 15000 });
  const anim = await rpage.evaluate(() => getComputedStyle(document.querySelector(".cat-fade")).animationName);
  check("reduced motion: category fade animation disabled", anim === "none", anim);
  await rctx.close();

  // ───────────── Mobile ─────────────
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mctx.route("**/*", (r) => (SEND.some((x) => x.test(r.request().url())) ? r.abort() : r.continue()));
  const mp = await mctx.newPage();
  await gotoHome(mp, BASE);
  await mp.locator("#home-cheapest").waitFor({ state: "attached", timeout: 20000 });
  check("mobile: hero tab module is hidden (grid is the mobile experience)", (await mp.getByRole("tablist").count()) === 0 || !(await mp.getByRole("tablist").first().isVisible()));
  const section = mp.locator("section[aria-labelledby='home-cheapest']");
  check("mobile: grid shows one card per API category", (await section.locator("article").count()) === api.length, `${await section.locator("article").count()} cards`);
  check("mobile: no horizontal overflow", await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const cardPrices = await section.locator("article .font-tabular").allInnerTexts();
  const expected = api.map((e) => e.product.variant.priceMillimes);
  const shownAll = cardPrices.map(parsePrice);
  check("mobile: every card price equals the API variant price", expected.every((p) => shownAll.includes(p)), `${shownAll.map(dt).join(", ")}`);
  await section.scrollIntoViewIfNeeded();
  await mp.screenshot({ path: `${SHOTS}/home-mobile-grid.png` });
  const box = await section.boundingBox();
  if (box) await mp.screenshot({ path: `${SHOTS}/home-mobile-grid-full.png`, clip: { x: 0, y: Math.max(0, box.y), width: 390, height: Math.min(box.height, 1800) }, fullPage: true });
  // touch target size of add-to-cart / favourites in the grid
  const heart = await section.locator("button[aria-pressed]").first().boundingBox();
  check("mobile: favourite button touch target >= 44px", heart && heart.width >= 44 && heart.height >= 44, heart ? `${heart.width}x${heart.height}` : "");

  // desktop grid
  await gotoHome(page, BASE);
  await page.locator("#home-cheapest").waitFor({ state: "attached", timeout: 20000 });
  await page.evaluate(() => document.querySelector("#home-cheapest")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SHOTS}/home-desktop-grid.png` });
  check("no uncaught page errors", errors.length === 0, errors.join(" | "));

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\nRESULT: ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
