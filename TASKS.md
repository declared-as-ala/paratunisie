# TASKS.md — ParaTunisie SEO Recovery (single source of truth)

Last updated: 2026-11-14 (Batch 1 secured; P1 root cause; Wave 1 canary + rollout done). Evidence below comes from live requests to paratunisie.com and read-only SQL on the production database. Nothing here is estimated or invented; unknowns are marked.

## 1. Executive Summary

**Current SEO health: poor, and mostly self-inflicted.** After the catalogue was replaced with the Sobitas catalogue (11,888 published products), **99% of products render `noindex` and only 100 products are in the sitemap.** Many large, useful category pages are also `noindex` and have no content. The site is technically sound otherwise (HTTPS, canonicals, valid Product/Breadcrumb JSON-LD, one H1 per page, 301 host redirects).

**Confirmed critical problems**
- SEO-001 (P0) 11,788 of 11,888 published products are `indexable=false` (`<meta robots noindex, follow, nocache>`), excluded from the sitemap.
- SEO-002 (P0) 11 large categories are `noindex` and have no editorial content: plantes-et-herbes (1,519 products), immunite (840), sommeil-stress (771), mineraux (663), antioxydants (639), articulations (592), digestion (477), probiotiques (433), collagene (274), acides-amines (251), boosters-hormonaux (230).
- SEO-003 (P0) No Google Search Console / Merchant Center access from this environment (MCP server timed out). No real search baseline exists yet.

**Baseline metrics:** see `docs/seo/BASELINE.md`. Organic clicks/impressions/CTR/position/indexed pages: **UNKNOWN (no GSC access)**.

**Business impact:** ~11.8k product pages cannot rank. Only 100 products and ~13 categories can attract organic traffic.

**Main risks:** mass indexation of thin, imported pages could dilute quality; 98.6% of products are not in stock (on-order model); descriptions are imported text.

## 2. SEO Audit Findings

| ID | URL(s) | Evidence | Root cause | Priority | Solution | Verification |
|---|---|---|---|---|---|---|
| SEO-001 | `/produits/*` (11,788 products) | `select indexable,count(*) from "Product"`: PUBLISHED+false = 11,788; HTML has `robots: noindex, follow, nocache`; sitemap has 100 `/produits` URLs | Catalogue sync created new products `indexable=false` by design (D-0033) until SEO copy exists | P0 | Staged indexation by quality rule (needs approval, see SEO-010) | `curl` robots meta + sitemap count after rollout |
| SEO-002 | 11 category URLs above | `Category.indexable=false`, `seoContent` null | Categories created/derived without content | P0 | Write unique French content, then index (approval) | meta robots + sitemap |
| SEO-003 | Google Search Console | `mcp gsc` timed out | Access not available | P0 (blocker) | Re-authorize GSC; or user exports performance CSV | Real clicks/impressions in BASELINE.md |
| SEO-004 | `/blog`, `/brands`, `/brands/:slug`, `/qui-sommes-nous` | All returned 404 | Legacy URLs removed | P1 | 301 to `/conseils`, `/marques`, `/marques/:slug`, `/a-propos`. `/proteine-sousse` has no equivalent: stays 404 | Local test: 308 to targets, 404 kept (done) |
| SEO-005 | All `/produits/*` JSON-LD | `merchantReturnDays: 3` + `FreeReturn` vs `/retours`: 7 days, no statement about return fees | Hard-coded schema out of sync with policy | P1 | Align to 7 days, drop unsupported fee/method (done in code) | Live JSON-LD shows 7 days |
| SEO-006 | Product pages, `Offer.availability` | 11,724 of 11,888 products `OutOfStock` | On-order model (Sobitas qte=0) | P1 | Business decision: `BackOrder`/`PreOrder` vs `OutOfStock` — **BLOCKED** | Decision recorded |
| SEO-007 | Product names (6) | e.g. "…Vanilla Ice cream – 2268 kg" | Source typo (g written as kg) | P2 | Rule-based fix of `\d{4}\s?kg` → g after review | SQL check = 0 |
| SEO-008 | Catalogue | 75 duplicate-name groups (e.g. 5× "Nutricost Melatonin Gummies – Strawberry – 180 gommes"); 8 products with brand "Autres marques" | iHerb variants imported as separate products | P2 | Report in admin; canonicalise or merge after review | Duplicates report |
| SEO-009 | Reviews | 2,500 reviews on 50 products, **all REJECTED**; storefront shows none; no AggregateRating in HTML | Seeded reviews were rejected; card star counts that were derived from product IDs were already removed | P1 (verified OK) | Keep policy: only approved reviews, no fabricated totals | `aggregateRating` absent in live HTML (verified) |
| SEO-011 | All pages | `Cache-Control: private, no-cache, no-store` on every page; home HTML 598 KB | `force-dynamic` rendering | P1 | ISR/caching strategy (approval: caching policy) | TTFB before/after |
| SEO-012 | Sitemap | 174 URLs, no lastmod check yet | — | P2 | Review lastmod and categories coverage | Sitemap test |

## 3. Master Task Board

| ID | Priority | Task | Status | Risk | Evidence | Verification |
|---|---|---|---|---|---|---|
| SEO-001 | P0 | Staged product indexation | WAVE 1 DONE (53 of 95 in-stock); rest of catalogue still noindex (see §10) | High | SQL + live curl | 53 pages verified live, sitemap 153 products |
| SEO-002 | P0 | Content + indexation for 11 big categories | READY (content to write) | Medium | SQL | meta robots |
| SEO-003 | P0 | Obtain GSC / Merchant access | BLOCKED | Low | MCP error | Real data in BASELINE |
| SEO-004 | P1 | Legacy URL redirects | VERIFIED (live 2026-11-14) | Low | 308 tests | Live curl: all 5 redirect, /proteine-sousse 404 |
| SEO-005 | P1 | Return-policy schema matches /retours | VERIFIED (live 2026-11-14) | Low | JSON-LD diff | Live JSON-LD shows `merchantReturnDays: 7`, no fee/method |
| SEO-006 | P1 | Availability semantics for on-order products | BLOCKED (business decision, see §12) | Medium | checkout code + UI | Decision |
| SEO-007 | P2 | Fix kg/g unit typos | DONE for the 2 real typos (4 others are correct French decimals) | Low | SQL | names + seoTitle now `2,268 kg`; backup table `_wave_backup_typos`; slugs unchanged |
| SEO-008 | P2 | Duplicate-name report in admin | TODO | Low | SQL | Report |
| SEO-009 | P1 | Rating policy | VERIFIED | Low | `aggregateRating` absent | curl |
| SEO-010 | P0 | Indexation proposal + dry run | READY (see docs/seo/CATALOG_AUDIT.md) | Medium | Counts | Approval |
| SEO-011 | P1 | Page caching / ISR | TODO | High | headers | Web Vitals |
| SEO-013 | P2 | Core Web Vitals measurement (needs PageSpeed/CrUX) | TODO | Low | none yet | PSI JSON |
| SEO-014 | P2 | Internal linking audit (graph) | TODO | Low | — | link report |
| SEO-015 | P2 | /conseils content audit | TODO | Low | 40 articles in sitemap | audit |

## 4. Implementation Phases
1. **Batch 1 (this batch):** SEO-004, SEO-005 (code only, low risk).
2. **Batch 2:** SEO-007, SEO-008, admin SEO health report (read-only dashboards).
3. **Batch 3 (needs approval):** SEO-010 staged indexation + SEO-002 category content.
4. **Batch 4:** SEO-011 caching, SEO-013 Core Web Vitals, internal linking.
Dependencies: SEO-001/002 need approval; SEO-006 needs a business decision; SEO-003 unlocks measurement for everything.

## 5. Change Log
| Time | Task | Files | DB | Git | Tests | Deploy | Rollback |
|---|---|---|---|---|---|---|---|
| 2026-11-14 | SEO-004 | `next.config.ts` | none | uncommitted | local: `/blog`→308 `/conseils`, `/blog/:slug`, `/brands`, `/brands/:slug`, `/qui-sommes-nous`→308; `/proteine-sousse` 404; `tsc` clean | deployed (web image rebuilt, container healthy); live curl OK | `docker tag` rollback `rollback-seo1`; or remove the 5 redirect entries |
| 2026-11-14 | SEO-005 | `src/lib/seo/schema.ts` | none | uncommitted | `tsc` clean | deployed with SEO-004 | file backups in `/root/paratunisie-backups/seo-batch1/` |
| 2026-11-14 | (prior) | catalogue sync, product page, MinIO | catalogue replaced (D-0033) | uncommitted | dry run on scratch DB | live | backups in `/root/paratunisie-backups` |

## 6. Results Dashboard
| Metric | Value |
|---|---|
| Organic clicks / impressions / CTR / position | UNKNOWN — no GSC access |
| Indexed pages (Google) | UNKNOWN |
| Sitemap-submitted URLs | 174 (100 products, 40 articles, 4 brands, ~30 static/category) |
| Published products | 11,888 (100 indexable) |
| Core Web Vitals | NOT MEASURED |
| Product rich-result eligibility | Product + Offer + shipping + returns JSON-LD present; GTIN/MPN absent (not in data) |
| Merchant Center | UNKNOWN |

## 7. Next Actions
1. Batch 1 is live and verified (redirects + return-policy schema). Ask Google to recrawl is pending Search Console access.
2. Get your decision on SEO-010 (staged indexation) — details in `docs/seo/CATALOG_AUDIT.md`.
3. Provide Search Console access (or CSV exports) to unlock SEO-003.
4. Decide availability semantics for on-order products (SEO-006).
5. Fix the 6 unit typos (SEO-007) and add the duplicate-name report.

## 8. P0 — Batch 1 secured (2026-11-14)
- Git: commit `f638b63` on branch `seo/recovery-batch1` (not pushed). Contains the storefront redesign, catalogue-sync tooling, Batch 1 redirects, schema fix, docs. Excluded on purpose: `.env`, `apps/api/.env`, two stray reference PNGs. Secrets scan of the staged diff: clean.
- Production images (server): web `latest` = `0b0c66aeb1fa`, admin `4972a7f420dc`, api `457d028c5f26`. Checkpoint tags `checkpoint-batch1` created for all three. Pre-Batch-1 web image: `rollback-seo1` (`d252ecd0fe3c`).
- DB checkpoint: `/root/paratunisie-backups/db-checkpoint-post-batch1-20261114.dump` (8.6 MB, `pg_restore -l` lists 64 table-data entries = valid archive). Older pre-sync dumps also listed OK.
- Redirect verification (live): `/blog`, `/brands`, `/qui-sommes-nous` -> 308 -> 200. A real article `/blog/complements-avant-pendant-apres-entrainement` -> `/conseils/<same slug>` 200; `/brands/golds-gym` -> `/marques/golds-gym` 200.
- Defect found while verifying: unknown `/conseils/<slug>` returned **500** (API answers 200 with an empty body, `res.json()` threw). Fixed in `src/app/conseils/[slug]/page.tsx` (deployed with the Wave 1 build; see §11).

## 9. Wave 1 results (P2)
| Step | Result |
|---|---|
| In-stock, published, noindex candidates | 95 |
| Passed every check | **53 made indexable** |
| Blocked | 42 (reasons below) |
| Canary | 10 products (diverse categories) applied first, verified live, then remaining 43 |
| Live verification | All 53: `robots: index, follow`, self-canonical, one H1, Product JSON-LD `InStock`, no `X-Robots-Tag` header, image 200; JSON-LD price = visible price = DB price (10 checked in detail) |
| Sitemap product URLs | 100 -> **153** |

Checks applied per product: existing code gate `evaluateProductSeoQuality` (published, valid slug/name/brand/category, description >= 160 chars, not the bulk template, no absolute claims, real image, valid price, availability consistency, unique title) + live image fetch (200, `image/*`) + no PROTEIN.TN/Sobitas text + no unsubstantiated "garanti" claim + non-generic brand + price between 3 and 2,000 DT.

Blocked (42):
- 27 gym machines/benches: prices of 2,490–35,000 DT cannot be verified against any source available to me. Need the owner to confirm price and stock. Not an automatic rejection of the product.
- 6 brand "Autres marques" (generic brand would put a meaningless brand in schema): glove, vitamin E, two shakers, EAA Powervis, GymHub shaker.
- 3 thin packs (description 39–48 chars): PACK PREMIUM ELITE, PACK PROFESSIONNEL, PACK GAIN MUSCULAIRE RAPIDE.
- 2 duplicate titles: Magnesium+Calcium+B6 (also contains "PROTEIN.TN" text), Tantor Whey 2,267 g.
- 3 with unsubstantiated guarantee wording ("service professionnel garanti", "usage intensif garanti"): C4 Original, Challenger Creatine 300 g, Banc réglable MND.
- 1 with third-party text: LIPO 6 Intense Ultra Concentrate ("PROTEIN.TN").
(The sync sanitizer missed "chez PROTEIN.TN" phrasing written in upper case with markdown bold; the 2 affected descriptions should be cleaned, SEO-016.)

Caveat (stock): many in-stock products show a stock of exactly 100 (e.g. 96–100). That looks like a nominal value from the source, not a counted inventory. Indexing is allowed because the user defined these as in stock, but the real stock must be confirmed before ads/Merchant feed (see P5).

Rollback: before-state JSON per batch in `/root/paratunisie-backups/wave1-before-0-10.json` and `wave1-before-10-53.json` (id, slug, indexable, score, issues, reviewedAt). Restore = set `indexable=false` for those ids (all were false).
Status words: "made indexable" only. Google indexing is NOT confirmed; needs GSC (blocked).

## 10. P1 — Root cause of 11,788 noindex products
1. **Source of the flag:** `Product.indexable` (database column). `src/lib/seo/metadata.ts:164` sets `robots: noindex` iff `product.indexable === false`. Not dynamic: no stock, content, device or user-agent logic; Googlebot receives the same HTML (tested with a Googlebot UA: same robots meta, no `X-Robots-Tag` header).
2. **Who set it false:** the catalogue sync (`ops/ovh/sobitas-sync.cjs`, D-0033) inserts new products with `indexable=false` by design, and the API import service does the same (`apps/api/src/imports/services/imports.service.ts:436`). So 11,788 new products started noindex.
3. **Second independent cause (latent bug):** the existing gate `evaluateProductSeoQuality` (also run on every admin save via `applyProductSeoGate`, `catalogue.service.ts:321`) blocked 100% of migrated products because it treated our own MinIO URLs (`https://paratunisie.com/paratunisie-media/...`) as "EXTERNAL_HOTLINKED_IMAGE". Fixed to accept our own media origin (with a lookalike-domain test). Without this fix, any admin edit would have re-set the 53 products to noindex.
4. **Sitemap eligibility** (`catalogue.service.ts getSitemapData`): product must be PUBLISHED, `indexable=true`, self-canonical; a category appears only if ACTIVE, indexable, and containing at least one indexable product; brands likewise.
5. **robots.txt:** no disallow on `/produits`; canonical is self-referencing on all sampled pages.
6. **Decision:** no global removal of noindex. Indexation proceeds by validated waves only. Quality gate stats for the whole catalogue are in `docs/seo/CATALOG_AUDIT.md`.

## 11. Deploy log (Wave 1 code fixes)
See `docs/seo/IMPLEMENTATION_LOG.md`. Backups of the pre-change files: `/root/paratunisie-backups/seo-batch1/*.pre-wave1`.

## 12. Findings P3–P7 (investigation; no further production changes beyond SEO-007)
**P3 Categories (11 noindex + others).** 13 of 51 categories are indexable. All 11 target categories are ACTIVE, have 0 characters of `seoContent` (except boosters-hormonaux: 395 chars) and 0–3 in-stock products each. `whey-isolate` (138 products, 8 in stock) and `barres-proteinees` are also noindex. Cause: `apply-product-seo-quality.ts` noindexes any category with no indexable product; categories with Wave 1 products can now qualify. Pilot candidates (strong intent + in-stock + indexable products): `whey-isolate`, `acides-amines`, `boosters-hormonaux`. Not done yet: writing the French category copy and the pilot indexing (needs the content first). Top five to write for: whey-isolate, acides-amines, boosters-hormonaux, collagene, mineraux.
**P4 Data quality.** Unit typos: only `2268 kg` x2 were wrong (fixed); `2,268 kg`/`1,215 kg` are valid French decimals. Duplicate names: 75 groups / 154 products, 0 groups span multiple brands (same-brand variants, e.g. flavour or iHerb duplicates); no merges or deletions made. Next: admin report (read-only) listing groups with sku/variant labels.
**P5 Stock vs backorder.** Facts: the main checkout (`orders.service.ts`) does not reject zero-stock items (only the landing-order flow does); the product page says "Disponible sur commande"; but JSON-LD says `OutOfStock` for the 11,7xx zero-stock products. Site behaviour and schema disagree. Google requires `BackOrder`/`PreOrder` to carry an availability date; no real lead time exists in the data. Decision needed from the owner: (a) real supplier lead time per brand (then BackOrder + date), or (b) honest "indisponible" and block ordering. Until then schema stays `OutOfStock` (not misleading). 34 of 164 in-stock products have stock exactly 100 and 52 have >=100: likely nominal, needs a real stock count.
**P6 Reviews.** 2,500 REJECTED reviews: 50 customer accounts, 50 products, 0 `verified`, 0 linked to an order (only 14 orders exist in total), ratings only 4–5 (avg 4.86), 398 distinct texts reused up to 140 times, dated Jan–Aug 2026. Treated as seeded/synthetic. Status kept REJECTED; none approved or deleted. Storefront and JSON-LD show no reviews or aggregateRating (verified), consistent with status.
**P7 GSC and performance.** GSC MCP failed again with `CONNECT_TIMEOUT` (30 s) — a network/auth connection failure from this environment, not a confirmed missing permission. Minimum needed: a Search Console property for `paratunisie.com` (domain or URL-prefix) with the connecting Google account added as at least *Restricted* user, OR performance exports (Pages and Queries, last 16 months, CSV) plus the Indexing > Pages report export. Performance (repeatable `curl`, 3 runs each, production): TTFB ~0.83–1.09 s for home, /creatine, /whey-isolate, a product page and /marques (one 1.7 s outlier); `Cache-Control: private, no-cache, no-store` on all pages => every request is rendered. Home HTML 598 KB not yet reduced. Caching change is a high-risk global change: NOT done, awaiting approval (proposal: ISR with short revalidate on product/category/home, keep cart/account dynamic).

## 13. Next batch (recommended)
1. Write French content for the top five categories and pilot-index whey-isolate, acides-amines, boosters-hormonaux (after review).
2. Clean "PROTEIN.TN" phrasing in the 2 descriptions; fix sync sanitizer (SEO-016); verify stock numbers; owner confirms prices of the 27 machines.
3. Owner decision on availability semantics (SEO-006).
4. Admin duplicate/data-quality report.
5. Caching proposal (SEO-011) and GSC access (SEO-003).
