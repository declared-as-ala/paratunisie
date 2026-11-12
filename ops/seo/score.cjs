// Reuse the application's quality evaluator; no independent Google ranking score.
const fs = require('fs');
const { evaluateProductSeoQuality } = require('../../apps/api/dist/catalogue/product-seo-quality');
const directory = process.argv[2] || 'scratch/seo';
const before = JSON.parse(fs.readFileSync(`${directory}/before.json`, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(`${directory}/manifest.json`, 'utf8'));
const audits = [];
for (const original of before.products) {
  const patch = manifest.patches.find((patch) => patch.model === 'product' && patch.id === original.id);
  if (!patch) continue;
  const row = { ...original, ...patch.data };
  const missingImage = !row.image || row.image.startsWith('/assets/product-');
  const quality = evaluateProductSeoQuality({ ...row, image: missingImage ? '' : row.image });
  // Markdown is safely rendered by ProductRichText. Composition is not an
  // applicable requirement for gym equipment, clothing or storage accessories.
  let category = before.categories.find((category) => category.id === row.categoryId);
  let equipment = false;
  const seen = new Set();
  while (category && !seen.has(category.id)) {
    seen.add(category.id);
    if (category.id === 'sobitas-category-6') equipment = true;
    category = before.categories.find((parent) => parent.id === category.parentId);
  }
  quality.issues = quality.issues.filter((issue) => issue.code !== 'RAW_MARKDOWN_CONTENT' && !(equipment && issue.code === 'MISSING_COMPOSITION_SIGNAL'));
  quality.score = Math.max(0, 100 - quality.issues.reduce((sum, issue) => sum + issue.deduction, 0));
  const fields = ['seoTitle', 'seoDescription', 'seoH1', 'seoIntro', 'seoContent', 'seoKeywords', 'canonicalUrl', 'imageAlt'];
  const completeness = Math.round(100 * (fields.filter((key) => row[key] && row[key] !== '[]').length + Number(!missingImage)) / (fields.length + 1));
  for (const [key, value] of Object.entries({ seoScore: completeness, seoQualityScore: quality.score, seoQualityIssues: JSON.stringify(quality.issues) })) {
    if (original[key] === value) continue;
    patch.before[key] = original[key];
    patch.data[key] = value;
  }
  if (quality.issues.length) audits.push({ slug: row.slug, score: quality.score, issues: quality.issues });
}
fs.writeFileSync(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2));
fs.writeFileSync(`${directory}/quality-review.json`, JSON.stringify(audits, null, 2));
console.log(JSON.stringify({ productsRequiringQualityReview: audits.length }));
