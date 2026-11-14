# Caching proposal (NOT deployed — needs explicit approval)

## Baseline (production, 3 runs each, 2026-11-14)
TTFB 0.83–1.09 s on /, /creatine, /whey-isolate, a product page, /marques (one 1.7 s outlier).
Header on every page: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.

## Origin of no-store
Explicit `export const dynamic = "force-dynamic"` (and `revalidate = 0` on some) in `src/app/page.tsx`,
`produits/[slug]/page.tsx`, `[category]/page.tsx`, `marques/page.tsx`, `shop/page.tsx`, `conseils/page.tsx`,
`conseils/[slug]/page.tsx`, `besoins/*`, `bien-etre`; `sitemap.ts`; API fetches with `cache: "no-store"`.
It is not a proxy setting or a Next.js default.

## Proposal
1. Public, non-personalized routes only: `/`, `/produits/[slug]`, `/[category]`, `/marques`, `/marques/[slug]`,
   `/conseils`, `/conseils/[slug]`. Replace `force-dynamic` with `export const revalidate = 60` (ISR) and API
   `fetch(..., { next: { revalidate: 60, tags: [...] } })`.
2. Never cached: `/panier`, `/checkout`, `/compte/*`, `/favoris`, all `/api/*`, anything reading cookies or sessions.
   First verify the root layout and header do not call `cookies()` / `headers()` (that would force dynamic rendering
   or leak per-user content into a shared cache).
3. Invalidation: a secret-protected `POST /api/revalidate` route called by the API after product, category, brand or
   article writes and after stock/price changes (`revalidateTag`). Without it, stale price/stock can show for up to
   60 s; acceptable only because checkout re-prices every order from the database.
4. Offer JSON-LD must equal what Google sees, so keep revalidate short (<= 60 s) plus tag invalidation.
5. Parity test: Googlebot UA vs normal UA must return identical robots, canonical, title and JSON-LD.

## Test plan (local first)
- `next build && next start`; 20 requests per page type: expect `x-nextjs-cache: HIT` and TTFB well under 150 ms.
- Change a price in admin; confirm the page updates within the window and immediately after the webhook.
- Confirm cart, checkout and account responses are still `no-store`.

## Rollback
Revert the commit and redeploy image tag `paratunisie-prod-paratunisie-web:pre-batch3` (or `checkpoint-batch1`).
No database migration is involved.

## Expected effect
Cached hits should drop from ~0.9 s to tens of milliseconds and reduce API load. Not claimed until measured.
