# TASKS.md — ParaTunisie SEO Recovery (single source of truth)

Last updated: 2026-11-14. Evidence below comes from live requests to paratunisie.com and read-only SQL on the production database. Nothing here is estimated or invented; unknowns are marked.

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
| SEO-001 | P0 | Staged product indexation | BLOCKED (approval) | High | SQL counts | After approval |
| SEO-002 | P0 | Content + indexation for 11 big categories | READY (content to write) | Medium | SQL | meta robots |
| SEO-003 | P0 | Obtain GSC / Merchant access | BLOCKED | Low | MCP error | Real data in BASELINE |
| SEO-004 | P1 | Legacy URL redirects | VERIFIED (live 2026-11-14) | Low | 308 tests | Live curl: all 5 redirect, /proteine-sousse 404 |
| SEO-005 | P1 | Return-policy schema matches /retours | VERIFIED (live 2026-11-14) | Low | JSON-LD diff | Live JSON-LD shows `merchantReturnDays: 7`, no fee/method |
| SEO-006 | P1 | Availability semantics for on-order products | BLOCKED (business) | Medium | 98.6% OutOfStock | Decision |
| SEO-007 | P2 | Fix kg/g unit typos in 6 names | READY | Low | SQL | SQL |
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
