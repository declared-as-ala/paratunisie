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

---

## Batch 6 addendum — implementation status (local only, NOT deployed)

**What exists in the code (all off by default):**
| Piece | File | Behaviour |
|---|---|---|
| Opt-in public cache | `src/lib/api/client.ts` `publicCacheSeconds()` | Only when `PUBLIC_CACHE_SECONDS` (max 600) is set at build **and** run time; server-side GET only; allow-list = catalogue products/categories/brands/concerns/redirect/sitemap-data, content articles, homepage featured/best-sellers, public reviews + rating; all tagged `catalogue`. The header mega-menu (5 min cache already in production) now carries the same tag. |
| ISR for home + product pages | `src/app/page.tsx`, `src/app/produits/[slug]/page.tsx` | `force-dynamic` removed; product page has an empty `generateStaticParams()` so each product is rendered on first request then cached. Category pages remain dynamic (they read `searchParams`); only their data fetches are cached. |
| Private pages | `next.config.ts` headers | `/panier`, `/checkout`, `/paiement`, `/compte/*`, `/favoris`, `/fidelite`, `/le-cercle` always `Cache-Control: private, no-store, max-age=0`. (Production today serves these static shells with `s-maxage=300`; no personal data is in them, but they should never sit in a shared cache.) |
| Flush endpoint | `src/app/api/revalidate/route.ts` | POST, `x-revalidate-secret`, allow-listed tag, immediate expiry. 503 when no secret is configured. |
| Automatic invalidation | `apps/api/src/common/web-cache-invalidation.interceptor.ts` (+10 unit tests) | After any successful POST/PUT/PATCH/DELETE (except tracking/analytics/auth/wishlist/diagnostic/notifications/product-requests), one debounced (1.5 s) call to `WEB_REVALIDATE_URL`. Inactive unless both `WEB_REVALIDATE_URL` and `REVALIDATE_SECRET` are set. |
| Writes outside HTTP | – | CLI imports, sync cron and manual SQL do not trigger a flush; the TTL (60 s) bounds staleness. After a bulk SQL edit call the flush endpoint by hand. |

**Why a runtime bug was found only by testing:** a review endpoint outside the allow-list turned a cached product page into a 500 ("Page changed from static to dynamic"). Any future page fetch added to a cached route must be added to the allow-list; `ops/seo/cache-check.cjs` samples 40 product URLs and fails on any non-200.

**Local results (production API as data source, Next 16 build, `PUBLIC_CACHE_SECONDS=60`):**
- `/` and `/produits/*`: `x-nextjs-cache: MISS` then `HIT`, `Cache-Control: s-maxage=60, stale-while-revalidate=…`.
- `/creatine` (category): still `private, no-cache, no-store`.
- Private pages: `private, no-store, max-age=0` (verified for 8 paths).
- `ops/seo/cache-check.cjs`: 40/40 product URLs 200; Googlebot and mobile-visitor HTML identical (10/10); schema price equals live API price (10/10); `POST /api/revalidate` → next request MISS then HIT.
- Revalidate endpoint: GET 405, no/wrong secret 401, unknown tag 400, valid 200.

**Build-time vs run-time (important):** static and ISR routes are prerendered by `next build`, so `PUBLIC_CACHE_SECONDS` (and `NEXT_PUBLIC_DEFER_TRACKERS`) must be present when the Docker image is built, and the API must be reachable during the build. This is why the flag is not a hot toggle.

**Deployment checklist (when approved):**
1. Set `REVALIDATE_SECRET` (web + API) and `WEB_REVALIDATE_URL=http://paratunisie-web:3000/api/revalidate` (API) in `docker-compose.prod.yml` / `.env`; `PUBLIC_CACHE_SECONDS=60` as a web build arg + env.
2. Tag the current images (`pre-batch6`), back up the compose file.
3. Build web + API, deploy API first, then web.
4. Run `node ops/seo/cache-check.cjs https://paratunisie.com <secret>` and `npm run seo:check`; compare 10 product prices with the admin.
5. Watch for 5xx in `docker logs paratunisie-web` for 30 minutes.

**Rollback (< 2 minutes):** `docker tag paratunisie-prod-paratunisie-web:pre-batch6 paratunisie-prod-paratunisie-web:latest` (same for api) and `docker compose -f docker-compose.prod.yml up -d --no-deps paratunisie-web paratunisie-api`. No database migration involved. Emergency without redeploy: unset `PUBLIC_CACHE_SECONDS` is NOT enough (it is baked at build); use the image rollback, or call the flush endpoint if only stale data is the problem.

