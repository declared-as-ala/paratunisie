"""Builds docs/seo/RANKING_BASELINE.md from a Search Console query export (rows: keys[0]=query, clicks, impressions, position).
Groups: brand, category w/o Tunisie, category with Tunisie, exact product/brand-product, other non-brand. Usage: python ranking-baseline.py <export.json> <label>"""
import json, re, sys
rows = json.load(open(sys.argv[1], encoding="utf-8"))["rows"]; label = sys.argv[2]
CAT = r"cr[ée]atine|whey|prot[ée]ine|magn[ée]sium|vitamine|om[ée]ga|omega|zinc|bcaa|eaa|pre[- ]?workout|gainer|collag|probiotique|ashwagandha|acides? amin|isolate|complément|complement|mass"
BRAND = re.compile(r"para ?tunisie|paratunisie|para tunisie", re.I)
def group(q):
    if BRAND.search(q): return "1. ParaTunisie brand"
    has_t = bool(re.search(r"tunisie|tunis|sfax|sousse", q))
    is_cat = bool(re.search(CAT, q))
    words = len(re.sub(r"\b(tunisie|prix|achat|acheter|pas cher|meilleur|meilleure|en)\b", "", q).split())
    if is_cat and words <= 3 and not re.search(r"\d", q): return "3. Category + Tunisie / price" if has_t or "prix" in q else "2. Category alone (no Tunisie)"
    if re.search(r"\d+\s?(g|kg|mg|ml|caps|gélules|tabs|comprim)|\b\d{2,}\b", q) or words >= 3: return "4. Exact product / brand + product / size"
    return "5. Other non-brand"
G = {}
for r in rows:
    q = r["keys"][0]; g = group(q)
    a = G.setdefault(g, dict(n=0, imp=0, clk=0, wpos=0.0, top10=0, q=[]))
    a["n"] += 1; a["imp"] += r["impressions"]; a["clk"] += r["clicks"]; a["wpos"] += r["position"] * r["impressions"]
    if r["position"] <= 10: a["top10"] += 1
    a["q"].append(r)
tot_i = sum(a["imp"] for a in G.values()); tot_c = sum(a["clk"] for a in G.values())
o = [f"# Ranking baseline — {label}", "", "Source: Search Console API (property `sc-domain:paratunisie.com`, web search, all countries), query export saved as `ops/seo/_gsc_queries_20261113.json`. Position = impression-weighted average; lower is better. Grouping is a regex classifier (screening aid, not Google data). **This is the 'before' reference: no improvement can be claimed until an equal period measured after Google recrawls shows one.**", "",
     f"Total: {len(rows)} queries, {tot_i} impressions, {tot_c} clicks, CTR {tot_c/tot_i*100:.2f}%.", "",
     "| Group | Queries | Impressions | Clicks | CTR | Avg position | Queries ≤ pos 10 |", "|---|---:|---:|---:|---:|---:|---:|"]
for g in sorted(G):
    a = G[g]; o.append(f"| {g} | {a['n']} | {a['imp']} | {a['clk']} | {a['clk']/a['imp']*100:.1f}% | {a['wpos']/a['imp']:.1f} | {a['top10']} |")
o += ["", "## Opportunities: positions 4–20 with ≥ 3 impressions (non-brand)", "", "| Query | Impr. | Clicks | Pos |", "|---|---:|---:|---:|"]
opp = [r for r in rows if 4 <= r["position"] <= 20 and r["impressions"] >= 3 and not BRAND.search(r["keys"][0])]
for r in sorted(opp, key=lambda r: -r["impressions"])[:25]:
    o.append(f"| {r['keys'][0]} | {r['impressions']} | {r['clicks']} | {r['position']:.1f} |")
o += ["", "## High impressions, low CTR (≥ 20 impressions, CTR < 2%)", "", "| Query | Impr. | Clicks | Pos |", "|---|---:|---:|---:|"]
low = [r for r in rows if r["impressions"] >= 20 and r["clicks"] / r["impressions"] < 0.02]
for r in sorted(low, key=lambda r: -r["impressions"])[:20]:
    o.append(f"| {r['keys'][0]} | {r['impressions']} | {r['clicks']} | {r['position']:.1f} |")
o += ["", "## How to re-measure", "Run the same export for an equal-length window ≥ 14 days after the last deploy (2026-11-16), then compare group by group: `python ops/seo/ranking-baseline.py <new export> <label>`. Report only differences visible in Google data."]
open("docs/seo/RANKING_BASELINE.md", "w", encoding="utf-8").write("\n".join(o) + "\n")
print(len(rows), tot_i, tot_c)
for g in sorted(G): print(g, G[g]["n"], G[g]["imp"], G[g]["clk"])
