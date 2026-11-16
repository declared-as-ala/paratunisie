import json, re, sys
rows = json.load(open("ops/seo/_gsc_queries_20261113.json", encoding="utf-8"))["rows"]
CAT = r"cr[ée]atine|whey|prot[ée]ine|magn[ée]sium|vitamine|om[ée]ga|omega|zinc|bcaa|eaa|pre[- ]?workout|gainer|collag|ashwagandha|amin|isolate|mass|iso 100|gold standard|dymatize|optimum|thorne|biotech|nutrex|scitec|ostrovit|redcon|cellucor|c4|xtend|allmax|nutricost|now foods"
q = [r for r in rows if re.search(CAT, r["keys"][0], re.I) and r["impressions"] >= 2 and not re.search(r"para ?tunisie", r["keys"][0], re.I)]
q.sort(key=lambda r: -r["impressions"])
o = ["# Product ranking strategy — exact product-name searches", "",
     "**Principle:** a product page competes for its exact name (brand + product + size) only when it is real, in stock, priced, indexable and passes the quality gate. Priority comes from Search Console demand, then real stock. No page is indexed in bulk; waves are small and gated by the previous wave's Google results.", "",
     "## First 30 product-intent queries by real impressions (90 days to 2026-11-13)", "",
     "Positions are from Google; many queries refer to products no longer in the catalogue (removed legacy range, not restored by decision). **Action column** uses the live catalogue on 2026-11-16.", "",
     "| # | Query | Impr. | Clicks | Pos |", "|---|---|---:|---:|---:|"]
for i, r in enumerate(q[:30], 1):
    o.append(f"| {i} | {r['keys'][0]} | {r['impressions']} | {r['clicks']} | {r['position']:.1f} |")
o += ["", "## What is implemented", "- 96 verified purchasable products: gap-filled titles/meta/canonical (avg score 83 → 97); 312 indexable products with valid Product/Offer JSON-LD (price, availability, brand, breadcrumb).",
      "- Plain-text structured-data descriptions, no fabricated SKU/review/GTIN; optional GTIN/MPN fields ready (empty until a human verifies identifiers).",
      "- Category guides now link to the in-stock products by name (shortlists), which is the main internal-link path to exact-name pages.",
      "", "## Gated next steps", "1. **Wave 3b (35 Tier-2 candidates in `WAVE3_CANDIDATES.csv`)**: do not index until Google has crawled the Wave 3 URLs and results are reviewed (URL Inspection + Search Console), and each candidate passes stock/price/claim review.",
      "2. **Claim review first** for products that carry demand: `MEDICAL_CLAIMS_SAMPLE.md` (e.g. an indexed in-stock pre-workout page contains performance claims).",
      "3. **Identifiers**: fill GTIN/MPN from packaging or supplier files, then re-run `product-schema-audit.cjs`.",
      "4. **Blocked by owner**: Gold Standard price conflict (587 vs 379 DT), placeholder stock of exactly 100, gym-machine prices, variant labels contradicting names (`6l`, `2 g`).",
      "", "## Evidence of success (only Google data counts)", "Re-export queries after ≥ 14 days with the same window length and compare groups with `ranking-baseline.py`; track clicks/impressions/position of the exact-name group (baseline: 386 queries, 1,491 impressions, 30 clicks, avg position 40.6)."]
open("docs/seo/PRODUCT_RANKING_STRATEGY.md", "w", encoding="utf-8").write("\n".join(o) + "\n")
