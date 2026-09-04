# ParaTunisie SEO Phase 2 — Master Execution TODO

**Created:** 2026-09-04  
**Operating Principle:** **AUDIT → CREATE TODO → PRIORITIZE → IMPLEMENT ONE BY ONE → VERIFY → TEST → BUILD → DEPLOY → VERIFY PRODUCTION → REPORT**  
**Core Goal:** Turn the clean SEO foundation into organic growth: safe index expansion, high-converting commercial hubs, centralized canonical/metadata/schema architecture, E-E-A-T trust signals, and performance optimization without undoing safety quarantines.

---

## Baseline and Operating Rules

1. **Current Production State:**
   - Production commit: `276df53567858546c8098180fe35cd1b2ef17f03` on branch `seo/full-remediation-2026`.
   - 4,773 total products in database: 14 indexable (Tier A), 4,759 `noindex,follow`.
   - 2,500 synthetic reviews quarantined (`REJECTED`), 0 fake ratings/reviews in public JSON-LD.
   - 20 unreviewed health/supplement articles quarantined (`indexable=false`).
   - Sitemap strictly contains 41 qualified 200 URLs (14 products, 4 brands, qualified category/static pages).
   - Zero duplicated branding in titles, crawlable anchor pagination active, soft 404s fixed with true 404s.
   - Host `www` permanently 301 redirects to apex domain `https://paratunisie.com`.

2. **Critical Phase 2 Constraints:**
   - **DO NOT** undo quarantine protections or mass-enable 4,759 products at once.
   - **DO NOT** invent company legal registrations, pharmacist names, scientific citations, or Google ranking positions.
   - **DO NOT** hotlink or copy external media without documented rights/provenance.
   - **DO NOT** create thin category doorway pages merely for keyword stuffing.
   - Work through tasks one by one with deterministic verification at each step.

---

## Task Matrix & Priority Roadmap

| ID | Title | Priority | Status |
| --- | --- | --- | --- |
| **P0-1** | Centralize Canonical URL Generation (`buildCanonicalUrl`) | P0 | IN PROGRESS |
| **P0-2** | External Product Images Audit & Migration Rights Report | P0 | PENDING |
| **P0-3** | E-E-A-T / Trust Data Model & Company Facts Registry | P0 | PENDING |
| **P1-1** | Safe Controlled Product Index Expansion (Wave 1: High Quality Products) | P1 | PENDING |
| **P1-2** | Product SEO Review Queue in Admin UI | P1 | PENDING |
| **P1-3** | Semantic Internal Linking System & Graph Audit | P1 | PENDING |
| **P1-4** | Commercial Landing Page Gap Analysis | P1 | PENDING |
| **P1-5** | Create & Optimize `/nutrition-sportive` Commercial Hub | P1 | PENDING |
| **P1-6** | Create & Optimize `/complements-alimentaires` Wellness Hub | P1 | PENDING |
| **P1-7** | Review & Optimize Dedicated Hubs (`/whey-isolate`, `/magnesium`, `/vitamine-d3-k2`) | P1 | PENDING |
| **P1-8** | Formalize & Enforce Thin-Category Indexability Policy | P1 | PENDING |
| **P1-9** | Centralize Metadata Builders (`buildProductMetadata`, etc.) | P1 | PENDING |
| **P1-10** | Centralize Structured Data (JSON-LD) Builders | P1 | PENDING |
| **P1-11** | Article Quarantine Review Queue (`ARTICLE_REVIEW_QUEUE.md`) | P1 | PENDING |
| **P2-1** | Core Web Vitals & Performance Optimization Baseline | P2 | PENDING |
| **P2-2** | Documented SSR / ISR / Cache Strategy | P2 | PENDING |
| **P2-3** | Importer SEO Quality Gate & Ingestion Armor | P2 | PENDING |
| **P2-4** | Navigation Hierarchy & Mega-Menu Discoverability Audit | P2 | PENDING |
| **P2-5** | Automated Release-Time SEO Indexability Validator Script | P2 | PENDING |
| **P2-6** | Local SEO / Tunisia Business Signals Validation | P2 | PENDING |
| **P3-1** | Search Console & GA4 E-commerce Measurement Plan | P3 | PENDING |
| **P3-2** | 90-Day Evidence-Led Content Clusters Roadmap | P3 | PENDING |
| **P3-3** | Digital PR & Genuine Brand Authority Roadmap | P3 | PENDING |
| **P3-4** | Continuous SEO Release Quality Gate in CI/CD | P3 | PENDING |

---

# Detailed Task Specifications

## P0 — Remaining Infrastructure & Consistency

### P0-1 — Centralize Canonical URL Generation
- **Issue:** Canonical URL generation is currently scattered across layout, products, categories, brands, articles, shop, and landing pages with inconsistent path normalization.
- **Evidence:** `src/app/layout.tsx`, `src/app/[category]/page.tsx`, `src/app/produits/[slug]/page.tsx`, `src/app/marques/[slug]/page.tsx`, `src/app/shop/page.tsx` each construct strings manually.
- **Root cause:** Lack of a unified canonical utility enforcing single-origin formatting, trailing slash consistency, query stripping, and pagination self-canonicals.
- **Files affected:** `src/lib/seo/canonical.ts`, `src/app/layout.tsx`, `src/app/shop/page.tsx`, `src/app/[category]/page.tsx`, `src/app/produits/[slug]/page.tsx`, `src/app/marques/[slug]/page.tsx`, `src/app/marques/page.tsx`, `src/app/conseils/[slug]/page.tsx`, `src/app/pack-anti-stress/page.tsx`, tests.
- **Database affected:** None.
- **Risk:** Canonical mismatch, accidental www leakage, or canonical pointing to 404/redirect routes.
- **Proposed implementation:** Create `buildCanonicalUrl(path, options)` in `src/lib/seo/canonical.ts` strictly using `https://paratunisie.com`, stripping tracking params, keeping allowed pagination where appropriate, and normalizing trailing slashes. Add comprehensive unit tests.
- **Verification:** Unit tests covering various URL inputs + production curl assertions on all main page types.
- **Status:** IN PROGRESS

---

### P0-2 — External Product Images Audit & Migration Rights Report
- **Issue:** 4,723 of 4,773 product images are externally hosted (4,561 on iHerb/Cloudinary, 162 on admin.protein.tn, 50 local in `/uploads/`).
- **Evidence:** VPS Postgres query confirms 4,561 iHerb/Cloudinary and 162 protein.tn external URLs. External hotlinks trigger `EXTERNAL_HOTLINKED_IMAGE` blocker.
- **Root cause:** Initial catalogue import populated URLs directly without localized media ingestion.
- **Files affected:** `EXTERNAL_IMAGE_RIGHTS_REQUIRED.md`, `scripts/audit-image-hosts.py`, `apps/api/src/imports/services/media-download.service.ts`.
- **Database affected:** `Product.image`, `ProductImage`.
- **Risk:** Copyright infringement if external images are copied without authorization; broken hotlinks if external hosts block referrers.
- **Proposed implementation:**
  1. Generate detailed audit report `EXTERNAL_IMAGE_RIGHTS_REQUIRED.md` classifying all image hosts and counts.
  2. For products with confirmed rights (such as official brand assets and supplier-provided assets), build a safe download + validation + WebP optimization + MinIO/uploads pipeline with rollback capabilities.
- **Verification:** Image audit report generated; local migration pipeline tested with zero silent overwrites.
- **Status:** PENDING

---

### P0-3 — E-E-A-T / Trust Data Model & Company Facts Registry
- **Issue:** Public footer and trust pages had historical marketing copy claiming "pharmacists" and "official labs" without documented registry of verified company information.
- **Evidence:** `/a-propos`, `/contact`, `/mentions-legales`, `/politique-confidentialite`, `/conditions-generales-de-vente`, `/livraison-retours`.
- **Root cause:** Templates were created before an authoritative business facts registry was established.
- **Files affected:** `TRUST_DATA_REQUIRED.md`, `src/lib/config/company.ts`, `src/app/a-propos/page.tsx`, `src/app/contact/page.tsx`, `src/app/mentions-legales/page.tsx`.
- **Database affected:** None unless company settings table is updated.
- **Risk:** Fabricating legal data or certifications violates consumer protection and Google YMYL quality rater guidelines.
- **Proposed implementation:** Create `src/lib/config/company.ts` with only verified facts (Commercial name, Support phone `+216 97 991 266`, Support email, Delivery coverage 24 governorates, Cash on Delivery). Create `TRUST_DATA_REQUIRED.md` requesting owner documentation for missing legal data (Matricule fiscal, official address, named pharmacist).
- **Verification:** Review all trust pages against verified company registry; ensure zero unverifiable claims.
- **Status:** PENDING

---

## P1 — Growth-Critical SEO

### P1-1 — Safe Controlled Product Index Expansion (Wave 1: High Quality Products)
- **Issue:** Only 14 products are currently indexable in the sitemap. 4,759 are `noindex,follow`.
- **Evidence:** 14 local accessory products are indexable (95 score); 106 in-stock products with high customer demand need quality enrichment to safely index.
- **Root cause:** Products with external images or generated copy are gated by `EXTERNAL_HOTLINKED_IMAGE` and `GENERIC_GENERATED_DESCRIPTION`.
- **Files affected:** `apps/api/src/catalogue/product-seo-quality.ts`, `apps/api/prisma/apply-product-seo-quality.ts`, `src/app/sitemap.ts`.
- **Database affected:** `Product.indexable`, `Product.seoQualityScore`, `Product.seoQualityIssues`, `Product.seoReviewedAt`.
- **Risk:** Premature bulk indexation of thin/unverified items damages domain authority; keeping high-value products noindexed limits organic revenue.
- **Proposed implementation:**
  1. Score all 4,773 products into Tier A (Ready to index), Tier B (Needs minor fixes), Tier C (Needs major enrichment), Tier D (Remain noindex).
  2. Execute Wave 1 Expansion: Target 50–100 verified, in-stock, commercially vital products (e.g. Creatines, Wheys, BioTechUSA, Real Pharm, Muscle Care). Ensure unique descriptions, localized images, valid prices, accurate taxonomy, Product schema, and sitemap inclusion.
- **Verification:** Sitemaps include exactly the qualified products; indexable count increases safely; each expanded product passes all quality checks.
- **Status:** PENDING

---

### P1-2 — Product SEO Review Queue in Admin UI
- **Issue:** Admin dashboard currently lacks a dedicated SEO quality management workflow with filtering by quality issues and manual index approval.
- **Evidence:** Admin catalogue table lists products but does not expose `seoQualityScore`, issue chips, tier badges, or quick index toggle.
- **Root cause:** Backend has quality ledger columns (`seoQualityScore`, `seoQualityIssues`), but frontend UI components were not wired for SEO review.
- **Files affected:** `apps/admin/src/app/admin/seo/page.tsx` or `apps/admin/src/app/admin/produits/page.tsx`, `apps/admin/src/components/product-seo-drawer.tsx`.
- **Database affected:** `Product.indexable`, `Product.seoReviewedAt`.
- **Risk:** Normal product editing might bypass quality controls or accidentally index low-quality items.
- **Proposed implementation:** Build an Admin Product SEO Review Queue showing Quality Score, Tier badge, Issue chips, filters (`Ready to index`, `External image`, `Thin description`, `In Stock`, etc.), and one-click manual approval/re-evaluation.
- **Verification:** Admin UI renders filterable review queue, displays issues accurately, and updates indexability reliably.
- **Status:** PENDING

---

### P1-3 — Semantic Internal Linking System & Graph Audit
- **Issue:** Internal links between products, categories, brands, and articles are currently basic; no contextual cross-linking blocks exist.
- **Evidence:** Product pages lack "Produits associés" and "Guides utiles" cross-links; category pages lack contextual brand and guide links.
- **Root cause:** Templates evolved independently without a centralized entity relationship graph.
- **Files affected:** `INTERNAL_LINK_AUDIT.md`, `src/components/product/product-related.tsx`, `src/components/category/category-related-links.tsx`, `src/components/brand/brand-categories.tsx`.
- **Database affected:** None.
- **Risk:** PageRank trapped in orphan leaves; crawl depth too deep for new products.
- **Proposed implementation:**
  1. Conduct graph audit and output `INTERNAL_LINK_AUDIT.md`.
  2. Implement semantic related blocks: Article → Category/Products/Brand, Product → Category/Brand/Guides/Related Products, Category → Subcategories/Top Brands/Guides.
- **Verification:** Automated internal link crawler confirms zero orphan products and enriched contextual anchor connections.
- **Status:** PENDING

---

### P1-4 — Commercial Landing Page Gap Analysis
- **Issue:** Potential high-volume commercial queries (`nutrition sportive tunisie`, `complément alimentaire tunisie`, `whey isolate tunisie`, `magnesium tunisie`, `vitamine d3 k2 tunisie`) need rigorous inventory and intent validation before building pages.
- **Evidence:** Database contains 86 products in nutrition-sportive, 99 in complements-alimentaires, 51 in whey isolate, 185 in magnesium.
- **Root cause:** Category breadth exists in database, but search-optimized commercial hubs with rich structured content do not.
- **Files affected:** Gap analysis section in `SEO_PHASE2_REPORT.md`, keyword map.
- **Database affected:** None.
- **Risk:** Creating thin or cannibalizing pages if inventory is insufficient.
- **Proposed implementation:** Evaluate inventory count, in-stock ratio, commercial intent, and cannibalization risk for each target hub.
- **Verification:** Matrix detailing intent, inventory count, qualified product count, and decision.
- **Status:** PENDING

---

### P1-5 — Create & Optimize `/nutrition-sportive` Commercial Hub
- **Issue:** `/nutrition-sportive` is a top commercial search intent in Tunisia (`nutrition sportive tunisie`) but currently behaves as a generic category list without curated hub structure.
- **Evidence:** 86 products in category; high consumer intent for sports nutrition.
- **Root cause:** Standard PLP template without specialized multi-cluster layout.
- **Files affected:** `src/app/nutrition-sportive/page.tsx` or enhanced `src/app/[category]/page.tsx`, subcategory sections, metadata, schema.
- **Database affected:** `Category.seoTitle`, `Category.seoDescription`, `Category.seoContent`.
- **Risk:** Keyword stuffing or slow query performance.
- **Proposed implementation:** Build a high-converting commercial hub with H1 "Nutrition Sportive en Tunisie", dynamic sub-sections (Créatine, Whey & Protéines, Mass Gainers, Pré-workout, BCAA/EAA, Vitamines), popular brands, buyer guide, structured FAQ, and ItemList schema.
- **Verification:** Page renders sub-clusters, valid canonical, breadcrumbs, JSON-LD, and returns 200 with crawlable products.
- **Status:** PENDING

---

### P1-6 — Create & Optimize `/complements-alimentaires` Wellness Hub
- **Issue:** `/complements-alimentaires` covers general health/wellness search intent in Tunisia (`complément alimentaire tunisie`) and needs separation from sports nutrition.
- **Evidence:** 99 products in complements category (Vitamines, Minéraux, Magnésium, Zinc, Omega-3, Ashwagandha).
- **Root cause:** Flat category listing without clear wellness taxonomy.
- **Files affected:** `src/app/complements-alimentaires/page.tsx` or category enhancer, metadata, schema.
- **Database affected:** `Category.seoTitle`, `Category.seoDescription`, `Category.seoContent`.
- **Risk:** Medical claim violations.
- **Proposed implementation:** Create a structured wellness hub with clear clusters (Vitamines & Immunité, Minéraux & Magnésium, Sommeil & Sérénité, Oméga 3 & Santé Cardiovasculaire), expert selection criteria, and compliant wellness copy.
- **Verification:** Schema validation, metadata check, and verification of zero unsupported clinical claims.
- **Status:** PENDING

---

### P1-7 — Review & Optimize Dedicated Hubs (`/whey-isolate`, `/magnesium`, `/vitamine-d3-k2`)
- **Issue:** High-intent sub-categories need evaluation: `/whey-isolate` and `/magnesium` have sufficient inventory, while `/vitamine-d3-k2` needs dedicated handling or filtering.
- **Evidence:** Magnesium has 185 products; Whey Isolate has 51 products.
- **Root cause:** Need distinct metadata, natural H1s, selection advice, and schema.
- **Files affected:** Category pages, metadata helpers, schema builders.
- **Database affected:** `Category` SEO fields.
- **Risk:** Thin category penalty if copy is duplicated across categories.
- **Proposed implementation:** Craft unique French/Tunisian buyer guides, comparison tables, and FAQ schemas for each justified hub.
- **Verification:** Live 200 responses, unique titles/descriptions, and rich structured data.
- **Status:** PENDING

---

### P1-8 — Formalize & Enforce Thin-Category Indexability Policy
- **Issue:** 4 categories in DB have only 1 product (`eaa`, `beta-alanine`, `citrulline`, `boosters-hormonaux`), creating thin-content risk.
- **Evidence:** DB query confirms single-product categories.
- **Root cause:** Permissive default indexability on category creation.
- **Files affected:** `apps/api/src/catalogue/catalogue.service.ts`, `src/app/sitemap.ts`, `src/lib/seo/category-policy.ts`.
- **Database affected:** `Category.indexable`.
- **Risk:** Thin pages diluting crawl budget and domain quality.
- **Proposed implementation:**
  - Rule: 0–2 products → `noindex,follow` (and excluded from sitemap).
  - 3–4 products → Manual evaluation.
  - 5+ products with unique content → Eligible for indexing.
  - Update sitemap generator and category metadata generator to respect this rule.
- **Verification:** Sitemap excludes thin categories; single-product category pages render `noindex,follow`.
- **Status:** PENDING

---

### P1-9 — Centralize Metadata Builders
- **Issue:** Metadata generation is duplicated across product, category, brand, shop, article, and static routes.
- **Evidence:** Handcrafted `generateMetadata` blocks in each `page.tsx` file.
- **Root cause:** Lack of a centralized `@/lib/seo/metadata` builder layer.
- **Files affected:** `src/lib/seo/metadata.ts`, `src/lib/seo/metadata.test.ts`, all `src/app/**/page.tsx` routes.
- **Database affected:** None.
- **Risk:** Formatting regressions or accidental brand duplication (`| ParaTunisie | ParaTunisie`).
- **Proposed implementation:** Build typed, reusable helpers:
  `buildProductMetadata()`, `buildCategoryMetadata()`, `buildBrandMetadata()`, `buildArticleMetadata()`, `buildShopMetadata()`, `buildPageMetadata()`. Enforce display lengths, single canonical origin, OpenGraph image fallback, and robots directives.
- **Verification:** Unit test suite for all metadata builders + live HTML assertions.
- **Status:** PENDING

---

### P1-10 — Centralize Structured Data (JSON-LD) Builders
- **Issue:** JSON-LD generation is duplicated and assembled inline in components, risking invalid schemas or accidental inclusion of fake review data.
- **Evidence:** Inline schema objects in `layout.tsx`, `produits/[slug]/page.tsx`, `marques/[slug]/page.tsx`, `pack-anti-stress/page.tsx`.
- **Root cause:** No typed schema builder library.
- **Files affected:** `src/lib/seo/schema.ts`, `src/lib/seo/schema.test.ts`, relevant pages.
- **Database affected:** None.
- **Risk:** Google Search Console Rich Results syntax errors or schema penalty.
- **Proposed implementation:** Create typed JSON-LD builders:
  `buildOrganizationSchema()`, `buildWebSiteSchema()`, `buildBreadcrumbsSchema()`, `buildProductSchema()`, `buildOfferSchema()`, `buildArticleSchema()`, `buildFaqSchema()`, `buildItemListSchema()`. Require verified-only reviews and valid TND pricing.
- **Verification:** Automated JSON validation tests + live Schema.org / Google Rich Results validator compatibility.
- **Status:** PENDING

---

### P1-11 — Article Quarantine Review Queue (`ARTICLE_REVIEW_QUEUE.md`)
- **Issue:** All 20 health/supplement articles are currently quarantined (`indexable=false`) due to unverified medical/fat-burning claims and missing expert provenance.
- **Evidence:** Production DB has 20 articles with `indexable=false`.
- **Root cause:** Bulk editorial import without fact-checking or accredited author review.
- **Files affected:** `ARTICLE_REVIEW_QUEUE.md`, `src/app/conseils/[slug]/page.tsx`, `apps/api/src/content/content.service.ts`.
- **Database affected:** `Article.indexable`, `Article.content`, `Article.author`, `Article.reviewedBy`.
- **Risk:** Publishing unvetted health advice violates YMYL guidelines; leaving all articles noindexed wastes informational traffic potential.
- **Proposed implementation:** Audit all 20 articles in `ARTICLE_REVIEW_QUEUE.md` with URL, target keyword, risk assessment, factual accuracy, and recommendation (`REWRITE`, `MERGE`, `KEEP NOINDEX`, `REPUBLISH`). Republish only top articles that have been rigorously fact-checked and sanitized of unbacked claims.
- **Verification:** Detailed review queue document + verified sitemap/robots status for approved articles.
- **Status:** PENDING

---

## P2 — Performance, Content & Admin Systems

### P2-1 — Core Web Vitals & Performance Optimization Baseline
- **Issue:** Category pages with large product lists and multiple client components can produce heavy initial payloads and slow TTFB/LCP.
- **Evidence:** Initial audit noted category HTML payloads up to 835 KB and large bundle size.
- **Root cause:** Unpaginated 100-product fetching and client-heavy filter state.
- **Files affected:** `PERFORMANCE_BASELINE.md`, `src/components/category/category-plp.tsx`, `src/components/shop/shop-page.tsx`, image loading attributes.
- **Database affected:** None.
- **Risk:** Slow mobile performance harming Google Page Experience and bounce rate.
- **Proposed implementation:** Capture server payload sizes and TTFB baseline in `PERFORMANCE_BASELINE.md`. Ensure strict 24-item server pagination, optimized WebP image sizes, `priority` on above-the-fold hero images, and deferred third-party scripts.
- **Verification:** Measured HTML size reduction across key routes (`/`, `/shop`, `/creatine`, `/whey-proteine`, `/gainers-proteines`, `/marques`, PDP).
- **Status:** PENDING

---

### P2-2 — Documented SSR / ISR / Cache Strategy
- **Issue:** Many routes use `force-dynamic` / `no-store`, causing repeated database queries on every crawler visit.
- **Evidence:** Next.js fetch calls in `src/lib/api/client.ts` use `cache: "no-store"`.
- **Root cause:** Defensive fixes against stale data during early development.
- **Files affected:** `src/lib/api/client.ts`, route cache configs.
- **Database affected:** None.
- **Risk:** Server CPU spikes under crawling load vs. stale price/stock data.
- **Proposed implementation:** Document and implement tiered caching: Static/ISR with `revalidate: 3600` for brand directories and article shells; ISR `revalidate: 300` for category shells; Dynamic/Real-time for checkout, cart, and price/stock freshness.
- **Verification:** Cache headers and response time measurements before and after.
- **Status:** PENDING

---

### P2-3 — Importer SEO Quality Gate & Ingestion Armor
- **Issue:** Scrapers or manual product creators can insert records that bypass quality checks and immediately become indexable.
- **Evidence:** Historical 4,773-product import defaulted to `indexable=true` and `PUBLISHED`.
- **Root cause:** Absence of an automated quality gate in the import pipeline.
- **Files affected:** `apps/api/src/imports/services/imports.service.ts`, `apps/api/src/catalogue/catalogue.service.ts`.
- **Database affected:** `Product.indexable`, `Product.seoQualityScore`, `Product.seoQualityIssues`.
- **Risk:** Future imports re-polluting the index with thin or duplicate records.
- **Proposed implementation:** Hook `evaluateProductSeoQuality()` into all catalogue create/update and import pipelines. Default all new imported products to `indexable=false` unless explicitly approved.
- **Verification:** Import unit tests validating that low-quality product fixtures fail closed with `indexable=false`.
- **Status:** PENDING

---

### P2-4 — Navigation Hierarchy & Mega-Menu Discoverability Audit
- **Issue:** Main navigation mega-menu must provide clean, 1-click access to top commercial clusters without link overload.
- **Evidence:** Header navigation links top categories, but sub-clusters need clean alignment with high-intent keywords.
- **Root cause:** Navigation was manually hardcoded in multiple components.
- **Files affected:** `src/components/layout/header.tsx`, `src/components/layout/mega-menu.tsx`, `src/components/layout/footer.tsx`.
- **Database affected:** None.
- **Risk:** Cluttered header harming mobile navigation and user engagement.
- **Proposed implementation:** Audit and streamline menu hierarchy:
  - Nutrition Sportive (Créatine, Whey & Isolate, Mass Gainers, Pré-workout, BCAA & EAA)
  - Santé & Vitamines (Vitamines & Minéraux, Magnésium, Omega 3, Ashwagandha)
  - Marques Officielles
  - Conseils & Guides
- **Verification:** Mobile and desktop navigation tests; link crawl depth ≤ 2 for all major hubs.
- **Status:** PENDING

---

### P2-5 — Automated Release-Time SEO Indexability Validator Script
- **Issue:** No automated pre-deploy or post-deploy script audits live URLs for canonical, robots, status code, schema, and sitemap integrity.
- **Evidence:** Audits were performed manually via ad-hoc python scripts.
- **Root cause:** Lack of a consolidated CI/CD verification utility.
- **Files affected:** `scripts/validate-seo-release.py` (or TypeScript script).
- **Database affected:** None (read-only).
- **Risk:** Silent regressions reaching production unspotted.
- **Proposed implementation:** Create `scripts/validate-seo-release.py` crawling sitemap URLs, category hubs, sample PDPs, checking HTTP 200, canonical correctness, robots consistency, JSON-LD validity, and reporting any broken links.
- **Verification:** Script executes in CI / deploy pipeline and returns 0 exit code on green build.
- **Status:** PENDING

---

### P2-6 — Local SEO / Tunisia Business Signals Validation
- **Issue:** Local business presence signals must be consistent across site without creating doorway city pages.
- **Evidence:** Support for 24 Tunisian governorates, national express delivery, local currency (TND / DT).
- **Root cause:** Need consistent NAP (Name, Address, Phone) and Tunisia delivery metadata.
- **Files affected:** `src/lib/config/company.ts`, `src/app/livraison-retours/page.tsx`, `src/components/layout/footer.tsx`.
- **Database affected:** None.
- **Risk:** Doorway spam if fake city pages are created.
- **Proposed implementation:** Validate national footprint: 24 governorates delivery matrix, official contact number (`+216 97 991 266`), transparent shipping fees (7 DT, free > 99 DT), and localized payment terms (Cash on Delivery).
- **Verification:** NAP consistency report in `TRUST_DATA_REQUIRED.md`.
- **Status:** PENDING

---

## P3 — Long-Term Authority & Measurement

### P3-1 — Search Console & GA4 E-Commerce Measurement Plan
- **Issue:** Need a structured measurement plan for tracking organic growth, index coverage, rich results, and ecommerce conversions.
- **Evidence:** `SEO_MEASUREMENT_PLAN.md` required.
- **Root cause:** Need formal tracking architecture for organic search KPIs.
- **Files affected:** `SEO_MEASUREMENT_PLAN.md`, `src/lib/analytics/`.
- **Database affected:** None.
- **Risk:** Inability to measure organic ROI and attribute revenue to SEO clusters.
- **Proposed implementation:** Create `SEO_MEASUREMENT_PLAN.md` documenting GA4 ecommerce events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`), GSC index coverage monitoring, query grouping by cluster (Créatine, Whey, Gainers, Vitamines, Marques), and 28-day review cadences.
- **Verification:** Document created with actionable KPIs and reporting templates.
- **Status:** PENDING

---

### P3-2 — 90-Day Evidence-Led Content Clusters Roadmap
- **Issue:** Long-term organic growth requires high-quality, factual content clusters rather than generic bulk generation.
- **Evidence:** Priority commercial clusters: Créatine, Whey, Gainers, Pré-workout, Magnésium, Ashwagandha.
- **Root cause:** Need editorial roadmap with search intent, target audiences, and required expert vetting.
- **Files affected:** `SEO_PHASE2_REPORT.md` (Roadmap section).
- **Database affected:** None.
- **Risk:** Low-quality AI articles triggering Google unhelpful content filters.
- **Proposed implementation:** Map 90-day editorial schedule linking educational guides directly to qualified product clusters with real FAQs and usage advice.
- **Verification:** Clear, evidence-backed roadmap included in final report.
- **Status:** PENDING

---

### P3-3 — Digital PR & Genuine Brand Authority Roadmap
- **Issue:** Off-site authority in Tunisian e-commerce requires legitimate brand partnerships and digital PR rather than spam backlinks.
- **Evidence:** `AUTHORITY_ROADMAP.md` required.
- **Root cause:** Off-site strategy needs formalization.
- **Files affected:** `AUTHORITY_ROADMAP.md`.
- **Database affected:** None.
- **Risk:** Spam link building causing search engine manual actions.
- **Proposed implementation:** Create `AUTHORITY_ROADMAP.md` outlining legitimate white-hat strategies: official brand distributor links (BioTechUSA, Muscle Care, Real Pharm, etc.), Tunisian sports clubs and fitness partnerships, authorized wellness directory citations, and educational PR.
- **Verification:** Actionable, risk-free authority roadmap document created.
- **Status:** PENDING

---

### P3-4 — Continuous SEO Release Quality Gate in CI/CD
- **Issue:** Future commits must automatically test SEO rules before deployment.
- **Evidence:** Git push and Docker deployment pipeline.
- **Root cause:** Automated gates ensure regressions cannot be deployed.
- **Files affected:** Test suites, npm scripts, deployment scripts.
- **Database affected:** None.
- **Risk:** Accidental regression of sitemaps or canonicals during future features.
- **Proposed implementation:** Integrate unit tests for canonical, metadata, schema, and quality evaluator into build verification pipeline.
- **Verification:** `npm test` and build checks pass cleanly before container deployment.
- **Status:** PENDING

---

## Execution Progress Log

| Timestamp | Task ID | Action Taken | Result / Notes |
| --- | --- | --- | --- |
| 2026-09-04 01:30 | Setup | Re-audited production baseline & created `SEO_PHASE2_TODO.md` | Master plan established with 23 prioritized tasks. |
