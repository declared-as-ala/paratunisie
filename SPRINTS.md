# SPRINTS.md — ParaTunisie Implementation Roadmap

Quality over breadth (`CLAUDE.md`, handoff brief §33). Each sprint's UI work is reviewed against `DESIGN_SYSTEM.md` §Quality Bar before moving on. `PROGRESS.md` and `TODO.md` are updated as each sprint progresses, not just at the end.

## Sprint 0 — Documentation, architecture, tooling audit (complete)

- All root `.md` documentation (this sprint's deliverable).
- Repo/git situation resolved with user (`DECISIONS.md` D-0001).
- Design direction (palette, type) proposed, pending Sprint 1 visual lock-in.
- MCP/tool audit complete: no Magic/21st.dev/shadcn MCP configured; Higgsfield available for image/video generation as a fallback for editorial imagery.
- Next.js project scaffold created (package.json, TS, Tailwind, shadcn init) — deferred to the start of Sprint 1 since Sprint 0 is documentation-only per the handoff brief.

## Sprint 1 — Global shell (complete)

- Project scaffold: Next.js (App Router) + TypeScript + Tailwind + shadcn init.
- Design tokens locked (color/type/spacing/motion) in Tailwind theme config.
- Header (desktop + mobile), desktop mega-menu, persistent mobile bottom tab bar, footer.
- Motion system foundation (timing/easing tokens, reusable transition primitives).
- `prefers-reduced-motion` handling wired globally.

## Sprint 2 — Homepage (complete)

- Full homepage per the architecture in the handoff brief / `UX.md`: announcement bar, hero, shop-by-concern, best-sellers, routine/diagnostic editorial section, brand universe, editorial campaigns, expert recommendations, advice articles teaser, social proof, newsletter/loyalty teaser, WhatsApp/expert entry point, footer.
- Homepage polished to the Quality Bar before moving to Sprint 3.

## Sprint 3 — Search, PLP, filters, product cards (complete)

- Search overlay with live suggestions against mock catalogue.
- Category/PLP template with sort, filters (desktop sidebar + mobile bottom sheet), breadcrumb, SEO intro content.
- Product card component finalized (this is reused everywhere — get it right once).

## Sprint 4 — Product detail page (complete)

- Full PDP: gallery, variant/size selection, price/promo, reassurance block, description/benefits/ingredients/usage tabs, reviews (mock), commerce rails (complete your routine, frequently bought together, similar, recently viewed), mobile sticky add-to-cart bar.

## Sprint 5 — Cart, checkout, order confirmation (complete)

- Cart drawer + compact mobile cart page, free-delivery progress indicator, sticky mobile checkout bar.
- Checkout flow (guest, simplified Tunisia address — gouvernorat + full address, Aramex delivery at 10 DT, Cash on Delivery confirmation — no payment method selection) against mocked submission.
- Order confirmation screen.
- Auto-open cart drawer on add-to-cart, micro-interactions on pressable elements.

## Sprint 6 — Routine diagnostic (complete)

- Multi-step guided flow, AM/PM recommendation output with rationale per product, disclaimer, save/share/email actions (mocked where backend-dependent).

## Sprint 7 — Brands, editorial, advice (complete)

- `/marques` index + `/marques/[slug]` with product grid.
- `/conseils` index + `/conseils/[slug]` article template, seeded with 6 real skincare articles.
- All pages ship SEO-complete (metadata, canonical, JSON-LD BreadcrumbList + Article).
- Homepage hero enhanced with premium CSS animations (floating glows, particles, gradient overlays, shimmer underline, CTA micro-interactions).

## Sprint 8 — Account, wishlist, loyalty (complete)

- Account shell (`/compte`) with orders, addresses, routines, settings sections.
- Wishlist (`/favoris`) — localStorage-backed via `useSyncExternalStore`, wired to product cards across PLP/PDP/header.
- Loyalty ("Le Cercle ParaTunisie") presentation page (`/fidélite`) with 3 tiers and ways to earn.

## Sprint 9 — Backend foundation (complete)

- Monorepo structure: `apps/api/` (NestJS + Prisma), `packages/types/`, `packages/shared/`.
- Full Prisma schema (20+ models) mapped from `DATA_MODEL.md`, using SQLite for local dev.
- NestJS modules: Catalogue, Orders, Customers, Routines, Wishlist, Reviews, Loyalty, Content.
- Repository interfaces defined; API-backed implementations with graceful fallback to local data.
- Database seeded: 16 products, 11 brands, 4 categories, 7 concerns, 6 articles.
- Frontend pages (`/shop`, `/[category]`, `/produits/[slug]`, `/marques/[slug]`, `/besoins/[slug]`) fetch from API server-side, pass data as props to client components.

## Sprint 10+ — Real commerce/business modules (scaffold complete)

- Search (Meilisearch) and Payment (COD only) service interfaces defined.
- Real implementations, inventory, observability, and production deployment pending backend connection.

## Admin / ERP Phase (Sprint 11+) — requirements locked, implementation not started

Full requirements in `REQUIREMENTS.md` §Admin / Back-Office, entities in `DATA_MODEL.md`, module boundaries in `API.md`. Deliberately sequenced *after* Sprint 10 (real commerce modules) rather than folded into the current frontend sprints — the admin operates on real orders/inventory/suppliers, so it needs Sprint 9's backend foundation and Sprint 10's real data flowing before it's useful, not before.

- **Admin 1 — Shell + auth + roles + dashboard.** Admin app shell (`apps/admin`), brand-aligned visual identity (ParaTunisie palette, warm cocoa sidebar, plum accents), `StaffUser`/RBAC auth distinct from customer auth (pending), dashboard home with top KPIs and operational alerts (`REQUIREMENTS.md` §F). Product management with create/edit drawer, live margin calculations (D-0017), toast system, confirmation modals, unsaved changes protection, sortable/filterable data tables.
- **Admin 2 — Order management + confirmation workflow.** Order list/detail, the full `OrderStatus` state machine and its guarded transitions, `OrderContactAttempt` logging, order funnel reporting. Reconcile the richer status enum against `apps/api`'s current simplified `OrderStatus` (`DATA_MODEL.md` note) as part of this sprint, not before.
- **Admin 3 — Products + pricing + supplier costs.** Admin catalogue CRUD, `coutAcquisition`/margin fields on variants (admin-only, never exposed to the storefront API), margin formulas from `REQUIREMENTS.md` §B wired to real numbers.
- **Admin 4 — Inventory + stock movements + batches/expiry.** `InventoryItem`, full `StockMovement` audit trail, batch/expiry tracking and alerts.
- **Admin 5 — Suppliers + purchasing.** Supplier CRUD, `SupplierProduct`, `PurchasePriceHistory`, purchase orders/goods receipts feeding inventory.
- **Admin 6 — Analytics + profitability.** Per-product/order/period profitability (`REQUIREMENTS.md` §C), dashboard sections B/C/F, costing-strategy decision (weighted-average default, per `DECISIONS.md`) implemented against real `PurchasePriceHistory` data.
- **Admin 7 — Returns + customer service.** `Return`/`Refund` workflow, customer-profile admin view with cancellation/refusal history, customer-service follow-up queue.
- **Admin 8 — Content + SEO admin.** CMS for homepage/editorial/navigation, SEO metadata management with duplicate-slug/indexation guardrails (`REQUIREMENTS.md` §K-L).

Order and priority can shift based on real operational pain once Sprint 9-10 data exists — this breakdown is a sensible default sequencing, not a locked contract. Any reordering is a `DECISIONS.md` entry, per the standing rule that sprint-order deviations get recorded.

## Admin / Infra Phase 2 (SPRINT 11+) — production-grade admin, infrastructure, and content management

The Admin 1-8 mock UI phase is functionally complete (`PROGRESS.md`). The next phase makes the system production-grade: a single shared design language across storefront and admin, real local infrastructure (Docker), object storage (MinIO), real media management, and storefront content that is managed from the admin instead of hardcoded. Numbered A–H; the current approved sprint is A–D.

- **SPRINT A — Shared UI system + Admin redesign foundation.** Extract a `packages/ui` shared component library (Button, Input, Select, Badge, Dialog, Drawer, Toast, Skeleton, EmptyState, DataTable primitives, Field/FormField, Tooltip, tabs) from the design primitives used by the storefront (`src/components/ui`, `DESIGN_SYSTEM.md`). Storefront and admin both consume the same package — no duplicated `client/Button.tsx` vs `admin/Button.tsx`. Redesign the admin shell (sidebar, topbar) to the ParaTunisie palette: warm ivory/white base, plum accent, cocoa text, blush states, champagne details. Refined tables, compact spacing, clear hierarchy. Review with the installed design skills (`review-animations`, `improve-animations`, `find-animation-opportunities`) before calling it done.

  > **Status:** Done 2026-08-09 — implementation complete and verified (builds, typecheck, lint, admin smoke test). Skills review (`review-animations` etc.) still pending; admin pages still on legacy retokenized classes pending the shared-primitives migration.
- **SPRINT B — Dockerization + local infrastructure.** Docker Compose dev environment: `paratunisie-web` (storefront), `paratunisie-admin`, `paratunisie-api`, `paratunisie-postgres`, `paratunisie-redis`, `paratunisie-meilisearch`, `paratunisie-minio`. Multi-stage production Dockerfiles, minimal runtime images, health checks, `.dockerignore`, non-root users, persistent volumes, intentional networks (edge/public: web+admin; internal: api+postgres+redis+meilisearch+minio), documented in `DEPLOYMENT.md`. PostgreSQL becomes the real database (provider swap from SQLite, committed migration + seed).
- **SPRINT C — MinIO media system.** S3-compatible object storage for all media (product images, brand/category/article images, homepage banners, campaign assets). DB stores metadata only (object key, URL, mime, width, height, size, alt, order, entity relationship, timestamps) — never binaries. Object naming: `products/{productId}/{uuid}.webp`, `brands/{brandId}/{uuid}.webp`, etc. Bucket strategy (public vs private) chosen intentionally. `MediaModule` in the API: upload with server-side validation (mime/size/extension/content-type), safe deletion flow (validate ownership → remove DB reference → delete object), presigned/URL serving strategy. Media CRUD tests.
- **SPRINT D — Product management + media management.** Production-grade product add/edit in admin: multiple image upload (drag & drop, paste, preview, progress, upload errors, retry, reorder, primary/cover selection, remove/replace single image, alt text). Stable `ProductImage` IDs — deleting one image never deletes others. Product drawer sections: general, commercial (cost/price/margin), media, attributes (size, skin type, hair type, concerns, texture, SPF), inventory (stock, threshold, batch, expiry), SEO. Full product CRUD endpoints in the API.
- **SPRINT E — Storefront CMS/content management.** Structured, safe CMS forms (NOT a generic page builder). Admin "Contenu" section: Accueil (hero, featured brands, best sellers, routine diagnostic, per-module enable/disable), Campagnes, Articles (DRAFT/PUBLISHED/SCHEDULED/ARCHIVED), Navigation, Bannières, FAQ. Everything business-editable on the storefront becomes manageable from admin; layout/code stays in code. Content API + storefront fetch swap. Draft/publish workflow with preview-before-publish later.
- **SPRINT F — Admin dashboard analytics.** Actionable ecommerce dashboard: KPI cards (CA aujourd'hui, commandes, marge brute estimée, panier moyen — each with vs-yesterday delta), operational status row (en attente, à confirmer, en préparation, expédiées, échecs, retours), order funnel (nouvelles → confirmées → expédiées → livrées with rates), sales chart with period switching (7d/30d/3mo/12mo + period-vs-period), margin chart (CA vs COGS vs marge — never labeled profit), orders-by-status distribution, top products (units/revenue/margin), low-stock/out-of-stock/expiration alerts, orders-needing-action widget, COD performance metrics, customer KPIs (new/returning/repeat rate), promotion performance (revenue/orders/AOV/margin/usage). Dashboard aggregation endpoint (`GET /admin/dashboard/overview?period=30d`) so the frontend doesn't fire 20 requests. Lightweight accessible chart library (or hand-rolled SVG) — no heavyweight analytics dep.

  > **Status:** Done 2026-08-13 — `GET /reporting/dashboard/overview?period=` real aggregation endpoint (KPIs, alerts, funnel, daily sales/margin series, top products, customer KPIs), `/admin` and `/admin/rapports` wired to it, hand-rolled SVG charts extended to accept real data. Not built: vs-yesterday/period-over-period deltas, promotion performance (no `Promotion` model exists — honest empty state instead of fabricated numbers), COD-by-governorate/courier (SPRINT G scope).

- **SPRINT G — Orders operational workflow.** Order admin wired to real API + state machine server-side (guarded transition endpoints per D-0016, not a generic status PATCH), contact attempts persistence, order funnel reporting, COD performance by governorate/courier/staff, returns/customer-service queue with SLA aging.

  > **Status:** Partial, 2026-08-13 — `TODO.md` previously marked this done in error; it wasn't. Only the guarded 11-status `OrderStatus` enum + transition table + `OrderStatusHistory` audit trail were implemented (D-0024), scoped narrowly to unblock SPRINT H's inventory reserve/sell hooks. `OrderContactAttempt` persistence, COD-by-governorate/courier/staff reporting, and the returns/customer-service SLA-aging queue remain open — a real SPRINT G pass is still needed.

- **SPRINT H — Inventory + suppliers + purchasing.** InventoryItem/StockMovement audit trail, batches/expiry with staged alerts (90/60/30 days), supplier CRUD + PurchasePriceHistory (append-only) + purchase orders/goods receipts feeding inventory, weighted-average costing implemented against real data (D-0017), low-stock replenishment suggestions from sales velocity + lead time.

  > **Status:** Done 2026-08-13 — full Prisma migration (`InventoryItem`, `StockMovement`, `Batch`, `Warehouse`, `Supplier`, `SupplierProduct`, `PurchasePriceHistory`, `PurchaseOrder`/`PurchaseOrderLine`), `inventory`/`suppliers`/`purchasing` NestJS modules, weighted-average cost service, `/admin/stocks` and `/admin/fournisseurs` rewired off fabricated data onto real endpoints, new `/admin/achats` purchase-order/goods-receipt admin pages. Bundled prerequisite: minimal `StaffUser` admin auth (D-0023), since none existed.

- **Admin simplification — Rentabilité (post-SPRINT H).** `/admin/fournisseurs` and `/admin/achats` soft-hidden from the sidebar/dashboard (routes intact — D-0026); new `/admin/rentabilite` page reusing SPRINT H's weighted-average cost system rather than a second one: `OrderItem.costIsEstimated` field, cost snapshot at `CONFIRMEE` transition, `profitability` module (`GET /profitability/overview|orders|orders/:id`, `POST /profitability/backfill-missing-costs`), period/status filters, CA-vs-Coût-vs-Gain chart, top/low-margin product tables, per-order profitability table linking into the existing order drawer, admin-only Rentabilité section inside that drawer, and a compact dashboard summary card. `Status: Done 2026-08-13.`

Each sprint clears the `DESIGN_SYSTEM.md` §Quality Bar and the admin-specific quality checklist (shared components actually shared, no default shadcn appearance, actionable dashboard, correct profitability labeling) before the next one starts. Decisions recorded in `DECISIONS.md` (D-0018 MinIO/media, D-0019 shared UI package, D-0020 Docker networking, D-0021 structured CMS).

## Notes

- Sprint order can be adjusted, but not skipped past shallowly — a sprint's page/feature must clear `DESIGN_SYSTEM.md` §Quality Bar before the next sprint's work is considered the priority.
- Any deviation from this order is a decision recorded in `DECISIONS.md`.
