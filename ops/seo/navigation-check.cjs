const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const output = [], errors = [];
  fs.mkdirSync('scratch/navigation/screens', { recursive: true });
  for (const width of [390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto('https://paratunisie.com/mass-gainer', { waitUntil: 'networkidle', timeout: 60000 });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('h1').innerText(), 'Mass Gainer Tunisie');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://paratunisie.com/mass-gainer');
    assert.ok(!(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    const nav = page.getByRole('navigation', { name: width < 1024 ? 'Navigation mobile' : 'Navigation principale', exact: true });
    if (width < 1024) {
      const toggle = page.locator('header summary');
      await toggle.focus(); await page.keyboard.press('Enter');
      await nav.waitFor({ state: 'visible' });
      assert.equal(await nav.getByRole('link', { name: 'Whey Protéine', exact: true }).getAttribute('href'), '/whey-proteine');
      assert.equal(await nav.getByRole('link', { name: 'Mass Gainer', exact: true }).getAttribute('href'), '/mass-gainer');
      await page.screenshot({ path: `scratch/navigation/screens/menu-${width}.png` });
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('header details').getAttribute('open'), null);
    } else {
      assert.ok(await nav.getByRole('link', { name: 'Whey Protéine', exact: true }).isVisible());
      assert.ok(await nav.getByRole('link', { name: 'Mass Gainer', exact: true }).isVisible());
    }
    assert.equal(await page.locator('header').getByText('Nos Catégories', { exact: true }).count(), 0);
    assert.equal(await page.locator('header').getByText('Protéines & Masse', { exact: true }).count(), 0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false);
    const productLinks = await page.locator('main a[href^="/produits/"]').count();
    assert.ok(productLinks >= 24);
    const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent)));
    const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
    assert.ok(faq && faq.mainEntity.length === 8);
    for (const question of faq.mainEntity) assert.equal(await page.getByRole('heading', { name: question.name, exact: true }).count(), 1);
    await page.screenshot({ path: `scratch/navigation/screens/mass-gainer-${width}.png` });
    await page.locator('main summary').filter({ hasText: 'Filtrer et trier' }).click();
    await page.locator('select[name="sort"]').selectOption('price_asc');
    await Promise.all([page.waitForURL(/sort=price_asc/), page.getByRole('button', { name: 'Appliquer', exact: true }).click()]);
    assert.ok((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    output.push({ width, status: response.status(), overflow, productLinks, visibleFaqQuestions: faq.mainEntity.length });
    await page.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync('scratch/navigation/browser.json', JSON.stringify({ output, errors }, null, 2));
  await browser.close(); console.log(JSON.stringify({ output, errors }));
})().catch(error => { console.error(error); process.exit(1); });
