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

## 14. Batch 3 (2026-11-14) — results
**Deployed (web + api + admin, all healthy):** og:image only from our own origin (code + test); gate: duplicate titles counted among PUBLISHED only, new RESTRICTED_SUBSTANCE_REVIEW blocker, own-media rule; read-only admin report `/admin/qualite-catalogue` (+ `GET /catalogue/admin/quality-report[/summary]`, admin-guarded, SELECT-only, unit-tested); sanitizer drops any line naming PROTEIN.TN/Sobitas (`ops/ovh/sobitas-sanitizer.test.cjs`, 6 cases pass). Rollback images: `pre-batch3` tags (web, api, admin); file backups `*.pre-batch3` in `/root/paratunisie-backups/seo-batch1/`.
**Data changes (scoped, backed up):** 8 descriptions cleaned of PROTEIN.TN lines (`_wave_backup_brandclean`); 3 "garanti" lines removed and 2 brands assigned, Buka Fighting Gear and Powervis, both brands noindex (`_wave_backup_batch3`); 5 category contents written (`_wave_backup_catcontent`); 2 unit typos (`_wave_backup_typos`).
**Wave 1b:** 7 more products passed the gate and were made indexable (Magnesium+Calcium, Tantor Whey, Lipo 6, C4, Challenger Creatine, Buka glove, Powervis EAA). Total made indexable by me: **60** (53 + 7). Product sitemap: 160 URLs. Rollback JSON: `wave1-before-0-7.json`.
**Still blocked (35 of the original 95):** 28 machines/benches (price and stock must be confirmed by the owner), 4 generic-brand (Vitamin E, 3 shakers), 3 packs (no contents in the data; descriptions are 39–48 characters).
**Denied action:** clearing 147 third-party `ogImage` DB values was denied as a mass change; solved in code instead (no DB change).
**Categories:** French content live for whey-isolate, eaa, acides-amines, l-carnitine, collagene (no medical claims, FAQPage schema verified). Pilot indexed: **whey-isolate, eaa, acides-amines** (robots `index, follow`, in sitemap; sitemap total 236 URLs). `boosters-hormonaux` REJECTED as a pilot: it contains MK-677 and about 95 DHEA / 7-keto / prohormone-type products. l-carnitine and collagene have content but stay noindex (few in-stock products) pending review of the pilot. Rollback: set `indexable=false` on the 3 rows.
**MK-677 decision needed:** `/produits/mk-677-60-capsules` was already indexable before my work and is the best product page in Search Console (17 clicks, position 7.5). I briefly set it noindex, then restored the original state because noindexing it was outside what was authorized. Legality and claims need owner review; the new gate blocks any further hormone/unapproved-compound product from auto-indexing (95 such product names exist).

## 15. Search Console (SEO-003 UNBLOCKED)
Cause of the MCP failure: not credentials or permissions. The service account authenticates (token HTTP 200) and has **siteFullUser on `sc-domain:paratunisie.com`**; Google APIs are reachable. The MCP server (`npx -y mcp-server-gsc`) times out at start-up (30 s connect limit, cold `npx` download). Workaround: `ops/seo/gsc-query.cjs` (read-only, direct API, prints no secrets). Fix for the MCP: install `mcp-server-gsc` globally and point `.mcp.json` at it, or raise the connect timeout.
Real baseline (2026-08-14 to 2026-11-12): **783 clicks, 23,312 impressions, CTR 3.36%, average position 20.5.** Brand query "paratunisie" = 88 clicks. Sitemap submitted: 177 URLs, 0 errors, 0 warnings, last downloaded 2026-11-12 (Google's "indexed" figure comes back as 0 and is not usable).
**Critical finding (`docs/seo/TRAFFIC_PAGES_STATUS.csv`):** of 1,000 URLs that earned 806 clicks, **595 URLs / 393 clicks (49%) now return 404**, **306 URLs / 214 clicks (27%) return 200 but noindex**, only 84 URLs / 189 clicks (23%) remain indexable, 15 redirect. The 404s are mostly old parapharmacy products (minoxidil, alopexy, dentifrices...) that no longer exist in the database after the catalogue replacement. This is the largest SEO loss on the site.
**Wave 2 candidate set (needs approval, NOT applied):** 153 noindex-but-200 product URLs with proven demand (185 clicks); 149 pass the quality gate and 4 fail on unsupported "100% authentique / n°1" claims; none are in stock (on-order). List: `/root/paratunisie-backups/wave2-candidates.json`.
**Decisions needed for the 404 pages:** restore equivalent products from the pre-sync dump `db-before-sobitas-sync-20261114-125229.dump` (still holds them) or 301 each to the closest category/brand; 410 for discontinued items. Mass 301 and restoration are Category C: not done.

## 16. Duplicates, reviews, availability, caching (updates)
Admin report counts (published): duplicate names 154 rows, duplicate SKUs 0, slug-suffix collisions 357, same-product-different-size 2,533, flavor variants 4,072 (variants, not defects), suspicious category 1, missing/generic brand 6, invalid units 0, missing or non-owned image 0, thin descriptions 3, legacy branding 0, restricted-substance names 95.
Reviews: unchanged, 2,500 REJECTED (seeded pattern: 50 accounts, 0 verified, 0 with orders, texts repeated up to 140 times); not approved or deleted; public UI and JSON-LD show none.
Availability: business decision still pending (see section 12). Caching: plan only, see `docs/seo/CACHING_PLAN.md` (nothing deployed).
Third-party hotlinks still present (SEO-017, needs approval or an image-mirroring run): 48 brand logo/hero images on `admin.protein.tn`, 3 ProductImage rows, 2 Product.image values.

## 17. Batch 4 (2026-11-14) — instruction change, redirect recovery, Wave 2
**Instruction change recorded:** restoring old products is CANCELLED. The current catalogue is the source of truth; the old dump is read-only history. Nothing was restored or imported (nothing had started). MK-677 set back to **noindex** (excluded until legal review).
**Redirect recovery (SEO-018):** full report `docs/seo/REDIRECT_MAP.csv` (595 old URLs with clicks, impressions, queries, equivalent, action, reason; built by `ops/seo/build_redirect_map.py`). Result: only **7** URLs have a legitimate destination (4 exact same-product matches from the old `/category/slug` pattern, 3 exact product-type category matches) = 5 historical clicks. The other **588** stay 404: the old range (dermo-pharmacy, baby, dentifrice, minoxidil, brands such as L'Oréal) has no equivalent in today's sports-nutrition catalogue, and redirecting them would be arbitrary. Top candidates produced by the token matcher were reviewed and rejected as false matches (different brand or ingredient). Deployed in `next.config.ts`, verified live: single hop, final 200, destinations indexable. Rollback: remove the 7 entries / image `pre-batch4`.
**Honest conclusion:** most of the lost 393 clicks cannot be recovered by redirects. It can only be won back by ranking the current catalogue for the same demand (categories, buying guides), which is the plan below.
**Wave 2 (SEO-001):** 153 proven-demand candidates + 4 redirect targets evaluated; 142 passed and were made indexable (canary 10, then 132); 11 held: 2 price-needs-verification (8-station-multi-gym, squat-rack-jx-fitness), 2 unsupported claims (allmax-classic-allwhey, hydroxycut-hardcore-super-elite), 7 possible medical claims (allmax-essentials, animal-fury-essentials pre-workout, NOW chewable L-theanine, NOW L-citrulline, NOW potassium chloride, swanson fenugreek, youtheory turmeric) pending review. Live sweep with a Googlebot user agent: robots `index, follow`, self-canonical, one H1, Product JSON-LD, no third-party meta; sitemap products 169 -> 301. Rollback JSON: `wave2-before-0-10.json`, `wave2-before-0-132.json` on the server.
**Bug found by the canary:** `produits/[slug]/page.tsx` passed `ogImage || image` as the page image, so legacy `admin.protein.tn` og:image survived my earlier metadata fix on some pages. Fixed (`image` and `ogImage` passed separately) and verified.
**Availability consistency:** on-order products show "Disponible sur commande" with a "Demander ce produit" request button (no add-to-cart) and schema `OutOfStock`. They are request-only, so schema and page agree; no BackOrder/PreOrder or dates invented. Business decision (SEO-006) stays open.
**Complete noindex inventory (11,719 published products still noindex):** 11,124 pass every automated check and are held back by policy (no mass indexation, on-order, little unique content); blocked by a real issue: medical-claim review 157, duplicate titles 154, unsupported absolute claims 127, restricted-substance names 95, price needs verification 59 (28 in stock), generic brand 6, thin description 3 (counts overlap slightly). Largest clean pools by category: vitamines 1,854, plantes-et-herbes 1,482, immunite 825, sommeil-stress 734, mineraux 624, antioxydants 597, articulations 552, digestion 457, magnesium 447, probiotiques 409, omega-3 328, collagene 265, acides-amines 246, creatine 234.
**Google status (URL Inspection, representative):** home and /creatine = "Envoyée et indexée". /whey-isolate and /produits/carbo-one-1-kg still show "Exclue par la balise noindex" because Google last crawled them on 2026-10-06 and 2026-10-13, before the change. **They are indexable, not yet indexed.** Next recrawl via sitemap; re-inspect in 7–14 days. `dip-belt` is a Google-known 404 (crawled 2026-10-07).

## 18. Batch 5 (2026-11-14) — qualified-traffic execution
**Authorizations used:** sitemap resubmission via the official API (done); local caching implementation and benchmark only (NOT deployed); old catalogue stays unrestored; MK-677, hormone products, 11 held products, 27 machines, "stock = 100" counts all untouched.

**Sitemap (SEO-019):** `PUT /webmasters/v3/sites/sc-domain:paratunisie.com/sitemaps/https://paratunisie.com/sitemap.xml` → HTTP 204; Search Console then showed `lastSubmitted`/`lastDownloaded` 2026-11-14T19:57Z, errors 0, warnings 0, 379 URLs submitted. This asks Google to re-read the file; it does not guarantee indexing (Google's "indexed" counter for sitemaps returns 0 and is not usable). Tooling: `ops/seo/gsc-query.cjs submit-sitemap` (needs `GSC_WRITE=1`, refuses otherwise).

**Phase 1 — Search Console opportunities** (`ops/seo/gsc_opportunities.py`, `docs/seo/GSC_OPPORTUNITIES.json`, 90 days): 1,310 queries, 13,574 impressions; 117 non-brand queries at positions 4–20, but almost all are for the *old* range (citrolax, enemacol, vominat, minoxidil, alopexy) whose pages are now 404 or discontinued. For today's catalogue demand exists but we rank 40–95: whey/protein 502 impressions, complements 211, nutrition sportive 136, creatine 114, magnésium 102, oméga-3 78, vitamines 78, zinc 33, collagène 5, probiotiques 9. Cannibalization found: "omega 3" and "whey protein" rank a guide instead of the category; "complément alimentaire" splits between hub and home. Full map: `docs/seo/KEYWORD_MAP.md`.

**Phase 2 — categories:** original French content, FAQPage + BreadcrumbList, specific guide links, 56–62-char titles for **vitamines, magnésium, oméga-3, zinc** plus hubs **complements-alimentaires, nutrition-sportive** (all internal links verified 200 before applying). Specific guide links added to whey-isolate, eaa, acides-amines. Backups: `_wave_backup_catcontent2`, `_wave_backup_hubs`, `_wave_backup_catlinks`. Generators: `ops/seo/category-content-batch5.py`, `category-content-hubs.py` (UTF-8, LF; CRLF breaks the FAQ parser — found twice).

**Phase 3 — competitors:** `docs/seo/COMPETITOR_ANALYSIS.md`, `COMPETITOR_SNAPSHOT.json`, tool `ops/seo/competitor_snapshot.py`. Real Tunisian players: primini.tn (1,662 supplement listings, FAQPage+ItemList), Parapharmacie.tn, Parapharm.tn, Para Pharmacie Express, Parapharmacie plus, Tunisiepara.com, lagrandepara.tn, impactnutrition.com.tn. Limit: search tool is US-based; no SERP-position or backlink data for competitors.

**Phase 4 — regression + performance:**
- `ops/seo/seo-regression.cjs` (`npm run seo:check`): sitemap integrity, 200 + indexable + self canonical + one H1 + no legacy host in metadata/`<link>` + valid Product/Offer + schema price = visible price + no rating markup + og:image ownership for sampled sitemap URLs; noindex canaries; indexable categories; filtered-listing rule; 7 redirects; 404 canaries; Googlebot/visitor parity; robots.txt. **439/439 pass on production.** Negative test: a wrong expectation makes it fail (proved).
- Lighthouse mobile (lab, simulated slow 4G, 4× CPU, 2 runs, median) `ops/seo/lighthouse-bench.sh`: BEFORE — home perf 31, LCP 7.5 s, TBT 7.9 s, 2.1 MB; /vitamines perf 32, LCP 8.9 s, TBT 8.3 s, 1.9 MB; product perf 37, LCP 6.7 s, TBT 8.8 s, 1.9 MB. CLS 0.000 everywhere. PageSpeed Insights keyless quota was exhausted (429), so no CrUX field data: UNKNOWN.
- Bottlenecks measured: (1) `/api/v1/catalogue/brands` fetched twice per page, 439 KB each, from `search-overlay.tsx` (desktop + mobile instance); (2) Google Ads gtag 165 KB / 2.5–4 s CPU, Meta Pixel 233 KB / 1.4–2 s CPU; (3) own JS 3.2 s, 217 KB unused JS.
- **Fix deployed (web only):** brands now load lazily on first keystroke and share one request. AFTER on /vitamines (1 run): transfer **1,919 KB → 1,040 KB (−46%)**, FCP 6.2 → 3.6 s, LCP 8.9 → 7.1 s, TBT 8.3 → 6.9 s; overall score still ~31. Rollback: image `pre-batch5`.
- Not changed (needs approval — tracking/conversion impact): deferring gtag and Meta Pixel (`lazyOnload`/after interaction). Expected to remove several seconds of main-thread time; must be tested against Google Ads / Meta conversion tracking first.
- Home HTML is 595 KB raw / 74 KB transferred; inline scripts 209 KB; product metadata is not the cause (checked with `ops/seo/payload_audit.py`).

**Caching (local only, nothing deployed):** `PUBLIC_CACHE_SECONDS` opt-in in `apiFetch` (public catalogue GETs only, max 600 s, tag `catalogue`; unset = unchanged); `force-dynamic` removed from home and product pages only (category pages read `searchParams` → need a separate restructure); `POST /api/revalidate` (503 unless `REVALIDATE_SECRET`, timing-safe secret, allow-listed tag, immediate expiry via `revalidateTag(tag, { expire: 0 })`). Results of the local A/B: see section 19.

**Phase 5 — images:** 53 references to `admin.protein.tn` (48 brand images, 3 ProductImage rows, 2 draft Product.image) verified valid (200, image/*, 927 KB), mirrored to MinIO (`brands/…`, `products/…`, public read added for `brands/*`) and repointed; originals saved in `_backup_legacy_images` (rollback = copy `old_url` back). Basis: the source is the Sobitas storage you directed me to mirror; brand logos remain third-party trademarks used to identify products. DB now has 0 legacy image references; `/marques` serves 24 own brand images and 0 protein.tn. Remaining mentions in the home page payload are the `ogImage` field of product data (not rendered tags; metadata ignores it). Script: `ops/seo/mirror-legacy-images.cjs` (dry run by default).

**Phase 6 — monitoring:** `ops/seo/weekly_report.py` compares equal windows, covers totals, sections, biggest page changes, traffic-loss check, positions 4–20, low-CTR pages, sitemap status, URL Inspection watchlist and the regression suite; first report `docs/seo/reports/2026-11-14.md`. **First real comparison (28d vs previous 28d): clicks 110 vs 282 (−61%), impressions 3,717 vs 6,842 (−46%), CTR 2.96% vs 4.12%, average position 19.2 vs 16.3.** The decline coincides with the products being noindexed/removed (product-section clicks 48 vs 220); it is observed correlation, not proven causation.
**URL Inspection (Google's own view):** `/`, `/vitamines`, `/magnesium`, `/omega-3`, `/zinc` = indexed. `/whey-isolate`, `/produits/carbo-one-1-kg` still "noindex" (last crawl 2026-10-06 / 10-13, before the change). `/eaa`, `/acides-amines`: Google crawled them on 2026-11-07 and recorded **canonical = https://protein.tn/eaa** (and `/acides-amines`), i.e. the pages then declared the other domain as canonical. Today's live canonical is correct and the DB holds 0 third-party canonicals; the historical cause cannot be proven (data changed during today's catalogue work). The regression suite now fails on any legacy host in `<link>` tags.

**Manual indexing-request list** (do not use the Indexing API for e-commerce pages), in priority order: 1 `/eaa`, 2 `/acides-amines`, 3 `/whey-isolate` (canonical fixed — highest value), 4 `/complements-alimentaires`, 5 `/nutrition-sportive`, 6 `/whey-proteine`, 7 `/vitamines`, 8 `/magnesium`, 9 `/omega-3`, 10 `/zinc` (content rewritten today), then products: `/produits/carbo-one-1-kg`, `/produits/thorne-magnesium-glycinate-180-gelules`, `/produits/now-foods-probiotic-10-30-gelules-vegetales`, `/produits/dr-kellyann-bone-broth-fast-track-turmeric-ginger-21-g`, `/produits/micro-ingredients-mag-duo-advanced-magnesium-formula-lemonade-180-g`.

## 19. Performance finding that changes the plan (SEO-020)
**Where the time goes.** True server-side TTFB measured inside the web container (8 requests, median): `/` 170 ms, `/vitamines` 134 ms, product page 85 ms, `/marques` 213 ms. External TTFB from Tunisia is ~0.76–1.1 s even for a static `robots.txt` (TCP connect 0.31 s + TLS 0.24 s + first byte 0.22 s). **The production server is in Kuala Lumpur, Malaysia (Hostinger).** Distance, not rendering, dominates what visitors and Googlebot experience from this side of the world.
**Consequences:** (1) my earlier estimate that origin caching would cut TTFB "from ~0.9 s to tens of ms" was overstated: origin caching can save at most ~100–200 ms per page; (2) the largest TTFB/LCP lever is infrastructure: put a CDN/edge in front (e.g. Cloudflare free tier: static assets are already `immutable`, HTML needs the caching plan) or host closer to Tunisia (Europe: roughly 40–60 ms RTT instead of ~300 ms). Both are infrastructure/DNS changes and are NOT done: decision needed (see blockers).
**Correction recorded:** `docs/seo/CACHING_PLAN.md` baseline used external TTFB; read it together with this section.
**Proxy:** `src/proxy.ts` calls the API (`/catalogue/seo/redirect`) before every product/brand/guide/category request (1.5 s timeout, internal network, a few ms). Not a bottleneck today; a 60 s in-memory cache would remove it entirely if needed.

## 20. Local caching test — result (nothing deployed)
Built locally with `PUBLIC_CACHE_SECONDS=60` against the production API and ran `next start`:
- **Pages are NOT yet cacheable.** `/`, `/produits/[slug]` and `/vitamines` still answer `Cache-Control: private, no-cache, no-store`; the route table still shows `ƒ` (dynamic). Remaining blockers found: `/homepage/*` endpoints not in the cache allow-list (build log: "used no-store fetch … /homepage/best-sellers", "revalidate: 0 … /homepage/featured"); public review reads pass `{ cache: "no-store" }` (client.ts:820, 824); raw `no-store` fetches at client.ts:522, 890, 1100; category pages read `searchParams` (filters/pagination) so they need a restructure into a param-less cached route plus a dynamic filtered route.
- **Invalidation endpoint works:** `POST /api/revalidate` → 401 without/with wrong secret, 400 unknown tag, 200 with correct secret and allow-listed tag, 405 for GET; returns 503 when `REVALIDATE_SECRET` is unset (disabled by default).
- Next.js decides static/dynamic at **build** time, so the flag must be present when the Docker image is built and the API must be reachable during that build (build would otherwise fail on the "critical catalogue" throw). That is a deployment risk to plan for.
- **Expected benefit is modest** (origin render is 85–213 ms; see section 19). Recommended order: (1) CDN/edge or a closer server for the Malaysia-to-Tunisia latency, (2) defer ad/analytics tags after approval, (3) finish page caching only if still needed.
- Production is unchanged by this work: production code still has `force-dynamic` on home and product pages (the working tree differs only locally and in git branch `seo/recovery-batch1`; the server tree received only `search-overlay.tsx`).

## 21. Batch 6 (2026-11-15) — commercial categories, infrastructure, tracking, caching
**Authorized by the user:** categories (creatine, whey-proteine, then others), infrastructure *investigation* (no migration/DNS), tracker optimisation *locally*, caching *locally*, technical SEO. Blocked items unchanged (MK-677/hormonal, 11 held products, machine prices, "stock 100", availability semantics).

**Deployed to production (database content only; no code deployed):**
- `/creatine` and `/whey-proteine`: original French copy built from catalogue facts only (brands/formats of published+indexable products, no dosage prescription, no medical claim), FAQPage, 6 guide links each, cross-links, authenticity/delivery/returns. Titles 63/56 chars. All 28 internal links verified 200 before applying. Live check: 200, self canonical, one H1, FAQ present. Backup: `_wave_backup_batch6`. Generator `ops/seo/category-content-batch6.py`.
- `/probiotiques`: descriptive copy, **kept noindex** (0 products in stock). Backup `_wave_backup_batch6b`. `/collagene` unchanged (content live, noindex, 2 in stock). Decision pending: index only when enough verified in-stock products.
- Rollback: `update "Category" set "seoTitle"=b."seoTitle",... from _wave_backup_batch6 b where slug=b.slug`.

**Infrastructure (analysis only):** `docs/seo/INFRASTRUCTURE_COMPARISON.md`. Verified: server in Kuala Lumpur (202 ms RTT), Cloudflare is **DNS-only** (not proxying), Milan edge at 29 ms, EU data centers 38–48 ms. Cloudflare zone settings unknown (no access). Nothing changed.

**Tracking (local):** `NEXT_PUBLIC_DEFER_TRACKERS=1`, `src/components/analytics/deferred-trackers.tsx`, `ops/seo/tracking-e2e.cjs`, `docs/seo/TRACKING_OPTIMIZATION.md`. Event parity proven for PageView, ViewContent, AddToCart, Purchase, Google conversion; also fixes events lost before the scripts load. Real Purchase not exercised (would create an order).

**Caching (local):** home + product pages ISR, categories data-cached only, private pages forced `private, no-store`, API interceptor + `/api/revalidate` flush, `ops/seo/cache-check.cjs` 40/40 URLs 200, UA parity 10/10, price parity 10/10, flush MISS→HIT. Found and fixed a review-endpoint allow-list bug that returned 500 on cached product pages. See `docs/seo/CACHING_PLAN.md` addendum (deploy checklist + rollback). Observation: production already serves `/panier`, `/checkout`, `/compte` with `s-maxage=300` (static shells, no personal data); the local change makes them private.

**Regression:** `npm run seo:check` 439/439 on production after the content changes. API unit tests for the invalidation interceptor 10/10; API typecheck clean; web build clean.

**Internal linking:** verified existing structure (product → parent category, hub → child categories); added category ↔ guide ↔ sibling links on creatine, whey-proteine.

**Open / needs decision:** approve Cloudflare proxy (option A) or EU VPS; approve tracker deferral and caching rollout after Events Manager / Tag Assistant verification; probiotiques/collagène indexation; re-run `weekly_report.py` and URL Inspection in 7–14 days; manual GSC indexing requests (list in §18, now plus `/creatine`).

## 22. Batch 7 (2026-11-15) — SEO growth, no infrastructure changes
**Deferred by the owner's decision (do not raise again this batch):** Malaysia VPS/hosting, Cloudflare, DNS, CDN/proxy, nginx production config, production caching, Meta Pixel / Google Ads tracking. Analyses stay in `docs/seo/INFRASTRUCTURE_COMPARISON.md`, `CACHING_PLAN.md`, `TRACKING_OPTIMIZATION.md`. The local code for caching/tracking sits behind build-time flags and must NOT be shipped in a web image yet (an empty `generateStaticParams` on the product page without `PUBLIC_CACHE_SECONDS` would make the page error): production web deploys must copy individual files, as done for the link fix below.

**Wave 3 audit (`ops/seo/wave3-audit.cjs`, read-only, runs the production quality gate + extra screens):**
- 11,587 published products still noindex audited. 11,212 pass the gate; 375 fail it (duplicate title 154, unsupported absolute claim 127, restricted-substance name 95, thin description 3).
- Extra screens on gate-passing products: medical wording 3,346 (conservative regex, human review), excluded categories (machines, cardio, hormonal boosters) 194, price anomaly 66, duplicate description 167, held list 22.
- **Only 36 noindex products are in stock**: 27 are gym machines (unverified prices), 8 have stock exactly 100 (unverified), others are thin packs or MK-677. **None qualifies**, so Wave 3 follows the Wave 2 rule: on-order (request-only, schema OutOfStock, consistent with the page) products with real Search Console demand.
- Tiering: Tier 1 = impressions ≥ 2 + commercial category + one page per product family; Tier 2 (35, impressions = 1) next wave; Tier 3 (7,599) held, no demand. Ranked list `docs/seo/WAVE3_CANDIDATES.csv` (top 400).
- Held for the owner: Optimum Nutrition Gold Standard family (17): **price discrepancy inside the same product** (2.27 kg flavours 587 DT vs the indexed 2.27 kg at 379 DT; 908 g at 155 DT vs 332 DT for 907 g siblings) and cannibalisation with the indexed page; `vinpocetine` and `bariatric` products held for regulatory/medical review.
- **Canary 6 → expansion 12 → 18 indexed.** Per product: robots `index`, self canonical, one H1, Product JSON-LD, schema price = API price = page, Googlebot HTML = mobile visitor HTML, present in sitemap: 18/18 pass. Rollback: `_wave_backup_wave3` (`update "Product" set indexable=false where slug in (select slug from _wave_backup_wave3)`). Indexable published products 301 → 319.

**Categories (Batch 7):** `/bcaa`, `/gainers-proteines`, `/pre-workout` rewritten (original French, FAQ, guide links, product links, stimulant safety note); all 34 links verified 200 before applying. Backup `_wave_backup_batch7`. With Batch 6 (`/creatine`, `/whey-proteine`) the six requested commercial categories are done; vitamines/magnésium/zinc/oméga-3 were done in Batch 5.
**Brand pages:** 4 brand pages made indexable with factual intro + links to their indexable categories (optimum-nutrition, biotech-usa, challenger-nutrition, ultimate-nutrition). Scenit, Kevin Levrone, Real Pharm stay noindex (sensitive-category products). Backup `_wave_backup_brands7`.
**Search Console (90 d):** 117 striking-distance queries, all for the removed legacy range (pages 404) except dip-belt and MK-677 (noindex by decision); `/livraison`, `/contact`, `/paiement` impressions are the brand query "paratunisie" (sitelinks), not a CTR issue; homepage title/description reviewed, unchanged. Current-catalogue demand sits at positions 40–95 and is addressed by the category and Wave 3 work.
**Internal links:** crawl of 142 pages (all sitemap non-product pages + 60 products), 1,305 unique internal links: 2 broken targets, both from `/conseils` and `data/articles.ts` (`/gainers`, `/bcaa-acides-amines`) → fixed to `/gainers-proteines` and `/bcaa`, deployed by copying only those 2 files (server copies were identical to git; backups `/root/paratunisie-backups/batch7/`; rollback image `paratunisie-prod-paratunisie-web:pre-batch7`). Tool: `ops/seo/link-check.py`.

## 23. Batch 8 (2026-11-15) — homepage "À LA UNE" by category + complete brand SEO
**Deployed to production (api, web, admin images + database):** only this batch's files were copied to the server tree (the local caching / tracking code from Batches 5-6 stays undeployed). Rollback images: `paratunisie-prod-paratunisie-{web,api,admin}:pre-batch8` (+ `api:pre-brandseo`); file backups `/root/paratunisie-backups/batch8/`.

**Phase A: homepage.** `GET /homepage/cheapest-by-category` (2 queries, pure unit-tested selection `apps/api/src/homepage/cheapest-by-category.ts`, 18 tests): per main category the cheapest *purchasable* in-stock product (subcategories included), real variant price in integer millimes, cheapest purchasable variant only (that same variant is the price shown and the cart line). Excluded: unpublished, out of stock, placeholder/missing image, price < 5 DT, packs, restricted substances (same regex as the quality gate), unverified stock counts (100 / 500+), suspiciously low price (< 20% of category median with 3+ candidates). "Prix le plus bas en stock" is displayed only when >= 2 eligible products were compared (BCAA has 1 → "En stock"). Size label hidden when the catalogue label contradicts the product name (`6l` on 90 tablets, `2 g` on 90 softgels, `Format standard`). No discount model exists in the data, so none is shown. 10 categories live. Desktop: tabbed module in the hero (keyboard roving tabindex, aria-selected, no autoplay, reduced-motion fade); all breakpoints: new grid "Les meilleurs petits prix par catégorie" (the mobile version). Falls back to the manual featured product if < 2 categories. `ops/qa/home-cheapest-e2e.cjs`: 34/34 on local and on production. Endpoint 12-68 ms internally, not cached (always fresh); homepage TTFB unchanged (0.84-1.08 s vs 0.84-0.92 s control).
**Pre-existing risk found, NOT changed:** `OrdersService.create` stores `item.priceMillimes` sent by the client (no server-side re-pricing). Recommend validating the price against the variant on the server.

**Compliance correction:** 7 indexable hormone-related products set to noindex (owner rule): `t-9-testo-booster-120-caps`, `shilajit-complex-weightworld-120-capsules`, `tribulus-60caps-real-pharm`, `whey-testo-mr-x-1-8-kg-v-shapes`, `zma-120-caps`, `best-zma-120-caps-scenit-nutrition`, `21st-century-fenugreek-100-gelules-vegetales`. Backup `_wave_backup_hormone_noindex`. Sitemap products 319 → 312. Regression canaries added.

**Phase B-D: brands (615 audited).** Findings: admin "SEO x/9" counted non-empty fields only; the old generator forced `indexable=true` on every brand, wrote one generic template for all, and "Régénérer l'existant" would have overwritten any brand not flagged custom (incl. my 4 Batch-7 brands, now flagged). New engine `apps/api/src/catalogue/brand-seo.ts` (+ service, 31 tests): tiers A/B/C from catalogue facts only; original French drafts only for A/B; validation (lengths, brand present, banned claims, ≥ 90 words, ≥ 3 links, "Tunisie" stuffing); duplicate/near-duplicate detection; preserves custom/original text and only replaces empty, generic-template or over-long title/description fields; dry-run then apply with a full Brand table snapshot; admin endpoints `GET /catalogue/seo/brands/audit`, `POST /catalogue/seo/brands/run`; old single/bulk generator now routes brands through it. New 10-check score + tier + reasons in the admin list, dry-run/preview/apply panel (`apps/admin/.../brand-seo-panel.tsx`). Tiers: **A 12, B 31, C 572**. Indexable brands 211 → **43**, 0 ineligible indexable. A/B scores: 22 at 10/10, 21 at 8/10 (the 2 missing points are a real logo and the OG image: no logo asset exists, none invented). Backups `_backup_brand_seo_20261115214507` (before A), `…214608` (B), `…214622` (C noindex pass), `…220311`.
**Web:** brand page: category chips with counts, in-stock toggle, sort, result count, progressive loading (24 at a time), CollectionPage + ItemList (real products, no offers/ratings), neutral fallback metadata (no more "Achat Officiel" / "produits officiels"), badge "Marque du catalogue".
**Validation:** `npm run seo:check` 807/807 (new brand rules: indexable, self canonical, one H1, title/description length and uniqueness, schema, no "official" claim, ineligible brands noindex and absent from the sitemap, hormone products noindex); `ops/seo/link-check.py` 176 pages / 1,893 internal links / 0 broken; sitemap 401 → 428 URLs (brands 9 → 43, products 312). Admin UI not clicked through (login required): admin type-checks, builds and deploys; its endpoints were exercised through the same service by CLI.
**Open:** 21 tier A/B brands lack a logo; variant labels in the catalogue are partly wrong (e.g. `6l`); tier B brands whose products are all on order are indexable by rule, review after Google's response; no ranking or traffic effect is claimed.

## 24. Batch 9–10 (2026-11-15 → 11-16): admin scores, product/category optimizer, structured data, order pricing, reviews, flagship categories
Full status lives in `TODO.md` (done / remaining / blocked). Category method and baseline: `docs/seo/CATEGORY_PROGRAMME.md`, `CATEGORY_BASELINE.json`, `SERP_CREATINE.json`.

**Admin "Chargement des scores…" — root cause (measured):** the products page asked `GET /catalogue/seo/checklist/product`, which loaded all 11,895 products with every variant and image, ran a 20-check scoring on each and returned **31.3 MB of JSON in 7.6 s using +583 MB RAM, on every page load and again after every save**. The client had no timeout, so a slow answer looked like an endless spinner. "Optimiser tous les produits" looped over that report and re-loaded the whole catalogue **twice per product** (O(n²)). **Fix:** per-page scores (`GET /seo/scores/product?ids=` ≤100): 36 ms warm / 1.2 s cold, 6 queries, 280 MB RSS; persisted `Product.seoScore` (+ index) refreshed by a resumable job (11,895 rows in 15 s); every admin request now has a timeout; loading → score | "Réessayer"; stale-response guard. Score = checklist with DB-derived page evidence (labelled "derived"; a live public-page audit replaces it when fresh).
**Stock numbers:** the admin cards counted the 25 rows on screen. Real: 11,895 products, 11,888 published, **164 with stock** (flag = variant stock, no mismatch), of which 34 = placeholder 100, 6 ≥ 500, 33 gym machines → **96 verified purchasable**.
**Optimizer:** `product-seo-draft.ts` (gap filling only; first draft would have regressed 44 good titles and copied marketing text: rejected after reviewing real output). Job engine (`seo-job.service.ts`): dry-run required before apply (confirm id), 500 cap, backup table, optimistic locking, cancel/retry/export/rollback. Applied to the 96 purchasable products: 65 changed, 29 complete, 2 blocked (restricted / "Tunisie" in name), avg score 83 → 97. Backup `_backup_product_seo_20261115231227k14x`.
**Structured data (Priority 4):** `product-schema-audit.cjs` baseline 0/312 valid (Markdown in `description` on every page). Fixed plain-text description, removed slug-as-SKU, removed the fabricated review fallback ("Très satisfait… Client Vérifié"), required real author/date/text for review markup → **312/312 valid**, 0 price or availability mismatches, GTIN missing on all (no data field). Not run: Google's Rich Results Test / Schema.org Validator (manual).
**Order price (Priority 6):** confirmed — `createOrder` summed and stored `item.priceMillimes` from the browser and accepted a client `shippingFeeMillimes`. Now `priceOrderLines` (server): variant resolved from the catalogue, price mismatch → 409 with the real price, stock and quantity checks, shipping computed server-side, validation before loyalty redemption. 11 unit tests + `verify-order-pricing.cjs` against live data (tampered 1 millime, −1 DT, negative price, wrong variant: all rejected; legitimate cart accepted). No order created, no historical order touched.
**Categories (Priority 2):** old score capped at 55 (9 of 20 checks needed a live audit never run); now derived evidence + `category-seo-draft.ts` gap filling: avg 58 → 88 (corrected scale), 0 below 50, 12 at 100; backups `_backup_category_seo_20261115232921`, `…233220`. Flagship guides: `/creatine`, `/whey-proteine`, `/magnesium` (deepened), `/collagene` (now indexable). New UI: `CategoryGuide` (table of contents, FAQ separate, no duplicate FAQ), `CategoryPriceComparison` (per 100 g, in-stock, excludes packs and noindex products, marks ties, shown only with ≥2 readable weights), intro un-clamped, quick links. Bug caught by tests: `90 gélules` parsed as `90 g`.
**Brands:** ABE (17) and ALLMAX (29): 0 indexable and 0 in stock (flavour variants on order, thermogenic items): correctly Tier C; the lever is a product wave, not a looser brand rule.
**Reviews (Priority 5):** DB held 2,500 reviews, all REJECTED, 0 approved, 0 linked to an order; 14 orders, 12 shipped, 0 delivered. Built: `ReviewInvitation` (one secret link per order line, token hashed), `ReviewModeration` history, spam screening (links/emails/phones rejected, flags for caps/repeats/duplicates), public form `/avis/<token>` (noindex), staff panel, verified flag **only** via a link; the open `POST /reviews` can no longer set verified/orderId. Nothing is sent automatically. 17 + 29 tests. **Authentic reviews today: 0.**
**Validation:** `npm run seo:check` 807/807; `category-page-check.cjs` (priority pages; one transient Googlebot/visitor mismatch on first load after a deploy, 4/4 clean reruns); product schema 312/312; API suites green; admin/web typecheck clean.
**Not done / honest limits:** guides for whey-isolate, vitamines, omega-3 still shallow; 33 categories have no guide; no Search Console result yet; admin screens not click-tested (login); competitor positions unknown (search tool is US-based); Merchant Center feed not implemented.
**Guides (10b):** `/whey-isolate`, `/vitamines`, `/omega-3` rewritten (`ops/seo/category-guides-batch10b.py`, claim-free; only the unit conversion 1 µg vitamin D = 40 UI stated); backup `_wave_backup_cat_batch10b`; `category-page-check` all green; `seo:check` 807/807. Review system deployed (migration `20261116000000_review_invitations` applied; public endpoints 404 on bad token, admin endpoint 401 without auth; live flow test created 0 reviews).

## 25. Batches 11–12 (2026-11-16): guides, indexing check, identifiers, baseline
- Link check after Batch 10: 177 pages, 1,931 internal links, 0 non-200. `seo:check` 807/807, category checks green, product schema 312/312 valid (GTIN missing on all, correctly).
- Guides (claim-free, comparison tables, EFSA caffeine reference only in pre-workout): bcaa, pre-workout, gainers-proteines (backup `_wave_backup_cat_batch10c`); ashwagandha (the previous text claimed stress/sleep/hormone effects: replaced), accessoires (437 → 2.7k chars), whey-hydrolysee (new guide, indexable=true: 3 indexable products, all in stock) (backup `_wave_backup_cat_batch12`; rollback of indexation: `update "Category" set indexable=false where slug='whey-hydrolysee'`).
- Demand check before writing: Search Console shows ≤ 16 impressions for every topic of the 33 unguided categories, and those categories have 0 products in stock, so no further guides were written for them and they stay noindex (no thin indexable pages).
- Indexing (URL Inspection, 11-16): /acides-amines, /eaa, /whey-isolate indexed, Google canonical = our own URL. Nothing to fix; no redirects. protein.tn is a separate site (owner decision), referring URL only.
- Identifiers: `ProductVariant.gtin/mpn` (migration `20261116100000_product_identifiers`), `product-identifiers.ts` (GS1 check digit, 4 tests), validated before any write in `updateProduct`, admin drawer fields, JSON-LD only for valid values. Rollback images `*:pre-ident`; originals in `/root/paratunisie-backups/batch12/`.
- Docs: `RANKING_BASELINE.md` (13.7k impressions / 218 clicks; categories alone avg pos 68, exact products 40.6), `MEDICAL_CLAIMS_SAMPLE.md` (45 flagged, 0 restricted; includes an indexed in-stock pre-workout with performance claims), `BRAND_LOGOS_MISSING.md`.

