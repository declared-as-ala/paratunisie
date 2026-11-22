import sys
rows = [l.rstrip("\n").split("|") for l in open(sys.argv[1], encoding="utf-8") if l.count("|") >= 5]
miss = [r for r in rows if r[4] == ""]
o = ["# Brand pages missing a genuine logo / brand image", "", f"{len(miss)} indexable brand pages have no `image` set (checked 2026-11-16). **No logo may be invented or generated**: each needs an official asset supplied by the owner or the brand/distributor (with the right to use it). Priority = published product count.", "", "| # | Brand | Published | Indexable products | Page |", "|---|---|---:|---:|---|"]
for i, r in enumerate(sorted(miss, key=lambda r: -int(r[2])), 1):
    o.append(f"| {i} | {r[0]} | {r[2]} | {r[3]} | https://paratunisie.com/marques/{r[1]} |")
o += ["", "After upload (Admin → Marques → image), run `node ops/seo/brand-seo-run.cjs` in dry-run to refresh the 10-point brand score. Without a logo the pages stay indexable (content is factual) but lose the image points of the score."]
open("docs/seo/BRAND_LOGOS_MISSING.md", "w", encoding="utf-8").write("\n".join(o) + "\n")
print(len(miss))
