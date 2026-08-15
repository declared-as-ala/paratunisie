# UX.md — ParaTunisie Customer Journeys

Each journey lists the happy path, key friction-reduction decisions, and the primary failure/edge state to design for. Cross-reference `DESIGN_SYSTEM.md` for the components involved.

## 1. Homepage → Category → Product → Cart → Checkout

Homepage surfaces "shop by concern" and best-sellers within the first two screens on mobile so a decisive visitor never has to scroll through pure editorial before reaching product. Category page opens with an SEO heading + short editorial intro (see `SEO.md`) but the product grid is visible without scrolling past a large hero. PDP add-to-cart opens the cart drawer (not a full navigation) so the user's browsing context is preserved. Checkout is reachable from the drawer with one tap.
Friction reduction: quick-add from PLP cards for repeat/known purchases; cart drawer shows free-delivery progress immediately.

## 2. Search → Product

Search is reachable from a persistent header affordance (icon on mobile always visible, full bar on desktop). Typing surfaces live suggestions (products, brands, categories, concerns) before submit. Selecting a suggestion goes straight to the destination, not to a results page first.
Edge state: zero results shows suggested categories/concerns and popular searches rather than a dead end — never just "no results."

## 3. Shop by Concern → Results

Concern cards on homepage/nav lead to a PLP pre-filtered by concern, with the concern name in the H1 and a short explanatory intro (SEO + user orientation in one). Related concerns are surfaced at the bottom to support cross-navigation without a dead end.

## 4. Routine Diagnostic → Recommendations → Cart

Multi-step flow with visible progress (step indicator), each step is a single decision to minimize abandonment. Back is always available. Final recommendation groups products into AM/PM steps with an explicit "why this product" line per item — this is the trust-building moment, not just a product dump. "Add all to cart" is the primary CTA; "replace a product" and "save" are secondary. Disclaimer (non-medical) shown once, persistently accessible, not intrusive.
Edge state: user has no clear concern/skips a step — flow still produces a reasonable "Routine Essentielle" default rather than blocking.

## 5. Brand → Product

Brand pages open with brand identity/story (short, not a wall of text) before the product grid, reinforcing authenticity trust (important given counterfeit concerns in the category). Best-sellers for that brand surfaced first in the grid.

## 6. Promotion → Product

Promotional entry points (homepage banner, editorial campaign) land on a filtered/curated collection, not a generic "all products" page, so the promotional intent is preserved.

## 7. Wishlist → Cart

Wishlist accessible from header at all times (icon with count). Each wishlist item has a one-tap "add to cart." Empty wishlist state suggests best-sellers/concerns rather than being blank.

## 8. Returning Customer

Recently viewed (local storage in MVP, account-backed later) surfaced on homepage for returning visitors. Reorder-friendly: account order history (Phase 2) supports one-tap reorder of a past order.

## 9. Empty Search

See §2 edge state — this is a first-class state, not an afterthought: suggested categories, popular searches, and a support/WhatsApp entry point ("besoin d'aide pour trouver un produit ?").

## 10. Unavailable Product

Out-of-stock PDPs remain indexable (don't 404/noindex a page with residual SEO value and potential restock) but clearly mark unavailability, disable add-to-cart, and offer: notify-me-on-restock (Phase 2), similar in-stock alternatives, and category link. Never silently hide out-of-stock products from listings without explanation — mark them clearly instead, per `CLAUDE.md` §20 (no fake data / no misleading states).

## 11. Mobile Navigation

A persistent five-item bottom tab bar is now adopted for mobile and tablet widths: Accueil, Shop, Diagnostic, Favoris, Compte. Shop opens the complete product catalogue and remains active on category and concern routes. Each destination has an icon and text label, the current destination is indicated by color plus a top marker, and the bar respects device safe areas. Search and cart remain in the compact top header. The former hamburger/drawer navigation was removed by explicit user direction; desktop retains the full mega-menu. See `DECISIONS.md` D-0010.

## 12. Support / WhatsApp

WhatsApp click-to-chat is available from header (secondary placement), PDP (near reassurance block), and checkout (in case of last-minute doubt) — consistent icon and copy across placements so it reads as one system, not three separate afterthoughts.

## 13. Homepage High-Conversion Rhythm & Routine Basket Booster

The homepage alternates **PRODUCT → DISCOVERY → PRODUCT → ROUTINE → PRODUCT → EDITORIAL → PRODUCT** across 18 structured sections to maximize product visibility early and throughout the customer journey.

Key conversion levers:
- **Instant Direct Add-to-Cart**: Every product card features direct add-to-cart with automatic cart drawer opening and real-time item count feedback.
- **Multi-Item Basket Booster ("Ajouter toute la routine")**: The Routine section showcases a 4-step dermatological routine (*Nettoyage, Traitement, Hydratation, Protection*) with a single-click button that adds all 4 complementary products to the cart simultaneously, boosting average order value (AOV).
- **Shop by Budget & Need**: Triggers rapid price-based and concern-based filtering for high-intent shoppers.

## Cross-cutting friction-reduction principles

- Never force account creation to browse, wishlist (local storage fallback), or start checkout — guest checkout is mandatory (`REQUIREMENTS.md`).
- Every irreversible action (place order) has a clear confirmation state; every reversible action (wishlist, cart quantity) is optimistic with no confirmation dialog.
- Price, stock, and delivery-estimate information is visible before the user commits to expanding effort (never hidden until checkout).
