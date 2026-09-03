# ParaTunisie SEO Remediation — Master TODO

Created: 2026-09-03
Workflow: **AUDIT → TODO → PRIORITIZE → BACKUP → ONE FIX → VERIFY → NEXT FIX → TEST → BUILD → DEPLOY → VERIFY PRODUCTION → REPORT**

## Baseline and operating rules

- Production commit at audit start: `f173285b073020c4875090c1e066ad65c056471e` on `main`.
- Production services were healthy at audit start: storefront, admin, API, PostgreSQL, Redis, Meilisearch, and MinIO.
- Production database baseline: 4,773 products, 27 categories, 410 brands, 2,500 reviews, 7 orders, 117 users, and 20 articles.
- No production data is to be deleted without a verified backup and a reversible remediation path.
- No credentials, tokens, customer data, or production secrets may be committed or copied into this document.
- External audit claims are hypotheses until marked **Confirmed** below.
- A task is complete only after its code/data change and stated verification both pass in production.
- Interactive browser verification is currently unavailable in the Codex in-app browser. Initial evidence therefore uses HTTP headers, server-rendered HTML, application code, production API/database queries, and container state. Browser/hydration checks remain open until a supported browser becomes available.

## Priority order

1. Review and structured-data integrity.
2. Product index-quality gate and sitemap containment.
3. Crawl controls, canonical host, and server-rendered discovery.
4. Taxonomy and product-template correctness.
5. Metadata, pagination, facets, images, links, trust, and internal architecture.
6. Performance, content quality, durable import controls, deployment, and measurement.

---

## P0 — Critical

### [ ] P0-1 — Remove false verified-purchase reviews from public output and structured data

- **Issue:** Seeded/generated reviews are publicly presented as genuine verified purchases and feed `AggregateRating`/`Review` JSON-LD.
- **Evidence:** Production has 2,500 reviews; all are `APPROVED`, all have `verified=true`, all have `orderId=NULL`, none matches an order item, and only 7 orders exist. Exactly 50 products have exactly 50 reviews with the same 4.86 average. There are 398 duplicated review-body groups accounting for 2,102 extra reviews. `apps/api/prisma/seed-reviews.js` deletes all reviews, generates exactly 50 per product, labels them “realistic,” and sets `verified: true`. A reviewed PDP renders “Achat vérifié,” `AggregateRating`, and `Review` schema.
- **Root cause:** Destructive synthetic-review seed plus public queries/ratings trusting `status=APPROVED` and the stored `verified` flag without requiring a matching eligible order.
- **Files affected:** `apps/api/prisma/seed-reviews.js`; `apps/api/src/reviews/reviews.service.ts`; review tests/controller DTOs; `src/app/produits/[slug]/page.tsx`; `src/components/product/product-tabs.tsx`; deployment helper scripts that invoke the seed.
- **DB affected:** `Review`, `User`, `Order`, `OrderItem`.
- **Risk:** Critical consumer-trust, legal/reputational, rich-result spam, and Google confidence risk. Genuine reviews must not be destroyed.
- **Proposed fix:** Create a forensic export/classification; change public review/rating queries to require an approved review with an order belonging to the reviewer, containing the same product, in an eligible fulfilled/confirmed state; derive verified status rather than trusting the boolean; remove fallback/generated review text from JSON-LD; disable/remove synthetic review seeding; quarantine identified synthetic rows reversibly (not hard-delete); preserve any independently verifiable genuine rows.
- **Verification:** Before/after forensic counts; public API returns only eligible reviews; reviewed sample PDP has no fake label/rating/schema; unit tests cover mismatched user/product/order/status and stored-boolean tampering; production HTML and Rich Results JSON validate.
- **Status:** Confirmed; remediation pending backup.

### [ ] P0-2 — Implement reversible product SEO eligibility and contain index bloat

- **Issue:** Every product is published and indexable regardless of quality or commercial state.
- **Evidence:** All 4,773 products are `PUBLISHED` and `indexable=true`; only 106 are in stock while 4,667 are not. There are 71 duplicate normalized-name groups and 71 duplicate-description groups. All 4,773 appear in the sitemap. Existing fields (`indexable`, `seoScore`, `publishState`) are not acting as a quality gate.
- **Root cause:** Import/catalogue flows default to published/indexable and sitemap logic only tests those permissive flags; no durable eligibility calculation or issue ledger exists.
- **Files affected:** Prisma schema/migration if new audit fields are required; catalogue service/controller; import services/CLI; sitemap; admin catalogue/SEO UI; tests and audit scripts.
- **DB affected:** `Product`, `ProductVariant`, `ProductImage`, `Brand`, `Category`, `ImportedProduct`, `SeoGenerationLog`.
- **Risk:** Critical index bloat, low-value pages, crawl-budget waste, duplicate pages, and quality-classifier degradation. Commercially useful on-order products must remain accessible.
- **Proposed fix:** Implement an explainable eligibility evaluator using publish state, valid identity/brand/category, unique slug/title, usable description, valid price/image, availability semantics, placeholder/duplicate detection, and product-type data. Store or expose quality score/issues/review timestamp where useful. Default insufficient imports to `noindex,follow`; never delete solely for SEO.
- **Verification:** Deterministic evaluator tests; production distribution report; sampled eligible/ineligible PDP metadata; sitemap excludes ineligible URLs while pages remain usable; admin/API exposes reasons.
- **Status:** Confirmed; exact threshold design pending forensic sampling.

### [ ] P0-3 — Restrict XML sitemap to canonical, indexable, valuable 200 URLs

- **Issue:** Current sitemap indiscriminately includes the entire catalogue and all active brands/categories.
- **Evidence:** Production `/sitemap.xml` returns 200 and contains 5,252 URLs: 4,773 products, 410 brands, 20 articles, 8 concern URLs, and 41 other/static/category URLs. It is a single sitemap and reflects permissive DB flags.
- **Root cause:** `src/app/sitemap.ts` consumes `catalogue/sitemap-data`; `CatalogueService.getSitemapData()` filters only `PUBLISHED/indexable` products and `ACTIVE/indexable` brands/categories, while every product currently qualifies.
- **Files affected:** `src/app/sitemap.ts`; catalogue sitemap endpoint/service; possibly route-specific sitemap generators and tests.
- **DB affected:** `Product`, `Brand`, `Category`, `Article` indexability and update timestamps.
- **Risk:** Critical crawl-budget and index-quality impact; stale/redirecting/low-value URLs may be submitted directly to Google.
- **Proposed fix:** Apply the product/category/brand eligibility policy, include only canonical 200 pages, use real `updatedAt`, exclude private/conversion/filter/search routes, and split into sitemap index + typed sitemap files if the qualified set or future growth warrants it.
- **Verification:** Parse every generated sitemap; validate URL count/type, status, canonical, robots, and duplicates; confirm excluded low-quality products; validate XML and production responses.
- **Status:** Confirmed.

### [ ] P0-4 — Tighten robots.txt without hiding noindex directives

- **Issue:** Robots exists, but private/admin and parameter strategy require validation.
- **Evidence:** Production `/robots.txt` returns 200 text/plain, allows `/`, disallows `/checkout`, `/panier`, `/compte`, `/favoris`, `/api/`, and references the canonical sitemap. `/admin` is not disallowed. This issue was incorrectly reported as wholly missing by older code comments; it currently exists.
- **Root cause:** Initial implementation covers storefront conversion/private routes but not the separate admin path or final crawl-policy matrix.
- **Files affected:** `src/app/robots.ts`; proxy rules only if admin is hosted under the same public origin.
- **DB affected:** None.
- **Risk:** Admin/private crawl noise; over-blocking could prevent Google from observing `noindex`.
- **Proposed fix:** Add only justified private disallows (including `/admin` if publicly routed), leave filtered public pages crawlable where `noindex,follow` must be seen, and retain sitemap reference.
- **Verification:** Fetch production robots as Googlebot-compatible text; compare each disallow to page-level robots; ensure public catalogue/content paths are allowed.
- **Status:** Partially confirmed; current file is valid but incomplete.

### [ ] P0-5 — Enforce one canonical host with a single permanent redirect

- **Issue:** `https://www.paratunisie.com` serves a 200 duplicate instead of redirecting to the non-www canonical host.
- **Evidence:** `http://paratunisie.com/` returns 301 to `https://paratunisie.com/`. `http://www.paratunisie.com/` returns 301 to `https://www.paratunisie.com/`, then HTTPS www returns 200. App canonicals use `https://paratunisie.com`, so the www page is a crawlable duplicate rather than a redirect.
- **Root cause:** Cloudflare/nginx-proxy-manager host routing lacks a www→apex redirect for HTTPS.
- **Files affected:** Reverse-proxy/Cloudflare host configuration; application host handling only as defense in depth.
- **DB affected:** None.
- **Risk:** Duplicate host, split signals, crawl duplication, inconsistent analytics/cookies.
- **Proposed fix:** Configure one-hop permanent redirects from both HTTP variants and HTTPS www to `https://paratunisie.com$request_uri`, preserving query/path and avoiding loops.
- **Verification:** Header matrix for four scheme/host combinations and nested paths; exactly one redirect; canonical/sitemap/OG/JSON-LD/internal links remain apex.
- **Status:** Confirmed; infrastructure change pending backup/config capture.

### [ ] P0-6 — Server-render `/marques` from real brand data

- **Issue:** Brand directory relies on a client effect, so initial HTML contains its empty state and no complete brand graph.
- **Evidence:** `src/app/marques/page.tsx` renders `<MarquesPage />` without data. `MarquesPage` starts with `brands=[]`, fetches `/api/v1/catalogue/brands` in `useEffect`, and conditionally renders “Aucune marque.” Production initial HTML contains “Aucune marque”; it has only 8 brand links inherited from global navigation, despite 410 DB brands.
- **Root cause:** Data fetching and brand mapping are entirely client-side.
- **Files affected:** `src/app/marques/page.tsx`; `src/components/marques/marques-page.tsx`; frontend API types/client; tests.
- **DB affected:** `Brand`, `Product` counts/status/indexability.
- **Risk:** Critical discoverability and false empty-page signal; most brand pages are not linked in initial HTML.
- **Proposed fix:** Fetch eligible brands in the Server Component (SSR/dynamic or controlled revalidation), pass serializable initial data to an interactive client filter, and remove fabricated “45+” fallback copy.
- **Verification:** Initial production HTML includes real count and representative brand links without hydration; no empty-state text when data exists; API failure produces honest retry/error behavior; browser hydration check when available.
- **Status:** Confirmed.

### [ ] P0-7 — Correct catalogue taxonomy, beginning with Gainers

- **Issue:** Commercial category membership contains materially unrelated products.
- **Evidence:** Production `/gainers-proteines` has 34 products. DB sample includes pure carbohydrate powders, rice cream, D-ribose, and a carbohydrate blocker. Confirmed examples include `CARBO BIG`, `CARBO ONE`, `CARBOX`, multiple D-Ribose products, and `Source Naturals Phase 2 Carbohydrate Blocker`.
- **Root cause:** Keyword/source-category classification merged carbohydrates and gainer intent without an ambiguity/review stage.
- **Files affected:** category mapping/import classification; taxonomy audit/remediation scripts; category navigation/content; tests.
- **DB affected:** `Product.categoryId`, `Category`, `CategoryMapping`, source/import metadata where available.
- **Risk:** Critical relevance dilution and misleading shopping experience; broad automated moves could create new errors.
- **Proposed fix:** Produce a category-by-category suspicious-assignment report using title, description, source category, brand, and specifications; manually approve ambiguous moves; correct confirmed records reversibly; add import classification safeguards.
- **Verification:** Before/after membership exports; manual reviewed decision log; sampled category HTML; counts and product semantics; regression tests for known misclassifications.
- **Status:** Confirmed for Gainers; full taxonomy audit pending.

### [ ] P0-8 — Make product specifications product-type aware

- **Issue:** Sports supplement PDPs render legacy skincare labels such as “Type de peau.”
- **Evidence:** Production creatine, folate, and carbohydrate PDP HTML all contain “Type de peau.” Product model defaults `skinTypes` broadly, and the shared product tabs render skincare-oriented fields without a reliable product-type gate.
- **Root cause:** One dermocosmetic-era template is applied to all categories; product type/specification schema is not normalized.
- **Files affected:** product types/transform; `src/components/product/product-tabs.tsx`; PDP; catalogue API/model/imports; tests.
- **DB affected:** `Product`, `Category`; potential normalized specification fields or validated attributes.
- **Risk:** Critical topical mismatch, poor user trust, and low-quality template signals across thousands of pages.
- **Proposed fix:** Classify broad product families safely; render sports fields (format, weight, servings, flavor, composition, use, brand) only when known and skincare fields only for applicable products; omit unknown values rather than fabricate.
- **Verification:** Representative sports/skincare/accessory PDP snapshots and HTML assertions; no skin fields on sports products; no invented specifications.
- **Status:** Confirmed.

### [ ] P0-9 — Build one safe rich-description renderer and eliminate duplicate/raw copy

- **Issue:** Markdown stored in descriptions is rendered as literal text; description and SEO content may repeat substantially.
- **Evidence:** Production sports PDP HTML contains literal `### Points Forts` and `**...**`. `product-tabs.tsx` outputs description in `<p>` as plain text in both mobile/desktop layouts; PDP separately renders `seoContent` as another plain paragraph.
- **Root cause:** Import/SEO generation stores Markdown-like strings but the presentation layer assumes plain text; no normalization/sanitization/deduplication pipeline exists.
- **Files affected:** product content renderer utility/component; `product-tabs.tsx`; PDP; import/SEO generators; tests and dependencies if a vetted Markdown parser/sanitizer is added.
- **DB affected:** `Product.description`, `seoContent`, `usage`; optionally format/version metadata.
- **Risk:** Critical content quality and semantic markup issue; unsafe HTML handling could introduce XSS.
- **Proposed fix:** Define accepted formats, safely parse a restricted Markdown subset or normalize to structured blocks, sanitize any HTML, prevent nested invalid markup, compare/collapse materially duplicate sections, and render once per intended section with semantic headings/lists.
- **Verification:** XSS fixture tests; Markdown/plain/HTML fixtures; live PDP has semantic elements and no raw markers or duplicated paragraphs.
- **Status:** Confirmed.

### [ ] P0-10 — Audit and remediate unsupported health/medical and credential claims

- **Issue:** Production and generated copy contains strong efficacy, certification, professional, and medical-adjacent claims without documented substantiation.
- **Evidence:** Homepage initial HTML includes “principes actifs ... aux concentrations cliniquement validées,” “accélérer la combustion des graisses,” “régulation du stress,” “conseils personnalisés par nos pharmaciens,” “sélectionnés par des professionnels de la santé,” “numéro 1,” and “laboratoires dermatologiques officiels.” No evidence for those credentials/claims was found in the audited code/data baseline.
- **Root cause:** Marketing templates and imported/generated SEO copy optimize persuasion without a provenance/status model for claims or verified business credentials.
- **Files affected:** homepage/category/product/article copy; SEO generator prompts/templates; trust pages; import pipeline; tests/audit script.
- **DB affected:** Product/category/brand/article SEO and description fields where unsupported claims occur.
- **Risk:** Critical YMYL trust, consumer protection, platform policy, and reputational exposure.
- **Proposed fix:** Inventory claims with source/provenance; retain accurate label/manufacturer statements with attribution; soften/remove unsupported guarantees, clinical language, rankings, and professional credentials; add measured safety copy where relevant; never fabricate citations.
- **Verification:** automated phrase report plus manual context review; approved copy inventory; production samples and schema contain no unsupported claims.
- **Status:** Confirmed for multiple templates; full DB/content classification pending.

---

## P1 — High Priority

### [ ] P1-1 — Separate homepage and shop search intent

- **Issue:** Homepage and `/shop` both target “parapharmacie en ligne Tunisie.”
- **Evidence:** Homepage title/H1 targets the phrase; shop title is exactly “Parapharmacie en ligne Tunisie.”
- **Root cause:** No enforced keyword-to-page ownership map.
- **Files affected:** root layout/home content; shop metadata/content; SEO helpers.
- **DB affected:** None unless homepage configuration stores copy.
- **Risk:** Cannibalization and unclear relevance.
- **Proposed fix:** Keep global parapharmacy intent on homepage; move shop to catalogue/boutique/complements-and-nutrition intent based on verified SERPs/GSC.
- **Verification:** keyword map, unique titles/H1/copy, live HTML.
- **Status:** Confirmed.

### [ ] P1-2 — Eliminate duplicated title branding

- **Issue:** Some titles render `| ParaTunisie | ParaTunisie`.
- **Evidence:** Production `/marques` and `/conseils` both show duplicate branding. Root layout has `%s | ParaTunisie`; child metadata already includes the brand.
- **Root cause:** Mixed use of templated versus already-branded child titles.
- **Files affected:** all route metadata; centralized SEO helpers.
- **DB affected:** `seoTitle` fields whose values already include branding.
- **Risk:** Truncated SERP titles and inconsistent metadata.
- **Proposed fix:** Centralize title normalization; child titles omit brand unless declared absolute; audit DB titles and routes.
- **Verification:** automated title crawl detects zero duplicated brand suffixes.
- **Status:** Confirmed.

### [ ] P1-3 — Improve conditional product title quality

- **Issue:** Product titles are inconsistent, sometimes truncated/generated, and can imply reviews or value not present.
- **Evidence:** Sample titles range from natural product titles to truncated `Doctor's Best ... gé... en Tunisie`; code creates fallbacks from product strings. Review-backed wording must disappear where reviews are ineligible.
- **Root cause:** No centralized length-aware product metadata builder tied to data quality.
- **Files affected:** PDP metadata; SEO helper; catalogue SEO generator; tests.
- **DB affected:** Product SEO title fields.
- **Risk:** Low CTR, duplication, stuffing, false review implications.
- **Proposed fix:** Normalize natural name + verified differentiator + Tunisia intent within sensible display length; condition review language on eligible reviews only.
- **Verification:** uniqueness/length audit and representative SERP-preview checks.
- **Status:** Confirmed.

### [ ] P1-4 — Centralize canonical URL generation and audit all templates

- **Issue:** Canonicals exist on sampled pages, but implementation is scattered and pagination handling is incorrect.
- **Evidence:** Root metadata, category/product/brand/article/shop routes each build canonicals separately. `/shop?page=2` is noindex and canonicalizes to `/shop`; category pages accept search params without a consistent faceted/pagination policy.
- **Root cause:** No shared canonical/robots policy layer.
- **Files affected:** new SEO utility plus all indexable route metadata functions.
- **DB affected:** canonical overrides on product/category/brand/article.
- **Risk:** Canonical-to-redirect/404 errors and loss of unique pagination discovery.
- **Proposed fix:** Add host-safe path normalization, validate overrides, self-canonicalize unique indexable pages, and explicitly define duplicate/filter relationships.
- **Verification:** automated URL-template matrix; no canonical points to redirect/404; production HTML assertions.
- **Status:** Partially confirmed.

### [ ] P1-5 — Make pagination crawlable and semantically correct

- **Issue:** Shop pagination controls are client-side `<button>` elements, not crawlable anchors; category pages fetch at most the first 100 products with no category pagination.
- **Evidence:** `shop-page.tsx` uses button `onClick`/router updates. Category page calls `fetchProducts`, whose default limit is 100; Whey has 186 products and Vitamines 950.
- **Root cause:** Pagination was designed as UI state, and category template predates catalogue scale.
- **Files affected:** shop/category server routes, client filters, API pagination parameters, metadata, tests.
- **DB affected:** None.
- **Risk:** Deep products are poorly discoverable; category pages silently omit inventory.
- **Proposed fix:** Render real `<Link href>` prev/next/numeric anchors, support paginated category queries, preserve safe filter state, and define canonical/index policy without infinite spaces.
- **Verification:** initial HTML contains anchors; page 2 returns unique products and 200; prev/next chain covers all eligible products.
- **Status:** Confirmed.

### [ ] P1-6 — Formalize faceted-navigation index controls

- **Issue:** Shop applies `noindex,follow` to any parameter, but canonicalizes all pages—including pagination—to `/shop`; category filter behavior is not centralized.
- **Evidence:** `generateMetadata` tests only `Object.keys(searchParams).length > 0`; filters can generate brand/category/concern/sort/search/page combinations.
- **Root cause:** One blanket rule conflates pagination with arbitrary facets.
- **Files affected:** shop/category metadata and URL builders; filters; robots/canonical helpers.
- **DB affected:** None.
- **Risk:** Crawl traps or loss of useful paginated discovery.
- **Proposed fix:** Allow curated route landings to index; noindex arbitrary search/sort/price/stock combinations; normalize parameter ordering; cap invalid pages; keep crawlable links intentionally.
- **Verification:** parameter matrix and crawler; no infinite combinations in internal links/sitemap.
- **Status:** Confirmed.

### [ ] P1-7 — Migrate hotlinked product media to controlled storage

- **Issue:** Most products hotlink third-party images.
- **Evidence:** 4,723/4,773 product image fields are external; only 50 use `/uploads/`. At least 162 reference `admin.protein.tn`; sampled out-of-stock pages use iHerb Cloudinary. Production PDPs load those external assets.
- **Root cause:** Catalogue imports retained external image URLs; local/MinIO ingestion was not applied to the bulk catalogue.
- **Files affected:** media/import services, image URL resolver, Next image config/components, migration/audit scripts.
- **DB affected:** `Product.image`, `ProductImage`, import source metadata.
- **Risk:** Broken images, third-party dependency, licensing risk, poor performance/control.
- **Proposed fix:** Inventory domains and rights; download only authorized assets; validate/dedupe/store in MinIO or controlled uploads; preserve source provenance; set dimensions/ALT; use optimized image behavior.
- **Verification:** domain report trends to zero unauthorized hotlinks; sampled images return 200 from controlled origin; layout dimensions and lazy/LCP behavior verified.
- **Status:** Confirmed.

### [ ] P1-8 — Crawl broken links, redirects, orphan pages, and soft 404s

- **Issue:** Large recent catalogue/import and manual redirects create high broken/orphan risk.
- **Evidence:** Static redirects map several unrelated legacy article paths to generic/different-topic pages; no complete current crawl exists. Dynamic category catch-all can obscure route mistakes.
- **Root cause:** Redirects and content lifecycle are split between Next config and `SeoRedirect`; no continuous internal-link validation.
- **Files affected:** crawler/audit script; redirects; route `notFound` handling; CI.
- **DB affected:** `SeoRedirect`, products/categories/brands/articles.
- **Risk:** Wasted crawl, poor UX, irrelevant redirects, soft 404s.
- **Proposed fix:** Crawl representative/full qualified graph with rate limits; classify failures; keep only relevant one-hop redirects; return true 404 for missing entities; report orphans.
- **Verification:** zero broken internal links in tested graph; redirect relevance list; unknown URLs return 404.
- **Status:** Audit pending.

### [ ] P1-9 — Verify and strengthen trust/E-E-A-T pages without invention

- **Issue:** Strong expertise/authenticity claims may exceed verifiable company/person information.
- **Evidence:** Public footer/trust copy claims experts, pharmacists, official laboratories, and “numéro 1.” Existing About, Contact, legal, editorial, privacy, returns, shipping, authenticity, payment, and terms routes need fact-by-fact validation.
- **Root cause:** Marketing content was written before a verified business/author information registry.
- **Files affected:** trust pages, footer/home content, Organization schema, article author display.
- **DB affected:** Article author/reviewer fields and homepage content if configured.
- **Risk:** YMYL credibility and legal transparency.
- **Proposed fix:** Reconcile against real business registration/contact/address/qualified contributors supplied or present in production; remove unverifiable claims; improve accurate policies and author provenance.
- **Verification:** fact checklist signed against authoritative business data; live pages and schema match.
- **Status:** Audit pending; unsupported claims confirmed.

### [ ] P1-10 — Strengthen semantic internal linking and breadcrumbs

- **Issue:** Global navigation links key categories, but product/category/article contextual relationships are partial and some breadcrumb URLs are derived from display names.
- **Evidence:** Product JSON-LD category URL slugifies the category name rather than using canonical category slug. Category “Explorez aussi” is generic. Article/product/category cluster coverage has not been measured.
- **Root cause:** Relationships are composed ad hoc rather than from canonical entity data and keyword ownership.
- **Files affected:** navigation, PDP/category/brand/article components and schema builders; content relationship queries.
- **DB affected:** ArticleProduct/Brand/Concern relationships and category/brand IDs.
- **Risk:** Weak topical clusters and potentially wrong breadcrumb URLs.
- **Proposed fix:** Use canonical slugs/parents; align visible breadcrumbs and JSON-LD; add restrained contextually relevant links among products, categories, brands, and genuine guides.
- **Verification:** crawler link graph, breadcrumb parity tests, no schema/UI mismatch.
- **Status:** Partially confirmed.

### [ ] P1-11 — Create `SEO_KEYWORD_MAP.md` from evidence

- **Issue:** No single intent-to-page ownership register exists.
- **Evidence:** Confirmed homepage/shop overlap and broad commercial category set; no reliable ranking/search-volume evidence is currently connected.
- **Root cause:** Metadata/content grew route by route.
- **Files affected:** new `SEO_KEYWORD_MAP.md`; metadata/content changes it drives.
- **DB affected:** Category/product/brand/article SEO metadata as applicable.
- **Risk:** Cannibalization and low-priority page creation.
- **Proposed fix:** Map all requested keywords to current/target URLs using live SERPs and Search Console only if accessible; label rankings unavailable rather than fabricate.
- **Verification:** one primary intent per page; every new landing page justified by inventory and differentiated value.
- **Status:** Pending.

---

## P2 — Medium Priority

### [ ] P2-1 — Evaluate only justified new commercial landing pages

- **Issue:** `/nutrition-sportive`, `/complements-alimentaires`, `/whey-isolate`, and `/magnesium` already exist as DB categories, but quality/intent differentiation is unverified; `/vitamine-d3-k2` does not have an audited dedicated category.
- **Evidence:** Inventory counts: nutrition sportive 74 (8 in stock), complements 99 (2), whey isolate 51 (2), magnesium 185 (4). Counts alone do not establish relevance or demand.
- **Root cause:** Imported category breadth is not equivalent to a curated SEO landing.
- **Files affected:** category template/data/content and navigation only after validation.
- **DB affected:** Category SEO fields and product assignments.
- **Risk:** Thin/cannibalizing pages if created automatically.
- **Proposed fix:** Validate intent, relevant inventory, content uniqueness, and category accuracy before enhancing or creating any page.
- **Verification:** keyword map + inventory review + distinct metadata/content + production index policy.
- **Status:** Pending.

### [ ] P2-2 — Implement a thin-category indexability policy

- **Issue:** One-product categories (`eaa`, `beta-alanine`, `citrulline`, `boosters-hormonaux`) are all indexable and submitted.
- **Evidence:** Production DB has four categories with exactly one product, all marked indexable.
- **Root cause:** Category indexability defaults to true without value thresholds/manual override rules.
- **Files affected:** eligibility evaluator, sitemap, category metadata/admin.
- **DB affected:** `Category.indexable` and SEO review fields if added.
- **Risk:** Thin pages and crawl dilution.
- **Proposed fix:** Use a review policy (normally noindex at 0–2 relevant products, manual evaluation at 3–5, eligible candidate at 5+ with useful content), allowing documented exceptions for genuine demand/value.
- **Verification:** category report with rationale and live robots/sitemap state.
- **Status:** Confirmed.

### [ ] P2-3 — Centralize structured data builders and validate semantic accuracy

- **Issue:** JSON-LD is assembled independently in many pages; fake reviews and inaccurate/global claims can leak into schema.
- **Evidence:** PDP constructs Product/Offer/Review inline; root constructs OnlineStore/Pharmacy/WebSite; sampled pages contain multiple scripts; global schema says credit card is accepted although architecture states COD-only.
- **Root cause:** No typed schema builder/validation layer.
- **Files affected:** shared SEO/schema utilities; layout, PDP, category, brand, article, shop routes; tests.
- **DB affected:** Source entity data only.
- **Risk:** Rich-result invalidation and factual mismatch.
- **Proposed fix:** Typed builders for Organization/WebSite/Breadcrumb/Product/Offer/Article/FAQ; include only visible, supported facts; correct payment/availability mapping; remove review schema until eligible.
- **Verification:** JSON parse/schema assertions, Rich Results validation where available, visible-content parity.
- **Status:** Confirmed.

### [ ] P2-4 — Centralize metadata builders

- **Issue:** Titles, canonicals, robots, OG and Twitter metadata are duplicated across routes.
- **Evidence:** Duplicate branding and inconsistent absolute/template patterns are live.
- **Root cause:** Route-local metadata implementation.
- **Files affected:** new SEO helpers and all route metadata.
- **DB affected:** Existing override fields remain supported with validation.
- **Risk:** Recurring regressions.
- **Proposed fix:** Add `buildCanonical`, product/category/brand/article metadata builders, title normalization, robots policy, and OG defaults.
- **Verification:** unit tests and crawl matrix.
- **Status:** Pending.

### [ ] P2-5 — Audit articles and build restrained topic clusters

- **Issue:** Twenty articles include sports/wellness topics; older redirects and medical claims suggest topic drift and potential generated-content quality issues.
- **Evidence:** Production has 20 articles; redirects map legacy skincare URLs to unrelated or generic destinations; article seed/sync copy includes fat-burning claims.
- **Root cause:** Editorial direction changed without complete content consolidation/provenance review.
- **Files affected:** article routes/renderers, content sync scripts, redirects, internal links.
- **DB affected:** `Article`, `ArticleFaq`, article joins.
- **Risk:** Cannibalization, unsupported YMYL content, irrelevant redirects.
- **Proposed fix:** Inventory intent, authorship, duplication, claims, links, and performance; improve/consolidate useful content; do not mass-generate articles.
- **Verification:** article audit table and production crawl.
- **Status:** Pending.

### [ ] P2-6 — Measure and improve Core Web Vitals bottlenecks

- **Issue:** Server-rendered HTML is unusually large on category pages (sampled Whey ~835 KB; Créatine ~742 KB) and global third-party scripts load on every route.
- **Evidence:** Sample HTML sizes and always-on Meta/Google scripts; category templates can render up to 100 product cards; no current field/Lighthouse baseline captured. In-app browser is unavailable for interactive measurement.
- **Root cause:** Large SSR payloads/product lists and global tracking architecture; actual LCP/CLS/INP causes require measurement.
- **Files affected:** route/component boundaries, pagination, images, analytics loading, fonts/caching.
- **DB affected:** None.
- **Risk:** Slower mobile UX and crawl/render cost.
- **Proposed fix:** Capture PageSpeed/Lighthouse/field data first, then optimize measured bottlenecks without damaging commerce tracking.
- **Verification:** before/after results for requested route set, build output, and ecommerce regression tests.
- **Status:** Baseline partially confirmed; metrics pending.

### [ ] P2-7 — Define SSR/ISR/cache freshness by route and data type

- **Issue:** Major routes use `force-dynamic`/`no-store`; catalogue availability needs freshness, but SEO shells and taxonomies could use controlled caching.
- **Evidence:** Homepage/shop and API client disable caching; brand directory is client-only; category/PDP perform multiple API calls including broad product fetches.
- **Root cause:** Reliability fixes accumulated without a route-level caching strategy.
- **Files affected:** Next routes/API client, cache tags/revalidation hooks, mutation endpoints.
- **DB affected:** Updated timestamps and publish events.
- **Risk:** Slow TTFB and high backend load versus stale stock/price if over-cached.
- **Proposed fix:** Cache stable entity/content shells, keep price/availability appropriately fresh, and revalidate by tag after admin mutations/imports.
- **Verification:** header/timing/freshness tests after changes.
- **Status:** Pending.

### [ ] P2-8 — Build product-data quality reporting/admin support

- **Issue:** There is no consolidated report for missing, duplicate, suspicious, external, unsafe, or noindex product data.
- **Evidence:** Existing SEO score does not prevent 4,773 products from indexing; confirmed duplicates/hotlinks/taxonomy/raw Markdown issues.
- **Root cause:** Import and SEO completeness metrics are not a full data-quality policy.
- **Files affected:** backend quality service/controller, admin page/components, shared types, audit tests.
- **DB affected:** Product quality fields if persisted; source tables.
- **Risk:** Remediation will regress on future imports.
- **Proposed fix:** Detect and expose requested issue classes with score, issue codes, eligibility decision, and review timestamp; provide safe filters/actions.
- **Verification:** seeded fixtures and production aggregate counts; admin display agrees with evaluator.
- **Status:** Pending.

### [ ] P2-9 — Protect every import path with quality and approval gates

- **Issue:** Future imports can publish/index low-quality records and generated Markdown by default.
- **Evidence:** All 4,773 products are published/indexable; bulk catalogue includes 4,667 unavailable items, raw Markdown, taxonomy errors, and external images. Multiple CLI/seed pathways exist.
- **Root cause:** No single normalized import transaction enforces dedupe, classification confidence, data quality, SEO eligibility, and approval.
- **Files affected:** import service/CLIs, catalogue create/update defaults, media and SEO generators, tests.
- **DB affected:** Product, ImportedProduct, mappings, SEO logs, media.
- **Risk:** Recurrent index bloat and fabricated facts/claims.
- **Proposed fix:** Enforce scrape→normalize→dedupe→classify→quality→import→default noindex→approval; unknown remains unknown; prohibit review generation and unsupported factual invention.
- **Verification:** import fixture suite and dry-run report; low-quality fixture cannot become indexable automatically.
- **Status:** Confirmed.

### [ ] P2-10 — Audit navigation discoverability without menu overload

- **Issue:** Major categories are globally linked, but hierarchy does not clearly separate nutrition sportive from general supplements and some labels contain aggressive claims.
- **Evidence:** Navigation exposes core categories within one level; requested hubs exist in DB but are not explicit top-level semantic groupings.
- **Root cause:** Flat navigation evolved around current campaigns.
- **Files affected:** navigation data, header mega-menu, footer, homepage category modules.
- **DB affected:** NavigationItem if adopted as source of truth.
- **Risk:** Ambiguous topical architecture.
- **Proposed fix:** Align concise menu groups to validated keyword map/inventory; keep key pages within few clicks; remove unsupported wording.
- **Verification:** internal-link depth report and responsive navigation regression.
- **Status:** Pending.

### [ ] P2-11 — Complete search-engine indexability report and automated validator

- **Issue:** No current consolidated report covers status, canonical, robots, sitemap, H1, title, description, schema, word count, and links.
- **Evidence:** Initial samples already found template-level defects.
- **Root cause:** SEO checks are manual and fragmented.
- **Files affected:** new read-only audit script and CI/report artifacts.
- **DB affected:** None, read-only.
- **Risk:** Regressions escape deployment.
- **Proposed fix:** Build a rate-limited validator across URL types and sampled/all eligible products; fail CI only on deterministic critical rules.
- **Verification:** reproducible report before and after remediation.
- **Status:** Pending.

### [ ] P2-12 — Verify Tunisia/local signals without doorway pages

- **Issue:** Tunisia terms and delivery coverage are prominent, but NAP/business eligibility and French/Arabic strategy are unverified.
- **Evidence:** Homepage targets Tunisia and claims 24-governorate delivery; business registration/location data has not been verified.
- **Root cause:** Local marketing copy is not tied to an authoritative NAP profile.
- **Files affected:** Organization schema, contact/about/legal/footer/local copy.
- **DB affected:** None unless settings are introduced.
- **Risk:** Inconsistent local trust signals; doorway-page temptation.
- **Proposed fix:** Validate actual NAP and Google Business Profile eligibility; keep one truthful national footprint; do not create duplicated city pages.
- **Verification:** NAP consistency checklist.
- **Status:** Pending external business facts.

---

## P3 — Long Term

### [ ] P3-1 — Connect Search Console and analytics SEO measurement

- **Issue:** Rankings, impressions, CTR, organic revenue, and index coverage cannot currently be proven from connected first-party search data.
- **Evidence:** No Search Console connector/data was available during baseline.
- **Root cause:** Measurement access/workflow not established.
- **Files affected:** Reporting documentation/dashboards only if authorized.
- **DB affected:** Optional aggregate reporting, never raw credentials.
- **Risk:** Priorities based on assumptions.
- **Proposed fix:** Connect verified GSC property, annotate deployment, track qualified clicks/conversions by landing page and query.
- **Verification:** reproducible 28-day baseline and post-release comparison.
- **Status:** Pending access.

### [ ] P3-2 — Build a 90-day evidence-led content cluster roadmap

- **Issue:** Requested commercial/informational keywords need a sustainable content plan, not mass generation.
- **Evidence:** Existing 20-article corpus and category architecture provide a base; performance/query gaps are not yet measured.
- **Root cause:** Content was created tactically.
- **Files affected:** roadmap/report; future editorial content.
- **DB affected:** Future Article records only after approval.
- **Risk:** Thin AI content and cannibalization.
- **Proposed fix:** Prioritize clusters from GSC/SERP/inventory evidence; define author/reviewer/source requirements and update cadence.
- **Verification:** approved roadmap with one owner page per intent and quality brief.
- **Status:** Pending P1/P3 measurement.

### [ ] P3-3 — Establish genuine authority and digital PR program

- **Issue:** Technical remediation alone will not establish off-site authority in a competitive YMYL market.
- **Evidence:** Backlink/brand-mention profile not audited in this pass.
- **Root cause:** Out of current code scope.
- **Files affected:** None initially.
- **DB affected:** None.
- **Risk:** Ranking ceiling despite technical improvements.
- **Proposed fix:** Pursue genuine supplier/manufacturer citations, useful original resources, partnerships, and earned mentions; prohibit paid/fake link schemes.
- **Verification:** Search Console links/mentions and qualified referral/organic outcomes.
- **Status:** Pending.

### [ ] P3-4 — Add recurring SEO/data-quality release gates

- **Issue:** Current lint and API tests already fail, and SEO/data regressions reached production.
- **Evidence:** Baseline: API tests 9 suites passed/3 failed (63 tests passed/4 failed); storefront/admin lint fail with existing React/TypeScript issues.
- **Root cause:** Deployment workflow does not run repository-wide quality gates before resetting/building production.
- **Files affected:** CI workflow, package scripts, SEO validator, test suites.
- **DB affected:** None.
- **Risk:** Repeat incidents and unsafe deploys.
- **Proposed fix:** Restore green baseline, add deterministic build/test/lint/SEO checks, migration review, backup verification, and post-deploy smoke checks.
- **Verification:** branch protection/CI run is green and blocks a known-bad fixture.
- **Status:** Pending.

---

## Execution log

### 2026-09-03 — Initial audit/TODO baseline

- **What was wrong:** Confirmed synthetic verified reviews, universal product indexability, oversized sitemap, www duplicate host, client-only brand directory, taxonomy pollution, generic skincare product template, raw Markdown, duplicate title branding, non-crawlable pagination, hotlinked media, and unsupported YMYL/trust claims.
- **Root cause:** Recorded per task above.
- **What was changed:** This master TODO only. No application or production data changed.
- **Files changed:** `SEO_REMEDIATION_TODO.md`.
- **DB changes:** None.
- **How tested:** Read-only repository inspection, production HTTP/header/HTML inspection, production PostgreSQL aggregate/forensic queries, container health inspection.
- **Result:** Baseline established. Next mandatory step is remediation branch creation followed by verified production backup before P0-1 changes.
