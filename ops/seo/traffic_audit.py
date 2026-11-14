import csv
import json
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

SP = "C:/Users/Ala/AppData/Local/Temp/claude/f58c8a0d78b16b1f/210226c2-0ef2-4787-84ea-4e60977f2375/scratchpad"
KEY = "C:/Users/Ala/.claude/secrets/gsc-credentials.json"
OUT = "C:/Users/Ala/Desktop/parapharmacie/docs/seo/TRAFFIC_PAGES_STATUS.csv"

raw = subprocess.run(
    ["node", f"{SP}/gsc-query.cjs", KEY, "perf", "page", "90"],
    capture_output=True, text=True, encoding="utf-8", errors="replace", env={**__import__("os").environ, "ROWS": "1000"},
).stdout
rows = [json.loads(line) for line in raw.splitlines() if line.startswith("{")]


def check(row):
    url = row["k"][0]
    r = subprocess.run(
        ["curl", "-s", "-m", "20", "-o", "-", "-w", "\n__CODE__%{http_code} %{redirect_url}", url],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    ).stdout
    body, _, tail = r.rpartition("\n__CODE__")
    code, _, redirect = tail.partition(" ")
    m = re.search(r'name="robots" content="([^"]*)"', body)
    robots = m.group(1) if m else ""
    state = "OK_INDEXABLE" if code == "200" and "noindex" not in robots else (
        "200_BUT_NOINDEX" if code == "200" else ("REDIRECT" if code.startswith("3") else f"HTTP_{code}"))
    return [url, row["clicks"], row["impressions"], round(row["ctr"], 2), row["pos"], code, state, redirect.strip()]


with ThreadPoolExecutor(8) as ex:
    result = list(ex.map(check, rows))

result.sort(key=lambda x: -x[1])
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["url", "clicks_90d", "impressions_90d", "ctr_pct", "avg_position", "http", "state", "redirect_to"])
    w.writerows(result)

summary = {}
for r in result:
    s = summary.setdefault(r[6], [0, 0, 0])
    s[0] += 1
    s[1] += r[1]
    s[2] += r[2]
print("pages:", len(result), "clicks:", sum(r[1] for r in result))
for k, v in sorted(summary.items(), key=lambda kv: -kv[1][1]):
    print(f"{k}: pages={v[0]} clicks={v[1]} impressions={v[2]}")
print("top 200_BUT_NOINDEX:")
for r in [x for x in result if x[6] == "200_BUT_NOINDEX"][:12]:
    print(" ", r[0].replace("https://paratunisie.com", ""), r[1], r[2])
