# SEO.md — ParaTunisie SEO Architecture

SEO is a first-class engineering requirement (`CLAUDE.md` §6), implemented alongside each page type, not retrofitted before launch.

## Target Queries (initial set — expand via keyword research in Sprint 3+)

Head terms: `parapharmacie tunisie`, `parapharmacie en ligne tunisie`, `produit parapharmacie tunisie`, `skincare tunisie`.
Concern/product long-tail: `écran solaire tunisie`, `écran solaire peau grasse tunisie`, `produit anti chute cheveux tunisie`, `routine peau grasse tunisie`, `crème peau sensible tunisie`.
Pattern to replicate across brand/concern/ingredient/skin-type/hair-type/routine pages: `[need] + tunisie`, `[brand] + tunisie`, `[concern] + [product type] + tunisie`.

No SEO hacks, no keyword stuffing (`CLAUDE.md` §22, handoff brief §37) — sustainable organic growth via genuinely useful pages.

## URL Architecture

French is default locale; Arabic ready but not shipped at launch.

```
/fr
/fr/visage
/fr/cheveux
/fr/solaire
/fr/corps
/fr/bebe-maman
/fr/marques
/fr/marques/[slug]
/fr/besoins/[slug]              (concern pages)
/fr/ingredients/[slug]           (Phase 2)
/fr/produits/[slug]
/fr/conseils
/fr/conseils/[slug]
/fr/recherche?q=...              (noindex)
/ar/... (mirrors /fr, added when Arabic ships)
```

Slugs are French, lowercase, hyphenated, stable once published (see Redirects below).

## Internationalization / hreflang

- Locale prefix in the URL path (`/fr`, `/ar`), never a query param or cookie-only switch, so each locale is independently crawlable and linkable.
- When `/ar` ships, every `/fr` page emits `hreflang="fr-tn"` / `hreflang="ar-tn"` reciprocal tags plus `x-default` pointing at `/fr` (French remains default for Tunisia).
- No hardcoded LTR-only layout logic — see `CLAUDE.md` §19 (logical CSS properties) so RTL doesn't require a rewrite.

## Canonical Strategy

- Every indexable page emits a self-referencing canonical.
- Filtered/sorted PLP URLs (`?brand=x&sort=price`) canonicalize to the clean category URL unless a specific filter combination is deliberately promoted to its own indexable landing page (see Faceted Navigation below).
- Paginated PLPs (`?page=2`) canonicalize to themselves (not to page 1) since content differs; `rel=next/prev` is not required by Google anymore but pagination is exposed via crawlable links either way.

## Indexation Rules

Indexable by default: category, brand, concern, ingredient, product, editorial, homepage.
Noindex by default: search results, cart, checkout, account pages, raw filter/sort query combinations not explicitly promoted, internal preview/staging routes.

## Pagination

PLP pagination uses real crawlable `<a href>` links (not JS-only), page 2+ has a unique enough title/meta (via product range or page number) to avoid being flagged as pure duplicate content, and a "load more" UX pattern still renders real paginated URLs underneath for crawlability (progressive enhancement, not JS-only infinite scroll).

## Filtering / Faceted Navigation

This is the highest index-bloat risk area for an ecommerce catalogue and is explicitly controlled:

- Single, high-intent facet combinations that map to real demand (e.g. `brand=la-roche-posay` on a concern page) may be promoted to a real, curated, indexable landing page with unique intro copy — not auto-generated for every combination.
- All other facet/sort query strings are noindex + canonical to the clean page.
- `robots.txt` disallows crawling of low-value parameter patterns that provide no unique content (e.g. `?sort=`) to protect crawl budget, while allowing the parameters that do matter.
- No page is auto-created for a facet combination with no real inventory/search demand behind it.

## Internal Linking

Designed intentionally, not left to default component composition:

- Product → brand, product → concern(s), product → ingredients (Phase 2), product → related routine.
- Article → referenced products, article → related concerns.
- Brand → its product ranges/best-sellers.
- Concern → related articles, related products, related concerns.
- Breadcrumbs on every non-homepage page, matching the URL hierarchy, marked up with `BreadcrumbList` schema.

## Metadata

Every page template defines: unique `<title>` (brand/category/product-specific, not a repeated template with only the noun swapped), unique meta description, Open Graph (title/description/image/type), Twitter card. Title/description generated from the same structured data that renders the page (no hand-duplicated content that drifts, per `CLAUDE.md` §6).

## Structured Data (JSON-LD)

- **Product + Offer**: every PDP — price, currency (TND), availability, condition.
- **AggregateRating + Review**: PDP, only once real reviews exist (Phase 2) — never fabricated (`CLAUDE.md` §20).
- **BreadcrumbList**: every non-homepage page.
- **Organization**: sitewide (logo, sameAs social links, contact).
- **WebSite + SearchAction**: homepage, once site search supports a query-string entry point.
- **Merchant/product feed**: Phase 2, for Google Merchant Center / Shopping — separate structured feed, not scraped from HTML.

## XML Sitemaps

Segmented sitemaps (products, categories/brands/concerns, editorial) referenced from a sitemap index, regenerated on publish/update, submitted via Search Console. Out-of-stock/discontinued products excluded per rules below rather than left stale.

## robots.txt

Allows all indexable paths above; disallows cart/checkout/account/search-results/low-value parameters; references the sitemap index.

## Image SEO

Descriptive filenames and `alt` text (French, descriptive not keyword-stuffed) on all product/editorial imagery; `next/image` responsive sizes; no critical content conveyed by image text alone.

## Category / Brand / Concern Content

Each of these page types carries genuine editorial intro content (2-4 sentences minimum) written for the page's specific topic — not templated filler with the noun swapped — both for user orientation and to avoid thin-content risk.

## Local SEO

Google Business Profile for the brand (once a physical/warehouse presence or customer service address exists), NAP consistency across footer/schema/GBP, "Tunisie" / gouvernorat-level relevance signals in copy where genuinely relevant (delivery coverage, not keyword stuffing).

## Core Web Vitals

Targets and implementation rules live in `PERFORMANCE.md`; SEO impact of missing them (ranking signal) is the reason they're non-negotiable, not just a UX nicety.

## Redirects

- Slug changes always get a 301 from the old to the new URL — no silent breakage.
- A redirect map is maintained (see `DECISIONS.md` for when this becomes a proper table vs. a config file) so redirects aren't lost across deploys.

## Discontinued / Out-of-Stock Products

- Out-of-stock: page stays live and indexable (see `UX.md` §10), marked unavailable, shows alternatives — do not noindex or delete.
- Permanently discontinued with no replacement: 301 to the closest matching category/concern page rather than 404, unless there's a strong reason to preserve a clean 404 for a truly removed line.

## Duplicate Content Prevention

- One canonical URL per real entity (product, category, etc.) — no parallel URL schemes reaching the same content.
- Variant products (same product, different size) live under one PDP with variant selection, not separate near-duplicate pages, unless SEO research later shows a specific variant deserves its own landing page (documented decision, not default).
