# DATA_MODEL.md — ParaTunisie Entity Plan

Planning document for the Postgres/Prisma schema built in Sprint 9+. Not all entities are implemented immediately — MVP (Sprints 1-8) uses mock objects shaped like this model so the eventual swap to real data is mechanical. Money fields are integer minor units (millimes) or `Decimal`, never float (`CLAUDE.md` §13).

## Identity & Customer

- **User** — id, email, phone, passwordHash (or auth-provider ref), locale, createdAt.
- **CustomerProfile** — userId, firstName, lastName, preferences (skin/hair profile snapshot from diagnostic).
- **Address** — id, userId, label, firstName, lastName, phone, gouvernorat, delegation, localite, addressLine, postalCode, deliveryInstructions, isDefault.

## Catalogue

- **Brand** — id, slug, name, story, logo, heroImage.
- **Category** — id, slug, name, parentId (self-relation for tree), description, heroImage.
- **Concern** — id, slug, name, description.
- **Ingredient** — id, slug, name, description, benefits.
- **Product** — id, slug, brandId, categoryId, title, shortDescription, description, benefits, usage, precautions, status (draft/active/discontinued), createdAt.
- **ProductConcern** — productId, concernId (join).
- **ProductVariant** — id, productId, size, sku, barcode.
- **SKU** — effectively ProductVariant.sku; if variant complexity grows (e.g. size × color), promote to its own entity with variant-attribute join.
- **ProductIngredient** — productId, ingredientId, order.
- **ProductImage** — id, productId, url, alt, order, isPrimary.
- **ProductAttribute** — id, productId, key (e.g. skinType, texture, hairType), value — flexible attribute bag for filter facets that don't warrant a dedicated table.

## Inventory (Future)

- **Warehouse** — id, name, address.
- **InventoryItem** — id, variantId, warehouseId, quantityOnHand, quantityReserved, quantityAvailable (derived: onHand − reserved), reorderThreshold.
- **StockMovement** — id, inventoryItemId, type (`purchase_receipt` / `order_reservation` / `order_sale` / `cancellation_release` / `return` / `damage` / `expiration` / `manual_adjustment` / `transfer`), quantity, reference (e.g. orderId or purchaseOrderId), performedByStaffId, note, createdAt. Append-only — never edited or deleted, since it's the audit trail inventory reconciliation depends on.
- **Batch** — id, variantId, batchNumber, expirationDate, warehouseId, quantity, purchasePriceHistoryId (which cost this batch was received at).

## Supplier & Purchasing (Future — Admin/ERP phase, `REQUIREMENTS.md` §E)

- **Supplier** — id, name, contactPerson, phone, email, address, taxInfo (nullable), leadTimeDays, paymentTerms, notes, isActive.
- **SupplierProduct** — id, supplierId, variantId, latestPurchasePriceMillimes, isPrimarySupplier (a variant may have more than one supplier over time). Join entity between `Supplier` and `ProductVariant`.
- **PurchasePriceHistory** — id, variantId, supplierId, purchasePriceMillimes, effectiveFrom, createdAt. Append-only — acquisition cost is a time series, never a single overwritten field, so margin can be computed against the cost that was actually in effect at any given order/movement. Powers the costing strategy chosen in `DECISIONS.md` (weighted-average by default — see `REQUIREMENTS.md` §E) rather than assuming "current cost" is always correct for historical reporting.
- **PurchaseOrder** — id, supplierId, status (draft/sent/partially\_received/received/cancelled), expectedDate, createdAt.
- **PurchaseOrderLine** — purchaseOrderId, variantId, quantity, unitCostMillimes, quantityReceived.

## Commerce

- **Order** — id, userId (nullable for guest), orderNumber (human-readable, distinct from internal id), status (see `OrderStatus` below), assignedStaffId (nullable), subtotal, discountTotal, deliveryFee, total, currency (TND), gouvernorat, deliveryAddress, placedAt.
- **OrderStatus** (enum) — `EN_ATTENTE` / `TENTATIVE_CONTACT` / `CONFIRMEE` / `PREPARATION` / `PRETE_EXPEDITION` / `EXPEDIEE` / `LIVREE` / `ECHEC_LIVRAISON` / `RETOURNEE` / `ANNULEE` / `REFUSEE`. Full state machine and allowed transitions documented in `REQUIREMENTS.md` §A.1-A.2 — this is a deliberately richer set than the `PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED` enum currently in `apps/api/prisma/schema.prisma`'s early Sprint 9 scaffold; reconciling the two is Admin-2 work, not done in this pass (see `DECISIONS.md`).
- **OrderStatusHistory** — id, orderId, fromStatus, toStatus, changedByStaffId, note (nullable), createdAt. Append-only, one row per transition — the UI never allows a raw status overwrite, only a valid transition (`REQUIREMENTS.md` §A.2), and this table is what the order-detail timeline renders.
- **OrderContactAttempt** — id, orderId, staffId, channel (`call` / `whatsapp`), outcome (`answered_confirmed` / `answered_call_later` / `no_answer` / `wrong_number` / `answered_refused` / `cancelled`), note (nullable), createdAt. Append-only — a new attempt is always a new row, never an edit of a prior attempt (`REQUIREMENTS.md` §A.5).
- **OrderItem** — orderId, variantId, quantity, unitPriceMillimes, lineTotal, unitCostMillimes (snapshot of acquisition cost, captured at the `CONFIRMEE` transition per D-0026 — never at raw order creation — copied from the weighted-average cost service; never recomputed retroactively from a supplier's current price, so historical order-profitability reports stay accurate even after supplier prices change), costIsEstimated (`Boolean`, default `false` — `true` when `unitCostMillimes` was backfilled from a later cost rather than captured live at confirmation; surfaced in `/admin/rentabilite` and the order drawer so estimates are never presented as exact). `Order` carries a `@@index([status, createdAt])` — both `ReportingService` and `ProfitabilityService` filter on this pair.
- **Payment** — id, orderId, method (COD — the only method; see `DECISIONS.md` D-0014), status (pending/collected/failed), amount. No `provider`/`providerRef` fields — there is no external payment gateway to reconcile against.
- **Shipment** — id, orderId, carrier, trackingRef, status, shippingCostMillimes, codAmountMillimes, deliveryAttemptCount, shippedAt, deliveredAt, returnReason (nullable).
- **Promotion** — id, name, type (percentage/fixed), value, scope (category/brand/product/global), minimumBasketMillimes (nullable), startAt, endAt, usageLimit (nullable), perCustomerLimit (nullable).
- **Coupon** — id, code, promotionId, usageLimit, usageCount, perCustomerLimit.

## Returns & Refunds (Future — Admin/ERP phase, `REQUIREMENTS.md` §I)

- **Return** — id, orderId, status (`REQUESTED` / `APPROVED` / `REJECTED` / `RECEIVED` / `REFUNDED` / `EXCHANGED` / `CLOSED`), reason, customerNote, staffNote, conditionOnReturn, restockingDecision (restock/damage/dispose), createdAt, updatedAt.
- **ReturnItem** — returnId, orderItemId, quantity.
- **Refund** — id, returnId, amountMillimes, method (matches original payment — COD refunds are typically a manual/cash process, documented not assumed), processedByStaffId, createdAt.

## Admin / RBAC & Audit (Future — Admin/ERP phase, `REQUIREMENTS.md` §M-N)

- **StaffUser** — id, email, passwordHash, name, role, isActive, createdAt. Kept structurally distinct from the storefront `User` (customer) rather than sharing one table with a `role` column — this is a deliberate change from the current `apps/api` scaffold's single `User.role: CUSTOMER | ADMIN` enum, since staff accounts have entirely different lifecycle, auth, and security requirements (`SECURITY.md` §Admin Security) than customer accounts, and conflating them makes least-privilege RBAC (`REQUIREMENTS.md` §M) awkward to express and query. Recorded as an architecture decision in `DECISIONS.md`.
- **Role** (enum) — `SUPER_ADMIN` / `ADMIN` / `ORDER_MANAGER` / `CUSTOMER_SUPPORT` / `WAREHOUSE` / `CONTENT_MANAGER` / `SEO_MANAGER`. A simple enum-per-staff-user is sufficient until real per-permission granularity is needed; if it is, promote to a `Permission`/`RolePermission` join model without changing `StaffUser`'s shape.
- **AuditLog** — id, staffId, action (e.g. `order_status_changed`, `price_changed`, `supplier_cost_changed`, `stock_adjusted`, `refund_processed`, `promotion_created`), entityType, entityId, oldValue (JSON, nullable), newValue (JSON, nullable), createdAt. Cross-cutting — written by any module performing a mutation covered by `REQUIREMENTS.md` §N, not owned by a single feature module.

## Engagement

- **Wishlist** — id, userId, createdAt.
- **WishlistItem** — wishlistId, variantId.
- **Review** — id, productId, userId, rating, title, body, isVerifiedPurchase, status (pending/published/rejected), createdAt.
- **LoyaltyAccount** — id, userId, tier (Essentiel/Privilège/Signature), pointsBalance.
- **LoyaltyTransaction** — id, loyaltyAccountId, type (earn/redeem/adjust), points, orderId (nullable), createdAt.

## Personalization (implemented, D-0029)

- **Routine** — id, userId (nullable — no customer auth exists yet, see below), sessionToken (opaque, guest identity), domain (SKIN/HAIR), tier (Essentielle/Complète/Premium), answers (raw questionnaire JSON), profile (normalized `NeedProfile` JSON), createdAt.
- **RoutineItem** — routineId, productId (real `Product`), slot (AM/PM), role, reason, position — the actually-recommended, AI/fallback-picked real products for a routine.
- **DiagnosticPhoto** — routineId (nullable), sessionToken/userId, storageKey (nullable — cleared after analysis), observations/confidence (structured JSON), redFlag, redFlagReason, provider, model, createdAt. Schema exists; photo/vision analysis itself is not implemented yet (no `OPENAI_API_KEY` configured for vision at time of writing).
- **DiagnosticQuestion** / **DiagnosticOption** — admin-manageable questionnaire (domain, key, label, type, required, position, active). Real questions seeded via `apps/api/prisma/seed-diagnostic-questions.ts` (standalone, additive-only — deliberately not part of the destructive `prisma/seed.ts`).
- **DiagnosticAiRequest** — profileHash, candidateHash, provider, model, promptVersion, token/cost/duration, status (SUCCESS/FAILED/CACHED/FALLBACK_RULES), resultJson — cache + usage log for the AI recommendation calls, mirrors `SeoGenerationLog`'s pattern.
- There is deliberately **no** `DiagnosticNeedMapping`/admin-editable need→category table — recommendation logic is AI-ranked over real `CatalogueService.findForRecommendation` candidates (or an in-code keyword fallback), not a manually maintained mapping (D-0029).

## Content & Merchandising (Sprint E+)

- **Article** — id, slug, title, excerpt, category, readTime, date, content (JSON blocks string), status (DRAFT/PUBLISHED/SCHEDULED), authorName, expertReviewer, featuredImage, publishedAt, scheduledFor, SEO fields (seoTitle, metaDescription, canonicalUrl, indexable, ogTitle, ogDescription, ogImage, targetKeyword).
- **ArticleProduct** — articleId, productId, rationale, position (join).
- **ArticleBrand** — articleId, brandId (join).
- **ArticleConcern** — articleId, concernId (join).
- **ArticleFaq** — id, articleId, question, answer, position.
- **HomepageConfig** — id, sectionKey, enabled, position, mode (MANUAL/AUTOMATIC/HYBRID), title, description, settings (JSON string for limits, pinned IDs, etc.).
- **HomepageCampaign** — id, title, eyebrow, description, desktopMedia, mobileMedia, ctaLabel, ctaUrl, status (DRAFT/SCHEDULED/PUBLISHED/ARCHIVED), startDate, endDate, productIds (JSON string array).

## SEO Metadata

- **SeoMeta** — polymorphic (entityType + entityId), title, description, canonicalOverride, ogImage — used where the default generated metadata needs an explicit override rather than being derived purely from entity fields.

## Notes for implementation

- Prefer generating `ProductAttribute` facets (skinType, hairType, texture, etc.) from a constrained enum/lookup rather than free text, so filters stay clean and don't fragment (`la-roche-posay` vs `La Roche-Posay` type drift).
- `Routine`/`RoutineItem` support a nullable `userId` plus `sessionToken` so the diagnostic flow works for guests (`UX.md` §4); there is no `/diagnostic/session/:id/save` endpoint yet since no customer auth/session system exists in this codebase — "Enregistrer ma routine" stays client-side (`localStorage`) like cart/wishlist until real customer auth lands (D-0029).
- Every entity that renders a public page carries or can resolve a slug; slug changes always produce a redirect row (see `SEO.md` §Redirects) — worth a `RedirectRule { fromPath, toPath, createdAt }` entity once Phase 2 starts generating real slug churn.
