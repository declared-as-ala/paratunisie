"""Search Console opportunity analysis (read-only, real data).

usage: python ops/seo/gsc_opportunities.py [days]
Writes docs/seo/GSC_OPPORTUNITIES.json and prints a summary.
"""
import json
import os
import re
import subprocess
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
KEY = os.environ.get("GSC_KEY", os.path.expanduser("~/.claude/secrets/gsc-credentials.json"))
DAYS = sys.argv[1] if len(sys.argv) > 1 else "90"


def gsc(dim):
    out = subprocess.run(
        ["node", os.path.join(HERE, "gsc-query.cjs"), KEY, "perf", dim, DAYS],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        env={**os.environ, "ROWS": "25000"},
    ).stdout
    return [json.loads(l) for l in out.splitlines() if l.startswith("{")]


rows = gsc("page,query")
norm = lambda u: re.sub(r"https://(www\.)?paratunisie\.com", "", u) or "/"
BRAND = re.compile(r"paratunisie|paratunisia|para tunisie", re.I)

# aggregate by query
q = defaultdict(lambda: {"clicks": 0, "imp": 0, "pos_w": 0.0, "pages": defaultdict(lambda: [0, 0])})
for r in rows:
    page, query = norm(r["k"][0]), r["k"][1]
    a = q[query]
    a["clicks"] += r["clicks"]
    a["imp"] += r["impressions"]
    a["pos_w"] += r["pos"] * r["impressions"]
    a["pages"][page][0] += r["clicks"]
    a["pages"][page][1] += r["impressions"]

queries = []
for k, a in q.items():
    queries.append({
        "query": k, "clicks": a["clicks"], "impressions": a["imp"],
        "ctr": round(100 * a["clicks"] / a["imp"], 2) if a["imp"] else 0,
        "position": round(a["pos_w"] / a["imp"], 1) if a["imp"] else 0,
        "pages": sorted(((p, c, i) for p, (c, i) in a["pages"].items()), key=lambda x: -x[2]),
        "brand": bool(BRAND.search(k)),
    })

nonbrand = [x for x in queries if not x["brand"]]
striking = sorted([x for x in nonbrand if 4 <= x["position"] <= 20 and x["impressions"] >= 5], key=lambda x: -x["impressions"])
lowctr = sorted([x for x in nonbrand if x["impressions"] >= 15 and x["ctr"] < 2.0 and x["position"] <= 12], key=lambda x: -x["impressions"])
cannibal = sorted([x for x in nonbrand if len(x["pages"]) > 1 and x["impressions"] >= 10], key=lambda x: -x["impressions"])

pages = defaultdict(lambda: {"clicks": 0, "imp": 0, "pos_w": 0.0})
for r in rows:
    p = norm(r["k"][0])
    pages[p]["clicks"] += r["clicks"]; pages[p]["imp"] += r["impressions"]; pages[p]["pos_w"] += r["pos"] * r["impressions"]
page_list = [{"page": p, "clicks": v["clicks"], "impressions": v["imp"], "ctr": round(100 * v["clicks"] / v["imp"], 2) if v["imp"] else 0, "position": round(v["pos_w"] / v["imp"], 1) if v["imp"] else 0} for p, v in pages.items()]
page_lowctr = sorted([x for x in page_list if x["impressions"] >= 40 and x["ctr"] < 1.5 and x["page"] != "/"], key=lambda x: -x["impressions"])

out = {
    "window_days": int(DAYS),
    "totals": {"queries": len(queries), "nonbrand_queries": len(nonbrand), "pages": len(page_list)},
    "striking_distance_4_20": striking[:60],
    "high_impr_low_ctr_queries": lowctr[:40],
    "cannibalization": cannibal[:30],
    "pages_low_ctr": page_lowctr[:40],
    "top_nonbrand": sorted(nonbrand, key=lambda x: -x["impressions"])[:60],
}
dest = os.path.join(HERE, "..", "..", "docs", "seo", "GSC_OPPORTUNITIES.json")
json.dump(out, open(dest, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(out["totals"]))
print("striking 4-20:", len(striking), "| low-ctr:", len(lowctr), "| cannibal:", len(cannibal), "| pages low ctr:", len(page_lowctr))
for x in striking[:18]:
    print(f'  pos {x["position"]:>5} imp {x["impressions"]:>4} clk {x["clicks"]:>2} | {x["query"]} -> {x["pages"][0][0][:60]}')
print("-- top non-brand by impressions")
for x in out["top_nonbrand"][:20]:
    print(f'  imp {x["impressions"]:>4} clk {x["clicks"]:>2} pos {x["position"]:>5} | {x["query"]}')
