# TODO.md — ParaTunisie SEO & commerce programme

Status as of **2026-11-16**. Single place to see what is done, what remains and what only you can decide.
Detail per batch: `TASKS.md` (§14–§24) and `docs/seo/`. Rule used everywhere: **no ranking or traffic claim until Search Console confirms it.**

## 0. Where we are (verified numbers)

| Area | Before | Now |
|---|---|---|
| Indexable products in the sitemap | 169 (start of Batch 4) | **312** (319 minus 7 hormone-related set to noindex) |
| Product structured data (Product + Offer) | 0 / 312 valid | **312 / 312 valid** (local validator; GTIN absent everywhere) |
| Admin product SEO scores | endless "Chargement des scores…" (31 MB payload, 7.6 s, +583 MB RAM) | **25-row page in 36 ms warm**, all 11,895 scores refreshed in 15 s |
| Verified purchasable products (real stock, not machines, not placeholder 100/500+) | admin card said "21" (it counted 25 rows) | **96** (164 have stock; 34 are placeholder 100, 33 are gym machines) |
| SEO score of those 96 products | avg 83 | **avg 97**, none below 70 |
| Category SEO score (51) | avg ≈ 29, capped at 55 by design | **avg 88**, none below 50, 12 at 100 |
| Indexable brand pages | 211 (≈205 empty or ineligible) | **43** (12 Tier A + 31 Tier B), 0 ineligible |
| Regression suite (`npm run seo:check`) | 439 | **807 / 807** |
| Order price integrity | client-sent price trusted | **server-priced** (tampered / negative / wrong-variant carts rejected) |
| Authentic reviews in production | 0 approved (2,500 synthetic, all rejected) | **0** — collection system built, see §2 |

## 1. ✅ Done

### Recovery & hygiene (Batches 1–4)
- [x] Quality gate for products (`product-seo-quality.ts`): thin text, duplicates, hotlinked images, absolute claims, restricted substances
- [x] Typos/brand fixes, Wave 1 (60) and Wave 2 (142) product indexation with rollback tables
- [x] 7 verified 301 redirects, legacy third-party `og:image`/canonical leaks fixed, noindex inventory
- [x] Search Console tooling via service account (`ops/seo/gsc-*.cjs`), sitemap resubmission, weekly report (`weekly_report.py`)

### Content, categories, brands (Batches 5–8, 10)
- [x] Original French category guides: vitamines, magnésium, oméga-3, zinc, complements-alimentaires, nutrition-sportive, whey-isolate, eaa, acides-aminés, BCAA, gainers, pre-workout
- [x] **Flagship `/creatine`** (1,780-word guide, live price-per-100 g comparison, FAQ, health wording tied to EFSA/ISSN) and **`/whey-proteine`** (same method)
- [x] **`/magnesium`** deepened (claim-free, EFSA/SCF 250 mg limit), **`/collagene`** upgraded and **made indexable** (6 indexable products, 2 in stock), `/probiotiques` copy written (kept noindex: 0 in stock)
- [x] New category layout: readable guide section with table of contents, FAQ separated (no more duplicate FAQ), jump links, live comparison table (excludes packs and noindex products, marks ties, never a single arbitrary "winner")
- [x] Brand engine (tiers A/B/C, dry-run/apply, backups, duplicate detection, score /10) and 4 → 43 indexable brand pages with factual copy; neutral metadata (no "official distributor" wording)
- [x] Homepage "À LA UNE — petits prix par catégorie" (10 categories, real variant price = cart price, honest "lowest price" label)
- [x] Wave 3 (18 products) with canary; 7 hormone-related products set to noindex (owner rule)
- [x] Internal link crawl: 176 pages / 1,893 links / 0 broken

### Admin & data integrity (Batch 9)
- [x] **Root cause of the scores bug** found and fixed (whole-catalogue report per page load; no timeout; O(n²) bulk action) → paginated scoring, persisted scores, indexed filters/sort
- [x] Resumable background jobs (progress, cancel, retry failures, CSV export, rollback) for score refresh and the product optimizer (gap-filling only, dry-run required before apply, 500 cap, backup table)
- [x] True stock statistics in the admin (the old cards counted only the 25 visible rows)
- [x] Filters by availability, indexation, score band; sort by score
- [x] Category scoring evidence fixed (9 of 20 checks were unreachable) + gap-filling category optimizer (46 categories completed)
- [x] Product JSON-LD fixed: plain-text description (was Markdown on 312/312 pages), no slug-as-SKU, **no fabricated review text/author**
- [x] **Order-price vulnerability fixed and proven** (server-authoritative pricing, stock and quantity checks, shipping computed server-side)
- [x] Guides/rewrites 2026-11-16: `/ashwagandha` (replaced unsupported health claims), `/accessoires` (was a 437-char stub), `/whey-hydrolysee` (new, now indexable: 3 products in stock)
- [x] `docs/seo/RANKING_BASELINE.md` (Search Console baseline by keyword group), `MEDICAL_CLAIMS_SAMPLE.md` (45 flagged high-demand products), `GOOGLE_INDEXING_RECOVERY.md`
- [x] Guides for `/whey-isolate`, `/vitamines`, `/omega-3` (claim-free, label reading, cost per day, precautions)
- [x] Review collection system: private per-order-line links, verified flag only through them, spam screening, moderation history, public form `/avis/<token>` (noindex), staff panel; legacy open endpoint can no longer grant "verified"

### Tooling added (all in `ops/`)
`seo-regression.cjs` · `link-check.py` · `product-schema-audit.cjs` · `category-page-check.cjs` · `tracking-e2e.cjs` · `cache-check.cjs` · `lighthouse-bench.sh` · `serp_snapshot.py` · `wave3-audit.cjs` · `brand-seo-run.cjs` · `run-job.cjs` · `measure-scores.cjs` · `verify-order-pricing.cjs` · `ops/qa/home-cheapest-e2e.cjs`

## 2. 🔧 Remaining work (ranked by SEO / commercial impact)

### A. Needs nothing from you — I can do next
1. [x] `/bcaa`, `/pre-workout`, `/gainers-proteines` deepened 2026-11-16 (720–800 words, comparison table, EFSA caffeine reference, FAQ, links; backup `_wave_backup_cat_batch10c`). *(`/whey-isolate`, `/vitamines`, `/omega-3` done 2026-11-16: 720–825-word claim-free guides, FAQ, product links, backup `_wave_backup_cat_batch10b`; category check all green)*
2. [ ] **Categories with no original guide (33)**: write guides only where products + demand justify it (candidates: plantes-et-herbes, immunité, sommeil-stress, minéraux, antioxydants, articulations, digestion, accessoires); keep the rest noindex
3. [ ] **Wave 3b**: 35 Tier-2 products (1 impression each) after Google responds to Wave 3
4. [ ] (list of the 21 logo-less brands now in `docs/seo/BRAND_LOGOS_MISSING.md`) **Brand "potential" flag in admin** (e.g. ABE 17 and ALLMAX 29 products: all on order, flavour duplicates, 0 demand — correctly Tier C today; they need a product wave first)
5. [ ] **Category/brand/homepage internal links**: add `/creatine`, `/whey-proteine` flagship links from related hubs and guides; link brands from category pages
6. [x] **GTIN/EAN/MPN** optional fields built and deployed 2026-11-16 (DB columns, GS1 check-digit validation, admin form, JSON-LD `gtin8/12/13/14` + `mpn` only when valid). All 312 pages still have none: values must be entered by a human from the packaging/supplier
7. [ ] Weekly report + URL Inspection **7–14 days after the last deploy** (compare equal windows; baseline in `docs/seo/CATEGORY_BASELINE.json`)
8. [ ] Refresh competitor snapshots monthly (`serp_snapshot.py`); add magnésium / vitamines / BCAA snapshots
9. [ ] Click-through test of the admin UI (login required) — builds, typechecks and endpoints are verified, the screens were not clicked

### B. Needs an action from you
1. [ ] **Search Console → request indexing** for: `/creatine`, `/whey-proteine`, `/magnesium`, `/collagene`, `/whey-isolate`, `/bcaa`, `/pre-workout`, `/gainers-proteines`, the 4 new brand pages, and a few Wave-3 products
2. [ ] **Reviews**: staff prepare links (Admin → Avis → "Inviter un acheteur vérifié") only for customers who agreed to be contacted. Ceiling today: **12 shipped orders**, so "20 reviews per product" cannot be reached from existing customers; it grows with real sales
3. [ ] **Official validators**: run Google Rich Results Test and Schema.org Validator on `/produits/micronised-creatine-optimum-nutrition-317g` and `/creatine` (my validator is a local rule check, not Google's tool)
4. [ ] Upload **real logos** for the 21 brand pages scoring 8/10 (the missing points are logo + social image)

### C. Blocked — your decision or data needed
- [ ] **Gold Standard price conflict**: 17 flavour pages at 587 DT vs the indexed 2.27 kg at 379 DT (908 g at 155 DT vs 332 DT). Which price is right? (17 products held back)
- [ ] **27 gym machines**: prices not verified → excluded from the homepage module, comparison and waves
- [ ] **34 products with stock exactly 100** (and 6 at 500+): placeholder counts? real quantities needed
- [ ] **MK-677 and other hormone-related products**: legality review (they stay noindex)
- [ ] **11 held Wave-2 products** (2 prices, 2 claims, 7 medical-claim reviews)
- [ ] **~3,300 products with medical wording**: human review (I can prepare a 50-product sample ranked by demand)
- [ ] **On-order semantics**: keep "Demander ce produit" + schema `OutOfStock`, or define real BackOrder with dates?
- [x] **`protein.tn`**: decided by owner 2026-11-16 — separate site, independent SEO, no merge/canonical consolidation/copied content. URL Inspection (11-16) shows Google canonical = our own URL for /acides-amines, /eaa, /whey-isolate (`docs/seo/GOOGLE_INDEXING_RECOVERY.md`)
- [ ] **`/probiotiques`**: stays noindex until at least one product is really in stock
- [ ] Variant labels that contradict names (`6l` on 90 tablets, `2 g` on 90 softgels): data fix by you or a supplier file

## 3. ⏸ Deferred by your decision (documented, not to be raised again)
Malaysia VPS / hosting location · Cloudflare (currently **DNS-only**, not proxying) · DNS · CDN · nginx · production caching (code is local, behind build-time flags; do **not** ship the web image from git without removing them) · Meta Pixel / Google Ads deferral (tested locally). Analyses: `docs/seo/INFRASTRUCTURE_COMPARISON.md`, `CACHING_PLAN.md`, `TRACKING_OPTIMIZATION.md`.

## 4. 🔁 Recurring
- Weekly: `python ops/seo/weekly_report.py` · `npm run seo:check` · `node ops/seo/product-schema-audit.cjs` · `node ops/seo/category-page-check.cjs`
- After any catalogue import: `python ops/seo/link-check.py` and the admin "Recalculer tous les scores" job
- Monthly: competitor snapshots; review Tier B brands whose products are all on order

## 5. Rollback quick reference
Images: `paratunisie-prod-paratunisie-{web,api,admin}:pre-batch8 | pre-batch9 | pre-batch10 | pre-reviews`.
Database dump before Batch 9: `/root/paratunisie-backups/db-pre-batch9-20261115.dump`. Backup tables (restore with the SQL in each job / `docs/seo/ROLLBACK.md`): `_backup_brand_seo_*`, `_backup_product_seo_20261115231227k14x`, `_backup_category_seo_20261115232921`, `_backup_category_seo_20261115233220`, `_wave_backup_cat_flagship`, `_wave_backup_cat_whey`, `_wave_backup_cat_collagene`, `_wave_backup_cat_magnesium`, `_wave_backup_hormone_noindex`, `_wave_backup_wave3`.

---

# Archive — original sprint checklist (unchanged)

## Sprint checklist (original)

Mirrors `SPRINTS.md`. Check items off as completed; keep in sync with `PROGRESS.md`. Do not check an item without having verified it (`CLAUDE.md` §22).

## Sprint 0 — Documentation & setup

- [x] CLAUDE.md
- [x] REQUIREMENTS.md
- [x] DESIGN_SYSTEM.md
- [x] UX.md
- [x] SEO.md
- [x] ARCHITECTURE.md
- [x] DATA_MODEL.md
- [x] API.md
- [x] SECURITY.md
- [x] PERFORMANCE.md
- [x] ACCESSIBILITY.md
- [x] TESTING.md
- [x] DEPLOYMENT.md
- [x] SPRINTS.md
- [x] TODO.md
- [x] PROGRESS.md
- [x] DECISIONS.md
- [x] Git repo situation resolved with user (fresh `git init` scoped to parapharmacie — DECISIONS.md D-0001)
- [x] .gitignore added
- [x] shadcn MCP configured (DECISIONS.md D-0005)
- [x] 21st.dev MCP configured, API key stored as env var only (DECISIONS.md D-0006)
- [x] Higgsfield CLI installed (not yet authenticated — user action needed)
- [x] Higgsfield companion skills installed + manually risk-reviewed (DECISIONS.md D-0007)
- [x] Emil Kowalski skills re-verified intact
- [ ] Restart Claude Code; verify shadcn + 21st MCP connected via `/mcp`
- [ ] User completes `higgsfield auth login` (browser OAuth)
- [x] User sign-off to proceed to Sprint 1

## Sprint 1 — Global shell

- [x] Next.js + TS + Tailwind + shadcn scaffold
- [x] Design tokens locked (color/type/spacing/motion) in Tailwind config
- [x] Header (desktop + mobile)
- [x] Mega-menu
- [x] Mobile navigation: five-item bottom tab bar (drawer removed per D-0010)
- [x] Footer
- [x] Motion system foundation + reduced-motion handling

## Sprint 2 — Homepage

- [x] Announcement bar
- [x] Hero
- [x] Shop by concern
- [x] Best sellers
- [x] Routine/diagnostic editorial section
- [x] Brand universe
- [x] Editorial campaigns
- [x] Expert recommendations
- [x] Advice articles teaser
- [x] Trust / social-proof section without fabricated testimonials or metrics
- [x] Newsletter / loyalty teaser
- [x] WhatsApp / expert entry point
- [x] Footer (final structure and content; WhatsApp uses the safe help fallback until its business number is configured)
- [x] Quality Bar self-review pass

## Sprint 3 — Search, PLP, filters, cards

- [x] Search overlay + live suggestions
- [x] PLP template (sort, filters, breadcrumb, SEO intro)
- [x] Mobile filter bottom sheet
- [x] Product card component
- [x] Category pages (`/visage`, `/corps`, `/cheveux`, `/solaire` + empty hygiene/complements/homme/bebe-maman)
- [x] Besoins index (`/besoins`) + concern detail pages (`/besoins/[slug]`)
- [x] Category PLP: subcategory chips, concern chips, desktop sidebar, mobile filter sheet, search-within-category, sort
- [x] Concern PLP: brand/skin-type/price filters, sort, search, mobile filter sheet
- [x] Server/client boundary: serializable `CategoryData`, `subcategoryMap`, `concernMap` passed from server; `ProductSummary` used as prop type

## Sprint 4 — PDP

- [x] Gallery + zoom (single real image per product + lightbox; see DECISIONS.md D-0012 on why not a fake multi-angle gallery)
- [x] Variant/size selection
- [x] Price/reassurance block (no promo/discount data exists — none fabricated)
- [x] Description/benefits/usage/composition(honest deferred)/livraison/avis(honest empty state) tabs
- [x] Commerce rails: routine completion, similar, recently viewed (no "frequently bought together" — DECISIONS.md D-0012)
- [x] Mobile sticky add-to-cart bar
- [x] Navbar logo (DECISIONS.md D-0013)

## Sprint 5 — Cart, checkout, confirmation

- [x] Cart drawer
- [x] Cart page
- [x] Free-delivery progress indicator
- [x] Checkout flow (address, delivery, Cash on Delivery confirmation — no online payment)
- [x] Order confirmation screen

## Sprint 6 — Routine diagnostic

- [x] Multi-step flow UI
- [x] Recommendation output (AM/PM + rationale)
- [x] Disclaimer
- [x] Save/share/email actions

### Diagnostic — real engine rebuild (2026-08-14, D-0029)

The Sprint 6 checklist above described the UI shell; the engine behind it was a hardcoded 16-product mock until this pass. Now real:

- [x] Real NestJS `diagnostic` module — DB-backed session/answers/result/alternatives/adjust-budget
- [x] Zero hardcoded product recommendations (`src/lib/data/diagnostic.ts` deleted)
- [x] AI-ranked recommendations over real Postgres candidates (`CatalogueService.findForRecommendation` → `OpenAiRecommendationProvider`), never a manually-maintained need→category mapping
- [x] Keyword fallback (in-code, not admin-editable) when no AI key is configured
- [x] Hard backend validation — every recommended `productId` re-verified against Postgres before the response
- [x] Budget respected as a routine total (bug found + fixed via real-data testing, see `PROGRESS.md` 2026-08-14)
- [x] Admin-manageable questions (`DiagnosticQuestion`/`DiagnosticOption`, seeded via standalone `seed-diagnostic-questions.ts`)
- [ ] Photo/vision analysis (`DiagnosticPhoto` schema exists; needs a real `OPENAI_API_KEY` with vision support before any provider work can be verified live — do not fake this, per project rule)
- [ ] Admin UI: question management screen, AI status/usage panel, diagnostic analytics (no mapping-management screen — intentionally not applicable anymore, D-0029)
- [ ] Real customer auth/session system — `POST /diagnostic/session/:id/save` doesn't exist yet because there's nowhere real to attach a saved routine to (see D-0029); "Enregistrer" stays `localStorage`-only until that lands

## Sprint 7 — Brands, editorial, advice

- [x] /marques index
- [x] /marques/[slug]
- [x] /marques redesign: search (accent-insensitive), alphabet nav, featured "Marques iconiques", universe discovery, compact brand directory
- [x] Brand detail page: search-within-brand (`BrandProducts` component)
- [x] /conseils index
- [x] /conseils/[slug] template + seed articles
- [x] Homepage hero premium animation enhancement

## Sprint 8 — Account, wishlist, loyalty

- [x] Account shell
- [x] Wishlist (local storage) wired sitewide
- [x] Loyalty presentation page

## Sprint 9 — Backend foundation

- [x] Monorepo restructure
- [x] Prisma schema from DATA_MODEL.md
- [x] NestJS modules per API.md
- [x] Repository interfaces defined
- [x] Frontend swapped to real API repositories
- [x] SQLite database seeded with catalogue data (16 products, 11 brands, 4 categories, 7 concerns, 6 articles)
- [x] API client with graceful fallback to local data when backend is unreachable
- [x] Server pages fetch from API; client components receive data as props

## Sprint 10+ — Real commerce modules

- [x] Search service interface (Meilisearch ready)
- [x] Payment service interface (COD only)
- [ ] Real reviews (pending backend)
- [ ] Loyalty ledger (pending backend)
- [ ] Observability
- [ ] Production deployment

## Admin / ERP Phase (Sprint 11+) — requirements locked in REQUIREMENTS.md/DATA_MODEL.md/API.md

- [x] Admin 1 — Shell + dashboard + all 17 pages (commandes, produits, marques, categories, clients, livraisons, articles, promotions, stocks + stubs)
- [x] Admin 1 refined — brand-aligned visual identity, product drawer with margin calc, toasts, modals, drawer system, unsaved changes protection, responsive table, row actions
- [x] Admin 2 — Order management + confirmation workflow (state machine, contact attempts, funnel reporting)
- [x] Admin 3 — Products + pricing + supplier costs (margin formulas wired to real data)
- [x] Admin 4 — Inventory + stock movements + batches/expiry
- [x] Admin 5 — Suppliers + purchasing (purchase price history) — completed in Admin 3
- [x] Admin 6 — Analytics + profitability (costing-strategy decision implemented)
- [x] Admin 7 — Returns + customer service
- [x] Admin 8 — Content + SEO admin

## Admin / Infra Phase 2 (SPRINT 11+) — production-grade admin + infrastructure (SPRINTS.md)

- [x] SPRINT A — Shared UI system + Admin redesign foundation (`packages/ui`)
- [x] SPRINT B — Dockerization + local infrastructure (compose + Dockerfiles + networks + PostgreSQL)
- [x] SPRINT C — MinIO media system (MediaModule, object naming, validation, asset seeding)
- [x] SPRINT D — Product management + media management (upload/reorder/primary/delete + marques & catégories complete management)
- [x] SPRINT E — Storefront CMS/content management (Unified Articles/Conseils model, Nest REST API, 5-tab article drawer, SEO score chip, Client Régulier popover)
- [x] SPRINT E2 — Homepage E-Commerce Conversion Redesign & Merchandising CMS (18 structured high-conversion sections, Routine basket booster, /admin/page-accueil CMS, Manual/Auto/Hybrid merchandising)
- [x] SPRINT F — Admin dashboard analytics (KPIs, funnel, charts, alerts, `GET /reporting/dashboard/overview` aggregation endpoint)
- [~] SPRINT G — Orders operational workflow (this checkbox was wrongly marked done; corrected 2026-08-13 — see PROGRESS.md/D-0024. Only the guarded 11-status transition + `OrderStatusHistory` audit trail were built, scoped for SPRINT H's inventory hooks. Contact-attempt persistence, COD-by-courier/staff reporting, and the returns/SLA-aging queue remain open)
- [x] SPRINT H — Inventory + suppliers + purchasing (real data, weighted-average costing)
- [x] Admin simplification — Fournisseurs/Achats soft-hidden from nav (routes intact, D-0026); new `/admin/rentabilite` page (cost snapshot at CONFIRMEE, product/order-level gain, dashboard + order-drawer summaries)
- [x] Admin data-integrity fixes — canonical `GET /orders/counts` (sidebar/Commandes header can't drift again), `aggregateProfitability` zero-cost-fallback bug fixed (never coerces unknown cost to 0 → fake 100% margin, D-0027), order-context summary + "Toutes les commandes" filter + "Produits sans coût d'achat" on Rentabilité, real-time invalidation event bus (D-0028 notes the Docker staleness lesson)
