# REQUIREMENTS.md — ParaTunisie Functional Requirements

Scope split into **MVP** (Sprints 1-8, storefront with mocked commerce backend), **Phase 2** (Sprints 9-10+, real backend/payments), and **Future** (post-launch). See `SPRINTS.md` for the schedule these map to.

---

## Catalogue & Browsing

**MVP**
- Category tree (Visage, Corps, Cheveux, Solaire, Bébé & Maman, Hygiène, Compléments, Homme) with subcategories.
- Brand directory and individual brand pages.
- "Shop by concern" pages (acné, taches, peau sèche, peau sensible, anti-âge, chute de cheveux, protection solaire).
- Product listing pages (PLP) with sort (popularity, price, new, rating) and filters (brand, price, concern, skin type, hair type, ingredient, product type, texture, rating, availability, promotion).
- Product detail pages (PDP) with gallery, variants, description, benefits, ingredients, usage, reviews.
- Mock catalogue of 16-24 realistic products across ~10 brands (see `DATA_MODEL.md` for shape).

**Phase 2**
- Real catalogue backed by Postgres/Prisma, admin-managed.
- Full-text/typo-tolerant search via Meilisearch.
- Ingredient pages, skin-type/hair-type landing pages.

**Future**
- Thousands-to-tens-of-thousands of SKUs, supplier-fed catalogue updates, batch/expiration tracking surfaced to admin.

## Search

**MVP**
- Client-side/mock search with live suggestions against the mock catalogue: products, brands, categories, concerns.
- Recent searches (local storage), a curated "trending searches" list.
- Deliberately excellent zero-result state with suggested categories/concerns.

**Phase 2**
- Meilisearch-backed instant search, typo tolerance, synonyms (FR + common Tunisian usage), article/editorial results.

## Filtering

**MVP**: client-side filter state on mock data, URL-reflected (`?brand=...&concern=...`) so filtered views are shareable and back-button-safe. Mobile: bottom sheet. Desktop: sidebar.
**Phase 2**: filters backed by Meilisearch facets; canonicalization/noindex rules per `SEO.md` so filter combinations don't bloat the index.

## Product Pages

**MVP**: full PDP layout (see `UX.md` journey), mock stock/price/variant data, related-product rails (routine completion, frequently bought together, similar alternatives, recently viewed via local storage).
**Phase 2**: real stock, real pricing, real reviews with verified-purchase flag.

## Promotions

**MVP**: promotional badges and struck-through prices on mock data; a promotions/landing collection page.
**Phase 2**: real promotion engine (percentage/fixed, date-bounded, category/brand-scoped), coupon codes.
**Future**: automated/segmented promotions, loyalty-tier pricing.

## Wishlist

**MVP**: local-storage-backed wishlist, wishlist page, add/remove from PLP and PDP.
**Phase 2**: account-backed wishlist synced across devices, "move to cart," share list.

## Cart

**MVP**: cart drawer + cart page against mock data, quantity change, remove, free-delivery progress indicator, promo-code input (mock validation).
**Phase 2**: server-persisted cart (guest via session, merged into account on login), real promo/coupon validation.

## Checkout

**MVP**: full checkout UI (guest, Tunisia address fields — gouvernorat/délégation/localité/adresse/code postal, delivery-method selection, payment-method selection UI, order summary) against mocked submission producing a confirmation screen.
**Phase 2**: real order creation, real payment via Cash on Delivery only (see `DECISIONS.md` D-0014 — no online payment gateway will be integrated), real delivery-cost calculation, order confirmation email/SMS.
**Future**: subscription/reorder. No online payment methods (card, e-Dinar, wallets) are planned — COD remains the only payment method by explicit decision.

## Accounts

**MVP**: account UI shell (overview, orders, addresses, wishlist, routines, reviews, profile) with mock/empty states; no real auth required to view the shell in dev.
**Phase 2**: real authentication (email/phone + password, or OTP), order history, address book, profile management.
**Future**: social login, loyalty dashboard integration.

## Reviews

**MVP**: display mock reviews/ratings on PDP with clear "sample data" marking in dev tooling (never presented as real to an end user in production).
**Phase 2**: real customer reviews, verified-purchase flag, moderation queue.
**Future**: review-request automation post-delivery, photo reviews.

## Loyalty — "Le Cercle ParaTunisie"

**Phase 2**: tiers (Essentiel, Privilège, Signature), points on purchase, member perks surfaced as a premium membership experience (not a bare points table).
**Future**: birthday rewards, tier-gated early access, referral program.

## Routine Builder / Diagnostic

**MVP**: full guided-flow UI (skin/hair profile → concerns → sensitivity → current routine → texture preference → budget → complexity → recommendation) against mock product data, producing Essentielle/Complète/Premium routines with AM/PM steps and a stated "why" per product. Explicit non-medical disclaimer. Actions: add all to cart, replace a product, save, share, email.
**Phase 2**: recommendation logic informed by real catalogue/inventory/pricing; save to account.
**Future**: repeat-purchase reminders tied to product usage cadence.

## Editorial Content ("Conseils")

**MVP**: article template + a handful of seeded articles (guides, ingredient explainers) to prove the pattern and support internal linking.
**Phase 2**: full editorial CMS-backed pipeline, author/reviewer bylines, TOC, related products.

## SEO

Cross-cutting requirement from Sprint 1 onward — see `SEO.md`. Not a separate phase; every page type ships SEO-complete.

## Customer Support

**MVP**: WhatsApp click-to-chat entry points (header, PDP, footer, checkout help), FAQ page.
**Phase 2**: expert-consultation booking/chat flow.

## Admin / Back-Office (Future — dedicated Admin/ERP phase, see `SPRINTS.md`)

Not implemented in this task — requirements only. The admin is the operating system of the business, not a "products + orders" CRUD panel. It must eventually cover: orders, customers, products/variants, brands, categories, stock, suppliers, purchase/selling prices, margins, promotions, deliveries, returns, customer service, reviews, loyalty, content, SEO, analytics, staff, and permissions. Conceptually: **ecommerce admin + order operations + inventory + supplier management + light ERP + customer service + analytics.**

### A. Order Management

This is the single most operationally important part of the admin, because ParaTunisie is Cash-on-Delivery-only (`DECISIONS.md` D-0014) — unlike a prepaid store, an order isn't "real" the moment it's placed. It becomes real when a human confirms the customer actually wants it and will be there to receive it. The admin exists largely to run that confirmation loop well.

#### A.1 Order status state machine

| Status | Meaning |
|---|---|
| `EN_ATTENTE` | Order received, not yet validated by staff or customer. Default status on creation. |
| `TENTATIVE_CONTACT` | Staff attempted to reach the customer (call/WhatsApp) but has not yet obtained confirmation. An order can cycle through multiple contact attempts while staying in this status. |
| `CONFIRMEE` | Customer explicitly confirmed the order (by phone, WhatsApp, or an eventual self-serve confirmation link). |
| `PREPARATION` | Confirmed order is being picked/packed. |
| `PRETE_EXPEDITION` | Packed and ready for courier pickup. |
| `EXPEDIEE` | Handed to the courier, tracking reference attached. |
| `LIVREE` | Courier confirms delivery and (for COD) cash collection. Terminal — success. |
| `ECHEC_LIVRAISON` | Courier attempted delivery but could not complete it (customer absent, unreachable, wrong address, refused at the door). Not terminal — feeds back into a retry or a return. |
| `RETOURNEE` | Order was dispatched (or attempted) and the parcel came back to ParaTunisie. Terminal for that shipment; may spawn a new order if the customer wants to retry. |
| `ANNULEE` | Order cancelled before shipment — by staff (e.g. stock unavailable, fraud suspicion, unreachable after N attempts) or by customer request before confirmation. Terminal. |
| `REFUSEE` | Customer was reached and explicitly declined the order. Terminal. Distinct from `ANNULEE`: this is a customer decision, not an operational one — tracked separately because a high refusal rate is a different signal (bad fit, price sensitivity, changed mind) than a high cancellation rate (stock, staff, fraud) and the two need different fixes. |

`ANNULEE` vs `REFUSEE` vs `ECHEC_LIVRAISON` are kept as three distinct terminal-ish states rather than collapsed into one "didn't work out" bucket precisely so the dashboard funnel (§C.12) can tell staff *why* orders are failing — a spike in `REFUSEE` means a merchandising/expectation problem, a spike in `ECHEC_LIVRAISON` means a courier/address problem, a spike in `ANNULEE` means an internal-ops problem.

#### A.2 State transitions

```
                      new order
                          │
                          ▼
                    EN_ATTENTE
                          │
                 staff attempts contact
                          │
                          ▼
                TENTATIVE_CONTACT ──────────────┐
                    │      │      │              │
             answers,   no answer  refuses        │ (repeat attempt,
             confirms   (retry)                    │  same status)
                │          │          │            │
                ▼          └──────────┘            │
            CONFIRMEE                              │
                │                          ANNULEE / REFUSEE
                ▼                            (both terminal)
            PREPARATION
                │
                ▼
         PRETE_EXPEDITION
                │
                ▼
            EXPEDIEE
             │     │
             ▼     ▼
          LIVREE  ECHEC_LIVRAISON
        (terminal)     │
                 ┌──────┴──────┐
                 ▼             ▼
          new attempt      RETOURNEE
          → EXPEDIEE        (terminal)
```

Allowed transitions only — no arbitrary status jumps that would destroy the operational trail:

- `EN_ATTENTE → TENTATIVE_CONTACT | CONFIRMEE | ANNULEE`
- `TENTATIVE_CONTACT → TENTATIVE_CONTACT` (another attempt, logged — see §A.5), `CONFIRMEE`, `ANNULEE`, `REFUSEE`
- `CONFIRMEE → PREPARATION | ANNULEE` (cancellation is still possible post-confirmation, e.g. stock shortage discovered during picking)
- `PREPARATION → PRETE_EXPEDITION | ANNULEE`
- `PRETE_EXPEDITION → EXPEDIEE`
- `EXPEDIEE → LIVREE | ECHEC_LIVRAISON`
- `ECHEC_LIVRAISON → EXPEDIEE` (redispatch attempt) `| RETOURNEE`
- `LIVREE`, `RETOURNEE`, `ANNULEE`, `REFUSEE` are terminal — no further status transitions, only a `Return`/`Refund` sub-workflow (§H) can follow `LIVREE`.

Every transition is written to `OrderStatusHistory` (who, when, from, to, optional note) — never overwritten in place (`DATA_MODEL.md`). The admin UI never exposes a raw "set status to X" dropdown with all values; it only offers the transitions valid from the current state, so staff cannot accidentally corrupt the flow.

#### A.3 Order admin list

Columns: order number, date/time, customer, phone, gouvernorat, total, payment method, payment status, order status, confirmation status, delivery status, assigned employee, courier, number of contact attempts, estimated margin, actions.

Filters: date range, status, confirmed/unconfirmed, gouvernorat, payment method, delivery method, assigned employee, courier, customer, high-value order, failed delivery, return, suspicious/repeated-refusal pattern.

Search: order number, customer name, phone, email.

Bulk actions limited to safe, reversible operations (e.g. assign to employee, print picking slips, export) — bulk status changes are deliberately *not* offered for anything past `CONFIRMEE`, since blindly bulk-transitioning shipped/delivered orders is exactly the kind of action that should require individual review.

#### A.4 Order detail page

The order detail page is an operational workspace, not a read-only receipt:

- **Customer** — name, phone, email, delivery address, order history, prior cancelled/refused/failed deliveries, lifetime value.
- **Order** — products, variants, quantities, unit prices, discounts, shipping, total.
- **Operations** — current status, full status timeline, employee notes, contact-attempt log, one-tap WhatsApp/call actions, courier info, tracking, preparation notes.
- **Payment** — method, status, COD amount due, transaction reference if ever applicable.
- **Profitability** (§C) — selling revenue, product acquisition cost, shipping cost/contribution, discount applied, estimated gross margin for this order.
- **Timeline** — every state-changing action timestamped with the staff member who performed it: created → contact attempted → confirmed → prepared → shipped → delivered (or the failure/return branch actually taken).

#### A.5 Contact attempts (COD confirmation workflow)

Every contact attempt is an append-only record, never an overwrite of the previous one:

- timestamp
- staff member
- channel (call / WhatsApp)
- outcome (answered-confirmed / answered-asked-to-call-later / no-answer / wrong-number / answered-refused / cancelled)
- optional free-text note

Example rendering:
```
Tentative 1 — 08/08/2026 10:12 — Appel — Pas de réponse
Tentative 2 — 08/08/2026 13:45 — WhatsApp — Client confirmé
```

An order can accumulate any number of attempts while in `TENTATIVE_CONTACT`; the admin surfaces "customers to call back" (§F) so nothing silently ages out. A configurable-but-sane default (e.g. 3 unanswered attempts over N days) is the trigger admin uses to *suggest* moving an order to `ANNULEE` — it is never automatic, since that would risk cancelling a real customer's order without their input (`CLAUDE.md` §20/§21-adjacent principle: don't silently act on ambiguous signals).

### B. Product Cost, Pricing & Margin

Every sellable variant/SKU eventually carries, in addition to its public-facing selling price:

- `prixVente` (selling price, what the storefront shows)
- `prixPromotionnel` (optional, active-dated)
- `coutAcquisition` (supplier/purchase cost — **admin-only, never sent to the storefront API response, never rendered client-side**)
- `supplierId`
- tax considerations, if/when applicable
- stock reference (§D)
- batch/expiry reference where the product category requires it

**Financial formulas (defined once here to prevent drift across the codebase and across staff conversations):**

- **Marge brute (gross margin amount)** = `prixVente − coûtAcquisition`. A currency amount, not a percentage.
- **Taux de marge (margin rate, cost-based / "markup")** = `margeBrute / coûtAcquisition × 100`. Answers "how much did we mark this up over what we paid?"
- **Taux de marque (markup rate, price-based / "gross margin %")** = `margeBrute / prixVente × 100`. Answers "what share of the selling price is profit before overhead?" This is the number retail/finance usually means by "margin %" — the admin should default to showing **taux de marque**, but both are computable and both must be labeled explicitly wherever shown so staff never confuse a 30%-of-cost markup with a 30%-of-price margin (they are very different numbers on the same product).

Example (matches the brief exactly):
```
SVR Sun Secure SPF50+
Prix fournisseur (coût d'acquisition) : 38,000 DT
Prix de vente : 59,900 DT
Marge brute : 21,900 DT
Taux de marge (sur coût) : 57.6%
Taux de marque (sur prix de vente) : 36.6%
```

**Promotions and real margin:** a promotion's admin preview shows the *resulting* margin, not just the discount, before activation:
```
Prix de vente après promotion : 43,900 DT
Coût : 39,000 DT
Marge brute restante : 4,900 DT (11.2% du prix)
```
Low-margin or negative-margin promotions are **not blocked automatically** — that's a business-rules decision for later, not an MVP constraint — but they must never be invisible. Staff activating a promotion always sees the margin consequence in the same screen as the activation control.

### C. Profitability

- **Per product**: selling price, supplier cost, gross margin amount, both margin percentages (§B).
- **Per order**: revenue, product cost, discount cost, delivery contribution (delivery fee charged to customer minus known courier cost, where courier cost is known), estimated gross profit.
- **Per day/week/month**: chiffre d'affaires (revenue), cost of goods sold, gross margin, total discounts given, cancelled-order count/value, returned-order count/value, failed-delivery count/value.

**Revenue is never labeled "profit" anywhere in the admin.** Chiffre d'affaires (CA) is the top-line number customers pay; gross margin/profit is CA minus cost of goods sold and, at the order level, minus discount and net delivery cost. This distinction is called out explicitly in every dashboard/report component that shows both, since conflating the two is the single most common — and most damaging — reporting mistake in small ecommerce operations.

> **Implemented** (`/admin/rentabilite`, `apps/api/src/profitability`, D-0026) — per-order and per-product gain on confirmed orders, using a cost snapshot (`OrderItem.unitCostMillimes`) captured at the `CONFIRMEE` transition from the weighted-average cost service (D-0017), never recomputed retroactively. Labeled "Gain estimé sur commandes confirmées," never "profit"/"Gain net." Delivery contribution and per-day/week/month CA/COGS breakdowns beyond the Rentabilité page's own chart are not built — courier cost isn't tracked yet, so delivery is deliberately left out of the gain figure rather than assumed.

### D. Inventory

Beyond the current `InventoryItem`/`StockMovement`/`Batch` sketch in `DATA_MODEL.md`, plan for:

- SKU/variant, warehouse/location, quantity on hand, quantity reserved, quantity available (on hand − reserved), reorder threshold, supplier reference, batch number, expiration date, purchase cost (linked to §E purchase-price history rather than a single static field).
- Stock movement types, each with a full audit trail (who/when/why, not just a delta): purchase receipt, order reservation (on `CONFIRMEE`, not on `EN_ATTENTE` — reserving stock for unconfirmed orders would let low-intent orders block real demand), order sale (on `LIVREE`, or on `EXPEDIEE` depending on the chosen accounting moment — decide and record in `DECISIONS.md` at Admin-3 kickoff), cancellation release, return, damage, expiration write-off, manual adjustment, warehouse transfer.

### E. Supplier Management

- Supplier entity: name, contact person, phone, email, address, tax/business info (where applicable), brands supplied, products supplied, latest purchase price per product, lead time, payment terms, notes, active/inactive flag.
- **Purchase price history is a first-class requirement, not an afterthought** — acquisition cost is not a static field. Example: CeraVe Cleanser costs 31 DT in January, 33 DT in March, 35.5 DT in June; the admin must be able to show that curve, not just "the current cost." Every price change is a new `PurchasePriceHistory` row, never an overwrite.
- Future (not MVP, but the data model must not preclude it): purchase orders, goods receipts, supplier invoices, full purchase history, outstanding supplier payments if the accounting scope ever expands.
- **Costing strategy**: don't hard-code an accounting method into the schema now. Plan for a defined, swappable costing strategy (actual batch cost, weighted-average cost, or another documented approach) computed *from* `PurchasePriceHistory` + `StockMovement`, rather than baking "current cost" into `ProductVariant` as the only source of truth. The default for Admin-3/6 should be **weighted-average cost**, since it's the simplest strategy that still tolerates price changes over time without requiring batch-level FIFO bookkeeping the team isn't set up to do yet — but this is a decision to make explicitly at implementation time (see `DECISIONS.md`), not something this requirements pass locks in.

### F. Admin Dashboard Home

Built around actionable business information — never decorative charts with no operational consequence.

**Top KPIs**: CA aujourd'hui, commandes aujourd'hui, commandes en attente, commandes à confirmer, commandes confirmées, commandes expédiées, commandes livrées, commandes annulées, taux de confirmation, taux de livraison, panier moyen, marge brute estimée (today).

**Operational alerts** (each one links directly to the filtered list that resolves it): commandes en attente depuis trop longtemps, clients à rappeler, commandes confirmées non préparées, échecs de livraison, stock faible, rupture de stock, produits proches d'expiration, produits sans prix fournisseur renseigné, commandes à forte valeur nécessitant une attention particulière.

**Dashboard sections:**

- **A. Opérations du jour** — new orders, awaiting confirmation, to prepare, to ship, delivery failures.
- **B. Ventes** — revenue today/week/month, average order value.
- **C. Rentabilité** — estimated gross margin, best-margin products, low-margin products, orders with unusual/outlier margin.
- **D. Inventaire** — low stock, out of stock, near expiry, high-stock/slow-moving.
- **E. Service client** — customers to call back, unresolved requests, return requests, negative reviews needing a response.
- **F. Top produits** — units sold, revenue, gross margin, conversion (once storefront analytics exist).
- **G. Entonnoir de commandes** — the single most important COD-specific view:
  ```
  100 nouvelles commandes
  → 82 confirmées      (taux de confirmation : 82%)
  → 76 expédiées
  → 69 livrées          (taux de livraison : 69% des commandes, 84% des expédiées)
  ```
  Displayed alongside confirmation rate, delivery success rate, cancellation rate, and return rate — these four numbers are the health metrics of a COD business and deserve permanent dashboard real estate, not a buried report.

### G. Customer Profile (admin view)

Contact info, addresses, order history, total spend, average basket, loyalty points, saved routines, reviews, returns, cancellation/refusal history, customer-service notes.

**Risk scoring caution**: any future "this customer is risky" indicator must be explainable (which signals produced it, not a black-box score) and must never auto-flag someone as fraudulent from a single failed/refused order — a bad address, a missed call, or a genuine change of mind are all normal and common. Risk signals inform a human's judgment; they don't replace it.

### H. Delivery Management

Order-level fields: courier, tracking number, shipment status, shipping cost, COD amount, delivery attempt count, delivered date, return reason.

Future dashboard views: delivery success rate by courier, average delivery time, failed-delivery breakdown, returned-parcel breakdown — this is what lets ParaTunisie negotiate with or switch couriers based on data instead of anecdote.

### I. Returns / Refunds

Status workflow: `REQUESTED → APPROVED | REJECTED`; `APPROVED → RECEIVED → REFUNDED | EXCHANGED → CLOSED`.

Recorded per return: reason, products/variants involved, condition on return, customer notes, staff notes, refund value, restocking decision. Cosmetics/hygiene items have real regulatory/hygiene constraints on resale after return — this is a business/legal-policy decision to make explicitly (with real Tunisian regulatory input) before the returns module is built, not something to assume away in the data model.

### J. Promotions (admin)

Percentage discount, fixed discount, category-scoped, brand-scoped, product-scoped, bundle, coupon code, minimum-basket threshold, start/end date, usage limits (total and per-customer). Margin-impact preview is mandatory before activation (§B).

### K. SEO Admin

SEO title, meta description, slug, canonical, index/noindex toggle, OG image, category/brand/concern SEO content, redirect-rule management. The admin must actively prevent staff from creating duplicate slugs or accidentally making a faceted/filtered URL indexable — this is a guardrail on top of the rules in `SEO.md`, not a separate policy.

### L. Content / CMS Admin

Homepage campaigns, editorial banners, advice articles, FAQs, routines, brand content, navigation/mega-menu structure, promotional sections — the goal is that a homepage content change or a new article doesn't require a developer.

### M. Roles & Permissions (RBAC)

Candidate roles: `SUPER_ADMIN`, `ADMIN`, `ORDER_MANAGER`, `CUSTOMER_SUPPORT`, `WAREHOUSE`, `CONTENT_MANAGER`, `SEO_MANAGER`.

Representative permission boundaries (illustrative, not exhaustive):
- Customer support can update confirmation/contact-attempt status; cannot view or edit supplier cost/margin data.
- Warehouse can prepare orders and adjust stock; cannot access customer-level analytics or spend history beyond what's needed to fulfill.
- Content manager can edit articles/campaigns; cannot touch orders or payments.
- Supplier cost and profitability data is permission-gated by default — it is sensitive business data, not just "admin-only" in a loose sense.

### N. Audit Log

Recorded for every significant admin mutation: status changed, price changed, supplier cost changed, stock adjusted, refund performed, order edited, promotion created/edited. Each entry: who, what, when, old value, new value (where applicable). This is what makes the margin/pricing data trustworthy and makes disputes ("who changed this price?") answerable in seconds instead of guesswork.

### O. Admin UX Principles

When eventually built: desktop-optimized, tablet-usable, fast, compact, searchable, keyboard-friendly where it speeds up repetitive tasks, clear status communicated by color **plus** text/icon (never color alone — `ACCESSIBILITY.md`), efficient dense tables, bulk actions only where genuinely safe, minimal decorative animation. The admin explicitly does **not** share the luxury storefront's visual language — it can carry brand identity subtly (palette, type) but operational clarity and speed are the actual design goals, not premium feel.

### P. Additional recommended capabilities

Recommended from an operator's-eye view of a Tunisian COD parapharmacy, to consider (not mandatory, and deliberately curated — dashboard bloat is a real failure mode, so only include what drives a decision):

- COD confirmation-rate trend over time (not just today's snapshot).
- Failed-delivery analytics by courier and by gouvernorat (some regions genuinely have worse delivery success — worth knowing, not worth publicly discussing).
- Repeat-customer rate and reorder cadence.
- Replenishment suggestions from sales velocity + lead time, not just a flat reorder threshold.
- Inventory aging (stock sitting unsold beyond a threshold), separate from low-stock alerts — the opposite problem.
- Expiration alerts staged by urgency (e.g. 90/60/30 days out), not a single binary flag.
- Supplier price-change alerts (this month's cost moved vs last purchase) so margin erosion is caught before it silently eats a bestseller's profitability.
- Best-selling product combinations (informs bundling and routine-builder recommendations, not just merchandising).
- Abandoned-cart visibility, once carts are server-persisted (Phase 2+).
- Customer-service follow-up queue with SLA aging (a request sitting 4 days unanswered should be visible, not buried).
- Delivery performance trends feeding courier negotiation.
- Promotion profitability retrospective (did this campaign's margin loss actually convert into a corresponding sales lift?).
- Staff productivity view (orders processed/confirmed per staff member) — useful for a small ops team's workload balancing, not for surveillance; frame and scope it that way if built.
- A daily-operations checklist view — effectively a persistent, prioritized to-do list assembled from the alerts in §F, so opening the admin each morning tells staff exactly what needs attention first.

## Analytics

**MVP**: GA4 (or equivalent) pageview/ecommerce event wiring stubbed but not blocking launch.
**Phase 2**: full ecommerce event tracking (view_item, add_to_cart, begin_checkout, purchase), Search Console verified, CWV field data monitored (`SEO.md`, `PERFORMANCE.md`).
**Future**: internal BI dashboard, cohort/retention analysis, routine-diagnostic funnel analytics.
