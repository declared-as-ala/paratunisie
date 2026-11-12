/* Run beside @prisma/client: node apply.cjs manifest.json [--apply].
 * Dry run by default. Compare-and-swap every field in one transaction.
 * A repeat run changes nothing. Concurrent manual edits abort the entire patch.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const write = process.argv.includes('--apply');
const allowed = new Set(['category', 'product', 'brand', 'productImage', 'article']);
async function main() {
  let changed = 0, skipped = 0;
  await prisma.$transaction(async (tx) => {
    // New parent rows must exist before category reparenting.
    const patches = [...manifest.patches].sort((a, b) => Number(Boolean(b.create)) - Number(Boolean(a.create)));
    for (const patch of patches) {
      if (!allowed.has(patch.model)) throw new Error('Unsupported entity');
      const model = tx[patch.model];
      const row = await model.findUnique({ where: { id: patch.id } });
      if (patch.create) {
        if (row) {
          if (row.slug !== patch.create.slug) throw new Error(`Conflicting new entity: ${patch.id}`);
          skipped++; continue;
        }
        if (write) await model.create({ data: patch.create });
        changed++; continue;
      }
      if (!row) throw new Error(`Entity removed since export: ${patch.id}`);
      const updates = {};
      for (const [key, value] of Object.entries(patch.data)) {
        if (JSON.stringify(row[key]) === JSON.stringify(value)) continue;
        if (JSON.stringify(row[key]) !== JSON.stringify(patch.before[key])) throw new Error(`Concurrent edit: ${patch.id}.${key}`);
        updates[key] = value;
      }
      if (!Object.keys(updates).length) { skipped++; continue; }
      if (write) {
        // updatedAt guard also protects edits occurring after the read.
        const result = await model.updateMany({ where: { id: patch.id, ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}), ...patch.before }, data: updates });
        if (result.count !== 1) throw new Error(`Concurrent edit: ${patch.id}`);
      }
      changed++;
    }
    for (const redirect of manifest.redirects) {
      const existing = await tx.seoRedirect.findUnique({ where: { oldPath: redirect.oldPath } });
      if (existing && existing.newPath !== redirect.newPath) {
        if (existing.newPath !== redirect.beforeNewPath) throw new Error(`Redirect conflict: ${redirect.oldPath}`);
        if (write) {
          const result = await tx.seoRedirect.updateMany({ where: { oldPath: redirect.oldPath, newPath: redirect.beforeNewPath }, data: { newPath: redirect.newPath } });
          if (result.count !== 1) throw new Error(`Concurrent redirect edit: ${redirect.oldPath}`);
        }
        changed++;
      }
      if (!existing) {
        if (write) await tx.seoRedirect.create({ data: { oldPath: redirect.oldPath, newPath: redirect.newPath } });
        changed++;
      }
    }
  }, { timeout: 120000, isolationLevel: 'Serializable' });
  console.log(JSON.stringify({ mode: write ? 'apply' : 'dry-run', changed, skipped }));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
