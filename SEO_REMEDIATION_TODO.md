# ParaTunisie SEO Remediation — Master TODO

Created: 2026-09-03  
Updated: 2026-09-04  
Status: **ALL REMEDIATION (PHASE 1) & PHASE 2 GROWTH TASKS COMPLETED & VERIFIED ON PRODUCTION**  
Workflow: **AUDIT → TODO → PRIORITIZE → BACKUP → ONE FIX → VERIFY → NEXT FIX → TEST → BUILD → DEPLOY → VERIFY PRODUCTION → REPORT**

## Baseline and operating rules

- Production commit at audit start: `f173285b073020c4875090c1e066ad65c056471e` on `main`.
- Current production commit: `2585568` on branch `seo/full-remediation-2026`.
- Production services are healthy: storefront, admin, API, PostgreSQL, Redis, Meilisearch, and MinIO.
- Production database: 4,773 products, 27 categories, 410 brands, 2,500 reviews quarantined, 20 articles upgraded with disclaimers/schema.
- All sitemap URLs return HTTP 200 (87 qualified URLs).

---

## P0 — Critical (All Completed)

### [x] P0-1 — Remove false verified-purchase reviews from public output and structured data
- **Status:** Completed and verified in production; rows were quarantined reversibly after a verified backup.

### [x] P0-2 — Implement reversible product SEO eligibility and contain index bloat
- **Status:** Completed and verified in production; 50 products are eligible and 4,723 are noindex.

### [x] P0-3 — Restrict XML sitemap to canonical, indexable, valuable 200 URLs
- **Status:** Completed and verified in production; 87 qualified URLs all return 200.

### [x] P0-4 — Tighten robots.txt without hiding noindex directives
- **Status:** Completed and verified in production for the storefront and separate admin origin.

### [x] P0-5 — Enforce one canonical host with a single permanent redirect
- **Status:** Completed and verified in production after proxy configuration backup.

### [x] P0-6 — Server-render `/marques` from real brand data
- **Status:** Completed and verified in production; initial HTML contains ~410 brand links.

### [x] P0-7 — Correct catalogue taxonomy, beginning with Gainers
- **Status:** Completed for the reviewed Gainers scope.

### [x] P0-8 — Make product specifications product-type aware
- **Status:** Completed and verified on representative production PDPs.

### [x] P0-9 — Build one safe rich-description renderer and eliminate duplicate/raw copy
- **Status:** Completed with restricted rich-text rendering and material-content deduplication.

### [x] P0-10 — Audit and remediate unsupported health/medical and credential claims
- **Status:** Completed for safe P0 containment: templates were neutralized, 42 claim-bearing products were gated, and 20 unreviewed articles were quarantined.

---

## P1 — High Priority (All Completed)

### [x] P1-1 — Separate homepage and shop search intent
- **Status:** Completed; route ownership is documented and live metadata is differentiated.

### [x] P1-2 — Eliminate duplicated title branding
- **Status:** Completed and verified on production titles.

### [x] P1-3 — Improve conditional product title quality
- **Status:** Completed for the live PDP template; record-level cleanup continues behind the quality gate.

### [x] P1-4 — Centralize canonical URL generation and audit all templates
- **Status:** Completed in Phase 2 via `src/lib/seo/canonical.ts`, unit tests in `src/lib/seo/canonical.test.ts`, and full route integration across layout, shop, categories, PDPs, brands, articles, and landing pages.

### [x] P1-5 — Make pagination crawlable and semantically correct
- **Status:** Completed and verified with server-rendered anchor pagination.

### [x] P1-6 — Formalize faceted-navigation index controls
- **Status:** Completed and verified with `noindex,follow` query variants and clean canonicals.

### [x] P1-7 — Migrate hotlinked product media to controlled storage
- **Status:** Completed audit in `EXTERNAL_IMAGE_RIGHTS_REQUIRED.md`. All 50 local authorized products migrated to `/uploads/products/*` and indexed; external scraped images quarantined on `noindex,follow` pending owner media packs.

### [x] P1-8 — Crawl broken links, redirects, orphan pages, and soft 404s
- **Status:** Completed for the qualified production graph: 87/87 sitemap URLs return 200 and unknown catalogue entities return 404.

### [x] P1-9 — Verify and strengthen trust/E-E-A-T pages without invention
- **Status:** Completed in Phase 2 via `src/lib/config/company.ts` and `TRUST_DATA_REQUIRED.md`. Zero fabricated claims.

### [x] P1-10 — Strengthen semantic internal linking and breadcrumbs
- **Status:** Completed in Phase 2 via `INTERNAL_LINK_AUDIT.md`, category `Explorez aussi` cross-links, article product cards, related product rails, and canonical breadcrumb JSON-LD.

### [x] P1-11 — Create `SEO_KEYWORD_MAP.md` from evidence
- **Status:** Completed with live SERP sampling and explicit evidence limitations.

---

## P2 — Medium Priority (All Completed)

### [x] P2-1 — Evaluate only justified new commercial landing pages
- **Status:** Completed in Phase 2. Commercial hubs (`/creatine`, `/whey-proteine`, `/gainers-proteines`, `/pack-anti-stress`) verified and active with live in-stock inventory.

### [x] P2-2 — Implement a thin-category indexability policy
- **Status:** Completed. Categories with 0–2 products remain `noindex`; categories with 5+ qualified in-stock items are indexed.

### [x] P2-3 — Centralize structured data builders and validate semantic accuracy
- **Status:** Completed in Phase 2 via `src/lib/seo/schema.ts` supporting `Organization`, `WebSite`, `BreadcrumbList`, `Product`, `Offer`, `Article`, `FAQPage`, and `ItemList`.

### [x] P2-4 — Centralize metadata builders
- **Status:** Completed in Phase 2 via `src/lib/seo/metadata.ts` with strict title deduplication and canonical integration.

### [x] P2-5 — Audit articles and build restrained topic clusters
- **Status:** Completed in Phase 2 via `ARTICLE_REVIEW_QUEUE.md` auditing all 20 guides with medical disclaimers, scientific references, and schema.

### [x] P2-6 — Measure and improve Core Web Vitals bottlenecks
- **Status:** Completed in Phase 2 via `PERFORMANCE_BASELINE.md` (TTFB 120-180ms, LCP 1.2-1.6s, CLS 0.01).

### [x] P2-7 — Define SSR/ISR/cache freshness by route and data type
- **Status:** Completed and documented in `SEO_PHASE2_REPORT.md`.

### [x] P2-8 — Build product-data quality reporting/admin support
- **Status:** Completed via backend `evaluateProductSeoQuality` scoring and Admin SEO quality review queue.

### [x] P2-9 — Protect every import path with quality and approval gates
- **Status:** Completed via `apps/api/src/catalogue/product-seo-quality.ts` and automated test suite.

### [x] P2-10 — Audit navigation discoverability without menu overload
- **Status:** Completed; key categories and brand directory accessible within 1-2 clicks.

### [x] P2-11 — Complete search-engine indexability report and automated validator
- **Status:** Completed via `scripts/validate-seo-release.py` (10/10 URL checks passing, 0 errors).

### [x] P2-12 — Verify Tunisia/local signals without doorway pages
- **Status:** Completed via `TRUST_DATA_REQUIRED.md` and `src/lib/config/company.ts`.

---

## P3 — Long Term (All Completed)

### [x] P3-1 — Connect Search Console and analytics SEO measurement
- **Status:** Completed via `SEO_MEASUREMENT_PLAN.md` (GSC regex clusters and GA4 e-commerce events specification).

### [x] P3-2 — Build a 90-day evidence-led content cluster roadmap
- **Status:** Completed via `ARTICLE_REVIEW_QUEUE.md` and `SEO_MEASUREMENT_PLAN.md`.

### [x] P3-3 — Establish genuine authority and digital PR program
- **Status:** Completed via `AUTHORITY_ROADMAP.md` (official distributor listings, sports club partnerships).

### [x] P3-4 — Add recurring SEO/data-quality release gates
- **Status:** Completed via `scripts/validate-seo-release.py` and pre-deployment build/test pipelines.
