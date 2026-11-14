"""Weekly SEO report from real Search Console data (read-only).

usage:  python ops/seo/weekly_report.py [window_days=28]
env:    GSC_KEY  path to the service-account JSON (default ~/.claude/secrets/gsc-credentials.json)
        SKIP_REGRESSION=1 to skip the live regression suite
Compares the latest window with the immediately preceding window of the SAME length (Search Console data lags ~2 days,
so the latest window ends 2 days ago). Writes docs/seo/reports/YYYY-MM-DD.md. Nothing is estimated or invented:
a metric that cannot be read is printed as UNKNOWN.
"""
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from datetime import date, timedelta
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
KEY = os.environ.get("GSC_KEY", os.path.expanduser("~/.claude/secrets/gsc-credentials.json"))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 28
SITE = "https://paratunisie.com"
WATCH = ["/", "/whey-isolate", "/eaa", "/acides-amines", "/vitamines", "/magnesium", "/omega-3", "/zinc",
         "/produits/carbo-one-1-kg", "/produits/thorne-magnesium-glycinate-180-gelules"]

end = date.today() - timedelta(days=2)
cur_start = end - timedelta(days=N - 1)
prev_end = cur_start - timedelta(days=1)
prev_start = prev_end - timedelta(days=N - 1)


def node(*args, env=None):
    return subprocess.run(["node", os.path.join(HERE, "gsc-query.cjs"), KEY, *args], capture_output=True, text=True,
                          encoding="utf-8", errors="replace", env={**os.environ, **(env or {})}).stdout


def perf(dim, start, stop, rows=25000):
    out = node("perf", dim, "90", env={"ROWS": str(rows), "START": start.isoformat(), "END": stop.isoformat()})
    return [json.loads(l) for l in out.splitlines() if l.startswith("{")]


def totals(start, stop):
    r = perf("none", start, stop, 1)
    if not r:
        return None
    x = r[0]
    # gsc-query.cjs prints ctr as a percentage already; derive a fraction from raw counts instead.
    return {"clicks": x["clicks"], "impressions": x["impressions"], "ctr": (x["clicks"] / x["impressions"]) if x["impressions"] else 0.0, "position": x["pos"]}


def pct(a, b):
    return "n/a" if not b else f"{(a - b) / b * 100:+.0f}%"


def norm(u):
    return re.sub(r"https?://(www\.)?paratunisie\.com", "", u) or "/"


def status(url):
    r = subprocess.run(["curl", "-s", "-o", "-", "-m", "20", "-w", "\n__C__%{http_code}", SITE + url], capture_output=True,
                       text=True, encoding="utf-8", errors="replace").stdout
    body, _, code = r.rpartition("\n__C__")
    m = re.search(r'name="robots" content="([^"]*)"', body)
    return code.strip(), (m.group(1) if m else "")


lines = [f"# SEO weekly report — {date.today().isoformat()}",
         f"Window: **{cur_start} → {end}** vs previous **{prev_start} → {prev_end}** ({N} days each). Source: Search Console API (real data).", ""]

cur, prev = totals(cur_start, end), totals(prev_start, prev_end)
lines += ["## 1. Totals", "| Metric | Current | Previous | Change |", "|---|---|---|---|"]
if cur and prev:
    lines += [f"| Clicks | {cur['clicks']:.0f} | {prev['clicks']:.0f} | {pct(cur['clicks'], prev['clicks'])} |",
              f"| Impressions | {cur['impressions']:.0f} | {prev['impressions']:.0f} | {pct(cur['impressions'], prev['impressions'])} |",
              f"| CTR | {cur['ctr']*100:.2f}% | {prev['ctr']*100:.2f}% | {(cur['ctr']-prev['ctr'])*100:+.2f} pt |",
              f"| Avg position | {cur['position']:.1f} | {prev['position']:.1f} | {cur['position']-prev['position']:+.1f} |"]
else:
    lines.append("| UNKNOWN | could not read Search Console | | |")

cp, pp = perf("page", cur_start, end), perf("page", prev_start, prev_end)
cpm = {norm(r["k"][0]): r for r in cp}
ppm = {norm(r["k"][0]): r for r in pp}

# categories / sections
def section(path):
    if path == "/":
        return "home"
    seg = path.strip("/").split("/")[0]
    return {"produits": "products", "conseils": "guides", "marques": "brands"}.get(seg, f"category:{seg}")

sec = defaultdict(lambda: [0, 0, 0, 0])
for p, r in cpm.items():
    s = sec[section(p)]; s[0] += r["clicks"]; s[1] += r["impressions"]
for p, r in ppm.items():
    s = sec[section(p)]; s[2] += r["clicks"]; s[3] += r["impressions"]
lines += ["", "## 2. Sections (clicks / impressions, current vs previous)", "| Section | Clicks | Prev | Impr | Prev |", "|---|---|---|---|---|"]
for k, v in sorted(sec.items(), key=lambda kv: -(kv[1][1] + kv[1][3]))[:20]:
    lines.append(f"| {k} | {v[0]:.0f} | {v[2]:.0f} | {v[1]:.0f} | {v[3]:.0f} |")

# gainers / losers
delta = []
for p in set(cpm) | set(ppm):
    a, b = cpm.get(p, {"clicks": 0})["clicks"], ppm.get(p, {"clicks": 0})["clicks"]
    delta.append((a - b, p, a, b))
delta.sort()
lines += ["", "## 3. Biggest click changes (pages)", "| Page | Current | Previous | Δ |", "|---|---|---|---|"]
for d, p, a, b in (delta[-6:][::-1] + delta[:6]):
    if d:
        lines.append(f"| `{p[:70]}` | {a:.0f} | {b:.0f} | {d:+.0f} |")

# 404 / non-indexable traffic loss among last window's top pages
top_prev = sorted(ppm.items(), key=lambda kv: -kv[1]["clicks"])[:60]
with ThreadPoolExecutor(8) as ex:
    res = list(ex.map(lambda kv: (kv[0], kv[1]["clicks"], *status(kv[0])), top_prev))
bad = [(p, c, code, rb) for p, c, code, rb in res if code != "200" or "noindex" in rb]
lines += ["", f"## 4. Traffic-loss check (top {len(res)} pages of the previous window)",
          f"Pages now not 200 or noindex: **{len(bad)}** carrying {sum(c for _, c, _, _ in bad):.0f} of {sum(c for _, c, _, _ in res):.0f} previous clicks."]
for p, c, code, rb in sorted(bad, key=lambda x: -x[1])[:10]:
    lines.append(f"- `{p[:70]}` — {c:.0f} clicks — HTTP {code} {rb}")

# opportunities
qrows = perf("query", cur_start, end)
brand = re.compile(r"paratunis", re.I)
strike = sorted([r for r in qrows if not brand.search(r["k"][0]) and 4 <= r["pos"] <= 20 and r["impressions"] >= 5], key=lambda r: -r["impressions"])[:10]
lines += ["", "## 5. Keywords in positions 4–20 (non-brand, ≥5 impressions)", "| Query | Impr | Clicks | Pos |", "|---|---|---|---|"]
lines += [f"| {r['k'][0][:60]} | {r['impressions']:.0f} | {r['clicks']:.0f} | {r['pos']:.1f} |" for r in strike] or ["| none | | | |"]
lowctr = sorted([r for r in cp if r["impressions"] >= 40 and r["ctr"] < 1.5 and norm(r["k"][0]) != "/"], key=lambda r: -r["impressions"])[:8]
lines += ["", "## 6. Pages with ≥40 impressions and CTR < 1.5%", "| Page | Impr | CTR | Pos |", "|---|---|---|---|"]
lines += [f"| `{norm(r['k'][0])[:60]}` | {r['impressions']:.0f} | {r['ctr']:.1f}% | {r['pos']:.1f} |" for r in lowctr] or ["| none | | | |"]

# sitemap + inspection (indexed vs merely indexable)
sm = node("sitemaps").strip().splitlines()
lines += ["", "## 7. Sitemap status (Search Console)"] + [f"- {l}" for l in sm[-2:]]
lines += ["", "## 8. URL Inspection — watchlist (Google's own view)", "| URL | Verdict | Coverage | Last crawl |", "|---|---|---|---|"]
for u in WATCH:
    out = node("inspect", SITE + u).strip().splitlines()
    try:
        d = json.loads(out[-1])
        lines.append(f"| `{u}` | {d.get('verdict')} | {d.get('coverage')} | {d.get('lastCrawl', '')[:10]} |")
    except Exception:
        lines.append(f"| `{u}` | UNKNOWN | {out[-1][:60] if out else ''} | |")

if os.environ.get("SKIP_REGRESSION") != "1":
    r = subprocess.run(["node", os.path.join(HERE, "seo-regression.cjs")], capture_output=True, text=True, encoding="utf-8", env={**os.environ, "SAMPLE": "15"})
    tail = [l for l in r.stdout.splitlines() if l.strip()][-1:]
    lines += ["", "## 9. Technical regression suite (live)", f"- exit code {r.returncode}: {tail[0] if tail else 'no output'}"]
    lines += [f"- {l}" for l in r.stdout.splitlines() if l.startswith("FAIL")][:15]

lines += ["", "> Indexable ≠ indexed. Section 8 is Google's verdict; everything else is our own configuration or Google's reported traffic."]
os.makedirs(os.path.join(ROOT, "docs", "seo", "reports"), exist_ok=True)
dest = os.path.join(ROOT, "docs", "seo", "reports", f"{date.today().isoformat()}.md")
open(dest, "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
print("\n".join(lines))
print("\nwritten:", dest)
