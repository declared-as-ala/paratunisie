# Product ranking strategy — exact product-name searches

**Principle:** a product page competes for its exact name (brand + product + size) only when it is real, in stock, priced, indexable and passes the quality gate. Priority comes from Search Console demand, then real stock. No page is indexed in bulk; waves are small and gated by the previous wave's Google results.

## First 30 product-intent queries by real impressions (90 days to 2026-11-13)

Positions are from Google; many queries refer to products no longer in the catalogue (removed legacy range, not restored by decision). **Action column** uses the live catalogue on 2026-11-16.

| # | Query | Impr. | Clicks | Pos |
|---|---|---:|---:|---:|
| 1 | whey tunisie | 101 | 0 | 77.0 |
| 2 | proteine anabolic tunisie | 99 | 0 | 63.0 |
| 3 | omega 3 | 49 | 0 | 67.8 |
| 4 | protéine tunisie | 32 | 0 | 69.7 |
| 5 | whey protein tunisie | 32 | 0 | 58.4 |
| 6 | psychotic pre workout | 30 | 1 | 37.1 |
| 7 | whey protein | 26 | 0 | 70.5 |
| 8 | magnésium tunisie | 24 | 0 | 84.4 |
| 9 | proteine tunisie | 22 | 0 | 63.6 |
| 10 | gold standard whey tunisie | 19 | 0 | 37.9 |
| 11 | omega 3 biotech | 19 | 0 | 71.1 |
| 12 | proteine whey | 19 | 0 | 78.4 |
| 13 | levro legendary mass | 18 | 0 | 56.8 |
| 14 | ashwagandha tunisie | 16 | 1 | 89.6 |
| 15 | creatine | 15 | 0 | 92.0 |
| 16 | creatine monohydrate prix tunisie | 15 | 0 | 82.1 |
| 17 | creatine monohydrate tunisie | 15 | 0 | 88.5 |
| 18 | real mass | 14 | 0 | 57.6 |
| 19 | aminofer | 13 | 0 | 67.8 |
| 20 | whey protein prix tunisie | 13 | 0 | 47.3 |
| 21 | creatine monohydrate | 12 | 0 | 97.3 |
| 22 | magnésium | 11 | 0 | 88.6 |
| 23 | whey gold standard | 11 | 0 | 72.1 |
| 24 | whey gold standard prix tunisie | 11 | 0 | 33.1 |
| 25 | whey gold standard tunisie | 11 | 0 | 38.6 |
| 26 | glycinate de magnésium tunisie | 10 | 0 | 91.8 |
| 27 | vitamines tunisie | 10 | 0 | 61.5 |
| 28 | now foods tunisie | 9 | 4 | 15.1 |
| 29 | creatine optimum nutrition tunisie | 9 | 0 | 37.3 |
| 30 | iso whey zero prix tunisie | 9 | 0 | 44.8 |

## What is implemented
- 96 verified purchasable products: gap-filled titles/meta/canonical (avg score 83 → 97); 312 indexable products with valid Product/Offer JSON-LD (price, availability, brand, breadcrumb).
- Plain-text structured-data descriptions, no fabricated SKU/review/GTIN; optional GTIN/MPN fields ready (empty until a human verifies identifiers).
- Category guides now link to the in-stock products by name (shortlists), which is the main internal-link path to exact-name pages.

## Gated next steps
1. **Wave 3b (35 Tier-2 candidates in `WAVE3_CANDIDATES.csv`)**: do not index until Google has crawled the Wave 3 URLs and results are reviewed (URL Inspection + Search Console), and each candidate passes stock/price/claim review.
2. **Claim review first** for products that carry demand: `MEDICAL_CLAIMS_SAMPLE.md` (e.g. an indexed in-stock pre-workout page contains performance claims).
3. **Identifiers**: fill GTIN/MPN from packaging or supplier files, then re-run `product-schema-audit.cjs`.
4. **Blocked by owner**: Gold Standard price conflict (587 vs 379 DT), placeholder stock of exactly 100, gym-machine prices, variant labels contradicting names (`6l`, `2 g`).

## Evidence of success (only Google data counts)
Re-export queries after ≥ 14 days with the same window length and compare groups with `ranking-baseline.py`; track clicks/impressions/position of the exact-name group (baseline: 386 queries, 1,491 impressions, 30 clicks, avg position 40.6).
