# Master Keyword → Search Intent → Page Ownership Map
**ParaTunisie — SEO Growth Sprint #2, updated with real Search Console data**

**Update 2026-10-14:** The "Current Position" column below was built in September 2026 before Google Search Console was connected, using "Tracking" placeholders. GSC is now live (via the `gsc` MCP server). This file has been updated with **real position/impressions/clicks** for the last 28 days (2026-09-15 to 2026-10-10) wherever the exact query string appears in that window's data (473 distinct queries pulled — a row showing "No GSC signal" means that exact phrase had **zero** impressions in the full pull, not a sampling gap). Semrush Volume/KD columns are unchanged third-party estimates from September and were not re-verified this session (no paid keyword-volume API was used, per instruction). See `SEO_AUDIT.md` §0 for the full analysis — in short: **every head term in this map is currently ranking position 25-100+ with zero clicks.** The only real organic traffic (55 clicks/28d site-wide) is 53% brand-navigational (`paratunisie`) plus an unrelated long tail of parapharmacy product names.

| Keyword | Intent | Semrush Volume | KD (%) | Real Position (GSC, 28d to 2026-10-10) | Real Impr/Clicks (28d) | Target URL | Priority | Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `parapharmacie tunisie` | Commercial | 3,600 | 43% | **97.1** | 11 / 0 | `/` | P0 | Not competitive at all. Needs authority (AUTHORITY_ROADMAP.md), not on-page tweaks. |
| `parapharmacie en ligne tunisie` | Commercial | 720 | 39% | No GSC signal | 0 / 0 | `/` | P0 | Zero impressions — not being shown for this query at all. |
| `whey protein tunisie` | Commercial | 1,200 | 6% | **54.9** | 8 / 0 | `/whey-proteine` | P0 | Improved from Sept's #55 claim — but still page 6, zero clicks. |
| `whey tunisie` | Commercial | 590 | 5% | **73.0** | 21 / 0 | `/whey-proteine` | P0 | Worst of the whey variants despite highest impressions — investigate why. |
| `whey protein prix tunisie` | Commercial | 480 | 7% | No GSC signal | 0 / 0 | `/whey-proteine` | P0 | |
| `whey isolate tunisie` | Commercial | 320 | 5% | **73.0** | 1 / 0 | `/whey-proteine` | P1 | |
| `proteine tunisie` | Commercial | 880 | 8% | No GSC signal (exact phrase) | — | `/whey-proteine` | P0 | `proteine whey` (impr 10, pos 77.8) is the closest real variant found. |
| `proteine prix tunisie` | Commercial | 390 | 6% | No GSC signal | 0 / 0 | `/whey-proteine` | P0 | |
| `creatine monohydrate tunisie` | Commercial | 390 | 4% | **89.4** | 5 / 0 | `/creatine` | P0 | |
| `creatine monohydrate prix tunisie`| Commercial | 210 | 4% | No GSC signal | 0 / 0 | `/creatine` | P0 | |
| `creatine tunisie` | Commercial | 480 | 5% | **93.0** | 2 / 0 | `/creatine` | P0 | |
| `creatine prix tunisie` | Commercial | 260 | 4% | No GSC signal | 0 / 0 | `/creatine` | P0 | |
| `pre workout tunisie` | Commercial | 320 | 4% | **26.5** | 2 / 0 | `/pre-workout` | P0 | Best-positioned head term in the whole map — still not page 1. |
| `nutrition sportive tunisie` | Commercial Hub | 480 | 12% | **66.9** | 17 / 0 | `/nutrition-sportive` | P1 | |
| `complements alimentaires tunisie` | Commercial Hub | 590 | 14% | No GSC signal (exact phrase) | — | `/complements-alimentaires` | P1 | `complément alimentaires tunisie` (impr 20, pos 62.8) and `complément alimentaire tunisie` (impr 18, pos 66.7) are the real variants found — both ~page 7. |
| `ashwagandha tunisie` | Commercial | 260 | 5% | **91.5** | 4 / 0 | `/ashwagandha` | P1 | |
| `ashwagandha prix tunisie` | Commercial | 140 | 4% | No GSC signal | 0 / 0 | `/ashwagandha` | P1 | |
| `omega 3 tunisie` | Commercial | 320 | 6% | **97.0** | 1 / 0 | `/omega-3` | P1 | |
| `omega 3 prix tunisie` | Commercial | 170 | 5% | No GSC signal | 0 / 0 | `/omega-3` | P1 | |
| `magnesium tunisie` | Commercial | 390 | 7% | **74.3** | 3 / 0 | `/magnesium` | P1 | |
| `magnesium prix tunisie` | Commercial | 210 | 5% | No GSC signal | 0 / 0 | `/magnesium` | P1 | |
| `magnesium bisglycinate tunisie` | Commercial | 170 | 4% | No GSC signal | 0 / 0 | `/magnesium` | P1 | |
| `vitamine d3 prix tunisie` | Commercial | 390 | 9% | No GSC signal | 0 / 0 | `/vitamines` | P1 | |
| `l-carnitine tunisie` *(new — missing from original map)* | Commercial | Unverified | — | No GSC signal (not yet crawled) | 0 / 0 | `/l-carnitine` | **P0 (newly flagged)** | **Page is `noindex` and absent from the sitemap — GSC confirms "URL is unknown to Google." See SEO_AUDIT.md §2.1. Highest-leverage single fix in this map: the page is fully built, just invisible.** |
| `acetyl l carnitine tunisie` | Commercial | Unverified | — | **24.5** | 2 / 2 (100% CTR) | `/l-carnitine` or a product PDP | P1 | Only cluster keyword with real clicks — currently likely landing on a product page, not the category. Verify once category is indexed. |
| `gold standard whey tunisie` | Transactional | 140 | 3% | No GSC signal | 0 / 0 | `/produits/100-whey-gold-standard-2-27kg-optimum-nutrition` | P1 | |
| `creatine optimum nutrition tunisie`| Transactional | 110 | 2% | **32.0** | 4 / 0 | `/produits/micronized-creatine-powder-317g-optimum-nutrition` | P1 | |
| `optimum nutrition tunisie` | Brand Intent | 210 | 6% | No GSC signal | 0 / 0 | `/marques/optimum-nutrition` | P1 | |

### Informational/guide-cluster keywords
The September map listed ~20 informational `/conseils/*` guide-cluster keywords (whey timing/dosage, creatine myths, ashwagandha cortisol, omega-3 forms, magnesium types, etc.). **None of these exact phrases appeared in the real 28-day GSC query pull** (473 distinct queries, zero overlap with the informational list). This doesn't mean the guides are wrong — it means they currently have no measurable search visibility at all. Not re-tabulated row-by-row here to avoid implying false precision; treat the entire informational cluster as "no GSC signal yet" pending re-check after the technical/indexing fixes in `SEO_AUDIT.md` ship and more time passes.

### What actually has real clicks right now (for contrast)
Per `SEO_AUDIT.md` §0: the brand term `paratunisie` (29 clicks, position 3.3) and a long tail of ~40 specific OTC/parapharmacy product names (not in this map's scope) are the only real traffic sources site-wide. This map's clusters are pre-revenue from an organic-search standpoint as of this update.
