# Meta Pixel + Google Ads: deferral without losing conversions (Batch 6, local only)

## Today (production)
`layout.tsx` loads gtag.js (Google Ads `AW-18415809993`) and fbevents.js (Pixel `2900022603691735`) with `afterInteractive`. Lab cost (Batch 5): gtag ≈ 165 KB / 2.5–4 s CPU, Pixel ≈ 233 KB / 1.4–2 s CPU on throttled mobile.
Measured defect of the current setup: `window.fbq` / `window.gtag` are **undefined** until those scripts run, so any event fired earlier (fast click, early page code) is silently dropped (`isFbqAvailable()` returns false).

## Change (flag `NEXT_PUBLIC_DEFER_TRACKERS=1`, build-time; default = unchanged)
- Inline stubs (`#tracker-stubs`) define `dataLayer`, `gtag`, `fbq` immediately and queue `config`, `init`, `PageView` and every later event.
- `DeferredTrackers` fetches gtag.js and fbevents.js on the earliest of: first interaction (pointerdown, keydown, touchstart, scroll, wheel), page hidden / left, or 5 s after window load.
- Pages loading them immediately: `/panier`, `/checkout`, `/paiement`, `/commande*`, `/pack-anti-stress` (conversion path and paid-ad landing).
- Server-side Meta CAPI relay (`/api/v1/tracking/meta-event`) and first-party analytics are untouched.

## Test (`ops/seo/tracking-e2e.cjs`; real tracker files, every outgoing beacon aborted and recorded; no real event, order or analytics row is created)
| Scenario | Production (current) | Deferred (local) |
|---|---|---|
| Home, no interaction | Pixel PageView + Google page_view/config; scripts at ~1.0 s | same events; scripts at ~5.7 s (fallback) |
| Home, scroll at ~1.5 s | same | same; scripts load at the scroll (1.55 s) |
| Product view + click Add to cart | PageView, ViewContent (379), AddToCart (379), Google page_view, CAPI relay | identical set (only Meta's automatic `SubscribedButtonClick` missing; it is not a configured conversion) |
| Purchase events fired by page code before scripts load | **lost** (stubs undefined) | Meta `Purchase` value 99.5 and Google `conversion` both emitted after load |
| /panier, /checkout with no interaction | scripts at ~1 s | scripts at ~0.7–1.1 s (immediate path) |
Limit: the real Purchase path creates an order in production, so it was not triggered; the same `fbq`/`gtag` calls were exercised instead. **Before any production rollout, confirm in Meta Events Manager "Test events" and Google Tag Assistant, then compare daily PageView / conversion counts for a week.**

## Residual trade-off
A visitor who leaves within ~5 s without touching the page (or whose tab never becomes hidden) is not counted by Meta/Google Ads. Real users almost always scroll or tap sooner; lab/bots do not. Impact on remarketing audience size must be watched.

## Lighthouse (mobile, simulated 4G, median of 3 runs, 2026-11-15)
Production vs local build served from the same laptop that runs Lighthouse (CPU contention biases against the local build; production API is the data source):
| Page | Perf | FCP | LCP | TBT | TTFB | Transfer |
|---|---|---|---|---|---|---|
| Home, production | 48 | 3.3 s | 7.4 s | 2,324 ms | 634 ms | 1,240 KB |
| Home, local deferred + cache | 55 | 1.5 s | 5.1 s | 1,526 ms | 64 ms | 651 KB |
| Product, production | 48 | 3.3 s | 5.1 s | 997 ms | 413 ms | 1,073 KB |
| Product, local deferred + cache | 51 | 1.3 s | 4.8 s | 2,684 ms | 723 ms | 1,168 KB |
Reading: home clearly better (first paint, transfer, TTFB). Product page: faster first paint but TBT worse and noisy (first run is a cache MISS that calls the Malaysian-latency API; same-machine CPU contention). **Not conclusive for product pages; repeat on a staging copy of the VPS before drawing conclusions.** Note production itself moved from the Batch 5 baseline (home 31, product 37) to 48 after the brand-list fix.
