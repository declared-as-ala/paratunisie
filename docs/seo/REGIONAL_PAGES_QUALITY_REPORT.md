# Regional landing pages — page-level quality report (48 URLs)

Audit of 2026-11-22 on commit `ffe9fb2` + follow-up. **Keyword columns are hypotheses (typical search phrasings), not Search Console data: the connector was unavailable and no search volume, position or click is claimed.**

## Evidence gathered

| Test | Result |
|---|---|
| Text identical across ≥ 20 of the 24 governorate pages of a cluster, after masking governorate and town names | **93 % (protéine), 98 % (parapharmacie)** of text lines |
| Jaccard similarity of Sousse vs Kébili (names masked) | **0.90** |
| Real regional order data available to differentiate pages | **15 orders in total, across 9 governorates, maximum 4 in one governorate**: not usable (statistically meaningless and potentially identifying) |
| Region-specific operational facts available (stores, warehouses, courier tiers, fees, timings) | **None**: fee (7 DT), payment (cash on delivery) and timing wording are identical for every governorate; ParaTunisie has no physical presence |
| Overlap with existing pages | The product grid, categories, brands and buying advice repeat the existing `/whey-proteine`, `/creatine`, `/vitamines`, `/magnesium` pages and the homepage |

## Decision

Genuine regional differentiation is **not** available from verified data. Titles, descriptions and H1 are unique (48/48), but that is not sufficient: the useful content is the same everywhere. Indexing 48 near-identical pages would create doorway pages and dilute the strong category pages (cannibalisation), so **the pilot stays at 6 indexable pages (Tunis, Sousse, Sfax × 2) and 42 pages remain `noindex, follow`, out of the sitemap**. This is a quality decision, not a technical limit: the framework can index any page by editing `INDEXED_PILOT` in `src/lib/local/governorates.ts`.

## What would justify indexing a page (any one is enough, with evidence)

1. Search Console shows impressions/clicks for that governorate's query on a pilot page, i.e. proven local demand.
2. Verified region-specific facts: a different delivery fee/time confirmed by the business, a local pickup point, a courier partner, or a local event/partnership.
3. ≥ 30 real orders for that governorate (privacy-safe aggregate) allowing honest 'most ordered here' content.
4. Genuine local-intent content that is not a template (e.g. a verified local partner, gym or pharmacy collaboration).

## Per-page status

| Cluster | URL | Target keyword hypothesis | Region | Indexable now | Reason |
|---|---|---|---|---|---|
| parapharmacie | /parapharmacie/tunis | parapharmacie tunis | Grand Tunis | **yes** | Pilot: largest market, used to measure real demand |
| parapharmacie | /parapharmacie/ariana | parapharmacie ariana | Grand Tunis | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/ben-arous | parapharmacie ben arous | Grand Tunis | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/manouba | parapharmacie manouba | Grand Tunis | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/nabeul | parapharmacie nabeul | Nord-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/zaghouan | parapharmacie zaghouan | Nord-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/bizerte | parapharmacie bizerte | Nord-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/beja | parapharmacie béja | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/jendouba | parapharmacie jendouba | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/le-kef | parapharmacie le kef | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/siliana | parapharmacie siliana | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/sousse | parapharmacie sousse | Centre-Est | **yes** | Pilot: largest market, used to measure real demand |
| parapharmacie | /parapharmacie/monastir | parapharmacie monastir | Centre-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/mahdia | parapharmacie mahdia | Centre-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/sfax | parapharmacie sfax | Centre-Est | **yes** | Pilot: largest market, used to measure real demand |
| parapharmacie | /parapharmacie/kairouan | parapharmacie kairouan | Centre-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/kasserine | parapharmacie kasserine | Centre-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/sidi-bouzid | parapharmacie sidi bouzid | Centre-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/gabes | parapharmacie gabès | Sud-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/medenine | parapharmacie médenine | Sud-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/tataouine | parapharmacie tataouine | Sud-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/gafsa | parapharmacie gafsa | Sud-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/tozeur | parapharmacie tozeur | Sud-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| parapharmacie | /parapharmacie/kebili | parapharmacie kébili | Sud-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/tunis | protéine tunis / whey tunis / créatine tunis | Grand Tunis | **yes** | Pilot: largest market, used to measure real demand |
| proteine | /proteine/ariana | protéine ariana / whey ariana / créatine ariana | Grand Tunis | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/ben-arous | protéine ben arous / whey ben arous / créatine ben arous | Grand Tunis | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/manouba | protéine manouba / whey manouba / créatine manouba | Grand Tunis | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/nabeul | protéine nabeul / whey nabeul / créatine nabeul | Nord-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/zaghouan | protéine zaghouan / whey zaghouan / créatine zaghouan | Nord-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/bizerte | protéine bizerte / whey bizerte / créatine bizerte | Nord-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/beja | protéine béja / whey béja / créatine béja | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/jendouba | protéine jendouba / whey jendouba / créatine jendouba | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/le-kef | protéine le kef / whey le kef / créatine le kef | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/siliana | protéine siliana / whey siliana / créatine siliana | Nord-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/sousse | protéine sousse / whey sousse / créatine sousse | Centre-Est | **yes** | Pilot: largest market, used to measure real demand |
| proteine | /proteine/monastir | protéine monastir / whey monastir / créatine monastir | Centre-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/mahdia | protéine mahdia / whey mahdia / créatine mahdia | Centre-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/sfax | protéine sfax / whey sfax / créatine sfax | Centre-Est | **yes** | Pilot: largest market, used to measure real demand |
| proteine | /proteine/kairouan | protéine kairouan / whey kairouan / créatine kairouan | Centre-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/kasserine | protéine kasserine / whey kasserine / créatine kasserine | Centre-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/sidi-bouzid | protéine sidi bouzid / whey sidi bouzid / créatine sidi bouzid | Centre-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/gabes | protéine gabès / whey gabès / créatine gabès | Sud-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/medenine | protéine médenine / whey médenine / créatine médenine | Sud-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/tataouine | protéine tataouine / whey tataouine / créatine tataouine | Sud-Est | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/gafsa | protéine gafsa / whey gafsa / créatine gafsa | Sud-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/tozeur | protéine tozeur / whey tozeur / créatine tozeur | Sud-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |
| proteine | /proteine/kebili | protéine kébili / whey kébili / créatine kébili | Sud-Ouest | no (noindex,follow) | Template-level duplicate of the pilot pages; no verified local fact or demand data yet |

## Improvements delivered in this pass

- **Directories** `/parapharmacie` and `/proteine` rebuilt for shoppers: how to order in 3 steps, live in-stock rayons, delivery terms, and governorates grouped by region (7 regions). Still `noindex` until the pilot is measured.
- **Application cache** (2 min, shared by the 24 pages of a cluster) for catalogue data: the 8 category + product API calls per page are now made once per cluster per 2 minutes. Cart/checkout/prices at order time remain validated server-side; displayed stock can lag by at most 2 minutes.
- Unique metadata on 48/48 pages, correct self-canonicals, BreadcrumbList + ItemList JSON-LD, 404 for unknown governorates, 6 URLs in the sitemap (only while the live catalogue passes the quality gate).

## Performance: root cause of the 1.4–2.5 s TTFB

| Measurement | Value |
|---|---|
| Origin render time on the server (localhost:3010) for a regional page | **0.24–0.31 s** (creatine category 0.17 s, robots.txt 0.01 s) |
| API calls behind it (categories, products) | 6–28 ms each |
| TCP connect time from the test machine to the VPS | **0.25 s** (round-trip latency before any TLS or HTTP) |
| Observed TTFB / total from the test machine | 1.0–2.5 s / 1.7–20 s (high variance) |

Conclusion: the application itself answers in ≈ 0.25 s; the rest is **network distance to the Kuala Lumpur VPS** (about 0.25 s per round trip, ×4–6 for TCP+TLS+HTTP, plus slow transfer of a 230 KB document). This is an infrastructure matter (hosting location / CDN), explicitly outside the authorised scope, so it was not changed. Application-level levers still possible: reduce HTML size (the shared header/menu markup is ~200 KB of each page) in a dedicated pass.

## Delivery inconsistency (needs the owner's decision — nothing changed)

- `/livraison` says: free above 99 DT, otherwise 7 DT; 24 h for Grand Tunis, 24–48 h elsewhere.
- `/aide`, the API and **the checkout** charge a flat 7 DT with no threshold (`apps/api/src/common/tunisia.ts`).
- Regional pages state only what checkout really does (7 DT, cash on delivery, 24–48 h) and make no free-shipping promise.
- Question for the owner: which rule is authoritative? If 'free above 99 DT' is true, checkout must change; if not, `/livraison` must be corrected.

## Not done in this pass (honest list)

- Mobile browser tests at 320/375/390/768/1440 px: the Chrome extension was not connected, so no real-device rendering was verified. Components use the existing responsive grid (2 columns on mobile, 44 px touch targets) but this is unverified.
- Search Console keyword research and monitoring: connector unavailable.
- Lint and production build run locally: the local disk is full (100 %), so only `tsc` and unit tests ran locally; the production build ran on the server.

## Search Console monitoring plan (after the pilot has been crawled)

Weekly export, filter pages matching `/parapharmacie/` and `/proteine/`; track impressions, clicks, CTR, position per URL and per query for 30, 60, 90 days. Promote a governorate to indexable only when criteria 1–4 above are met. Compare against `RANKING_BASELINE.md` (no regional pages existed before 2026-11-22).
