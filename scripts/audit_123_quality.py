# -*- coding: utf-8 -*-
import json
import re

with open("scripts/eligible_123_snapshot.json", encoding="utf-8") as f:
    rows = json.load(f)

RESTRICTED_RE = re.compile(
    r"(?<![a-z0-9])(?:mk-?677|ibutamoren|sarms?|ostarine|ligandrol|lgd-?4033|rad-?140|testolone|cardarine|gw-?501516|stenabolic|dhea|7-?keto|pregnenolone|prohormones?|1-?andro|4-?andro|epiandrosterone|clenbuterol|ephedra|ephedrine|dnp|oxandrolone|anavar|tamoxifen|nolvadex|clomiphene|hcg)(?![a-z0-9])",
    re.I,
)

restricted = [r["slug"] for r in rows if RESTRICTED_RE.search(f"{r['name']} {r['slug'].replace('-', ' ')}")]
generic_desc = [r["slug"] for r in rows if re.search(r"^Découvrez \*\*", (r["description"] or "").strip()) and "### Points Forts" in (r["description"] or "")]
empty_faq = [r["slug"] for r in rows if not r["seoFaq"] or r["seoFaq"].strip() in ("[]", "")]
bad_img = [r["slug"] for r in rows if not r["image"] or "unavailable" in r["image"] or "placeholder" in r["image"]]
score_lt_95 = [r for r in rows if r["seoScore"] < 95]
missing_any = [
    r["slug"] for r in rows
    if not all([
        (r["seoTitle"] or "").strip(),
        (r["seoDescription"] or "").strip(),
        (r["seoH1"] or "").strip(),
        (r["seoIntro"] or "").strip(),
        (r["seoContent"] or "").strip(),
        (r["canonicalUrl"] or "").strip(),
        (r["ogTitle"] or "").strip(),
        (r["ogDescription"] or "").strip(),
        (r["ogImage"] or "").strip(),
        (r["imageAlt"] or "").strip(),
    ])
]

print(f"Total eligible: {len(rows)}")
print(f"Restricted substance matches: {len(restricted)} {restricted}")
print(f"Generic generated description: {len(generic_desc)}")
print(f"Empty seoFaq: {len(empty_faq)}")
print(f"Bad/placeholder image: {len(bad_img)} {bad_img}")
print(f"Missing >=1 core SEO field: {len(missing_any)}")
print(f"Score < 95: {len(score_lt_95)}")
print(f"Custom SEO (seoIsCustom=true): {sum(1 for r in rows if r['seoIsCustom'])}")
print(f"Score distribution: min={min(r['seoScore'] for r in rows)}, max={max(r['seoScore'] for r in rows)}, avg={sum(r['seoScore'] for r in rows)/len(rows):.1f}")

# Print 2 sample complete rows and 2 incomplete rows
print("\nSample incomplete product:")
for r in rows[:2]:
    print(f"  {r['slug']} | title={r['seoTitle']} | h1={r['seoH1']} | brand={r['brand_name']} | cat={r['category_name']}")
    print(f"    desc[:120]={(r['description'] or '')[:120]!r}")
print("\nSample complete product (score 100):")
for r in [x for x in rows if x["seoScore"] == 100][:2]:
    print(f"  {r['slug']} | title={r['seoTitle']} | h1={r['seoH1']}")
    print(f"    meta={r['seoDescription']}")
    print(f"    intro[:120]={(r['seoIntro'] or '')[:120]!r}")
