/* Read-only UI verification; does not trigger bulk edits or notifications. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('fs');
(async () => {
  fs.mkdirSync('scratch/navigation/screens', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const login = await context.request.post('https://admin.paratunisie.com/api/v1/admin-auth/login', { data: { email: process.env.SEO_ADMIN_EMAIL, password: process.env.SEO_ADMIN_PASSWORD } });
  assert.ok(login.ok());
  const page = await context.newPage(), errors = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['produits', 'categories']) {
    await page.goto(`https://admin.paratunisie.com/admin/${path}`, { waitUntil: 'networkidle', timeout: 60000 });
    const score = page.getByRole('button', { name: /Détail SEO de/ }).first();
    await score.waitFor({ state: 'visible', timeout: 30000 });
    await score.click();
    const dialog = page.locator('dialog[open]');
    await dialog.waitFor();
    assert.equal(await dialog.locator('li').count(), 20);
    assert.ok(await dialog.getByRole('button', { name: 'Optimiser le SEO', exact: true }).isVisible());
    await page.screenshot({ path: `scratch/navigation/screens/admin-${path}-score.png` });
    results.push({ path, deductions: await dialog.locator('li').count(), score: await dialog.locator('p.text-2xl').textContent() });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync('scratch/navigation/admin-browser.json', JSON.stringify({ results, errors }, null, 2));
  await browser.close(); console.log(JSON.stringify({ results, errors }));
})().catch(error => { console.error(error); process.exitCode = 1; });
