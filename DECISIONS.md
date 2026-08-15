# DECISIONS.md — Architecture Decision Record

Only significant architectural/product/design decisions are logged here — not trivial choices (`CLAUDE.md` §15).

## D-0030 — Diagnostic Phase 2: Groq vision provider (Llama 4 Scout), private MinIO storage, zero raw-image retention, and red-flag referral

**Date:** 2026-08-15
**Decision:** Diagnostic Phase 2 integrates real vision cosmetic analysis into the NestJS `/diagnostic` engine:
1. **Groq Vision Provider**: Implemented via `GroqVisionProvider` (`apps/api/src/diagnostic/vision/groq-vision.provider.ts`), making direct HTTP `fetch()` calls to Groq's OpenAI-compatible chat completions endpoint (`https://api.groq.com/openai/v1/chat/completions`) using active model `qwen/qwen3.6-27b` (configurable via `GROQ_VISION_MODEL`).
2. **Medical Diagnosis Guardrails**: System prompt strictly forbids medical terms (`acne`, `eczema`, `rosacea`, `dermatitis`). Observations are restricted to 6 cosmetic parameters (`shine`, `visibleDryness`, `visibleRedness`, `visibleTexture`, `visiblePores`, `unevenTone`). Output is strictly validated at runtime (`validateVisionOutput`).
3. **Private Storage & Zero Retention**: Diagnostic photos are stored in a private MinIO bucket `paratunisie-diagnostics` (`DiagnosticStorageService`). Immediately after `analyze()` completes, the raw image binary is permanently deleted from MinIO (`removeObject`), and `DiagnosticPhoto.storageKey` is reset to `null` in PostgreSQL — only structured cosmetic observations persist.
4. **Red Flag Referral**: If `redFlag: true` is returned by the model, recommendation generation short-circuits — no product routine is built, and the storefront renders a medical referral notice.
5. **Signal Provenance**: Photo observations are merged into `NeedProfile` (`QuestionnaireService.mergePhotoObservations`), with signal sources tracked in `sources["questionnaire" | "photo"]`. Questionnaire answers override photo conflicts.

## D-0029 — Diagnostic rebuilt as a real, AI-ranked engine over real Postgres candidates; no manual need→category mapping; guest identity via opaque session token

**Date:** 2026-08-14
**Decision:** `/diagnostic` was a pure client-side quiz over a 16-item hardcoded mock array (`src/lib/data/diagnostic.ts`), completely disconnected from the real ~9,700-product catalogue. Rebuilt as a real NestJS `diagnostic` module (`apps/api/src/diagnostic/`):
1. **Retrieval → AI ranking → hard validation**, not a manual mapping table. `CatalogueService.findForRecommendation` (new) narrows the real catalogue to a candidate set (category subtree + keyword search), `RecommendationService` sends only that candidate set (never the full catalogue) to an AI provider (`DiagnosticRecommendationProvider` interface, `OpenAiRecommendationProvider` impl) which returns only `productId`s drawn from what it was given — every returned id is re-verified against Postgres (`findPublishedByIds`) before ever reaching the response. An initial `DiagnosticNeedMapping` (admin-editable need→category table) was built, then explicitly removed per the user's follow-up requirement: recommendation logic must be AI/database-driven, not something they maintain by hand in an admin screen.
2. **Keyword fallback, not a second mapping table.** When no AI key is configured (or a request fails), `diagnostic-rules/keyword-fallback.ts` ranks the same real candidates using an in-code French keyword dictionary — plain code, not an admin-editable table, so it satisfies "AI-driven, not manually mapped" even in its degraded mode. Name/category matches score 3x a benefit/description-only match (a hair dye's usage instructions can incidentally mention "shampooing"; that must not outrank an actual shampoo).
3. **Guest identity**: no customer login/session system exists anywhere in this codebase. `Routine.userId` was made optional and `Routine.sessionToken` (opaque, server-issued) added instead of building a full auth system for this feature alone. `POST /diagnostic/session/:id/save` was deliberately **not built** — "Enregistrer ma routine" stays `localStorage`-backed like every other guest feature (cart, wishlist) rather than shipping an endpoint that would have to trust a client-supplied `userId` with no real auth behind it.
4. **Budget is a routine total, not a per-item ceiling.** Found via real-data testing: filtering candidates by `priceMillimes <= budget` per item let a 6-item "Complète" routine total ~3.5x the user's stated budget. Fixed with a per-item heuristic ceiling (`budget / tierItemCap`) at retrieval time plus a hard post-assembly trim that drops lowest-priority items until the real total fits.
**Context:** Real taxonomy audit (`apps/api/prisma` queried directly) found the imported `Category` tree is heavily contaminated with brand-as-category nodes (a `Marques` root alone has 823 children) and the `Concern` many-to-many relation is populated on essentially 0 real products — so recommendation logic had to be built against real leaf categories + product text, not the `Concern` model the original schema seemed to imply, and not assumed-clean taxonomy.
**Reason:** Matches the user's explicit instruction (mid-implementation revision): "AI understands the need → AI evaluates real product facts → AI chooses the best products," with the database as ground truth and hard backend validation as the only thing the frontend ultimately trusts.
**Consequence:** `DiagnosticNeedMapping` was added to the schema then removed in the same session (migration history reflects both) — a real scope correction, not speculative churn. Phase 2 (photo/vision analysis) and Phase 3 (Admin question/mapping UI, analytics) were scoped but not built this pass — Phase 3's originally-planned "mapping management" admin screen no longer applies at all per this decision.

## D-0027 — Profitability gain/margin must never coerce unknown cost to zero; revenue always shown, gain/margin split from it

**Date:** 2026-08-13
**Decision:** `ProfitabilityTotals` (`profitability-calc.ts`) is split into `totalRevenueMillimes` (every item, always shown — orders are never hidden for lacking cost data) and `eligibleRevenueMillimes` (only items with a known cost snapshot). `gainMillimes`/`tauxMarge` are `number | null` — `null`, never `0` or a number computed against unknown cost, whenever `eligibleRevenueMillimes` is 0. This rule applies everywhere profitability is computed or displayed: KPI cards, the orders table, per-product rows, the order drawer, and the dashboard summary card all render `—` with an explanatory tooltip instead of a number when gain/margin can't be calculated.
**Context:** Live screenshots showed a confirmed 58.9 DT order reporting "Coût d'achat: 0,000 DT / Gain estimé: 58,900 DT / Taux de marge: 100%". Root cause: the original `aggregateProfitability` computed `gainMillimes = revenueMillimes - costMillimes` using revenue from **all** items but cost summed only from items **with a known cost** — so when zero items had a cost snapshot, gain silently equaled full revenue. This is precisely the "silent zero fallback" anti-pattern `REQUIREMENTS.md` §15 explicitly warns against (`item.unitPurchaseCost ?? 0` and its equivalents) — except it was hiding inside an aggregate function's arithmetic, not an obvious `?? 0`, which is why it shipped in the first sub-agent-reviewed pass.
**Reason:** A margin figure computed against unknown cost isn't "conservative" or "approximately right" — it's fabricated, and 100% margin is the single most misleading number this system could show a shopkeeper making pricing/restocking decisions.
**Consequence:** Every consumer of `aggregateProfitability` (`getOverview`, `getOrdersTable`, `getOrderDetail`, `buildDailySeries`, `buildProductProfitability`) was audited and fixed for the same class of bug — `buildProductProfitability` had an identical latent version at the per-product level (summing total revenue but only known-cost items' cost). Tests added (`profitability-calc.spec.ts`) assert `gainMillimes`/`tauxMarge` are `null`, not a number, when cost coverage is 0 — this is now a regression-tested invariant, not just documented intent.

## D-0028 — Docker image staleness during active development: rebuild after every backend change that must survive a container restart

**Date:** 2026-08-13
**Decision:** No schema/architecture change — an operational lesson worth recording. During this session, `paratunisie-api`'s Docker image was built once (capturing the `profitability` module) and never rebuilt again despite several more backend changes landing on disk (the seed-script cost backfill, then this session's zero-fallback fix). Since the API container's entrypoint runs `prisma db seed` on every restart, and Docker images are frozen at build time (no live bind-mount), every container restart silently re-seeded the database using the **stale, pre-backfill** seed script — undoing locally-verified fixes without any error or warning.
**Context:** Traced directly: `docker exec paratunisie-api sh -c "grep -c 'Backfilled cost snapshot' /app/prisma/seed.ts"` returned `0` on an image that otherwise had the full profitability module compiled in, confirming the image predated the backfill step added later in the same working session.
**Reason:** Verifying a fix by running it directly against the dev database (via local `ts-node`/`node`) is necessary but not sufficient when a containerized process with its own entrypoint logic (reseeding) also writes to that same database on its own schedule (restart).
**Consequence:** Any session that touches `apps/api` and expects the change to persist across container restarts should rebuild (`docker compose build paratunisie-api`) as part of that unit of work, not defer it — deferring it is what caused this bug to reappear after being fixed once already.

## D-0026 — Rentabilité: cost snapshot at CONFIRMEE, Fournisseurs/Achats soft-hidden, backfill flagged estimated

**Date:** 2026-08-13
**Decision:** Three linked decisions for the new `/admin/rentabilite` page:
1. `OrderItem.unitCostMillimes` is snapshotted once, at the `CONFIRMEE` transition (`orders.service.ts`'s `updateOrderStatus`, using the existing weighted-average cost service), not at raw order creation — so a later `PurchasePriceHistory` change never retroactively moves an already-confirmed order's gain.
2. `/admin/fournisseurs` and `/admin/achats` are removed from the sidebar/dashboard (not visible in the admin experience) but their route files, components, and all backing Prisma models (`Supplier`, `SupplierProduct`, `PurchasePriceHistory`, `PurchaseOrder`, `PurchaseOrderLine`) are left in place — confirmed with the user. Deleting them would break `InventoryService.getWeightedAverageCost` and `ReportingService`'s "missing supplier price" alert, both of which read `PurchasePriceHistory` today, and would remove the only UI path that writes new purchase costs.
3. Historical/backfilled cost values are never presented as exact: `OrderItem.costIsEstimated` (new field) is `true` for anything derived after the fact from current weighted-average cost rather than captured live at confirmation, and the Rentabilité UI labels these accordingly.
**Context:** `REQUIREMENTS.md` §B/§C/§D (profitability), user request to simplify the admin around gain-on-confirmed-orders while reusing the SPRINT H purchase-cost system rather than building a second one.
**Reason:** (1) ties the snapshot to a single well-defined event already owned by the order state machine. (2) avoids a destructive UI change silently breaking a dependency the investigation confirmed was real, not incidental. (3) matches `REQUIREMENTS.md`'s explicit instruction not to silently pretend historical values are exact when they're a best-effort estimate.
**Consequence:** A production backfill for pre-existing confirmed orders without a snapshot is available via `ProfitabilityService.backfillMissingCosts()` (`POST /profitability/backfill-missing-costs`, `SUPER_ADMIN` only) — always marks `costIsEstimated: true`. Dev seed data uses an equivalent inline backfill (not the same code path, since `seed.ts` runs outside Nest DI) for the one seeded `CONFIRMEE` order.

---

## D-0023 — Minimal admin auth (`StaffUser` + JWT cookie) added ahead of full RBAC

**Date:** 2026-08-13
**Decision:** Added a `StaffUser`/`Role` model and a small `admin-auth` module (login/logout/me, bcrypt password check, JWT issued as an HttpOnly/Secure/SameSite cookie) with an `AdminAuthGuard` + `RolesGuard`/`@Roles()` decorator. Applied to the new SPRINT F/H controllers (`reporting`, `inventory`, `suppliers`, `purchasing`) only.
**Context:** SPRINT H exposes supplier costs and margins, which `CLAUDE.md` §3 requires to be auth/role-checked even on "internal" endpoints — but zero auth existed anywhere in `apps/api` before this (no `StaffUser`, no guards on any controller, no admin login page). Building the full RBAC system described in `REQUIREMENTS.md` §M (granular permissions, staff management UI) is a separate, larger scope than SPRINT F/H.
**Reason:** Ship real admin-only cost data in compliance with `CLAUDE.md` §3 without expanding this pass into a full RBAC project.
**Consequence:** `orders`, `catalogue`, `customers`, and the other pre-existing modules remain unguarded — a known, pre-existing gap this pass does not retrofit. A dedicated future pass should apply `AdminAuthGuard` repo-wide and build out real per-role permission granularity if `Role`'s coarse enum proves insufficient.

---

## D-0024 — `Order.status` promoted to a real 11-value enum with guarded transitions (not full SPRINT G)

**Date:** 2026-08-13
**Decision:** `Order.status` changed from a free `String` to the `OrderStatus` enum (`REQUIREMENTS.md` §A.1's 11 values), with an append-only `OrderStatusHistory` audit table and a server-side transition table (`apps/api/src/orders/order-status.ts`) enforcing `REQUIREMENTS.md` §A.2's allowed-transitions graph. Stock-accounting moment: **reserve on `CONFIRMEE`, deduct (sale) on `LIVREE`**, release reservation on `ANNULEE`/`REFUSEE`/`RETOURNEE`.
**Context:** SPRINT H's inventory reservation/sale hooks need a trustworthy order status to trigger off. `TODO.md` marked SPRINT G ("Orders operational workflow," the D-0016 state machine) done, but it was never actually implemented — `Order.status` was still a bare unvalidated string and `PATCH /orders/:id/status` accepted any value. `TODO.md` corrected accordingly.
**Reason:** Deducting stock on `LIVREE` rather than `EXPEDIEE` avoids decrementing stock for parcels that fail delivery or are returned — safer for a COD-only business where a meaningful share of shipments don't complete.
**Consequence:** This is a deliberately scoped fix, not full SPRINT G — `OrderContactAttempt` persistence, COD-by-courier/staff reporting, and the returns/SLA-aged queue remain open, unimplemented, and tracked as SPRINT G in `SPRINTS.md`.

---

## D-0025 — New SPRINT F/H money data converts millimes→DT at the API boundary, `formatCurrency`'s contract left unchanged

**Date:** 2026-08-13
**Decision:** `apps/admin/src/lib/utils.ts`'s `formatCurrency`/`calculateMargin` keep their existing contract (plain decimal DT in). New SPRINT F/H code (dashboard, inventory, suppliers, purchasing) converts real Prisma millimes fields to decimal DT once, at the point each API response is consumed, before calling these shared helpers — it does not pass raw millimes into them.
**Context:** The original plan (this entry, first drafted) intended to change `formatCurrency`/`calculateMargin` to accept millimes directly. On inspection, 7 existing admin pages (`clients`, `commandes/[id]`, `promotions`, `retours`, `rapports`, `product-drawer`, `supplier-drawer` — 31 call sites) all call these helpers with plain decimal DT values sourced from local/mock state, not millimes. Changing the shared contract would have silently corrupted every one of those unrelated pages (a `38` DT value rendering as `0.038` DT) — a blast radius far outside SPRINT F/H's scope.
**Reason:** `CLAUDE.md` §13 (integer millimes in storage/transport) doesn't require the presentation layer's shared formatter to also take millimes — converting once at the boundary where real API data enters a new component achieves the same correctness without touching 7 files this task has no reason to verify.
**Consequence:** `formatCurrency`/`calculateMargin` remain decimal-DT-in. Real millimes values from `/reporting`, `/inventory`, `/suppliers`, `/purchasing` are divided by 1000 at the call site in the new components that consume them. `product-drawer.tsx`'s existing `costPrice`/`price` fields (already decimal DT, user-entered) are untouched.

---

## D-0022 — Homepage High-Conversion 18-Section Architecture & Hybrid Merchandising

**Date:** 2026-08-10
**Decision:** The ParaTunisie homepage is restructured into an 18-section alternating flow (**PRODUCT → DISCOVERY → PRODUCT → ROUTINE → PRODUCT → EDITORIAL → PRODUCT**). Product sections (Best Sellers, New Arrivals, Promotions, Seasonal Campaigns) support three merchandising modes: **MANUAL** (pinned items only), **AUTOMATIC** (business rules on sales, creation date, discount), and **HYBRID** (pinned items first + automatic fill). Admin users get gross margin (`margeBrute`) and stock visibility in product selector drawers to inform merchandising choices, while storefront users see only clean retail prices and savings badges.
**Context:** Homepage conversion optimization pass; `REQUIREMENTS.md` §Homepage.
**Reason:** Transitioning from an editorial-heavy landing page to a luxury high-conversion e-commerce engine. Pushing multi-item sales via the single-click **"Ajouter toute la routine"** bundle action and giving business staff code-free CMS controls at `/admin/page-accueil`.
**Consequence:** `HomepageConfig` and `HomepageCampaign` models added to Prisma schema; `/api/v1/homepage/config` and `/admin-config` REST endpoints deployed.

---

## D-0021 — Structured CMS forms, not a generic page builder

**Date:** 2026-08-09
**Decision:** Storefront content management (SPRINT E) uses structured, safe CMS forms — each homepage module (Hero, Featured Brands, Best Sellers, Routine Diagnostic, campaigns, banners) is a typed form with enable/disable, ordering, and validated fields. No drag-and-drop page builder, no arbitrary HTML/React injection from admin.
**Context:** `SPRINTS.md` SPRINT E; the brief explicitly says "Do not create a generic page builder initially."
**Reason:** A page builder is a large surface with unbounded risk (arbitrary code/HTML, layout breakage, content-model drift). Structured forms cover 95% of real editorial needs (change copy, swap media, reorder, enable/disable) safely.
**Consequence:** Content API exposes typed module payloads; storefront renders from those payloads. Draft/publish/schedule/archive per editorial entity. Layout remains code; admin manages content and configuration only.

---

## D-0020 — Docker networking: edge (web, admin) + internal (api, data services)

**Date:** 2026-08-09
**Decision:** Docker Compose uses two networks. `edge` (public-facing): `paratunisie-web` and `paratunisie-admin` only. `internal`: `paratunisie-api`, `paratunisie-postgres`, `paratunisie-redis`, `paratunisie-meilisearch`, `paratunisie-minio`. The API is attached to **both** networks — it must serve the edge apps and reach internal data services. The edge apps do not see Postgres/Redis/Meilisearch/MinIO directly; they reach them only through the API. No `internal: true` on the API or edge apps — they need outbound internet (package install at build, external APIs, presigned URL/CDN access at runtime where applicable).
**Context:** `SPRINTS.md` SPRINT B; brief §4-5.
**Reason:** Least-exposure for data services (never reachable from outside the compose stack), while edge apps still reach the API. The API is the only internal-network tenant that also serves edge traffic, so it belongs on both.
**Consequence:** Postgres/Redis/Meilisearch/MinIO expose no host ports (or only a documented dev-only localhost mapping for tooling like Prisma Studio / MinIO console). Documented in `DEPLOYMENT.md` §Local infrastructure.

---

## D-0019 — Shared UI package `packages/ui`; one design language across storefront and admin

**Date:** 2026-08-09
**Decision:** A `packages/ui` workspace package holds the shared design primitives — Button, Input, Select, Badge, Dialog, Drawer, Toast, Skeleton, EmptyState, DataTable primitives, Field/FormField, Tooltip, Tabs — implemented once and consumed by both the storefront and the admin. Domain components stay in their apps (ProductCard, CartDrawer, MegaMenu in the storefront; OrderTable, MarginCard, OrderTimeline in the admin).
**Context:** `SPRINTS.md` SPRINT A; brief §1. Before this, the storefront had `src/components/ui` (Base UI-backed shadcn) and the admin had a separate hand-rolled CSS-class system (`admin-table`, `.badge`, `.kpi-card`, `.field-input`) — two divergent vocabularies for the same brand.
**Reason:** The brief's core rule: no duplicated `client/Button.tsx` vs `admin/Button.tsx` when they should be one primitive. The palette is already shared (D-0009); only the component layer diverged.
**Consequence:** Admin is migrated onto the shared primitives (SPRINT A). Both apps compile the package via Tailwind v4 `@source` so utilities resolve per-app. Token names harmonized (admin's `ink-muted`/`primary-soft`/`border-strong` map onto the storefront vocabulary or vice versa — single source in `DESIGN_SYSTEM.md`).

---

## D-0018 — MinIO object storage; database stores metadata only; public-read media bucket with signed-URL option

**Date:** 2026-08-09
**Decision:** MinIO (S3-compatible) is the object store for all media — product images, brand/category/article images, homepage banners, campaign assets, future user uploads. Image binaries are never stored in PostgreSQL. The DB stores: object key, URL, mime type, width, height, size, alt text, ordering, entity relationship, createdAt. Object naming: `products/{productId}/{uuid}.webp`, `brands/{brandId}/{uuid}.webp`, `categories/{categoryId}/{uuid}.webp`, `articles/{articleId}/{uuid}.webp`, `campaigns/{campaignId}/{uuid}.webp` — UUIDs, never original filenames, for uniqueness. One bucket `paratunisie-media` (public-read in dev; CDN/reverse-proxy in front in prod). Uploads are validated server-side (mime, size, extension, content-type — never trust the client). Deletion is safe-ordered: admin request → backend validates ownership → DB reference removed → object deleted only when safe.
**Context:** `SPRINTS.md` SPRINT C; brief §6-10.
**Reason:** S3-compatible object storage is the standard for image pipelines; MinIO gives a local, dockerized equivalent of the eventual AWS S3/production bucket. Metadata-only DB keeps Postgres lean and avoids binary blobs.
**Consequence:** `Media`/`ProductImage` Prisma model carries metadata fields only. Storefront images are served directly from MinIO (or via CDN in prod); the API returns object URLs. Signed URLs are the documented path for any future private asset (e.g. staff-only exports).

---

## D-0017 — Margin terminology locked; default costing strategy set to weighted-average

**Date:** 2026-08-08
**Decision:** Three margin terms are defined precisely and must be used consistently everywhere (docs, admin UI copy, future code): **marge brute** (gross margin amount) = `prixVente − coûtAcquisition`; **taux de marge** (cost-based rate) = `margeBrute / coûtAcquisition × 100`; **taux de marque** (price-based rate, "gross margin %") = `margeBrute / prixVente × 100`. The admin defaults to displaying taux de marque but both must always be labeled explicitly. Acquisition cost is modeled as a time series (`PurchasePriceHistory`) rather than a single static field, and the default costing strategy for computing "current cost" from that history is **weighted average**.
**Context:** `REQUIREMENTS.md` §B/§E, written during the Admin/ERP requirements pass (no implementation yet).
**Reason:** Marge brute vs taux de marge vs taux de marque are routinely confused in small-business reporting (a 30%-of-cost markup and a 30%-of-price margin are very different numbers on the same product) — defining them once prevents drift across future admin screens and staff conversations. Weighted-average is the simplest costing strategy that still tolerates real supplier price changes over time without requiring FIFO/batch-level bookkeeping the team isn't resourced for yet.
**Consequence:** `REQUIREMENTS.md` §B/C and `DATA_MODEL.md`'s `PurchasePriceHistory`/`OrderItem.unitCostMillimes` are written against this model. Revisiting the costing strategy later (e.g. actual batch cost) is possible without a data-model rewrite, since cost is already derived from history rather than hard-coded.
**Next step:** Implemented at Admin-3/Admin-6 (`SPRINTS.md`), against real purchase data — not before.

---

## D-0016 — Order status state machine formalized for COD confirmation workflow

**Date:** 2026-08-08
**Decision:** The future admin's order lifecycle uses an 11-status state machine — `EN_ATTENTE`, `TENTATIVE_CONTACT`, `CONFIRMEE`, `PREPARATION`, `PRETE_EXPEDITION`, `EXPEDIEE`, `LIVREE`, `ECHEC_LIVRAISON`, `RETOURNEE`, `ANNULEE`, `REFUSEE` — with explicitly allowed transitions only (`REQUIREMENTS.md` §A.1-A.2), replacing any assumption that a simple `PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED` set is sufficient.
**Context:** ParaTunisie is Cash-on-Delivery-only (D-0014), so unlike a prepaid store, an order isn't operationally "real" until a human confirms it. `ANNULEE`/`REFUSEE`/`ECHEC_LIVRAISON` are kept as three distinct terminal(-ish) states rather than one bucket specifically so dashboard funnel reporting can distinguish *why* orders fail (merchandising/expectation problem vs courier/address problem vs internal-ops problem).
**Consequence:** `apps/api/prisma/schema.prisma`'s current scaffold has a simpler 5-value `OrderStatus` enum written during earlier Sprint 9 scaffolding work — it is now known to be superseded by this richer model and needs reconciling (migration + status-mapping) at Admin-2 kickoff (`SPRINTS.md`), not silently left inconsistent nor patched ad hoc outside a real sprint.
**Next step:** Admin-2 implements the state machine server-side as guarded transition endpoints (`API.md`), not a generic status-PATCH, so invalid transitions are structurally impossible rather than just discouraged in the UI.

---

## D-0015 — Staff accounts (`StaffUser`) kept structurally separate from customer accounts (`User`) for RBAC

**Date:** 2026-08-08
**Decision:** The future admin introduces a distinct `StaffUser` entity (email, passwordHash, role, isActive) rather than reusing the storefront `User` table with a `role` column, for the seven-role RBAC model in `REQUIREMENTS.md` §M (`SUPER_ADMIN`, `ADMIN`, `ORDER_MANAGER`, `CUSTOMER_SUPPORT`, `WAREHOUSE`, `CONTENT_MANAGER`, `SEO_MANAGER`).
**Context:** `apps/api/prisma/schema.prisma`'s current scaffold has a single `User.role: CUSTOMER | ADMIN` enum. Written during the Admin/ERP requirements pass — not yet implemented.
**Reason:** Staff accounts have fundamentally different lifecycle, auth surface, and security posture than customer accounts (`SECURITY.md` §Admin Security — separate auth, least-privilege by default, supplier-cost/margin data permission-gated). Conflating the two into one table with a role flag makes that separation awkward to enforce and query, and risks customer-auth changes accidentally touching admin security surface.
**Consequence:** `DATA_MODEL.md` documents `StaffUser` + `Role` alongside, not instead of, the existing customer `User`. Reconciling this against the current single-table scaffold is Admin-1 work.
**Next step:** Implemented at Admin-1 (`SPRINTS.md`) alongside admin auth — not before.

---

## D-0014 — No online payment gateway will be integrated; Cash on Delivery only

**Date:** 2026-08-08
**Decision:** ParaTunisie will not integrate any online payment gateway (card, e-Dinar, wallets). Cash on Delivery (COD) is the sole payment method, permanently — not a Phase 2 stepping stone to card/e-Dinar as earlier docs assumed.
**Context:** Explicit user instruction. Superseded the "COD first, then card/e-Dinar" plan originally recorded in `ARCHITECTURE.md` and `REQUIREMENTS.md` at Sprint 0.
**Reason:** User's call — COD is already the dominant payment method in Tunisian ecommerce, and skipping a payment gateway integration removes an entire category of scope: PCI/tokenization concerns, webhook signature verification, payment provider selection and integration work, and payment-related compliance overhead.
**Consequence:** Updated `REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DATA_MODEL.md`, `API.md`, `SPRINTS.md`, `TODO.md` to remove references to a future card/e-Dinar integration. The `payments` backend module (Sprint 9+) becomes COD-status tracking only — no gateway adapters, no payment webhook intake. The `Payment` entity drops `provider`/`providerRef` fields since there's no external provider to reconcile against.
**Next step:** None planned. If this is ever revisited, treat it as a new decision (not a resumption of the old plan) — payment provider selection, PCI scope, and webhook verification would all need to be designed from scratch at that point.

---

## D-0013 — Navbar logo: reused the existing favicon glyph, hand-built (no MCP had usable credits)

**Date:** 2026-08-07
**Decision:** Added a `Logo`/`LogoMark` component (`src/components/layout/logo.tsx`) rendering the ParaTunisie flower mark (three petals + center dot) next to the wordmark in the header and footer. The glyph reuses the exact path data and hex values already established in `src/app/icon.svg` — same mark, minus its rounded-square badge background — rather than inventing a second, competing logo.
**Context:** User asked to "use mcp" to generate an attractive logo for the navbar. Checked every image-capable MCP connected in this session: Higgsfield (1 credit left, free plan; its vector-logo model Recraft needs a paid plan we don't have), Kling (0 credits), 21st.dev (`search_logo` only searches existing third-party brand logos, not generation), Canva (unauthenticated, and fundamentally a template editor, not a one-call generator). None could produce an original logo without the user spending money or completing a browser OAuth flow.
**Reason:** Given the choice (asked directly), the user picked the free hand-built SVG path over waiting on credits/auth. Reusing the favicon's existing mark instead of designing a new one keeps one consistent brand identity across favicon, header, and footer rather than shipping two different marks.
**Next step:** If the user later tops up Higgsfield credits or authenticates Canva, an AI-generated mark could replace this — the `LogoMark` component is a single, isolated swap point.

---

## D-0012 — No fabricated ingredient lists or "frequently bought together" data on the PDP

**Date:** 2026-08-07
**Decision:** The Sprint 4 product detail page's "Composition" tab defers to the product's real packaging rather than listing invented INCI ingredients. Commerce rails are limited to "Complétez votre routine" (different category, shared concern) and "Produits similaires" (same category) — both derived from real catalogue relationships — plus "Récemment consultés" (the visitor's own real localStorage browsing history). No "frequently bought together" rail was built, since that would imply real aggregated purchase-affinity data that doesn't exist yet.
**Context:** Extending `REQUIREMENTS.md`'s PDP content list (which includes ingredients and frequently-bought-together) while there is no real backend/inventory/purchase data.
**Reason:** Consistent with the integrity precedent set in D-0011 (no fabricated ratings/stock/discounts) and `CLAUDE.md` §20 — an ingredient list is read by shoppers as a safety document, not marketing copy, so it's treated with more caution than a benefit bullet.
**Next step:** Real INCI data and real purchase-affinity data both belong to Sprint 9+ (real backend/inventory) — revisit both tabs/rails once that data exists.

---

## D-0011 — Shop is the mobile catalogue destination

**Date:** 2026-08-07
**Decision:** Renamed the mobile `Catégories` tab to `Shop` and routed it to `/shop`. The Shop is the canonical discovery page for the current frontend: search, category, concern, brand, price, and sort state are represented in its URL so navigation history and shared links preserve the view.
**Context:** The user explicitly requested the label change and asked for Shop to be reachable from the homepage while proceeding through Sprint 3.
**Reason:** `Shop` describes the complete catalogue more accurately than a categories-only destination. Category and concern pages still map to the Shop tab's active state, preserving orientation.
**Integrity:** Product cards omit ratings, review counts, stock claims, discounts, and urgency because no verified commerce backend exists yet. Quick-add and favourite controls provide prototype feedback without inventing those facts.

---

## D-0010 — Mobile drawer replaced with bottom tab navigation

**Date:** 2026-08-07
**Decision:** Removed the hamburger and mobile navigation drawer. ParaTunisie now uses a persistent five-item bottom tab bar below the desktop breakpoint: Accueil, Shop, Diagnostic, Favoris, and Compte. Desktop keeps the full mega-menu and has no hamburger. The second tab was initially named `Catégories` and renamed to `Shop` in D-0011.
**Context:** `UX.md` originally made bottom navigation conditional on validation. After reviewing the Sprint 2 homepage, the user explicitly requested an app-like mobile experience and removal of the web hamburger.
**Reason:** The five destinations represent frequent, top-level mobile tasks and fit the documented maximum without an overflow item. Search and cart remain globally available in the top header.
**Accessibility:** Every tab has an icon plus label, a minimum 64px-high target, URL-aware `aria-current`, a visible top marker in addition to color, keyboard focus styling, press feedback, and iOS/Android safe-area spacing. Page content reserves the tab bar height to prevent overlap.

---

## D-0009 — Brand palette changed to rose plum for Sprint 2

**Date:** 2026-08-07
**Decision:** Replaced the Sprint 1 botanical-green palette with the user-supplied identity: deep rose plum `#7B2F52`, dark hover `#5E203C`, dusty rose `#C98FA8`, soft blush `#EAD2DC`, champagne gold `#C8A46B`, warm ivory `#FCF8F6`, soft nude `#F5ECE8`, and deep cocoa `#2B2326`.
**Context:** The user explicitly supplied a new complete palette immediately before Sprint 2. This scoped instruction supersedes D-0008's earlier token choice.
**Reason:** The new palette is the user's brand direction. Semantic tokens remain centralized, so the shell and future page types inherit the change without component-level hex values.
**Verification:** Primary on ivory is 8.39:1, ivory on primary is 8.39:1, cocoa on ivory is 14.51:1, muted text on ivory is 5.45:1, and primary on blush is 6.22:1. These tested pairs meet WCAG AA for normal text.

---

## D-0008 — Design tokens locked for Sprint 1 (superseded by D-0009)

**Date:** 2026-08-07
**Decision:** Locked concrete hex values and font picks in `DESIGN_SYSTEM.md` (deep emerald `#1C4A3A` primary, sage `#9CB3A4`, warm ivory `#FBF8F3` surface, champagne `#C6A56C` accent, charcoal `#211F1C` ink; Fraunces for editorial serif, Inter for UI sans).
**Context:** `DESIGN_SYSTEM.md` originally said to lock hex values "screenshotted against real product photography" — we don't have real product photography yet (mock catalogue comes later in Sprint 1-3). Locking now against the written "avoid" list and standard contrast/legibility checks instead, so Sprint 1 isn't blocked waiting on photography that depends on the shell existing first.
**Reason:** Unblocks Sprint 1. Low-risk to revisit — tokens are centralized in Tailwind theme config, so a later adjustment against real photography is a config change, not a rewrite.
**Next step:** Once real/representative product photography exists (Sprint 3-4), do the screenshot-based sanity check `DESIGN_SYSTEM.md` originally called for and adjust tokens if needed.

---

## D-0001 — Git repository anomaly flagged, no git action taken

**Date:** 2026-08-07
**Decision:** Do not run any git command (`init`, `add`, `commit`) inside `C:\Users\Ala\Desktop\parapharmacie` until the user explicitly resolves the situation below. Documentation was written using plain file writes only, which are unaffected.
**Context:** `C:\Users\Ala\Desktop\parapharmacie` is an empty directory with no `.git` of its own. Running `git status`/`git log` from inside it resolves upward to a repository rooted at `C:\Users\Ala` (the user's entire home directory), which tracks `node_modules` changes and points at remote `https://github.com/declared-as-ala/ftf.git` with commit history belonging to an unrelated project ("stage-pfe" workforce management / exercise seeding). This is almost certainly an accidental `git init` run at the home-directory level at some point, not intentional project structure.
**Alternatives considered:** (a) ignore it and let ParaTunisie be nested inside that repo — rejected, would tangle an unrelated project's history with this one and risk accidentally committing unrelated home-directory files. (b) Run `git init` directly inside `parapharmacie` now — rejected without user confirmation, since it's a repo-altering action and the user hasn't been asked yet. (c) Flag it and wait — chosen.
**Reason:** This is a repo-initialization-adjacent decision with real blast radius (a home-directory-rooted repo could end up with sensitive personal files staged if `git add` is ever run carelessly at that level). Needs an explicit user decision, not an autonomous one.
**Resolution (2026-08-07):** User chose to `git init` fresh inside `parapharmacie`, scoped to this folder only. Done and verified (`git rev-parse --show-toplevel` now returns the `parapharmacie` path, `git status` shows only project files). The home-directory repo at `C:\Users\Ala` was left untouched, as instructed. No commits have been made yet — commits only happen when explicitly requested (per standing user preference).

---

## D-0002 — Technology stack

**Date:** 2026-08-07
**Decision:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Motion for the frontend; NestJS + TypeScript + PostgreSQL + Prisma for the backend (from Sprint 9); modular monolith, no microservices at launch.
**Context:** Specified directly in the project handoff brief.
**Alternatives considered:** MongoDB was explicitly ruled out in favor of PostgreSQL given the relational integrity needs of orders/inventory/batches/suppliers/payments.
**Reason:** Matches the brief's explicit direction and the domain's transactional-integrity requirements.

---

## D-0003 — No MCP design-acceleration tools currently available (superseded by D-0005/D-0006)

**Date:** 2026-08-07
**Decision:** Proceed without Magic MCP / 21st.dev MCP / shadcn MCP for now; use Higgsfield MCP (image/video generation) where editorial imagery is needed, and hand-build shadcn-based components restyled per `DESIGN_SYSTEM.md`.
**Context:** Tool audit found only Canva, Indeed, Higgsfield, Kling, and Meta Ads MCP servers configured — none of the component-pattern-research tools named in the handoff brief.
**Reason:** Brief explicitly says not to block the project if an MCP isn't installed/configured, and to record the gap instead.
**Status:** Superseded — see D-0005 (shadcn MCP configured) and D-0006 (21st.dev MCP configured) below.

---

## D-0005 — shadcn MCP configured (project-scoped)

**Date:** 2026-08-07
**Decision:** Ran `npx shadcn@latest mcp init --client claude` inside `parapharmacie`. It wrote a project-scoped `.mcp.json` with a `shadcn` stdio server (`npx shadcn@latest mcp`, no API key required). No pre-existing Next.js scaffold was needed — the command worked against the empty directory.
**Context:** User asked to configure the official shadcn MCP before Sprint 1.
**Status:** Configured, not yet verified connected in a live session — new project `.mcp.json` servers require a Claude Code restart (and the standard one-time "trust this project's MCP servers" approval) before their tools appear. Verify via `/mcp` after restart.

---

## D-0006 — 21st.dev MCP configured; deprecated "magic" server found pre-existing (left untouched)

**Date:** 2026-08-07
**Decision:** Ran `npx @21st-dev/cli@latest init --client claude --write`, which merged a `21st` HTTP MCP server (`https://21st.dev/api/mcp`, auth via `x-api-key: ${API_KEY_21ST}` env-var reference — no literal key in any file) into the same project-scoped `.mcp.json` alongside `shadcn`.
**Context:** Before touching anything, inspected `~/.claude.json` and found an existing **global** `mcpServers.magic` entry — the deprecated `@21st-dev/magic` package — with an API key embedded directly as a literal string in that config file (pre-existing, not created by this session). Per the user's explicit instruction not to blindly overwrite or delete existing MCP configuration, this entry was left exactly as found; nothing was merged into or removed from `~/.claude.json`. The new, current `21st` server lives only in the project's `.mcp.json` and uses an env-var reference rather than a literal key.
**User then supplied their 21st.dev API key directly in chat.** It was set as a persistent Windows user-level environment variable (`API_KEY_21ST`, via `[Environment]::SetEnvironmentVariable`) and was **not** written into any file in this repository, `.env`, `PROGRESS.md`, or anywhere else. It appears in this chat transcript only because the user pasted it there themselves.
**Reason:** Matches the security rules in the handoff brief (§6): never store keys in tracked files; merge, don't overwrite, existing config.
**Next step:** User should consider whether the old global `magic` entry (with its embedded literal key) should be removed/rotated at some point — flagged here for awareness, not acted on autonomously. Claude Code needs a restart for the new project `.mcp.json` servers and the new env var to take effect; a *new* terminal/Claude Code launch after this point should pick up the env var (Windows may require a full logoff if a fresh terminal still doesn't see it).

---

## D-0007 — Higgsfield companion skills installed; automated risk scanners flagged them, manual review found nothing malicious

**Date:** 2026-08-07
**Decision:** Installed `@higgsfield/cli` globally (v1.1.20, official package, verified against the domain/maintainers on npm) and all 9 skills from `higgsfield-ai/skills` via `npx skills@latest add higgsfield-ai/skills`, project-scoped to `parapharmacie/.agents/skills` (symlinked into `.claude/skills`, tracked via `skills-lock.json`).
**Context:** The installer's own security-assessment step reported: Snyk rated **all 9 skills "Critical Risk"**; Socket flagged 1 alert on `higgsfield-brandkit`; an internal "Gen" scanner rated `higgsfield-marketplace-cards`, `higgsfield-product-photoshoot`, and `higgsfield-youtube-thumbnail` "High Risk". Given the tool's own warning ("review skills before use; they run with full agent permissions"), these were manually inspected rather than trusted blindly: grepped every script for `eval`/`exec`/`os.system`/`subprocess`/`base64` usage and enumerated every external domain referenced. Findings — `higgsfield-brandkit`'s Python scripts use `subprocess.run` only to invoke local `ImageMagick`/`rsvg-convert` binaries (located via `shutil.which`) with argument-list form (no shell injection risk) and a timeout; the three "High Risk" skills are plain `SKILL.md` prompt-routing files with no executable code, referencing only `cdn.higgsfield.ai` (official CDN), `raw.githubusercontent.com`, and `fonts.googleapis.com`. No obfuscation, no credential harvesting, no unexpected exfiltration targets found.
**Reason:** The scanner ratings read as generic/boilerplate severity buckets applied to any skill bundling executable scripts, not a specific finding — but this is a judgment call, not a certainty.
**Next step:** Flagged to the user for awareness rather than silently proceeding. Not removed. If the user wants them gone, `npx skills@latest remove higgsfield-*` from `parapharmacie`.

---

## D-0004 — Repository layout deferred until Sprint 9

**Date:** 2026-08-07
**Decision:** The `apps/`/`packages/` monorepo layout described in `ARCHITECTURE.md` is not created during Sprints 0-8. The Sprint 1-8 Next.js storefront lives at the repository root; this placement was confirmed by the Sprint 1 scaffold and is now locked until the planned Sprint 9 restructure.
**Reason:** Avoids premature structure for a single-app phase; matches `CLAUDE.md` §1's "no premature abstraction" rule.
**Resolution (2026-08-07):** Repo-root placement confirmed. `next.config.ts` explicitly scopes Turbopack to this directory so an unrelated lockfile higher in the user's home directory cannot influence project-root discovery.
