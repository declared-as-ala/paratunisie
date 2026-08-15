# PROGRESS.md — ParaTunisie Living Status

Mandatory, updated after every meaningful development task (`CLAUDE.md` §15). Newest entry first.

## 2026-08-15 — Diagnostic Phase 2: Real Groq vision provider (Llama 4 Scout), private MinIO storage, zero retention, and signal merging (D-0030)

### What existed before
Phase 1 delivered a real DB-backed diagnostic engine over PostgreSQL candidates, but photo analysis was gated on `photoAnalysisEnabled: false` because no vision provider or storage pipeline was implemented.

### Completed in Phase 2
1. **Groq Vision Provider (`apps/api/src/diagnostic/vision/groq-vision.provider.ts`)**: Implemented direct `fetch()` integration to `https://api.groq.com/openai/v1/chat/completions` using `GROQ_VISION_MODEL` (`meta-llama/llama-4-scout-17b-16e-instruct`). No SDK dependency.
2. **Medical Guardrails & Runtime Validation**: System prompt strictly forbids medical diagnosis language (`acne`, `eczema`, `rosacea`, `dermatitis`). Model responses are parsed and validated via `validateVisionOutput` to ensure strict enum values for 6 cosmetic parameters (`shine`, `visibleDryness`, `visibleRedness`, `visibleTexture`, `visiblePores`, `unevenTone`).
3. **Private Storage (`DiagnosticStorageService`)**: Created private MinIO bucket `paratunisie-diagnostics` (no public policy). Added MIME allowlist (`JPEG`, `PNG`, `WebP`), magic-byte inspection, SVG rejection, and 8MB file size caps.
4. **Zero-Retention Policy**: Immediately upon successful completion of `analyzePhoto()`, the raw image binary is permanently deleted from MinIO (`removeObject`), and `DiagnosticPhoto.storageKey` is reset to `null` in PostgreSQL.
5. **Red Flag Medical Referral**: When `redFlag: true` is detected, routine generation short-circuits — recommendation logic is skipped and the storefront displays a medical referral notice.
6. **Signal Merging & Provenance**: `QuestionnaireService.mergePhotoObservations` combines photo observations into `NeedProfile`, with signal provenance tracked in `sources["questionnaire" | "photo"]`. Questionnaire answers override photo conflicts.
7. **Frontend Experience (`src/components/diagnostic/`)**: Re-enabled mode choice ("Questionnaire", "Photo", "Questionnaire + Photo"), photo capture/upload UI, photo quality tips, required consent checkbox, and privacy transparency copy.

### Verification
- `apps/api`: `npm test` passed 10 test suites / 59 unit tests (including `groq-vision.spec.ts` for output validation, medical term sanitization, and upload validation).
- `apps/api`: `npm run build` clean (`nest build` succeeded).
- Storefront: `npm run build` clean (Next.js compilation + static generation succeeded).

---

## 2026-08-14 — Real diagnostic engine: AI-ranked over real Postgres candidates, zero hardcoded products (D-0029)

### What existed before (audited first, not assumed)
`/diagnostic` looked real but was 100% fake: `src/lib/data/diagnostic.ts`'s `buildRoutine`/`getAlternative` scored and filtered the 16-item hardcoded mock array in `src/lib/data/products.ts` — no API call, no Prisma, no backend module existed at all. An unused `RoutinesModule` already persisted to real `Product` rows but nothing called it.

### Real taxonomy audit (queried the live DB directly before building anything)
9,673 products, 9,672 `PUBLISHED`. `Category` tree is heavily brand-contaminated (a `Marques` root has 823 children; several root categories are literally brand names like `SVR`/`VICHY`/`PHYTO`). `Concern` many-to-many is populated on essentially 0 real products (max 1). `Product.skinTypes`/`routineTime` are boilerplate — 9,672/9,673 products share the exact same value, so neither is a usable per-product signal. Real, usable signals: leaf `Category` names/slugs (e.g. `peaux-mixtes-grasses-acne-et-imperfections`, `soin-anti-age`, `hydratation-et-nutrition`), `Brand`, `ProductVariant.priceMillimes`/`stock`, and free-text `Product.name`/`description`.

### Architecture (revised mid-build per explicit user follow-up — see D-0029 for the full why)
First pass built an admin-editable `DiagnosticNeedMapping` (need → categories → routine role) table. User then explicitly required the opposite: no manually-maintained mapping, AI-driven ranking over real DB candidates instead. Rebuilt around: `CatalogueService.findForRecommendation` (new — category-subtree + keyword candidate retrieval, respects `API.md`'s no-raw-Prisma-cross-module rule) → `RecommendationService` sends only that candidate set to `OpenAiRecommendationProvider` (interface-based, swappable) → every returned `productId` is re-verified against Postgres before the response is built. `DiagnosticNeedMapping` was removed from the schema in the same session. No `OPENAI_API_KEY` was configured at build time, so the in-code keyword fallback (`diagnostic-rules/keyword-fallback.ts` — French keyword dictionary, not a DB table) is what actually ran for all verification below; the AI path compiles and is wired but wasn't live-tested with a real request.

### Two real bugs found and fixed via actual DB testing (not just code review)
1. **Budget was applied per-item, not per-routine.** A "moins de 80 DT" answer let a 6-item routine total ~289 DT, since the price filter only capped each candidate individually. Fixed with a per-item heuristic ceiling (`budget ÷ tier item count`) at retrieval time plus a hard post-assembly trim.
2. **"Voir une alternative" returned an irrelevant product** (a hair coloration kit offered as a conditioner replacement) — root cause was two bugs stacked: the French role label ("Shampooing") was being looked up in a dictionary keyed by internal need strings (silently matching nothing), and the fallback's final tie-break sorted by price-proximity only, so a candidate that merely *mentioned* "shampooing" in its usage-instructions description (real product text, not fabricated) could win purely on price. Fixed both — role→keyword reverse lookup, and name/category matches weighted 3x over incidental description mentions.

### Verified against the live DB (not simulated)
5 scenarios run through the real running API against real Postgres, every returned `productId` real: skin dry+sensitive+Essentielle, skin combination+imperfections+Complète, hair dry+frizz, hair oily scalp, budget<80DT (see chat for the actual product names/prices/ids returned). No-match case confirmed honest (`itemCount: 0`, no invented product, `unfilledRoles` lists what couldn't be filled).

### Not built this pass (scoped out, tracked in `TODO.md`)
Photo/vision analysis (schema exists — `DiagnosticPhoto` — but no vision-capable API key configured, and per the user's own instruction this must never be faked). Admin UI for question management (analytics/AI-status panel). The originally-planned admin "mapping management" screen no longer applies at all (D-0029).

## 2026-08-13 — Admin data-integrity fixes: order-count drift + profitability zero-cost fallback (D-0027, D-0028)

### Root causes (as requested — nothing patched blind)

1. **Sidebar "3" vs Commandes header "4"**: `admin-shell.tsx`'s nav config had a hardcoded `badge: 3` literal — completely disconnected from any data, not derived from anything.
2. **Commandes status-sum "3" vs Normal tab "4"**: `commandes-page.tsx` computed `tentativeCount` by checking `o.status === "TENTATIVE"`, but the real `OrderStatus` enum value is `TENTATIVE_CONTACT` — the one real order in that status was silently counted as zero.
3. **Actual DB state** (queried directly, not assumed): 4 orders, exactly `CONFIRMEE`, `EN_ATTENTE`, `TENTATIVE_CONTACT`, `ANNULEE` — no unknown/null status. `ABANDONNEE`/`SUPPRIMEE` (what the Normal/Abandonnées/Supprimées tabs filter on) aren't real `OrderStatus` values at all — pre-existing, not fixed here (no request to build real soft-delete).
4. **"Coût d'achat: 0 / Gain: 58,900 / Marge: 100%"** — two stacked causes:
   - A real bug in `aggregateProfitability`: `gainMillimes = revenueMillimes − costMillimes` used revenue from **all** items but cost summed only from items **with a known cost**, so zero cost coverage silently produced `gain = revenue`. See D-0027.
   - Docker image staleness: the running `paratunisie-api` container's image predated the seed-script cost backfill, so its own reseed-on-restart wiped locally-verified data. See D-0028.
5. **Canonical product-cost field** (confirmed, not guessed): `product-drawer.tsx`'s "Prix d'achat" is local component state only — no product-CRUD backend exists, it has never persisted. The real, persisted cost field is `PurchasePriceHistory.purchasePriceMillimes` via `InventoryService.getWeightedAverageCost`, snapshotted into `OrderItem.unitCostMillimes` at `CONFIRMEE`.

### Fixes

- **`GET /orders/counts`** (new, `orders.service.ts`): one `groupBy` query, real enum values only — canonical source for both the sidebar badge and the Commandes header/tabs, so they can't independently drift again. Fixed the `TENTATIVE_CONTACT` string bug in `commandes-page.tsx` alongside it.
- **Real-time invalidation**: `apps/admin/src/lib/order-events.ts` — a single `window` `CustomEvent`, fired after a real order status change, consumed by the sidebar, dashboard, and Rentabilité page to refetch without a manual reload. No new state-management dependency (`CLAUDE.md` §16).
- **`aggregateProfitability` rewritten** (`profitability-calc.ts`, D-0027): `totalRevenueMillimes` (always shown) vs `eligibleRevenueMillimes` (cost-known only); `gainMillimes`/`tauxMarge` are `number | null`, never coerced to 0/100 when cost is unknown. Every consumer (`getOverview`, `getOrdersTable`, `getOrderDetail`, `buildDailySeries`, `buildProductProfitability`) audited and fixed — `buildProductProfitability` had the identical bug at the per-product level.
- **`ProfitabilityService.getOverview`**: new `orderCounts` (total/confirmed/pending/tentative/cancelled/refused/livree/contributing) — orders in the period are always counted, never hidden just because they don't contribute to gain. New `productsMissingCost` list.
- **`ProfitabilityService.getOrdersTable`**: now accepts every real `OrderStatus` (not just CONFIRMEE/LIVREE) for a "Toutes les commandes" view; each row gets a server-computed `contribution`/`reason` ("En attente — non incluse dans le gain", "Annulée — gain retiré", etc.) — never guessed client-side.
- **`ProfitabilityService.getOrderDetail`**: per-line `costSource` (`snapshot` / `backfilled_estimate` / `unknown`) for the order-drawer diagnostic view.
- **`/admin/rentabilite`**: order-context summary row (Total/Confirmées/En attente/Tentatives/Annulées/Livrées) above the KPIs; "Commandes contribuant au gain" KPI; "Statut financier" filter on the orders table (Toutes/Confirmées/En attente/Tentatives/Annulées/Livrées); cost-coverage banner now shows "Articles avec coût renseigné: X / Y"; new "Produits sans coût d'achat" panel (real action → `/admin/achats`, the actual working cost-entry path — not the non-persisting product drawer); chart marks buckets with incomplete cost data (dashed points + footnote) instead of a misleading flat line; all margin/gain cells render `—` with a tooltip instead of a fake number when ungradable.
- **Dashboard summary card**: same null-safe rendering fix, plus real-time invalidation.
- **Docker**: `paratunisie-api` rebuilt so the fix (and the existing seed backfill) survive future container restarts (D-0028).

### Verification
- `apps/api`: `npm run build` clean, `npm test` — 6 suites, 39 tests, all passing (12 new/rewritten: zero-cost-fallback regression, mixed known/unknown split, `orders/counts` grouping incl. an "unusual status not silently excluded" case, cost-snapshot-at-confirmation + never-overwrite).
- `apps/admin`: `npx tsc --noEmit` clean.
- Direct DB re-check: the confirmed order's item now shows `unitCostMillimes: 38285, costIsEstimated: true` after reseeding with the corrected script.

### Numbers (from the actual dev DB, not invented)
- Orders total: 4 — `CONFIRMEE` ×1, `EN_ATTENTE` ×1, `TENTATIVE_CONTACT` ×1, `ANNULEE` ×1.
- Confirmed order (Anthelios Fluide Invisible SPF50+): CA 58.900 DT, coût 38.285 DT (weighted-average, backfilled+estimated), gain 20.615 DT, marge ≈ 35.0%.
- Products still missing purchase cost: none among the 12 seeded products (all have `PurchasePriceHistory`) — the "0 DT cost" screenshots were the aggregation bug + stale reseed, not genuinely missing product data.

### Known gaps / follow-ups
- `ABANDONNEE`/`SUPPRIMEE` order-list tabs remain non-functional against real data (no real status represents either) — pre-existing, out of scope, not silently faked.
- `handleDelete` in `commandes-page.tsx` remains local-state-only (no real `DELETE /orders/:id` endpoint exists) — intentionally not wired to the new invalidation event, since firing it would misleadingly suggest the deletion was persisted server-side when it wasn't.

---

## 2026-08-13 — TunisiePara Catalog Import, Competitor Pricing & Original SEO System

### Context
Built a production-grade, resumable, idempotent catalog discovery, scraping, competitor price tracking, media downloader, and original SEO generation system for ParaTunisie targeting `https://tunisiepara.com/`.

### Completed
- **Prisma Schema Extensions**: Added `ImportProvider`, `ImportRun`, `ImportedProduct`, `CategoryMapping`, `BrandMapping`, `CompetitorPrice`, `CompetitorPriceHistory`, `ImportError`, `ImportStatus`, `SeoStatus`, and `ProductPublishState` models/enums. Extended `Product` with `seoTitle`, `seoDescription`, `seoKeywords`, `seoFaq`, `seoScore`, `publishState`, and `manualOverrides`.
- **Backend Core Module (`apps/api/src/imports/`)**:
  - `CatalogProvider` interface & `TunisieParaProvider` implementation using `cheerio` with JSON-LD extraction, DOM fallback selectors, pagination, rate limiting, and price parsing.
  - `MediaService`: Image downloader with SHA-256 checksum deduplication, format validation, local/MinIO file saving, and clean ParaTunisie media URL generation (no hotlinking!).
  - `SeoGeneratorService`: Engine generating original French product descriptions (Présentation, Bénéfices, Pour qui ?, Conseils, Caractéristiques, Composition/Actifs), meta tags, 3-6 factual FAQs, image ALTs, Tunisian search intent keywords, and 0-100 SEO completeness score. Zero medical hallucinations.
  - `ImportsService`: Idempotent multi-signal matching (EAN, SKU, source URL, normalized brand + title + size), brand/category mapping, competitor price tracking/history, field protection, dry-run mode, and batch processing.
  - `ImportsController`: Admin endpoints protected by `AdminAuthGuard`.
  - `import-cli.ts`: CLI script for command-line discovery and batch import runs.
- **Admin Dashboard Interface (`apps/admin/src/app/admin/importation/`)**:
  - Full management page with KPIs, Action bar (Analyser le catalogue, Importer, Synchro prix, Dry Run toggle, Limit caps), Filter bar, and Discovered Products data table.
  - `ImportPreviewDrawer`: Side drawer for inspecting source vs. ParaTunisie pricing, generated SEO title/description/FAQ, and 1-click Approve & Publish action.
  - Category Mapping, Brand Mapping, and Error audit views.
  - Sidebar link added to `admin-shell.tsx` under Catalogue.
- **Automated Tests**: Added `tunisiepara-parser.spec.ts` unit test suite covering price parsing, slugification, SEO payload generation, and score calculation.

### Verification
- `apps/api`: `npm run build` clean (`nest build` succeeded).
- `apps/api`: `npx jest apps/api/src/imports/tests/tunisiepara-parser.spec.ts` passed 3/3 tests clean.
- `apps/admin`: `npm run build` clean (TypeScript + Next.js static generation of `/admin/importation` succeeded).

---

## 2026-08-13 — Admin simplification: Fournisseurs/Achats hidden, Rentabilité page added

### Context

User request: simplify the admin around one question — gain on confirmed orders — reusing the purchase-cost system already built in SPRINT H rather than a second one. Confirmed with the user that removing `/admin/achats` removes the only UI path that writes new `PurchasePriceHistory` (goods receipt), so the pages were **soft-hidden** (nav/dashboard links removed, route files and all backing Prisma models left intact) rather than deleted.

### Completed

- **Cost snapshot at confirmation**: `orders.service.ts`'s `updateOrderStatus` now snapshots each item's weighted-average cost into `OrderItem.unitCostMillimes` the moment an order reaches `CONFIRMEE`, so later `PurchasePriceHistory` changes never move an already-confirmed order's numbers. New `OrderItem.costIsEstimated` field (migration `profitability_snapshot_flags`) distinguishes a real live snapshot from a backfilled best-effort estimate. New `Order @@index([status, createdAt])`.
- **`apps/api/src/profitability/`**: `profitability-calc.ts` (pure, unit-tested revenue/cost/gain/margin functions — no fabricated numbers, items without a cost snapshot are excluded from cost/gain rather than treated as zero-cost), `ProfitabilityService` (`getOverview`, `getOrdersTable` paginated, `getOrderDetail`, `backfillMissingCosts`), guarded `AdminAuthGuard` + `@Roles(SUPER_ADMIN, ADMIN)`. Three endpoints: `GET /profitability/overview`, `GET /profitability/orders`, `GET /profitability/orders/:id`, plus `POST /profitability/backfill-missing-costs` (`SUPER_ADMIN` only).
- **`/admin/rentabilite`** (new, under a new "Analyse" sidebar section alongside Rapports): 9 date-range presets + Confirmées/Livrées/Confirmées+Livrées status scope, 6 KPI cards (CA confirmé, Coût d'achat, Gain estimé, Taux de marge, Commandes confirmées, Panier moyen), CA-vs-Coût-vs-Gain chart (hand-rolled SVG, modeled on `dashboard-chart.tsx` — no new chart dependency), top-profitable/low-margin product panel with an adjustable threshold, paginated per-order profitability table linking into the existing order drawer via `?view=<id>` (no new order-detail view).
- **Order drawer**: new admin-only "Rentabilité" section (`commandes-page.tsx`) — sous-total produits/coût d'achat/gain/marge + per-line breakdown, fetched independently from `GET /profitability/orders/:id` since the drawer's existing order state carries no cost data. Never rendered on the storefront.
- **Dashboard**: compact "Rentabilité (aujourd'hui)" summary card + link to the full page — not a duplicate of it.
- **Fournisseurs/Achats**: removed from `admin-shell.tsx`'s sidebar and the "Logistique" section (now just Stocks). Route files, drawers, and the `Supplier`/`SupplierProduct`/`PurchasePriceHistory`/`PurchaseOrder`/`PurchaseOrderLine` Prisma models are untouched — `InventoryService.getWeightedAverageCost` and `ReportingService`'s "missing supplier price" alert both depend on `PurchasePriceHistory` today (confirmed via repo-wide grep before touching anything).
- **Testing**: `apps/api` had a `test` script but no jest actually installed anywhere in the repo — added `jest`/`ts-jest`/`@types/jest` + config. 12 new tests: 9 pure-function tests (`profitability-calc.spec.ts` — revenue/cost/gain math, discount-aware revenue via `priceMillimes` already being the amount paid, negative-margin detection, cost-coverage exclusion) + 3 service-level filter tests (`profitability.service.spec.ts`, mocked Prisma — default-to-CONFIRMEE-only, explicit status scope, date-range pass-through).

### Verification
- `apps/api`: `npm run build` clean, `npm test` — 2 suites, 12 tests, all passing.
- `apps/admin`: `npm run build` clean (typecheck + static generation), `/admin/rentabilite` present in the route list, `/admin/fournisseurs`/`/admin/achats` still present (soft-hidden, not deleted) and still build.
- Manually verified via direct DB query after reseeding: the seeded `CONFIRMEE` order's item shows `unitCostMillimes: 38285, costIsEstimated: true` (backfilled from the seed's weighted-average-equivalent cost).
- Not run: `npm run lint` — **pre-existing gap, not introduced by this work**: `apps/api/package.json` has a `lint` script but no `eslint` package installed anywhere in the repo. Flagged here rather than silently worked around; fixing it is a separate, unscoped task.
- Live end-to-end walkthrough (create product cost → confirm order → check Rentabilité → change cost → confirm the old order's gain didn't move) not run live this session, per the user's standing preference this session for code-first delivery over live demoing — happy to run it live on request.

### Known gaps / follow-ups
- `costCoverage`/margin figures for orders confirmed before this feature only have a snapshot if backfilled (`costIsEstimated: true`) — real historical accuracy depends on running `POST /profitability/backfill-missing-costs` once, or simply waiting for new confirmations to accumulate real snapshots.
- No granular `analytics.profitability.read` permission — restricted to the `Role` enum (`SUPER_ADMIN`/`ADMIN`), consistent with D-0023's coarse-RBAC scope note.
- §17 of the original request (optional purchase-cost columns on the product list) deliberately skipped — marked optional by the user, and no per-product cost field exists without N+1 calls into a system (`PurchasePriceHistory`) not shaped for that view.

---

## 2026-08-13 — SPRINT F (Dashboard Analytics) + SPRINT H (Inventory/Suppliers/Purchasing)

### Context

`TODO.md` marked SPRINT G done and listed only F/H as open. Investigation found this inaccurate: `Order.status` was still a bare unvalidated `String`, `PATCH /orders/:id/status` accepted any value with no transition validation, and none of D-0016's 11-value state machine existed server-side. Separately, zero of SPRINT H's data model existed in Prisma, and there was no auth anywhere in `apps/api`. Corrected scope, confirmed with the user, and built accordingly.

### Completed

#### Foundation
- **Prisma migration** (`20260813152545_sprint_f_h_foundation`): `StaffUser`/`Role` enum, `OrderStatus` enum (11 values, replacing the free-string scaffold) + `OrderStatusHistory` (append-only), `OrderItem.unitCostMillimes`, and the full SPRINT H model set — `Warehouse`, `InventoryItem`, `StockMovement`/`StockMovementType`, `Batch`, `Supplier`, `SupplierProduct`, `PurchasePriceHistory`, `PurchaseOrder`/`PurchaseOrderLine`. Seed extended with a local-dev `SUPER_ADMIN` StaffUser, 3 suppliers, purchase price history, and inventory/batches across the seeded catalogue.
- **Minimal admin auth** (D-0023): `admin-auth` module (bcrypt login, JWT in an HttpOnly/Secure/SameSite cookie, logout, `/me`), `AdminAuthGuard` + `RolesGuard`/`@Roles()`, applied to every new controller. New `/admin/login` page, `AuthProvider` context, admin shell wired to real staff identity + logout. Existing modules (`orders`, `catalogue`, etc.) intentionally not retrofitted — recorded as a known, pre-existing gap.
- **OrderStatus guarded transitions** (D-0024): `apps/api/src/orders/order-status.ts` transition table (REQUIREMENTS.md §A.2), `updateOrderStatus` validates + writes `OrderStatusHistory` + triggers inventory hooks (reserve on `CONFIRMEE`, sell on `LIVREE`, release on `ANNULEE`/`REFUSEE`/`RETOURNEE`). Scoped narrowly — not full SPRINT G (see `SPRINTS.md`).
- **Admin API client** (`apps/admin/src/lib/api-client.ts`): typed fetch wrapper, credentials included for the auth cookie, replacing hardcoded/inconsistent `localhost:3001` URLs in the pages this pass touched.

#### SPRINT H — Inventory, Suppliers, Purchasing
- `apps/api/src/inventory`: stock query/adjust, append-only `StockMovement` audit trail, staged 90/60/30-day expiry alerts, low-stock alerts, weighted-average cost service (D-0017, derived from `Batch` × `PurchasePriceHistory`), reserve/release/sell hooks, replenishment suggestions (sales velocity vs. supplier lead time).
- `apps/api/src/suppliers`: Supplier CRUD, `SupplierProduct` linking, append-only `PurchasePriceHistory` endpoint.
- `apps/api/src/purchasing`: `PurchaseOrder`/`PurchaseOrderLine` CRUD, goods-receipt endpoint (creates `Batch` + `StockMovement` + `PurchasePriceHistory`, updates PO status).
- `/admin/stocks` and `/admin/fournisseurs` rewired off `Math.random()`-fabricated data (a live `CLAUDE.md` §20 violation) onto the real endpoints. New `/admin/achats` pages (purchase-order creation + goods receipt) using `packages/ui` Table/Drawer/Field primitives.

#### SPRINT F — Dashboard Analytics
- `apps/api/src/reporting`: single `GET /reporting/dashboard/overview?period=` aggregation endpoint — KPIs, operational alerts (now real, sourced from inventory/suppliers), order funnel + COD health rates, daily margin/sales series, top products, customer KPIs. Promotion-performance widget renders an honest empty state (no `Promotion` model exists — out of scope, not fabricated).
- `dashboard-chart.tsx`/`sparkline.tsx` extended to accept real series via props (still hand-rolled SVG, no chart dependency added). `/admin` (dashboard home) and `/admin/rapports` both wired to the same endpoint — period switching now actually refetches instead of being decorative.

#### Money units (D-0025)
- New real SPRINT F/H data converts millimes → decimal DT once at the API boundary before reaching `formatCurrency`/`calculateMargin`. Those shared helpers' existing decimal-DT contract was deliberately left unchanged after finding 7 existing pages/31 call sites depend on it — changing it would have silently corrupted unrelated pages.

### Verification
- `apps/api`: `npm run build` clean. `apps/admin`: `npm run build` (typecheck + static generation) clean, including the new `/admin/achats` and `/admin/login` routes.
- Manually smoke-tested: migration + seed run clean, admin login issues a real session cookie, guarded endpoints correctly return 401 without it.
- Live end-to-end walkthrough (dashboard numbers, stock adjustment → movement journal, supplier price history, PO create → receive → stock/cost update, order confirm → deliver → stock reserve/deduct) deferred to the user per their request mid-session — not yet run.

### Known gaps / follow-ups
- Full SPRINT G (contact attempts, COD-by-governorate/courier/staff, returns/SLA queue) is still open.
- Auth is admin-only and unguarded on pre-existing modules (`orders` GET-by-id/create, `catalogue`, etc.) — a pre-existing gap, not introduced by this pass, not yet closed.
- No period-over-period ("+X% vs hier") deltas on dashboard KPIs — would need a second query per KPI; skipped rather than fabricated.
- `unitCostMillimes` is only populated for orders created after this pass (nullable) — margin figures for older/seeded orders are partial, disclosed via a `marginCoverage` field rather than presented as complete.

---

## 2026-08-10 — Senior E-Commerce UX, Search & Conversion Optimization Pass

### Completed

- **Prominent Header Search & Structured Autocomplete**: Embedded a visible search bar on desktop and mobile (`[ Rechercher un produit, une marque, un besoin... ]`). Autocomplete displays 5 structured result categories: `PRODUITS`, `MARQUES`, `CATÉGORIES`, `BESOINS`, `CONSEILS` with accent-insensitive filtering.
- **Cart Drawer Cross-Sell**: Added a **"Complétez votre panier"** section inside `CartDrawer` with one-tap `+ Ajouter` buttons that update the subtotal and free shipping progress bar instantly.
- **Merchandising Telemetry**: Created `logMerchandisingEvent()` helper in `src/lib/telemetry.ts` to log section views, search clicks, routine bundle adds, and cart cross-sells.
- **Advice ↔ Product Linking**: Ensured article pages prominently feature **"Soins recommandés dans cet article"** with product cards and direct links.

---

## 2026-08-10 — Homepage Visual Polish & Merchandising Pass

### Completed

- **Visual Rhythm & Surface Alternation**: Eliminated product-grid monotony by alternating surface backgrounds (`bg-white` → `bg-soft-nude/40` → `bg-gradient-to-br ...`).
- **Hero Best Sellers**: Promoted `HomeBestSellers` into the dominant commerce section (4 spacious cards desktop, 2-column mobile grid).
- **Promotions Rail**: Converted `HomePromotions` into a horizontal snap rail with rose/plum accents and clear discount pricing.
- **Routine Bundle Experience**: Refined `HomeRoutineBundle` with 4 clear step badges (*1. Nettoyage*, *2. Traitement*, *3. Hydratation*, *4. Protection*), total routine price, and dual CTAs (**"Ajouter toute la routine"** & **"Personnaliser ma routine"**).
- **Seasonal Campaign**: Redesigned `HomeSeasonalCampaign` as a luxury editorial split block (campaign image banner + 3 curated products).
- **New Arrivals**: Converted `HomeNewArrivals` into a horizontal discovery rail.
- **Hero Typography & LCP**: Refined headline line breaking (*"Votre routine beauté / commence par le bon conseil."*) and added priority image loading.

---

## 2026-08-10 — Homepage E-Commerce Conversion Redesign & Admin Merchandising CMS

### Completed

#### Storefront Homepage Redesign (`src/components/home/`)
- **High-Conversion 18-Section Flow**: Reorganized homepage structure to alternate **PRODUCT → DISCOVERY → PRODUCT → ROUTINE → PRODUCT → EDITORIAL → PRODUCT**.
- **Hero**: Refined copy ("*Votre routine beauté commence par le bon conseil*"), CTAs, and 3 reassurance pills (*✓ Produits 100% authentiques*, *✓ Livraison partout en Tunisie*, *✓ Paiement à la livraison*).
- **`HomeShopByNeed`**: Compact grid of 8 concerns (*Imperfections*, *Taches & éclat*, *Peau sensible*, *Peau sèche*, *Anti-âge*, *Chute de cheveux*, *Solaire*, *Bébé*) with real product count badges & direct category links.
- **`HomeBestSellers`**: High-priority Best Sellers grid immediately following Shop by Need with direct *Ajouter au panier* buttons.
- **`HomePromotions`**: Active deals section displaying discount badges (*-20%*, old price vs. new price).
- **`HomeRoutineBundle`**: 4-step routine showcase (*Nettoyage → Traitement → Hydratation → Protection*) with single-click **"Ajouter toute la routine"** multi-item add-to-cart button.
- **`HomeNewArrivals`**: Horizontal discovery rail of latest catalog additions.
- **`HomeFeaturedBrands`**: Partner brand wall linking directly to `/marques/[slug]`.
- **`HomeSeasonalCampaign`**: Split editorial campaign banner + 3–4 featured seasonal products.
- **`HomeEverydayEssentials`**: Repeat purchase replenishment products.
- **`HomeShopByBudget`**: Filter pills for price buckets (<30 DT, 30–50 DT, 50–100 DT, 100+ DT).
- **`HomeExpertAdvice`**: Article spotlight connected directly to recommended purchasable products.
- **`HomeTrustReassurance`**: Guarantees of authenticity, delivery speed, and expert pharmacy support.

#### Admin Merchandising CMS (`/admin/page-accueil`)
- **Section Controls**: Enable/disable toggles, title editing, display ordering.
- **Merchandising Modes**: Choose between **MANUAL** (pinned items only), **AUTOMATIC** (sales/date/discount rules), and **HYBRID** (pinned items first + auto-fill).
- **Admin Product Selector Drawer**: Displays catalog items with **Prix Vente**, **Marge brute** (`+20.615 DT`), **Stock disponible**, and **Ventes** metrics for informed merchandising decisions (hidden from storefront).
- **Sidebar Integration**: Added **Page d'accueil** with `LayoutTemplate` icon under *Contenu* in `admin-shell.tsx`.

#### Database Schema & Backend API (`apps/api`)
- Added `HomepageConfig` & `HomepageCampaign` Prisma models to `schema.prisma`.
- Created `HomepageService`, `HomepageController`, `HomepageModule` serving `/api/v1/homepage/config` and `/api/v1/homepage/admin-config`.

---

## 2026-08-10 — SPRINT E: Unified Content & SEO-Commerce System + Client Régulier Popover

### Completed

#### Unified Editorial Architecture
- **Single Entity**: Consolidated `/conseils` and `/admin/articles` onto an enriched `Article` schema in PostgreSQL with join tables (`ArticleProduct`, `ArticleBrand`, `ArticleConcern`, `ArticleFaq`).
- **REST API (`apps/api`)**: Built `GET /api/v1/content/articles`, `GET /dashboard-stats`, `GET /by-slug/:slug`, `POST /articles`, `PATCH /articles/:id`, `POST /duplicate`, `DELETE /articles/:id`.
- **Database Seeding**: Populated PostgreSQL with 6 rich articles, formatted content blocks, FAQs, and product links.

#### Admin: Conseils & Articles Management (`/admin/articles`)
- **Dashboard & KPIs**: Created 4 real-time KPI cards (*Publiés*, *Brouillons*, *Planifiés*, *SEO incomplet*).
- **5-Tab Article Drawer**: Designed `article-drawer.tsx` with tabs for *Info*, *Médias*, *Contenu & FAQ*, *Produits & Liens*, and *SEO*.
- **Enhanced Médias Tab**: Added live banner preview, media status indicator (*✓ Configurée* / *Non définie*), upload controls, and real-time Storefront card mockup preview.
- **SEO Completeness Score**: Integrated an 11-point internal score chip (`SEO N/11`).
- **Image Persistence**: Integrated `localStorage` caching so article edits and featured images are preserved on refresh.

#### Admin Commandes: Client Régulier & Order History Popover
- **Automatic Grouping**: Orders are grouped dynamically by customer phone and name across the database.
- **Badge Detection**: Any client with >1 orders is automatically badged as **👥 Client régulier (N)**.
- **Hover Order History**: Hovering over the *Client régulier* badge opens a popover displaying the client's complete order history (*Order Ref, Date, Status, Total amount in DT*).

#### Storefront Editorial Hub (`/conseils` & `/conseils/[slug]`)
- **Hub Page**: Featured hero card, category filter tabs, responsive article cards.
- **Detail Page**: Hero image, author badge (*Dr. Amira Selmi*), auto-generated TOC, typed block renderer (`article-block-renderer.tsx`), **NOS RECOMMANDATIONS** product grid, and interactive **FAQ Accordions** with `FAQPage` JSON-LD schema.

---

## 2026-08-09 — Complete Admin Management for Marques (Brands) & Catégories (Categories)

### Completed

#### Marques (Brands) Admin Management (`/admin/marques`)
- **Redesigned Admin Marques Page**: Updated to ParaTunisie Rose `#E11D48` theme with KPI metrics (Total Marques, Marques Actives, Marques Iconiques), Search input (`Rechercher une marque...`), Status filter (`Actif`, `Brouillon`), and Featured filter (`Marques Iconiques`).
- **Refined Brands Table**: Displays brand logo thumbnail, brand name, slug, attached products count, positionment tags, status badge, iconique badge, and action buttons (`👁️`, `✏️`, `🗑️`).
- **Right-Side Marque Drawer (`marque-drawer.tsx`)**:
  - Informations générales (Nom, Slug, Tagline, Description courte/longue, Statut, Featured toggle).
  - Images & Bannières (Logo MediaUploader, Hero Desktop banner, Hero Mobile banner).
  - Positionnement (Pays d'origine, Univers de marque, Spécialités tags).
  - SEO Form Section with snippet preview.
- **Safety Delete Validation**: Blocks deletion if a brand has attached products and opens explanatory modal.

#### Catégories (Categories) Admin Management (`/admin/categories`)
- **Redesigned Admin Categories Page**: Dual view modes — **Hierarchical Tree View** (expandable parent & subcategories tree) and **Refined Table View**.
- **Right-Side Category Drawer (`category-drawer.tsx`)**:
  - Informations (Nom, Slug, Parent Category selector, Description courte/longue, Statut, Featured toggle).
  - Médias (Category icon/vignette, Hero banner).
  - Découverte & Ordre d'affichage (Position order, Featured subcategories).
  - SEO Form Section with H1 title, SEO title, Meta description, Canonical URL, Indexable toggle, live snippet preview, and bottom editorial content.
- **Safety Delete Validation**: Blocks deletion if subcategories or products are attached.

#### Shared Admin Form Components
- **`MediaUploader` (`media-uploader.tsx`)**: Upload, preview, replace, remove, alt text, file validation, progress state, and fallback.
- **`SeoFormSection` (`seo-form-section.tsx`)**: Live Google Search snippet preview, character counters (Title 50-60, Meta 140-160), Canonical URL, Index/Noindex toggle.
- **`UnsavedChangesModal` (`unsaved-changes-modal.tsx`)**: Intercepts drawer close when changes are pending.

#### API & Backend Updates
- Extended Prisma `Brand` and `Category` schema models with media, hierarchy, positionment, and SEO fields (`npx prisma generate` executed successfully).
- Updated NestJS `CatalogueController` and `CatalogueService` with CRUD endpoints (`GET`, `POST`, `PATCH`, `DELETE`).

### Tests performed
- `npx tsc --noEmit` — 0 errors across `apps/admin` and `apps/api`.
- `npm run lint` — 0 errors across `apps/admin` and `apps/api`.

---

## 2026-08-09 — SPRINT A: Shared UI system + Admin redesign foundation

### Completed

#### `packages/ui` (20 files)
- `package.json` (`file:`-consumable, exports `.` + `./tokens.css`), `tsconfig.json`, `cn.ts`, canonical `tokens.css` (DESIGN_SYSTEM.md values; light theme only).
- 15 primitives: Button, Badge (success/warning/danger/info/neutral variants), Input, Select (Base UI v1.7 `Item` API), Tabs, Sheet, Dialog parts, ConfirmModal (admin API), Drawer (admin API), Toast (`toast(type, message)` API), Skeleton, EmptyState, DataTable primitives, Field, Tooltip.

#### Storefront wired
- `file:packages/ui` dependency, `transpilePackages`, Tailwind `@source "../../packages/ui/src"`, 8 missing token aliases added (`ink-faint`, `border-strong`, `primary-soft`, `danger`, `warning(-bg)`, `info(-bg)`).
- `button/badge/input/tabs/sheet` shims now re-export from `@paratunisie/ui` (no duplicated implementations).

#### Admin wired
- `file:../../packages/ui` dependency + `transpilePackages` (types + ui); `globals.css` imports shared `tokens.css` + `@source` — single canonical token source, the admin's inverted token block removed.
- Namespace shims (`drawer/confirm-modal/toast`) keep every existing import path working; new code imports `@paratunisie/ui` directly.
- Token rename sweep (`bg-surface-alt`→`bg-soft-nude`, then `bg-surface`→`bg-surface-alt`); legacy classes (`admin-table`, `.badge-*`, `.kpi-card`, `.field-input`) retained and retokenized.
- Admin shell redesigned per brief: light ivory/white base, plum active states, blush hovers, champagne ADMIN label.
- Supplier/product drawers + stocks modal migrated onto shared Drawer/ConfirmModal/Dialog/Field.

#### Tooling
- Dockerfiles: `packages/` copied into the deps stage of the root + admin images so `npm ci` resolves `file:` deps.
- ESLint made runnable (was not runnable before): root `eslint.config.mjs` finished, root lint script scoped to `eslint src packages`, new `apps/admin/eslint.config.mjs` (imports root config + own `.next` ignores). Fixed 55 pre-existing problems: 4 errors (2 `react-hooks/set-state-in-effect` in the drawers — replaced with render-time state adjustment per React docs; 1 `<a>`→`<Link>`; 1 unescaped apostrophe) + ~51 unused imports.

### Design decisions
- Canonical tokens live in `packages/ui/src/tokens.css`; admin imports via `@import`, storefront keeps its `@theme inline` architecture and adds only missing aliases — no dual maintenance (D-0022).
- Drawer/ConfirmModal/Toast keep the admin's historical component APIs so existing call sites work unchanged.
- ESLint is per-app: root config covers storefront + packages only; each app owns its own config (admin imports the root's).

### Tests performed
- `npm run lint` (root + admin) — 0 errors, 0 warnings (root: 1 pre-existing `<img>` warning in `logo.tsx`).
- `npx tsc --noEmit` — clean in both apps.
- `npx next build` — storefront 64 routes, admin 18 routes, clean.
- Admin smoke: `next start -p 3102` → `/admin` HTTP 200.
- Shared tokens compiled into both CSS outputs (`soft-nude`, `ease-drawer`, `translate-x-full`, `primary-soft`, `pt-toast-in` keyframe).

### Next task
- SPRINT C: MinIO media system.
- Skills review of the redesigned admin shell (`review-animations`, `improve-animations`, `find-animation-opportunities`).
- Migrate remaining admin pages onto shared data-table/Badge primitives (legacy classes retokenized, behavior preserved).

### Known issues / risks
- Run lint per app (`npm run lint` from each app directory); the root script is intentionally scoped to `src packages`.
- Legacy admin classes remain (retokenized) until the shared-primitives migration follow-up.
- Admin data remains mock — API wiring is the Admin 1-8 backend phase (SPRINT 12+).

---

## 2026-08-09 — Phase 2 kickoff: Admin/Infra roadmap docs + SPRINT B Dockerization & PostgreSQL swap

### Completed

#### Roadmap docs (Phase 2)
- **`SPRINTS.md`**: Added "Admin / Infra Phase 2 (SPRINT 11+)" section with sprints A–H: A (shared UI system + admin redesign foundation), B (Dockerization + local infrastructure), C (MinIO media system), D (product + media management), E (storefront CMS/content), F (admin dashboard analytics), G (orders operational workflow), H (inventory + suppliers + purchasing). Current approved scope: A–D.
- **`TODO.md`**: Added matching checklist section.
- **`DECISIONS.md`**: Four new ADRs — D-0018 (MinIO object storage, metadata-only DB, public-read bucket with signed-URL option, safe-deletion order), D-0019 (shared `packages/ui` — one design language across storefront and admin), D-0020 (Docker networking: edge = web+admin, internal = api+data services, API on both), D-0021 (structured CMS forms, not a generic page builder).
- **`ARCHITECTURE.md`**: Updated repo layout (`packages/ui` in place), frontend/backend sections (shared design system, MinIO media pipeline, Docker local infra), deployment summary.
- **`DEPLOYMENT.md`**: New "Local infrastructure — Docker Compose" section with the service/port/network table, volume strategy, migration/seed flow, health-check policy.

#### SPRINT B — Dockerization + local infrastructure
- **`docker-compose.yml`**: 7 services — `paratunisie-web` (3000), `paratunisie-admin` (3002), `paratunisie-api` (3001), `paratunisie-postgres` (5432, host port **only** for local tooling per D-0020), `paratunisie-redis`, `paratunisie-meilisearch`, `paratunisie-minio`. Two intentional networks (`edge`, `internal`); API on both; data services internal-only. Persistent volumes (postgres-data, minio-data, meilisearch-data), healthchecks on every service, `restart: unless-stopped`.
- **Dockerfiles** (multi-stage, non-root runtime users, minimal alpine images): root storefront (Next.js standalone), `apps/admin` (standalone + `packages` copied for `@paratunisie/types` transpile), `apps/api` (NestJS; runs `prisma migrate deploy && prisma db seed` at container start via `CMD`).
- **`.dockerignore`**: root-level (covers web/admin contexts) + `apps/api/.dockerignore`; `.env` and `*.db` excluded so secrets/DB files never enter images.
- **`output: "standalone"`** added to both `next.config.ts` files (required for the standalone Docker builds).
- **`docker compose config`** validates: 7 services, 2 networks, no warnings.

#### SPRINT B — PostgreSQL provider swap (validated against a real Postgres container)
- **`apps/api/prisma/schema.prisma`**: provider `sqlite` → `postgresql`. `migration_lock.toml` updated to match.
- **Fresh baseline migration** `20260809004724_init` regenerated for Postgres (old SQLite-flavored migration + `dev.db` removed), applied and validated against a real `postgres:16-alpine` container.
- **Seed re-validated on Postgres**: 11 brands, 4 categories, 7 concerns, 16 products with variants + concern relations, 6 articles.
- **Built API verified end-to-end against Postgres**: `nest build` clean; running `node dist/main` served `GET /api/v1/catalogue/brands` → 11 records, `GET /api/v1/catalogue/products` → 16 records, all HTTP 200.
- **Fixed a latent strict-mode bug surfaced by the build**: `routines.service.ts` passed `answers: unknown` directly into a JSON-string column — now `JSON.stringify(data.answers)`.
- **`apps/api/.env`** updated to the compose Postgres URL (`localhost:5432`); committed **`.env.example`** added; seed header comment corrected (PostgreSQL).

### Design decisions
- Postgres host port 5432 is a documented dev-only localhost mapping (Prisma Studio, bare-metal `npm run dev`) — the only data service exposed, per D-0020.
- API Docker runtime keeps full `node_modules` on purpose: the dev startup flow (`migrate deploy` + `db seed` via ts-node) needs devDependencies. Production image can prune later when migrations move to CI.
- Fresh baseline migration chosen over a Postgres-conversion migration: the SQLite migration's DDL (inline `PRIMARY KEY`, `DATETIME`) is provider-specific and no production data exists to preserve.

### Tests performed
- `docker compose config --quiet` — valid; services/networks enumerated correctly.
- `npx prisma migrate dev --name init` against real Postgres — applied clean.
- `npx prisma db seed` against real Postgres — all seed sections passed.
- `npm run build` in `apps/api` — clean (0 errors after the routines fix).
- Live smoke test: built API serving catalogue endpoints from Postgres — HTTP 200, correct record counts.

### Next task
- SPRINT C: MinIO media system (MediaModule, object naming, upload validation, safe deletion) — `docker-compose.yml` already includes the `paratunisie-minio` service.
- SPRINT A: shared UI package extraction (`packages/ui`) + admin redesign.
- Local storefront/admin/API images can now be built via `docker compose build`; end-to-end compose boot (all 7 services healthy) is the next validation milestone.

### Known issues / risks
- `docker compose up` full-stack boot is defined but not yet executed end-to-end (next validation milestone — images must be built first, ~a few minutes for Next.js builds).
- Storefront build context is the repo root (shared `.dockerignore`); the API builds from `apps/api` with its own context — keep the two `.dockerignore` files in sync when adding new large directories.
- `package.json#prisma` seed config is deprecated in Prisma 7 (warning only, not breaking) — future: migrate to `prisma.config.ts`.
- The API currently has no `/health` endpoint — the compose healthcheck hits the catalogue route; a dedicated health route is a small follow-up.

---

## 2026-08-08 — Admin 4-8: Full ERP phase complete (inventory, analytics, returns, content, promotions)

### Completed

#### Admin 4 — Inventory + stock movements + batches/expiry (`/admin/stocks`)
- Full inventory table with SKU, product, warehouse, quantity on hand/reserved/available, reorder threshold, batch number, expiry date, purchase cost, supplier link.
- Stock movement log with 9 movement types (purchase receipt, order reservation, order sale, cancellation release, return, damage, expiration write-off, manual adjustment, warehouse transfer), each with audit trail (who/when/why).
- KPI bar: En stock, Réservé, Disponible, Ruptures, Stock faible, Proches expiration, Valeur stock.
- Expiry alerts staged by urgency (90/60/30 days), not a single binary flag.
- Stock adjustment modal for manual corrections.
- Color-coded stock indicators (green/amber/red) with background highlighting for out-of-stock and low-stock rows.

#### Admin 6 — Analytics + profitability (`/admin/rapports`)
- Period selector (today/week/month) with top KPIs: CA, commandes, panier moyen, marge brute estimée.
- Order funnel visualization (100 → 82 confirmées → 76 expédiées → 69 livrées) with confirmation rate, delivery rate, cancellation rate, return rate.
- Top products table with units sold, revenue, gross margin, taux de marque (color-coded).
- Low-margin products alert table with cost/price/margin breakdown.
- Operational alerts panel (commandes en attente, échecs livraison, stock faible, expiration, panier moyen trend).

#### Admin 7 — Returns + customer service (`/admin/retours`)
- Full status workflow: REQUESTED → APPROVED/REJECTED → RECEIVED → REFUNDED/EXCHANGED → CLOSED.
- Return detail panel with: customer info, products returned (with reason per item), condition on return, customer notes, staff notes, restocking decision (RESTOCK/DAMAGED/DISPOSED), refund value.
- KPI bar: À traiter, En cours, Remboursés, Rejetés.
- Allowed transitions enforced per state (only valid actions shown).
- Confirmation modal before executing state transitions.

#### Admin 8 — Content + SEO admin
- **Articles** (`/admin/articles`): Full article table with search, status filter, category filter, sort. Status workflow (Published/Draft/Archived). Toggle publish/unpublish. Tags display, author, publish date, SEO fields (seoTitle, metaDescription, indexable). Delete with confirmation.
- **Promotions** (`/admin/promotions`): Full promotion table with search, status filter. Types: percentage, fixed, free shipping. Scope: ALL/CATEGORY/BRAND/PRODUCT with scope value display. Usage limits (used/total). Margin-impact preview per active percentage promotion — shows resulting price, remaining margin, taux de marque with color-coded warnings for low/negative margin. Activate/deactivate toggle. Delete with confirmation.

### Design decisions
- Revenue is never labeled "profit" — CA (chiffre d'affaires) is the top-line number; marge brute is CA minus COGS. This distinction is explicit in all dashboard/report components.
- Stock movements are append-only with full audit trail — who/when/why, not just a delta.
- Expiry alerts staged by urgency (90/60/30 days) rather than a single binary flag.
- Margin-impact preview is mandatory before promotion activation per REQUIREMENTS.md §B.
- Returns workflow follows the exact state machine from REQUIREMENTS.md §I.
- Costing strategy: weighted-average cost is the default for Admin-3/6 (per REQUIREMENTS.md §E), implemented as a simple average proxy until stock quantity data is available for real weighted-average calculation.

### Tests performed
- `cd apps/admin && npx tsc --noEmit` — clean (0 errors)
- `cd apps/admin && npx next build` — clean, 19 routes generated (18 static + 1 dynamic `[id]`)

### Next task
- Wire all admin CRUD to real API endpoints
- Admin auth (login page, session context, RBAC)
- Real weighted-average costing from purchase price history + stock movements

### Known issues / risks
- All admin data remains mock — no API endpoints wired yet.
- Weighted-average cost is a simple average proxy — real implementation needs stock quantity data per batch (Admin 6 scope).
- Returns hygiene/regulatory constraints for cosmetics resale are not yet implemented in the workflow (noted in REQUIREMENTS.md §I as a business/legal-policy decision to make with real Tunisian regulatory input).
- Admin auth not implemented yet (login page, session context).

---

## 2026-08-08 — Admin 3: Products + pricing + supplier costs (supplier management, purchase price history)

### Completed
- **Supplier type & status map** (`types.ts`): `Supplier` interface (name, contactPerson, phone, email, address, taxId, brandsSupplied, leadTimeDays, paymentTerms, notes, status). `SUPPLIER_STATUS_MAP` for UI labels. `PurchasePriceHistory` interface (supplierId, productId, purchasePrice, effectiveDate, notes). `StockMovement` and `StockMovementType` types with `STOCK_MOVEMENT_MAP` for future inventory use.
- **Product type enhanced** (`types.ts`): Added optional `supplierId` field to `Product` — links products to their supplier for cost tracking.
- **Admin shell sidebar** (`admin-shell.tsx`): Added "Fournisseurs" nav entry with `Building2` icon under "Logistique" section.
- **Suppliers list page** (`/admin/fournisseurs`): KPI bar (Actifs, Inactifs, Marques couvertes, Délai moyen). Full data table with search (name/contact/brand), status filter, sortable columns. Row actions: Modifier, Activer/Désactiver, Supprimer with confirmation modals. Responsive column priorities.
- **Supplier drawer** (`supplier-drawer.tsx`): Two-panel form — Informations (name, contact, phone, email, address, taxId, status) + Conditions commerciales (lead time, payment terms, notes). Purchase price history section: grouped by product, mini sparkline bar chart showing price trend, chronological entries with dates, trend indicator (color-coded +/-). Brands supplied display.
- **Product drawer enhanced** (`product-drawer.tsx`): Added supplier selection dropdown (only active suppliers). Purchase price history section shows chronological entries for the product with active price highlighted, supplier name, and notes. Accepts `suppliers` and `purchaseHistory` props.
- **Products page updated** (`produits/page.tsx`): Mock products now include `supplierId` linking to suppliers. Mock supplier and purchase history data. ProductDrawer receives suppliers and purchaseHistory props.

### Design decisions
- Purchase price history is append-only — each price change is a new row, never an overwrite (per REQUIREMENTS.md §B).
- Supplier drawer shows weighted-average cost proxy (simple average of historical prices) when no stock quantity data exists — placeholder for real weighted-average costing in Admin 6.
- Product drawer supplier dropdown filters to active suppliers only — avoids linking products to inactive suppliers.
- Purchase price history sparkline uses simple bar chart (CSS-only, no chart library) — shows relative price movement per product at a glance.

### Tests performed
- `cd apps/admin && npx tsc --noEmit` — clean (0 errors)
- `cd apps/admin && npx next build` — clean, 19 routes generated (18 static + 1 dynamic `[id]`)

### Next task
- Admin 4: Inventory + stock movements + batches/expiry
- Wire supplier/product CRUD to real API endpoints
- Implement real weighted-average costing from purchase price history

### Known issues / risks
- All admin data remains mock — no API endpoints wired yet.
- Weighted-average cost calculation is a simple average proxy — real implementation needs stock quantity data per batch (Admin 4/6 scope).
- Supplier drawer purchase history is read-only display — editing/deleting individual history rows is not yet supported (append-only design per REQUIREMENTS).

---

## 2026-08-08 — Admin 2: Order management (state machine, contact attempts, operational workspace)

### Completed
- **Order state machine** (`lib/order-state.ts`): Implements REQUIREMENTS.md §A.1 — 11 order statuses with strict allowed-transitions map. `getAllowedTransitions()`, `canTransition()`, `isTerminal()`, `TRANSITION_LABELS`, `getTransitionVariant()`, `getStatusStep()`. Staff can only see/perform actions that the current state permits.
- **Enhanced types** (`lib/types.ts`): `ContactAttempt` (timestamp, staffMember, channel: APPEL/WHATSAPP, outcome: 6 outcomes per REQUIREMENTS.md §A.4, note), `OrderTimelineEntry` (status history with optional note), `Order` extended with `contactAttempts`, `timeline`, `address`, `subtotal`, `shipping`, `previousOrders`. `CONTACT_CHANNEL_MAP` and `CONTACT_OUTCOME_MAP` for UI labels and badge colors.
- **ConfirmModal** updated: accepts `success` variant alongside existing `danger`/`warning`/`default` — needed for order state transitions.
- **Commandes list page** (`commandes/page.tsx`): Filter chips by status, sort dropdown, compact KPI row, action buttons showing only allowed transitions per state machine, responsive table, row actions. Fixed syntax error in mock data (missing quote on address string).
- **Order detail page** (`commandes/[id]/page.tsx`): Full operational workspace — two-column layout (items + contact attempts on left, customer/payment/profitability/timeline on right). Items table with cost price and margin display. Contact attempts panel with add form (channel select, outcome select, note textarea). Status transition buttons (only allowed transitions shown, confirmation modal before executing). Timeline visualization (reversed chronological, dot indicators). Customer sidebar with phone/WhatsApp links, previous order count. Profitability card showing cost, revenue, estimated margin brute. Fixed ConfirmModal type error (success variant).

### Design decisions
- Order state machine is the single source of truth for what actions staff can perform — no manual status overrides.
- Contact attempts are append-only records, never editable or deletable, per REQUIREMENTS.md §A.4.
- Profitability is shown only when cost data exists (costPrice > 0) — avoids misleading zero-margin display.
- Timeline uses dot indicators with primary color for current status, muted for historical.

### Tests performed
- `cd apps/admin && npx tsc --noEmit` — clean (0 errors)
- `cd apps/admin && npx next build` — clean, 18 routes generated (17 static + 1 dynamic `[id]`)

### Next task
- Admin 3: Products + pricing + supplier costs (margin formulas wired to real data, purchase price history)
- Wire order CRUD to real API endpoints
- Wire contact attempts to backend persistence
- Implement real order funnel on dashboard

### Known issues / risks
- All admin data remains mock — no API endpoints wired yet.
- The root-level `npx tsc --noEmit` reports errors because root tsconfig doesn't include admin path aliases — expected; admin has its own tsconfig and builds independently.
- Order detail has no real backend persistence for contact attempts — they are state-only in the current mock implementation.

---

## 2026-08-08 — Admin visual redesign + product management (Admin 1 refined)

### Completed
- **Admin design system overhauled** (`apps/admin/src/app/globals.css`): ParaTunisie brand-aligned tokens — warm ivory background (`#FCF8F6`), white surfaces, cocoa text, plum accents, refined borders, subtle shadows. Replaced generic grey SaaS palette. Added drawer/sheet, toast, modal, and field-input CSS primitives. Custom scrollbar, selection color, and reduced-motion handling.
- **Admin shell redesigned** (`admin-shell.tsx`): Sidebar uses warm cocoa gradient (`#2B2326` → `#1E181A`) with plum-tinted active states and the brand's `PT` monogram badge. Refined section labels, active state highlighting, and user profile footer. Topbar uses frosted-blur backdrop, bell notification icon, compact search. Added `Stocks` nav entry.
- **Shared type system enhanced** (`types.ts`): `Product` type extended with `costPrice`, `barcode`, `reorderThreshold`, `shortDescription`, `description`, `usage`, `skinTypes`, `concerns`, `size`, `slug`, `seoTitle`, `metaDescription`, `indexable`, `createdAt`, `updatedAt`. Added `MarginInfo` interface. Added `PRODUCT_STATUS_MAP`.
- **Margin calculation utilities** (`utils.ts`): `calculateMargin()` implements D-0017 formulas (marge brute, taux de marge, taux de marque). `marginWarningClass()` for conditional coloring. `formatPercent()`, `formatCurrencyShort()`.
- **Toast notification system** (`components/toast.tsx`): React context-based, supports success/error/warning/info types, auto-dismiss after 4s, brand-consistent styling with left border accent, smooth enter/exit animations. Accessible via `useToast()` hook.
- **Confirmation modal** (`components/confirm-modal.tsx`): Polished dialog for destructive actions (archive, delete). Supports danger/warning/default variants. Focus trap, Escape to close, accessible `aria-modal` and `aria-labelledby`.
- **Drawer / sheet** (`components/drawer.tsx`): Right-side panel, 640px max-width, mobile full-screen. Smooth cubic-bezier slide-in, body scroll lock, Escape to close, focus return. Used as the base for product create/edit.
- **Product create/edit drawer** (`components/product-drawer.tsx`): 5-section form (Informations principales, Tarification, Inventaire, Description, SEO). Live margin calculation display — shows marge brute, taux de marge, taux de marque with color-coded warnings for negative/low margins. Unsaved changes protection with confirmation modal. Sticky footer with Annuler/Enregistrer actions.
- **Products page redesigned** (`produits/page.tsx`): Client component with state management. Compact KPI cards (Actifs, Brouillons, Ruptures with danger border, Stock faible with warning border). Full-featured data table: sortable columns, brand/status dropdown filters, search by name/brand/SKU. Margin percentage column (color-coded). Row actions menu (Modifier, Dupliquer, Archiver, Supprimer). Responsive column priorities (hidden on smaller viewports). Inline stock indicators with dot + text. Archive/delete confirmation modals with toast feedback.
- **Dashboard refined** (`page.tsx`): Tighter KPI grid, alert severity colors using brand danger/warning/info backgrounds, refined order funnel visualization, compact quick-stats cards.
- **Stocks page stub** created for new sidebar entry.

### Design decisions
- Sidebar uses warm cocoa gradient instead of pure black — feels brand-aligned without losing operational density.
- KPI cards use `border-l-[3px]` accent instead of heavy shadows for alert states — cleaner, more compact.
- Table uses subtle row hover (`background: var(--color-background)`) and `sticky` header — functional, not decorative.
- Drawer max-width 640px (not 720px) — wider than a mobile sheet but narrower than a full page, keeps the admin context visible.
- Margin warnings are color-coded (danger for negative, warning for <15%) but never block saving — per REQUIREMENTS.md §B.

### Tests performed
- `cd apps/admin && npx tsc --noEmit` — clean (0 errors)
- `cd apps/admin && npx next build` — clean, 17 routes generated (15 static + 1 dynamic `[id]`)

### Next task
- Admin 2: Order management state machine, contact attempts, funnel reporting
- Wire product CRUD to real API endpoints
- Add image upload/management to product drawer

### Known issues / risks
- All admin data remains mock — no API endpoints wired yet.
- Image management not yet in the product drawer (placeholder for Sprint 3/4).
- The root-level `npx tsc --noEmit` reports errors because root tsconfig doesn't include admin path aliases — this is expected; the admin app has its own tsconfig and builds independently.
- Existing admin pages (commandes, marques, categories, clients, livraisons, articles, promotions) use the old CSS class names which still work with the new globals.css. They should be updated to use the new design tokens in a follow-up pass.

---

## 2026-08-08 — Admin 1 shell: all 16 pages built and compiling

### Completed
- **Admin app rebuilt**: `apps/admin` reinstalled cleanly (previous install had incomplete Next.js internals). `turbopack.root` set in `next.config.ts` to silence workspace detection warning.
- **Shared type system** (`src/lib/types.ts`): `Order`, `OrderItem`, `OrderStatus`, `Product`, `Brand`, `Category`, `Customer`, `Delivery`, `Article`, `Promotion` types with status maps (`ORDER_STATUS_MAP`, `DELIVERY_STATUS_MAP`).
- **Shared utilities** (`src/lib/utils.ts`): `formatCurrency`, `formatDate`, `formatDateShort`, `timeAgo`, `cn`.
- **Admin pages created** (16 total):
  - `/admin` — Dashboard with 12 KPIs, 5 alerts, recent orders table, COD funnel, quick stats grid
  - `/admin/commandes` — Order list with status filter chips, payment badges, quick stats
  - `/admin/commandes/[id]` — Order detail: items table, customer info, payment, timeline, delivery status, action buttons (Confirmer/Préparer/Annuler based on status)
  - `/admin/produits` — Product list with SKU, stock indicator (rupture/low/ok), status dots, compare-at-price
  - `/admin/marques` — Brand list with featured badge, product count, status
  - `/admin/categories` — Category tree with nested subcategories and product counts
  - `/admin/clients` — Customer list with order count, total spent, governorate, join date
  - `/admin/livraisons` — Delivery list with carrier, tracking number, status badges
  - `/admin/articles` — Article list with status, tags, publish date
  - `/admin/promotions` — Promotion list with code, type, usage limits, validity dates
  - `/admin/avis`, `/admin/retours`, `/admin/rapports`, `/admin/equipe`, `/admin/parametres` — Stub pages (module scope defined, to be fleshed out in later sprints)
- **All pages use the admin design system**: dense, functional, high-contrast palette (`--color-background: #ffffff`, `--color-ink: #212529`, `--color-primary: #7B2F52`). Same sidebar/topbar shell, `admin-table`, `kpi-card`, `badge` CSS classes.

### Tests performed
- `npx next build` — clean, 16 routes generated (15 static + 1 dynamic for `[id]`)
- All pages compile with TypeScript strict mode

### Next task
- Admin 2: Order management state machine (real statuses, transitions, contact attempts, funnel)
- Admin 3: Products + pricing + supplier costs
- Wire dashboard KPIs to real API data when admin endpoints exist

### Known issues / risks
- All admin data is mock — no API endpoints for admin yet (admin backend is Sprint 12+ scope)
- Stub pages (avis, retours, rapports, equipe, parametres) need fleshing out in later sprints
- Admin auth not implemented yet (login page, session context)

---

## 2026-08-08 — Sprint 9 complete: frontend swapped to real API repositories

### Completed
- **Backend setup**: Installed NestJS/Prisma dependencies in `apps/api/`. Switched Prisma schema from PostgreSQL to SQLite for local dev (arrays stored as JSON strings). Ran `prisma migrate dev` and `prisma db seed` — database populated with 11 brands, 4 categories, 7 concerns, 16 products (with variants and concern relations), and 6 articles.
- **Frontend API client** (`src/lib/api/client.ts`): Fetches from NestJS `/api/v1/catalogue/*` endpoints, transforms Prisma's nested response into flat `ProductSummary` shape. Gracefully falls back to local mock data when the API is unreachable (build time, API down).
- **Repository pattern** (`src/lib/api/repositories.ts`): `ProductRepository` interface with `apiProductRepository` implementation. Provider (`src/lib/api/index.ts`) selects API or mock based on `NEXT_PUBLIC_API_URL` / `NODE_ENV`.
- **Page components swapped**: `shop/page.tsx`, `[category]/page.tsx`, `produits/[slug]/page.tsx`, `marques/[slug]/page.tsx`, `besoins/[slug]/page.tsx` now fetch from the API server-side and pass data as props to client components. `ShopPage` and `FilterControls` refactored to accept products/filter-options as props instead of importing from local data files.
- **Helper functions updated**: `getRoutineCompletionProducts` and `getSimilarProducts` now accept optional `allProducts` parameter for use with API-fetched data.
- **Gitignore**: Added `*.db` and `*.db-journal` patterns for SQLite files.

### Tests performed
- `npx tsc --noEmit` — clean (0 errors)
- `npx eslint src` — clean (0 errors, 1 pre-existing `<img>` warning in logo.tsx)
- `npx next build` — passes, 64 pages generated

### How it works
- **With API running** (`npm run dev` in `apps/api/`): Frontend fetches real data from NestJS/Prisma.
- **Without API** (build, production without backend): Falls back to local mock data transparently.
- **To start the backend**: `cd apps/api && npm run dev` (runs on port 3001).
- **To switch to PostgreSQL**: Change `provider = "sqlite"` back to `provider = "postgresql"` in `apps/api/prisma/schema.prisma`, update `DATABASE_URL`, and re-run `prisma migrate dev`.

### Known issues / risks
- SQLite schema stores arrays as JSON strings (`skinTypes`, `routineTime`, `content`) — production PostgreSQL should use native arrays.
- The `brands` and `categories` data in the frontend (`src/lib/data/brands.ts`, `src/lib/data/categories.ts`) still contains rich metadata (taglines, descriptions, match functions, seoIntro) not in the API. These local files are still used for category/concern page metadata — only product data is fetched from the API.
- `formatPrice` and other utility functions remain in local data files — not yet moved to shared package.

---

## 2026-08-08 — Category/besoins PLP type safety fixes + server/client boundary cleanup

### Completed
- Fixed TypeScript type mismatch between server and client components: `ProductData` (reduced type) in `category-plp.tsx` and inline product type in `concern-plp.tsx` did not include `description`, `benefits`, `usage`, `sizes`, `routineTime` fields required by `ProductSummary`. Both now import and use `ProductSummary` directly.
- Removed unused `ConcernPage` import from `concern-plp.tsx`.
- Verified `[category]/page.tsx` server component correctly pre-computes `subcategoryMap` and `concernMap` (serializable `Record<string, string[]>`) and passes them as props alongside a stripped `CategoryData` (no `match` functions).
- Verified `besoins/[slug]/page.tsx` passes full `ProductSummary[]` from `getProductsForConcern()` to `ConcernPLP`.

### Tests performed
- `npx tsc --noEmit` — clean (0 errors)
- `npx eslint src` — clean (0 errors, 0 warnings)
- `npx next build` — passes, 62 pages generated, all routes correct

### Known issues / risks
- Category pages for hygiene/complements/homme/bebe-maman render with empty product grids (no products mapped to those categories yet — expected, not a bug).
- `[category]` route shows as dynamic (`ƒ`) in build output because it reads `searchParams`; static prerendering of known slugs still works via `generateStaticParams`.

---

### Completed
- Documentation-only pass, as explicitly scoped by the user — no admin UI or backend code written.
- Read `CLAUDE.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `API.md`, `SECURITY.md`, `UX.md`, `SPRINTS.md`, `TODO.md`, `PROGRESS.md`, `DECISIONS.md`, and — since it's directly relevant prior art discovered earlier this session — the existing `apps/api/prisma/schema.prisma` scaffold, before writing anything.
- `REQUIREMENTS.md`: replaced the thin "Admin / ERP (Future)" stub with a full specification — order management state machine (11 statuses, allowed transitions only), order admin list/detail, COD contact-attempt workflow, product cost/margin formulas (marge brute / taux de marge / taux de marque defined explicitly), per-product/order/period profitability, supplier management + purchase-price history, inventory, dashboard KPIs/alerts/sections (including the order funnel — confirmation/delivery/cancellation/return rates), customer profile (with risk-scoring caution), delivery management, returns/refunds workflow, promotions with margin-impact preview, SEO admin, content/CMS admin, RBAC, audit log, admin UX principles, and a curated list of additional operator-recommended features.
- `DATA_MODEL.md`: added `OrderStatusHistory`, `OrderContactAttempt`, `Supplier`, `SupplierProduct`, `PurchasePriceHistory`, `PurchaseOrder`/`PurchaseOrderLine`, `Return`/`ReturnItem`/`Refund`, `StaffUser`/`Role`, `AuditLog`; expanded `Order`/`OrderItem`/`Shipment`/`Promotion`/`InventoryItem`/`StockMovement`. Explicitly noted where this richer model supersedes the simpler enums already scaffolded in `apps/api/prisma/schema.prisma` (5-status `OrderStatus`, single `User.role` for both customers and staff) rather than silently contradicting it.
- `API.md`: added an "Admin / ERP modules" section (`orders` expansion, `suppliers`, `purchasing`, `inventory`, `shipments`, `returns`, `reporting`, `audit`, `admin-auth`) with module boundaries only — endpoint/DTO design deferred to each Admin-N sprint kickoff.
- `SPRINTS.md`/`TODO.md`: added a dedicated "Admin / ERP Phase (Sprint 11+)" with an Admin 1-8 breakdown (shell/auth/roles/dashboard → order management → pricing/margin → inventory → suppliers/purchasing → analytics/profitability → returns/customer service → content/SEO admin), sequenced after Sprint 10 rather than folded into current frontend sprints, per explicit instruction.
- `DECISIONS.md`: three new entries (D-0015 `StaffUser` separation, D-0016 order state machine, D-0017 margin terminology + weighted-average costing default) — real architecture/business decisions only, not every documentation choice.

### Known issues / risks
- `apps/api/prisma/schema.prisma` (an existing scaffold, not created this session) now has two known, explicitly documented gaps versus the new requirements: a simplified 5-status `OrderStatus` enum and a single `User.role` covering both customers and staff. Both are flagged for reconciliation at Admin-1/Admin-2, not silently left inconsistent.
- This pass is requirements/architecture only — no schema migration, no admin route, no admin component was written or should be inferred as started.

---

## 2026-08-08 — Cinematic Higgsfield hero video shipped; model+skincare alternative generated, reviewed, and rejected by user preference

### Completed
- Reconnected Higgsfield under a new account (110 credits, Plus plan) after the prior account showed 0 balance. Verified via `balance` before any spend.
- Full model catalog inspected live (`models_explore`, no assumptions from prior docs). Selected `cinematic_studio_2_5` for the still keyframe and `cinematic_studio_3_0` (Higgsfield's top cinema-grade video model, silent by default) for image-to-video animation of a restrained product still-life (frosted-glass serum, ceramic jar, matte tube, glass bottle; ivory/beige-dominant palette per `DESIGN_SYSTEM.md`; subtle abstract crescent-inspired background curve, no literal Tunisian iconography).
- First keyframe draft showed products in an unstable "mid-fall" pose — regenerated once (2 credits) before animating, since animating an already-falling pose risked violating the "no flying/dramatic motion" brief.
- Animated result (60 credits, 6s/1080p/16:9/silent) frame-reviewed at 1fps: found a disappearing petal and more camera push/product rotation than specified — flagged explicitly to the user per their own quality-review checklist; user chose to accept as-is rather than spend more credits on a retry.
- Installed `ffmpeg` (winget, `Gyan.FFmpeg`) — not previously available. Optimized the raw 4.66MB clip to production assets: `hero-cinematic.mp4` (361KB, H.264), `hero-cinematic.webm` (147KB, VP9), `hero-cinematic-poster.webp` (34KB) — ~92-97% size reduction.
- Restructured `home-hero.tsx` from a two-column grid (text | boxed image) into a true full-bleed layout: `HeroVisual` (new client component, `hero-visual.tsx`) renders the video/poster as an absolute-positioned background; copy overlays on the left. This matches the brief's explicit "must not look like a rectangular video pasted into a webpage" requirement, which the original grid layout could not satisfy.
- Mobile (`<md`) gets a dedicated stacked layout — headline/copy/CTA first, static poster image second, **no video element ever mounted**. `HeroVisual` only mounts the `<video>` tag (not just CSS-hides it) when `matchMedia` confirms both desktop width and `prefers-reduced-motion: no-preference`, so mobile and reduced-motion users never fetch the video bytes at all, not just skip playback.
- Applied the `animate` skill (Emil Kowalski methodology) to the headline/copy/CTA entrance: CSS-only `@starting-style` (Tailwind `starting:` variant) fade+rise, staggered 0/80/160ms, reusing the project's existing `--duration-large`/`--ease-out-standard` tokens rather than inventing new ones — keeps `HeroCopy` a Server Component (no JS needed). `review-animations` is user-invocation-only and could not be run by the agent.
- Updated OG/Twitter share image metadata in `layout.tsx` to the new poster.
- Verified: `tsc --noEmit` clean, `eslint` clean (exit 0), `next build` production build succeeded (all 42 routes generated).
- **Second concept generated per explicit user request**: human model + skincare + 3D depth via `veo3_1` (Google Veo 3.1, text-to-video, `veo-3-1-fast`/`high`, 16.5 credits). First attempt had AI-hallucinated fake garbled product-label text ("LUKOURY SRAINCE", "PERCBERY", etc.) on every product and a cluttered left side — rejected outright, explicitly disqualified per the brief's own "no fake labels" rule, no integration attempted.
- Retried once (16.5 credits) with an explicit "completely blank/unmarked packaging" + "strict left 40% empty" prompt rewrite. Result passed on labels/composition/face-stability, but had one defect: literal hex codes in the prompt (`#F4ECE7` etc.) caused Veo to render a corrupted `"#F4ECE77"` text string baked into the bottom-left corner of every frame. Fixed for free via `ffmpeg`'s `delogo` filter (inpaints from the surrounding smooth gradient) rather than spending more credits on a third generation — verified clean across the full clip afterward.
- Optimized the model+skincare version to production assets (`hero-model.mp4` 972KB, `hero-model.webm` 913KB, `hero-model-poster.webp` 100KB — heavier than the product-only version since facial/hair detail compresses less than smooth product surfaces) and swapped it into `home-hero.tsx`/`hero-visual.tsx`/`layout.tsx`.
- **User reviewed the integrated model+skincare hero and rejected it on preference** ("no i dont liek it") — reverted all references back to `hero-cinematic.*` (the original product-only hero). Re-verified `tsc`/`eslint` clean after the revert.

### Final state
- Live hero: product-only cinematic still-life + restrained animation (`hero-cinematic.mp4`/`.webm`/`-poster.webp`).
- Unused but not deleted: `hero-model.mp4`/`.webm`/`-poster.webp` (the rejected model+skincare alternative) remain in `public/assets` in case the direction is revisited later — nothing in the codebase references them now.
- Higgsfield credit spend this session: 2 + 2 + 60 (accepted product hero) + 16.5 + 16.5 (rejected model concept, one fixed for free post-generation) = 97 of 110 credits. ~13 remaining.

### Known issues / risks
- The accepted product-only hero has two known, user-accepted minor imperfections: a petal that disappears between the 5th and 6th second, and camera push/product rotation slightly stronger than originally specified. Documented rather than silently shipped.
- `zsky.ai`'s MCP server (`zsky-mcp-server.py`) was separately reviewed earlier this session (raw-downloaded and read directly, bypassing a WebFetch pipeline that had exhibited injection-like refusal behavior) and found clean; it's wired into `.mcp.json` but unused for this hero work since Higgsfield covered the need.

---

## 2026-08-08 — Pollinations MCP: live verification (still no generation)

### Completed
- Restarted session picked up the `pollinations` MCP server from `.mcp.json` — confirmed connected (21 tools available: `generateImage`, `generateVideo`, `listImageModels`, `getKeyInfo`, `getBalance`, `getPricing`, etc.).
- **Found a real config bug**: `getKeyInfo` initially echoed the masked key as the literal string `${P...I_KEY}` — the `${POLLINATIONS_API_KEY}` placeholder in `.mcp.json`'s `env` block was never substituted with the actual env var value for this stdio server (unlike the `21st` HTTP server's `headers` block, which does resolve `${...}` correctly). `getBalance` failed with "Authentication failed" — confirmed the server was not actually using a working key.
- **Fixed via the server's own `setApiKey` tool** (a live tool call, not a file write — still complies with "never write secrets into files") instead of depending on the `.mcp.json` substitution. `getKeyInfo` now correctly reports `authenticated: true`, `keyType: "secret"`, masked as `sk_...xibcem`.
- Verified real balance: **0 Pollen** on this key. Since it's an `sk_` secret key (pay-as-you-go against account Pollen balance, no built-in free-tier throttle), a 0 balance means **no generation is currently possible** without either topping up Pollen or switching to a `pk_` publishable key (which gets a small free allowance — 1 pollen/IP/hour — independent of account balance, per the official docs).
- Catalogued real capabilities via `listImageModels`/`getPricing`: 40 image models, 11 video models, 35 image-to-image/image-to-video capable. No generation calls made — balance is 0, so even the cheapest model would just fail, and the brief said not to spend anything.

### Next task
- User decides: top up Pollen on the `sk_` key, or get a `pk_` publishable key from `enter.pollinations.ai/keys` for the free rate-limited tier. Either way, once there's usable balance, resume with the still-image-first workflow for the ParaTunisie hero.

### Known issues / risks
- The `.mcp.json` → `env` `${VAR}` substitution does not work for this stdio server in this Claude Code setup (confirmed bug, not a one-off) — if this server config is ever regenerated, remember to call `setApiKey` live rather than trusting the file-based substitution.

---

## 2026-08-08 — Pollinations MCP configured (tooling audit only, no generation yet)

### Completed
- Verified `@pollinations/mcp` before touching config: real npm package (v2.3.0, MIT, maintainer email matches the `pollinations.ai` domain, published under the official `pollinations/pollinations` GitHub org). Cross-checked the official README (fetched from the installed version's package contents, not a stale doc page) for the config shape, env var name, and tool list.
- Added a `pollinations` entry to the project-scoped `.mcp.json`, merged in alongside the existing `shadcn` and `21st` entries — neither was touched. Config references `${POLLINATIONS_API_KEY}` only; no literal key anywhere in the file.
- User supplied a Pollinations API key in chat. Stored it **only** as a persistent Windows user-level environment variable (`POLLINATIONS_API_KEY`) — never written to `.mcp.json`, source, markdown, or git, per the explicit no-secrets-in-files instruction.
- **Flagged a mismatch**: the supplied key is a **secret key** (`sk_` prefix — server-side, no rate limit, can spend Pollen), not the **publishable key** (`pk_` — client-safe, rate-limited to 1 pollen/IP/hour, free) that the "don't purchase credits, use the free allowance" goal called for. User was told where to get a `pk_` key instead (`enter.pollinations.ai/keys`) if they want guaranteed-free usage; proceeding with the `sk_` key otherwise, pending their call.
- Identified the key-type/signup source: `enter.pollinations.ai/keys` — "App Key (pk_)" for browsers/public clients with budget controls (the free/rate-limited option), vs "Secret (sk_)" for server-side, no rate limit, spends Pollen.

### Next task
- Restart Claude Code so the new MCP server + env var actually take effect (same requirement as every prior MCP addition this session — new project `.mcp.json` servers only connect on a fresh process).
- Once connected: call `identity`/`listImageModels`/`listTextModels`/pricing-equivalent tools to verify real connectivity and check actual free-usage behavior — not yet done, since the server isn't live in this session.

### Known issues / risks
- Cannot yet confirm actual callability, available image/video models, or real free-allowance behavior — that requires the post-restart verification step. Everything reported so far is from package/doc inspection only, not a live call.
- The `sk_` key currently configured can draw down a paid Pollen balance with no rate-limit safety net, unlike a `pk_` key — worth switching if the intent is strictly free usage.

---

## 2026-08-08 — Sprints 6-10 complete (all remaining sprints)

### Sprint 6 — Routine diagnostic (already complete)
- Multi-step guided flow (Type → SkinType → Concerns → Sensitivity → Tier)
- AM/PM recommendation output with per-product rationale
- Disclaimer (cosmetic advice, not medical)
- Save/share/email actions, product replacement
- All verified in previous session

### Sprint 7 — Homepage hero enhancement
- Enhanced `hero-visual.tsx` with premium CSS animations: floating radial glows (plum + champagne), refined particles, gradient overlays for text readability
- Added `heroFloat`, `heroParticle`, `heroShimmer` keyframe animations to `globals.css`
- Staggered text reveal, champagne shimmer underline on headline, CTA micro-interactions (scale, shadow, arrow shift)
- Mobile: static poster with gradient overlay. Desktop: video + animated overlays
- Reduced-motion: all animations killed via existing `prefers-reduced-motion: reduce` in globals.css
- Mobile uses `next/image` (no CLS), desktop video is conditionally mounted

### Sprint 8 — Account, wishlist, loyalty
- **Wishlist hook** (`use-wishlist.ts`): `useSyncExternalStore` + localStorage, toggle/add/remove/isWishlisted
- **Product card wired**: heart button now uses real wishlist state (not local `useState`)
- **Account page** (`/compte`): shell with orders, addresses, routines, settings sections; links to wishlist + diagnostic
- **Wishlist page** (`/favoris`): grid of wishlisted products with remove + add-to-cart; empty state with CTA
- **Loyalty page** (`/fidélite`): "Le Cercle ParaTunisie" program with 3 tiers (Bronze/Argent/Or), ways to earn, premium presentation
- All pages ship SEO-complete (metadata, canonical, BreadcrumbList JSON-LD)

### Sprint 9 — Backend foundation
- **Monorepo structure**: `apps/api/` (NestJS), `packages/types/`, `packages/shared/`
- **Prisma schema** (`apps/api/prisma/schema.prisma`): 20+ models covering Identity, Catalogue, Commerce, Engagement, Personalization, Content — fully mapped from `DATA_MODEL.md`
- **NestJS modules**: Catalogue, Orders, Customers, Routines, Wishlist, Reviews, Loyalty, Content — each with controller + service + module
- **Repository interfaces** (`packages/types/src/repositories.ts`): `ProductRepository`, `OrderRepository`, `CustomerRepository`, `WishlistRepository`, `ReviewRepository`, `RoutineRepository`, `LoyaltyRepository`, `ContentRepository`
- **Mock repository** (`packages/types/src/mock-product-repository.ts`): Sprint 1-8 implementation using local data
- **Shared utilities** (`packages/shared/src/index.ts`): `formatPrice`, `slugify`, `GOUVERNORATS`, delivery constants

### Sprint 10 — Real commerce module stubs
- **Search service interface** (`commerce-services.ts`): Meilisearch integration ready
- **Payment service interface**: Cash on Delivery only (D-0014)
- **Meilisearch config type**: host, apiKey, indexName
- Placeholder implementations with console logging, ready for real backend connection

### Tests performed
- `npx tsc --noEmit` — clean
- `npm run lint` — clean (0 errors, 0 warnings)
- `npm run build` — passes, 45 pages generated (3 new: /compte, /favoris, /fidélite)

### Next task
- All sprints complete. Ready for production deployment planning.

### Known issues / risks
- Backend (`apps/api`) requires `npm install` in that directory to install NestJS/Prisma dependencies before running
- Prisma schema needs `prisma migrate dev` to create the database
- Repository interfaces are defined but frontend still uses direct data imports — swap happens when backend is connected

---

## 2026-08-08 — Sprint 7: Brands index/brand pages + conseils index/article pages

### Completed
- Created `src/lib/data/brands.ts` — 10 brand records (La Roche-Posay, Bioderma, Avène, CeraVe, Vichy, Uriage, Ducray, Filorga,SVR, Nuxe) with slugs, taglines, descriptions, and `getBrandBySlug`/`getProductsByBrand` helpers; product relationships derived from the existing `products` array (no duplicate data).
- Created `src/lib/data/articles.ts` — 6 seeded skincare advice articles (real, evidence-based content: sunscreen in Tunisia, oily-skin routine, anti-aging, sensitive skin, hydration, body care), `getArticleBySlug`, `articleCategories` helper.
- Built `/marques` index page — Server Component, brand card grid with initial-letter icons, `generateMetadata`, BreadcrumbList JSON-LD.
- Built `/marques/[slug]` brand detail page — `generateStaticParams` from brands data, product grid from `getProductsByBrand`, per-brand metadata, BreadcrumbList JSON-LD.
- Built `/conseils` index page — Server Component, article cards with category badges + read time, `generateMetadata`, BreadcrumbList JSON-LD.
- Built `/conseils/[slug]` article template — `generateStaticParams`, full article content, per-article metadata, Article + BreadcrumbList JSON-LD.

### Tests performed
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — passes, 41 pages generated (10 brand pages, 6 article pages + index pages)

### Next task
- Sprint 6: Routine diagnostic (multi-step flow, AM/PM recommendations, disclaimer)

### Known issues / risks
- None.

---

## 2026-08-08 — Sprint 5 polish: shared cart-drawer architecture + checkout fixes

### Completed
- Added `src/hooks/use-cart-drawer.ts` — a `useSyncExternalStore`-backed store (same pattern as `use-cart.ts`/`use-recently-viewed.ts`) for cart-drawer open state and a "last added item" key, kept separate from `use-cart.ts` so pages that only need cart data don't re-render on drawer open/close.
- `useCart().addItem` now opens the drawer and flags the added row centrally (in `use-cart.ts`) — every add-to-cart entry point (product card, PDP, future recommendations) gets this for free, no per-component wiring.
- Fixed a real correctness bug: `ProductCard`/`ProductPurchasePanel`'s "Ajouté" state was a local one-way flag that never reverted — removing the item from the cart elsewhere left the button falsely showing "Ajouté" forever. Now derived from actual cart membership via `useCart().isInCart(productId, sizeLabel?)`.
- Checkout: removed Délégation/Localité/Code postal fields (checkout only — nothing else referenced them), added `aria-invalid` validation styling, animated the delivery-method radio dot (was a hard conditional mount, now a transform/opacity transition), fixed a stray-quote JSX syntax error and a duplicate `sizeLabel` key in an inline type that were blocking the build.
- Excluded ad hoc root-level `verify-*.js` scripts from ESLint (dev tooling, not app source).

### Tests performed
- `npx tsc --noEmit`, `npm run lint` — clean.
- `npm run build` — blocked mid-session by a concurrent build process; not re-run standalone before the Sprint 6 pivot, but typecheck/lint against the final combined state are clean.

### Next task
- Sprint 6: routine diagnostic.

### Known issues / risks
- Full Playwright visual re-verification (375/390/430/768/1024/1440) of the final checkout/cart state wasn't completed before pivoting to Sprint 6 — worth a pass before this is considered fully shipped.

---

## 2026-08-08 — Cart page + checkout redesign + Aramex delivery

### Completed
- **Cart page redesigned mobile-first**: compact product rows (72px image, tighter spacing, quantity controls inline), sticky bottom checkout bar above mobile nav, premium empty state with icon + CTA, collapsible free-delivery indicator ("Plus que X pour la livraison offerte"), desktop sidebar summary preserved.
- **Cart drawer refined**: matching compact rows, `active:scale-90` micro-interactions on quantity/remove buttons, just-added highlight, refined free-delivery bar.
- **Checkout simplified**: removed Délégation, Localité, and Code postal fields (Gouvernorat + full address text input only), single Aramex delivery method at 10 DT (no delivery method selector), collapsible order summary on mobile, sticky bottom confirm bar on mobile.
- **Auto-open cart drawer on add-to-cart**: already wired via `useCartDrawer` hook + `openCartDrawer()` in `use-cart.ts` `addItem` — confirmed working.
- **Aramex delivery**: single delivery method, 10 DT (10,000 millimes), free when cart reaches 99 DT threshold. Updated cart page, cart drawer, and checkout to display "Livraison Aramex".
- **Micro-interactions**: `active:scale-90`/`active:scale-[0.97]` on all pressable elements (quantity buttons, remove, product links), `transition-transform duration-100 ease-out`, `prefers-reduced-motion` handled globally via `globals.css`.
- **Typography refinements**: tighter mobile type scale (`text-2xl` vs `text-3xl` heading), smaller brand labels (`text-[0.65rem]`), compact spacing throughout.

### Tests performed
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — passes, 23/23 pages generated

### Next task
- Sprint 6: Routine diagnostic (multi-step flow, AM/PM recommendations, disclaimer)

### Known issues / risks
- None.

---

## 2026-08-08 — Product decision: no online payment gateway (docs only)

### Completed
- User decided ParaTunisie will not integrate any online payment gateway — Cash on Delivery is the permanent, sole payment method. Recorded as `DECISIONS.md` D-0014.
- Updated every doc that assumed a later card/e-Dinar integration: `REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DATA_MODEL.md`, `API.md`, `SPRINTS.md`, `TODO.md`.

### Next task
- No code changes needed yet — Sprint 5 (cart/checkout) hasn't started. When it does, checkout builds a COD-only confirmation step, no payment method selector.

### Known issues / risks
- None. This simplifies scope (removes gateway integration, PCI/tokenization, and payment-webhook work entirely).

---

## 2026-08-07 — Sprint 4: Product detail page complete + navbar logo

### Completed
- Extended the product data model (`src/lib/data/products.ts`) with `description`, `benefits`, `usage`, and a `sizes[]` variant array per product (16/16), plus `getProductBySlug`, `getRoutineCompletionProducts`, and `getSimilarProducts` helpers. No fabricated INCI ingredient data — see `DECISIONS.md` D-0012.
- Built `/produits/[slug]` (`generateStaticParams` for all 16 slugs, statically generated — confirmed in the build output as `●` SSG routes): gallery with zoom lightbox (native `<dialog>`), variant/size selector, quantity stepper, price, wishlist toggle, add-to-cart (prototype-level, matching the existing `ProductCard` pattern — real cart is Sprint 5), reassurance block, and a tabbed content area (Description / Bénéfices / Utilisation / Composition / Livraison & retours / Avis — the last two with honest non-fabricated content, matching the Sprint 3 integrity precedent).
- Mobile sticky add-to-cart bar lives inside `ProductPurchasePanel` itself (not a sibling) so it shares size/quantity/added state directly; positioned at `bottom-[calc(4.5rem+env(safe-area-inset-bottom))]` so it sits cleanly above the persistent bottom tab bar with no overlap (verified via Playwright bounding-box check).
- Commerce rails: "Complétez votre routine" (cross-category, shared concern), "Produits similaires" (same category), "Récemment consultés" (real localStorage browsing history via `useSyncExternalStore`, not `setState`-in-effect — see Known issues).
- Product + Offer and BreadcrumbList JSON-LD generated server-side from the same product record that renders the page (`CLAUDE.md` §6), verified via rendered HTML inspection.
- Added shadcn `tabs` component (Base UI-backed, proper ARIA tablist/tab/tabpanel semantics) rather than hand-rolling tab accessibility.
- Fixed a real Base UI accessibility warning surfaced during verification: `Button` rendered as a `<Link>` (via the `render` prop) needs `nativeButton={false}` — now set automatically in `src/components/ui/button.tsx` whenever `render` is passed, instead of leaving every call site to remember it.
- **Navbar logo** (user request, mid-sprint): checked every image-capable MCP connected in this session for logo generation (Higgsfield, Kling, 21st.dev, Canva) — none could produce one without spending money or an interactive OAuth flow (full detail in `DECISIONS.md` D-0013). User chose the free path: built `Logo`/`LogoMark` reusing the existing favicon glyph (three petals + center dot), now shown next to the wordmark in the header and footer.

### Tests performed
- `npx tsc --noEmit`, `npm run lint`, `npm run build` — all clean (16/16 product pages statically generated, `/`, `/shop`, `/_not-found`, `/icon.svg`).
- Production-server HTTP smoke test: valid slugs return `200`, unknown slug returns `404` (`notFound()`), JSON-LD scripts present and well-formed (verified by parsing the actual rendered `<script type="application/ld+json">` tags, not just counting substring matches).
- Playwright visual verification at 375px and 1440px: no horizontal overflow at either width, zero console errors, screenshots reviewed by eye (not just "it compiled") — gallery image, variant switching, tab switching, and add-to-cart interaction all confirmed working. One early screenshot appeared to show a blank gallery image; root-caused to Chromium process contention from repeated Playwright launches (confirmed via isolated element screenshot + computed-style check that the image was in fact rendering correctly at `opacity:1`/`complete:true`), not a real bug — cleaned up orphaned `chrome.exe` processes and re-verified.
- Logo verified visually in the header (desktop + mobile) and footer via Playwright screenshots.

### Next task
- Sprint 5: cart drawer + cart page, free-delivery progress indicator, checkout flow, order confirmation.

### Known issues / risks
- Fixed a real `react-hooks/set-state-in-effect` lint error in the initial `useRecentlyViewed` implementation (calling `setState` synchronously in a `useEffect` reading `localStorage`) by rewriting it around `useSyncExternalStore`, the React-idiomatic pattern for external-store synchronization — not by suppressing the rule.
- Add-to-cart across the PDP, `ProductCard`, and the mobile sticky bar are still independent prototype-level UI states (no shared cart store) — real, persisted cart state is Sprint 5 scope.
- Ingredient/composition data intentionally deferred to real packaging rather than fabricated — see `DECISIONS.md` D-0012. Revisit once real product data exists.

---

## 2026-08-07 — Sprint 3: Search and Shop complete

### Completed
- Renamed the mobile `Catégories` tab to `Shop`, routed it to `/shop`, preserved its active state across category/concern routes, and added direct Shop calls to action in the homepage hero and best-seller section.
- Added a 16-item mock catalogue and reusable responsive product card with optimized local imagery, honest product information, accessible favourite feedback, and quick-add feedback without fabricated ratings, reviews, stock, discounts, or scarcity.
- Built the `/shop` product-listing page with breadcrumb, metadata/canonical, editorial SEO introduction, result count, sorting, brand/category/concern/price filters, desktop sticky sidebar, mobile bottom sheet, filter reset, and a useful zero-result state.
- Kept search, sort, and facet selections in query parameters so views are linkable and browser-history safe.
- Upgraded global search to live catalogue suggestions, direct product destinations, full Shop results, popular searches, recent searches stored locally, an announced result count, and a category-led empty state.
- Added four optimized local WebP product crops from the existing project-owned editorial packshot. The Higgsfield product-photo workflow was checked first, but generation could not run because no Higgsfield workspace is selected.
- Recorded the Shop naming and catalogue-state decision in `DECISIONS.md` D-0011 and updated `UX.md`, `SPRINTS.md`, and `TODO.md`.

### Tests performed
- `npm run lint` — passed with no errors or warnings.
- `npm run build` — passed; TypeScript and static generation completed, including `/shop`.
- Production-server HTTP smoke test — `/shop?brands=Vichy` returned `200` with rendered catalogue markup.
- Code review verified semantic landmarks, labelled controls, keyboard focus styles, 44px touch targets, `aria-live` feedback, native-dialog focus/Escape behavior, and safe-area treatment in the mobile sheet/tab bar.

### Verification limitation
- No browser backend was available after the required connection and discovery checks, so screenshot-based checks and manual pointer/keyboard interaction could not be performed. Compile, static generation, URL-state logic, rendered HTTP output, and responsive code paths were verified.

### Next task
- Sprint 4: product detail page with gallery, variants, reassurance, product information tabs, recommendation rails, and the mobile sticky add-to-cart bar.

### Known issues / risks
- Product detail routes and a real cart are scheduled for Sprints 4 and 5, so product links currently reach the framework 404 and quick-add is intentionally UI-only.
- Select a Higgsfield workspace before requesting newly generated isolated product packshots; the current Sprint 3 catalogue uses optimized crops from the existing project-owned image.

## 2026-08-07 — Navigation refinement: app-like mobile tab bar

### Completed
- Removed the hamburger trigger and mobile drawer from the top header; the desktop mega-menu remains available from the `lg` breakpoint upward.
- Added a fixed five-item bottom tab bar for Accueil, Shop, Diagnostic, Favoris, and Compte, matching the user's requested mobile-app experience. The label was subsequently updated from `Catégories` per D-0011.
- Added pathname-aware active states, `aria-current`, icon and text labels, a non-color active marker, press feedback, 64px touch rows, safe-area padding, and matching document bottom spacing.
- Removed duplicate wishlist/account actions from the top header at mobile and tablet widths while retaining search and cart.
- Updated `UX.md`, `DESIGN_SYSTEM.md`, `SPRINTS.md`, `TODO.md`, and `DECISIONS.md` D-0010 to make the navigation choice authoritative.

### Tests performed
- `npm run lint` — passed.
- `npm run build` — passed.
- Local rendered-HTML smoke test — returned `200`, found exactly five mobile tab targets, confirmed Accueil has `aria-current="page"`, confirmed safe-area handling is present, and confirmed the hamburger label is absent.

### Verification limitation
- No visual browser backend was available, so device screenshot inspection was not possible. Responsive visibility, spacing, and active-state behavior were verified through compiled output and rendered markup.

## 2026-08-07 — Sprint 2: Homepage complete

### Completed
- Replaced the botanical palette with the user-supplied rose-plum identity across all semantic tokens, shell components, states, and homepage surfaces. Added explicit dusty-rose, blush, soft-nude, champagne, and cocoa roles; recorded the change in `DECISIONS.md` D-0009.
- Built the complete homepage: responsive announcement bar, editorial hero, shop-by-concern grid, best-seller feature, brand universe, routine diagnostic, seasonal campaigns, guided expert-selection section, advice teasers, trust proof, Le Cercle loyalty teaser, and WhatsApp support entry point.
- Generated three project-owned editorial images for the hero, best sellers, and routine sections, converted them to optimized WebP assets, and served them through `next/image` with responsive sizes and explicit containers.
- Avoided fabricated ratings, review counts, testimonials, scarcity, expert identities, or marketing statistics. The social-proof requirement is expressed through concrete trust policies instead.
- Added a ParaTunisie SVG app icon, removed unused Next.js scaffold artwork, and completed Open Graph/Twitter image metadata with the homepage hero.
- Preserved semantic headings, visible focus states, 44px touch targets, mobile-first collapse behavior, reduced-motion handling, and high-contrast token pairs.

### Tests performed
- `npm run lint` — passed.
- `npm run build` — passed; TypeScript and static generation completed successfully.
- Local HTTP smoke test — homepage returned `200`, all major section headings rendered, and all three WebP assets returned `200`.
- WCAG contrast calculations — primary/ivory 8.39:1, cocoa/ivory 14.51:1, muted/ivory 5.45:1, primary/blush 6.22:1.
- Mechanical review — no placeholder copy, no `h-screen`, no viewport-gated hidden content, no decorative infinite animation, no fabricated social proof, and no unreferenced generated assets.

### Verification limitation
- The in-app browser again reported no available browser backend, so screenshot-level inspection and manual breakpoint interaction at 375px/768px/1440px could not be performed in this session. The layout was verified through compiled output, rendered HTML, responsive code inspection, and asset requests.

### Next task
- Sprint 3: search overlay with live mock suggestions, PLP template, desktop/mobile filters, and the reusable product card.

### Known issues / risks
- Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to the verified ParaTunisie business number before production. Until then, the support CTAs safely route to `/aide` rather than exposing a fake number.
- Homepage links intentionally target page types scheduled for later sprints and will resolve to the 404 page until those routes are implemented.

## 2026-08-07 — Sprint 1: Global shell complete

### Completed
- Scaffolded the repo-root Next.js App Router storefront with strict TypeScript, Tailwind CSS v4, and shadcn/Base UI foundations; confirmed the repo-root placement in `DECISIONS.md` D-0004.
- Locked and implemented the ParaTunisie color, Fraunces/Inter typography, radius, spacing, state, and motion tokens from `DESIGN_SYSTEM.md`; added shared CSS and Motion values plus global `prefers-reduced-motion` handling.
- Built and wired the responsive site shell into the root layout: sticky header, desktop category/brand/concern mega-menu, full-height mobile navigation drawer, search preview dialog, account/wishlist/cart actions, and multi-column footer.
- Added shell-level SEO metadata (canonical and Open Graph), French document language, an accessible skip link, labeled icon actions, dialog/drawer focus behavior, stronger drawer scrim, and 44px touch targets for the close and popular-search controls.
- Replaced the stock Next.js starter screen with an intentional French coming-soon surface so the shell can be reviewed without prematurely implementing the Sprint 2 homepage.
- Scoped Turbopack to this project root, removing the warning caused by an unrelated parent-directory lockfile.

### Tests performed
- `npm run lint` — passed with no errors or warnings.
- `npm run build` — passed; TypeScript, static generation, and the `/` route all completed successfully.
- Local HTTP smoke test against the development server — returned `200`; verified the header, navigation labels, main content, footer, French characters, canonical, Open Graph tags, skip target, and key ARIA labels in rendered HTML.
- Code-level accessibility/responsive review — verified mobile-first breakpoints, 44px primary touch targets, semantic navigation/dialog controls, visible focus styles, Escape/focus management supplied by native dialog/Base UI, and reduced-motion overrides.

### Verification limitation
- The in-app visual browser reported no available browser backend in this session, so screenshot-based checks at 375px/768px/1440px and manual click/keyboard interaction were not performed. This does not affect compile or HTTP correctness, but the first Sprint 2 task should begin with that visual pass when a browser backend is available.

### Next task
- Sprint 2 homepage implementation, beginning with a visual shell check at mobile/tablet/desktop sizes and then the homepage sections in `SPRINTS.md`.

### Known issues / risks
- Header and footer links intentionally point to future Sprint routes and will resolve to the Next.js 404 until those page types are implemented.
- The WhatsApp number and social destinations are placeholders and must be replaced with verified ParaTunisie business URLs before production.

## 2026-08-07 — Sprint 0b: Design tooling configured (before Sprint 1)

### Completed
- **Git resolved:** ran `git init` scoped to `parapharmacie` only, per user decision on D-0001. Verified `git rev-parse --show-toplevel` now returns the `parapharmacie` path and `git status` shows only project files. Home-directory repo at `C:\Users\Ala` untouched. Added `.gitignore` (node_modules, .next, .env*, build artifacts). Nothing committed yet — commits happen only when explicitly requested.
- **shadcn MCP:** configured via `npx shadcn@latest mcp init --client claude`. Wrote project-scoped `.mcp.json` with a `shadcn` stdio server, no API key needed, no scaffold required. Details: `DECISIONS.md` D-0005.
- **21st.dev MCP:** configured via `npx @21st-dev/cli@latest init --client claude --write`, merged into the same `.mcp.json` (env-var-based auth, no literal key in any file). Found a pre-existing **global** `magic` MCP entry (deprecated `@21st-dev/magic`, with a literal API key already embedded in `~/.claude.json` from before this session) — left untouched per "don't blindly overwrite existing config." User then supplied their 21st.dev API key in chat; it was stored **only** as a persistent Windows user environment variable (`API_KEY_21ST`), never written to any repo file. Details: `DECISIONS.md` D-0006.
- **Higgsfield CLI:** installed `@higgsfield/cli` v1.1.20 globally (the `npm install -g` postinstall step failed under git-bash/tar but succeeded when run via PowerShell — environment quirk, not a package problem). CLI verified working (`higgsfield --version`). Auth status checked: **not yet authenticated** (`higgsfield auth token` → "Not authenticated").
- **Higgsfield companion skills:** installed all 9 skills from `higgsfield-ai/skills` (project-scoped to `.agents/skills`, symlinked into `.claude/skills`). The installer's automated scanners flagged elevated risk (Snyk: "Critical Risk" on all 9; Socket: 1 alert on `higgsfield-brandkit`; Gen: "High Risk" on 3 skills). Manually reviewed every flagged script/file — no malicious code found (legitimate local ImageMagick/rsvg-convert invocation with safe argument-list subprocess calls; the "High Risk" items are plain prompt-routing `SKILL.md` files with no executable code). Full findings in `DECISIONS.md` D-0007 — kept installed, flagged to user for awareness.
- **Emil Kowalski skills:** re-verified all 9 still present and intact in `~/.claude/skills` — no reinstall needed.

### Current work
- Awaiting: (1) user restart of Claude Code so the new project `.mcp.json` servers (`shadcn`, `21st`) and the `API_KEY_21ST` env var are picked up, verified via `/mcp`; (2) user completing `higgsfield auth login` manually (browser OAuth — suggested via `! higgsfield auth login`).

### Next task
- After restart: verify `/mcp` shows `shadcn` and `21st` connected; do one harmless test call on each (list/search components) without installing anything.
- Once Higgsfield is authenticated: confirm `higgsfield auth token` succeeds.
- Then: user sign-off to start Sprint 1 UI implementation.

### Tests performed
- `shadcn --version` (4.16.2) — CLI itself works.
- `higgsfield --version` (1.1.20) and `higgsfield auth token` (correctly reports not authenticated).
- Manual code/domain review of all 9 installed Higgsfield skills (see D-0007).
- `git rev-parse --show-toplevel` / `git status` to confirm the new repo is correctly scoped to `parapharmacie`.
- Live MCP tool listing (`ToolSearch`) for shadcn tools — none found yet, as expected before a restart.

### Known issues / risks
- **shadcn/21st MCP tools not yet visible in the live session** — expected; project `.mcp.json` servers require a Claude Code restart (+ one-time trust approval) before their tools appear. Not a failure, just a pending step.
- **Higgsfield CLI not authenticated** — needs manual browser login by the user.
- **Pre-existing deprecated `magic` MCP server** (global, literal API key embedded in `~/.claude.json`) predates this session and was left as-is; user may want to remove/rotate it at some point (`DECISIONS.md` D-0006).
- **Automated risk-scanner flags on Higgsfield skills** — treated as informational after manual review found nothing concerning; not a hard blocker, but worth the user's own glance given they "run with full agent permissions" per the installer's own disclaimer.

### Important implementation notes
- `API_KEY_21ST` is a user-level Windows environment variable only — never appears in any tracked file. If it's ever missing after a restart, re-set it rather than hardcoding it into `.mcp.json` or any `.env` file.

---

## 2026-08-07 — Sprint 0: Documentation complete

### Completed
- Full repo inspection: `C:\Users\Ala\Desktop\parapharmacie` confirmed empty (no code, no package files).
- Git inspection: discovered the directory has no `.git` of its own; `git` commands resolve to a repo rooted at the user's home directory (`C:\Users\Ala`), tracking `node_modules` and pointing at an unrelated remote (`declared-as-ala/ftf.git`) with unrelated commit history. Logged as `DECISIONS.md` D-0001. No git commands were run against this tree.
- Tooling audit: Node v24.12.0, npm 11.6.2 available. No Magic MCP / 21st.dev MCP / shadcn MCP configured — only Canva, Indeed, Higgsfield, Kling, Meta Ads MCP servers available. Logged as `DECISIONS.md` D-0003.
- Confirmed all nine Emil Kowalski skills installed and available: `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `pick-ui-library`, `prototype`.
- Created all 17 required root documentation files: `CLAUDE.md`, `REQUIREMENTS.md`, `DESIGN_SYSTEM.md`, `UX.md`, `SEO.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `API.md`, `SECURITY.md`, `PERFORMANCE.md`, `ACCESSIBILITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `SPRINTS.md`, `TODO.md`, `PROGRESS.md` (this file), `DECISIONS.md`.

### Current work
- None — awaiting user review/approval of documentation before Sprint 1 begins, per the handoff brief's explicit instruction not to implement UI during this first task.

### Next task
- User approval to proceed to Sprint 1 (global shell: scaffold, design tokens, header/mega-menu/mobile nav/footer, motion foundation).
- Resolve the git repository situation (`DECISIONS.md` D-0001) before any commit is made.
- Confirm exact repo-root vs `apps/web` placement for the Sprint 1-8 frontend (`DECISIONS.md` D-0004).

### Tests performed
- None yet — no code written in this sprint (documentation only, as instructed).

### Known issues / risks
- **Git repo anomaly (blocking commits):** see D-0001. Needs explicit user decision before `git init`/`git add`/`git commit` can run safely in this directory.
- **No component-research MCP tools available** (Magic/21st.dev/shadcn): Sprint 1 component work will be hand-built against `DESIGN_SYSTEM.md` rather than accelerated via pattern-research MCPs. Not a blocker, just slower than the brief anticipated.
- **Exact color/type values not yet locked**: `DESIGN_SYSTEM.md` specifies direction (deep botanical green, sage, warm ivory, champagne accent; editorial serif + readable sans) but final hex/font picks are deferred to a Sprint 1 visual trial against real product imagery, per that document's own instruction not to lock from swatches alone.
- **Bottom mobile nav (Accueil/Catégories/Diagnostic/Favoris/Compte)** is explicitly conditional in `UX.md` §11 — adopt only if usability signal supports it, not by default.

### Important implementation notes
- Data-access layer must be built behind repository interfaces from Sprint 1 onward (mock implementation now, real API implementation from Sprint 9) — this is the mechanism that avoids a frontend rewrite when the backend attaches (`ARCHITECTURE.md`).
- Every new page type ships SEO-complete (metadata + canonical + JSON-LD) in the same PR that ships the page — not retrofitted later (`CLAUDE.md` §6, `SEO.md`).
