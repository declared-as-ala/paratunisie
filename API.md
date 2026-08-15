# API.md — Backend Module & API Boundaries

Applies from Sprint 9 (NestJS backend). REST, documented with OpenAPI, consistent error envelope. Each module owns its own DTOs/services/Prisma access; other modules call through its public service, never raw Prisma cross-module (`CLAUDE.md` §3).

## Modules

- **catalogue** — products, variants, brands, categories, concerns, ingredients, attributes. Read-heavy public endpoints + admin-authenticated write endpoints.
- **search** — thin façade over Meilisearch (query, facets, suggestions); indexing triggered by catalogue module events, not polled.
- **cart** — guest (session-keyed) and account-linked cart, line items, promo application.
- **checkout** — order creation from a cart, address capture, delivery-method/cost resolution.
- **orders** — order lifecycle, status transitions, order history queries.
- **payments** — Cash on Delivery status tracking only (`DECISIONS.md` D-0014). No gateway adapters, no webhook intake — there is no external payment provider.
- **promotions** — promotion/coupon rules and validation.
- **customers** — accounts, profiles, addresses.
- **wishlist**
- **reviews** — submission, moderation status, verified-purchase check against `orders`.
- **loyalty** — tier/points ledger, driven by `orders` events.
- **diagnostic** (implemented, D-0029 & D-0030) — real, AI-ranked cosmetic diagnostic with Groq vision photo analysis. `GET /diagnostic/config?domain=SKIN|HAIR` (admin-manageable questions/options, `photoAnalysisEnabled` reflects whether `GROQ_API_KEY` or `OPENAI_API_KEY` is set). `POST /diagnostic/session` → `{ id, sessionToken }` (guest identity — see D-0029, no customer auth exists). `PATCH /diagnostic/session/:id/answers` (merges + recomputes the normalized `NeedProfile`). `POST /diagnostic/session/:id/photo` (multipart upload to private MinIO bucket `paratunisie-diagnostics`, MIME allowlist `jpeg`/`png`/`webp`, SVG rejection, max 8MB). `POST /diagnostic/session/:id/analyze` (runs `GroqVisionProvider` via `meta-llama/llama-4-scout-17b-16e-instruct`, parses cosmetic observations, clears `storageKey` in DB, and permanently deletes raw image binary from MinIO for zero retention). `GET /diagnostic/session/:id/result` (candidate retrieval via `CatalogueService.findForRecommendation` → AI ranking, or the in-code keyword fallback when no API key is set; short-circuits to medical referral notice if `redFlag: true`). `POST /diagnostic/session/:id/adjust-budget`, `POST /diagnostic/session/:id/alternatives`.
- **routines** — thin persistence primitive (`Routine`/`RoutineItem` Prisma models) the `diagnostic` module writes through; not a separate API surface of its own.
- **content** — articles, brand story content, FAQs, product links.
- **homepage** — homepage merchandising configuration, section toggles, seasonal campaign scheduler, and automated Best Sellers / New Arrivals feeds (`/api/v1/homepage/config`, `/api/v1/homepage/admin-config`, `/api/v1/homepage/sections`, `/api/v1/homepage/campaigns`).
- **seo** — sitemap generation, redirect rules, metadata overrides.
- **admin** (cross-cutting) — RBAC-gated endpoints layered over the above modules rather than a separate parallel API surface.

## Admin / ERP modules (Future — dedicated Admin phase, `REQUIREMENTS.md`/`SPRINTS.md`)

Requirements only in this pass — not implemented. Layered onto the modules above per the "Public vs Admin surface" rule below, plus new modules where the domain genuinely doesn't exist yet:

- **orders** (expanded) — order list/detail, status-transition endpoints (each transition its own guarded action, not a generic `PATCH status`, so the state machine in `REQUIREMENTS.md` §A.2 is enforced server-side, not just in the UI), contact-attempt logging, order-assignment to staff. `GET /orders/counts` (implemented, D-0028) — one `groupBy`-backed aggregate (`total`/`normal`/`abandoned`/`deleted`/`byStatus`) that's the canonical source for both the sidebar order badge and the Commandes page header/tabs, so the two can't independently compute different totals.
- **suppliers** — supplier CRUD, `SupplierProduct` links, purchase-price history queries.
- **purchasing** — purchase orders, goods receipts (feeds `inventory` stock movements on receipt).
- **inventory** — stock levels, stock-movement history, batch/expiry queries, low-stock/near-expiry alert feeds.
- **shipments** — courier/tracking updates, delivery-attempt logging; may stay inside `orders` rather than a separate module if the split doesn't earn its complexity — decide at Admin-2 kickoff.
- **returns** — return/refund workflow (`REQUIREMENTS.md` §I).
- **reporting** — dashboard KPI aggregation, order funnel, sales/margin series. Read-only, heavier queries — a natural candidate for Redis-cached aggregates rather than live joins on every dashboard load.
- **profitability** (implemented, D-0026, fixed D-0027) — `GET /profitability/overview?from&to&statuses` (KPIs restricted to CONFIRMEE by default; response includes `orderCounts` — total orders in the period regardless of status, alongside the contributing subset, so orders are never hidden), `GET /profitability/orders?from&to&statuses&page&pageSize&search` (paginated; `statuses` accepts **every** real `OrderStatus` here, not just CONFIRMEE/LIVREE, for the "Toutes les commandes" view — each row carries a server-computed `contribution`/`reason`), `GET /profitability/orders/:id` (item-level breakdown incl. `costSource`: `snapshot`/`backfilled_estimate`/`unknown`), `POST /profitability/backfill-missing-costs` (`SUPER_ADMIN` only). All guarded by `AdminAuthGuard` + `@Roles(SUPER_ADMIN, ADMIN)` — purchase cost/gain is sensitive per §B. Reads `OrderItem.unitCostMillimes`/`costIsEstimated`, not a live join against `PurchasePriceHistory` per request. `gainMillimes`/`tauxMarge` are `number | null` throughout — `null`, never a number computed against unknown cost, whenever no item in scope has a cost snapshot (D-0027).
- **audit** — write-only from other modules' mutations, read (with filtering) for admin review (`REQUIREMENTS.md` §N).
- **admin-auth** — staff authentication and RBAC, structurally separate from customer `auth` (`SECURITY.md` §Admin Security, `DATA_MODEL.md` `StaffUser`).

Endpoint design for `orders`, `suppliers`, `inventory`, and `reporting` is intentionally left unspecified beyond module boundaries here — full endpoint/DTO shapes get designed at their respective Admin-N sprint kickoff (`SPRINTS.md`) against the real Prisma schema, not speculatively now.

## Conventions

- Base path `/api/v1`. Versioned only when a breaking change is unavoidable (`CLAUDE.md` §12) — not pre-versioned speculatively beyond v1.
- Error envelope: `{ error: { code, message, details? } }` with correct HTTP status; no bare stack traces returned to the client.
- Pagination: cursor or page/limit, consistently applied across list endpoints — pick one at Sprint 9 kickoff and record in `DECISIONS.md`.
- All mutating endpoints validated via DTOs (`class-validator`) and require an explicit auth/role check (`CLAUDE.md` §3, `SECURITY.md`).
- Webhook endpoints (payment provider callbacks) are the one place external unauthenticated input enters the system — signature-verified, idempotent, logged.

## Public vs Admin surface

Public storefront endpoints are read-focused and cacheable where possible (catalogue, content, search). Admin endpoints are RBAC-gated and live under the same modules rather than a duplicated API, to avoid drift between what admin edits and what the storefront actually reads.
