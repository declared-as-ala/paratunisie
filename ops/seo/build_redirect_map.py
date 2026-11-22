"""Builds docs/seo/REDIRECT_MAP.csv from the Search Console 404 audit + current-catalogue matching.

Input : redirect-match.json (produced read-only on the server by the matcher), env MATCH=<path>
Output: docs/seo/REDIRECT_MAP.csv
Rule  : redirect only exact equivalents (same product) or an exact product-type category. Everything else stays 404.
"""
import csv
import json
import os
import re

m = json.load(open(os.environ["MATCH"], encoding="utf-8"))

EXACT = {
    "/probiotiques/now-foods-probiotic-10-30-gelules-vegetales": "/produits/now-foods-probiotic-10-30-gelules-vegetales",
    "/magnesium/thorne-magnesium-glycinate-180-gelules": "/produits/thorne-magnesium-glycinate-180-gelules",
    "/magnesium/micro-ingredients-mag-duo-advanced-magnesium-formula-lemonade-180-g": "/produits/micro-ingredients-mag-duo-advanced-magnesium-formula-lemonade-180-g",
    "/articulations/dr-kellyann-bone-broth-fast-track-turmeric-ginger-21-g": "/produits/dr-kellyann-bone-broth-fast-track-turmeric-ginger-21-g",
}
CATEGORY = {
    "/produits/young-health-omega-3-boite-90-capsules": ("/omega-3", "omega-3 supplement; same product type as the indexable omega-3 category"),
    "/produits/calmag-calcium-magnesium-b30": ("/magnesium", "calcium-magnesium supplement; same product type as the indexable magnesium category"),
    "/produits/apederm-seamag-magnesium-marin-60-gelules": ("/magnesium", "magnesium supplement; same product type as the indexable magnesium category"),
}


def intent(r):
    qs = [q[0] for q in r["queries"][:2]]
    if qs:
        return "; ".join(qs)
    return "no query data (very low volume)"


rows = []
for r in m:
    p = r["path"]
    if p in EXACT:
        action, dest, reason = "301", EXACT[p], "Exact same product exists in the current catalogue (old category-style URL)."
        equiv = EXACT[p]
    elif p in CATEGORY:
        dest, reason = CATEGORY[p]
        action, equiv = "301 (category)", "none (type-level match only)"
    elif r["type"] == "brand":
        action, dest, equiv = "KEEP_404", "", "none"
        reason = "Brand not present in the current catalogue; a redirect to /marques would be arbitrary."
    elif r["type"] == "product":
        action, dest, equiv = "KEEP_404", "", "none"
        reason = "No exact or genuinely equivalent product in the current catalogue (old dermo-pharmacy or other range)."
    else:
        action, dest, equiv = "KEEP_404", "", "none"
        reason = "Legacy URL pattern without a verified equivalent."
    rows.append([p, r["clicks"], r["imp"], intent(r), equiv, action, dest, reason])

rows.sort(key=lambda x: (-x[1], -x[2]))
out = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "seo", "REDIRECT_MAP.csv")
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["Old URL", "Historical Clicks (90d)", "Historical Impressions", "Search Intent (top queries)", "Current Equivalent", "Proposed Action", "Destination", "Reason"])
    w.writerows(rows)
n301 = sum(1 for x in rows if x[5].startswith("301"))
print("rows", len(rows), "| 301:", n301, "| 301 clicks:", sum(x[1] for x in rows if x[5].startswith("301")), "| keep 404:", len(rows) - n301)
