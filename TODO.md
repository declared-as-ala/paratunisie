# TODO.md — ParaTunisie Task Checklist

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
