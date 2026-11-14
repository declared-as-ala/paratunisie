# Implementation Log

See the Change Log table in `TASKS.md`. Detailed evidence for each batch is appended here.

## Batch 1 (2026-11-14): SEO-004, SEO-005
- Local test: `/blog`, `/blog/abc`, `/brands`, `/brands/optimum-nutrition`, `/qui-sommes-nous` → 308 to `/conseils`, `/conseils/abc`, `/marques`, `/marques/optimum-nutrition`, `/a-propos`; `/proteine-sousse` → 404.
- `tsc --noEmit` clean.
- Live (after deploy): the same five URLs return 308 to the targets on https://paratunisie.com, `/proteine-sousse` 404, product JSON-LD shows `"merchantReturnDays":7`, `/creatine /marques /shop /conseils` 200. Container `paratunisie-web` healthy.

## 2026-11-14 — Wave 1 (SEO-001) + fixes
- DB: `Product.indexable=true` for 53 validated in-stock products (+ seoQualityScore/Issues/ReviewedAt). Rollback files on server: `/root/paratunisie-backups/wave1-before-*.json`.
- Code: `apps/api/src/catalogue/product-seo-quality.ts` accepts own media origin (+ test). `src/app/conseils/[slug]/page.tsx` returns 404 instead of 500 for unknown slugs.
- Deployed: api + web images rebuilt; previous images tagged `checkpoint-batch1`.
- Live verification: 53/53 pages index,follow + canonical + InStock JSON-LD; sitemap products 100 -> 153; `/conseils/unknown` 404.
