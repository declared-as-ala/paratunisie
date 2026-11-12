/* Public, read-only mobile checks; does not submit an order or send messages. */
const { chromium } = require('playwright');
const fs = require('fs');
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__seoMetrics = { lcp: null, cls: 0 };
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__seoMetrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__seoMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const output = [];
  fs.mkdirSync('scratch/seo/mobile', { recursive: true });
  for (const path of ['/whey-proteine', '/accessoires', '/whey-proteine?page=2', '/produits/anabolic-whey-80-proactive-2-25kg']) {
    const response = await page.goto(`https://paratunisie.com${path}`, { waitUntil: 'networkidle', timeout: 60000 });
    const metrics = await page.evaluate(() => ({
      ...window.__seoMetrics,
      overflow: document.documentElement.scrollWidth > innerWidth,
      h1: [...document.querySelectorAll('h1')].map((node) => node.textContent),
      productLinks: [...document.querySelectorAll('a[href^="/produits/"]')].length,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      navigation: performance.getEntriesByType('navigation').map((entry) => ({ ttfb: entry.responseStart, domContentLoaded: entry.domContentLoadedEventEnd })),
      jsBytes: performance.getEntriesByType('resource').filter((entry) => /\.js(?:\?|$)/.test(entry.name)).reduce((sum, entry) => sum + entry.transferSize, 0),
    }));
    output.push({ path, status: response.status(), ...metrics });
    await page.screenshot({ path: `scratch/seo/mobile/${path.slice(1).replace(/[^a-z0-9-]/g, '_')}-viewport.png` });
    await page.screenshot({ path: `scratch/seo/mobile/${path.slice(1).replace(/[^a-z0-9-]/g, '_')}.png`, fullPage: true });
  }
  await page.goto('https://paratunisie.com/whey-proteine', { waitUntil: 'networkidle' });
  await page.locator('main summary').filter({ hasText: 'Filtrer et trier' }).click();
  await page.getByLabel('Rechercher dans cette catégorie').fill('whey');
  await Promise.all([page.waitForURL(/q=whey/), page.getByRole('button', { name: 'Appliquer', exact: true }).click()]);
  output.push({ filterUrl: page.url(), robots: await page.locator('meta[name="robots"]').getAttribute('content') });
  fs.writeFileSync('scratch/seo/mobile/results.json', JSON.stringify({ output, errors, note: 'Single unthrottled lab run. LCP/CLS are lab observations; INP and field Core Web Vitals require real-user data.' }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ output, errors }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
