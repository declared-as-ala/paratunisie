# -*- coding: utf-8 -*-
import json
import re

with open("scripts/eligible_123_snapshot.json", encoding="utf-8") as f:
    rows = json.load(f)

cutoff_meta = [r["slug"] for r in rows if (r["seoDescription"] or "").strip().endswith((",", "…", "...")) or len((r["seoDescription"] or "").strip()) < 115 or len((r["seoDescription"] or "").strip()) > 165]
raw_seo_in_desc = [r["slug"] for r in rows if "**SEO Title**" in (r["description"] or "") or "**Meta Description**" in (r["description"] or "")]
short_intro = [r["slug"] for r in rows if len((r["seoIntro"] or "").split()) < 45]
short_content = [r["slug"] for r in rows if len((r["seoContent"] or "").split()) < 80]
no_faq = [r["slug"] for r in rows if not r["seoFaq"] or len(json.loads(r["seoFaq"])) < 2]
template_intro = [r["slug"] for r in rows if "est disponible sur ParaTunisie pour compléter" in (r["seoIntro"] or "") or "est proposé par ParaTunisie dans la catégorie" in (r["seoIntro"] or "")]

print(f"Cutoff / out-of-range seoDescription (<115 or >165 or trailing ,/…): {len(cutoff_meta)}")
print(f"Raw **SEO Title**/**Meta Description** inside description: {len(raw_seo_in_desc)} {raw_seo_in_desc}")
print(f"Short seoIntro (<45 words): {len(short_intro)}")
print(f"Template-like seoIntro: {len(template_intro)}")
print(f"Short/missing seoContent (<80 words): {len(short_content)}")
print(f"Fewer than 2 FAQs in seoFaq: {len(no_faq)}")

# Check categories distribution among the 123 eligible products
from collections import Counter
cats = Counter(r["category_name"] for r in rows)
print("\nCategory distribution (123 eligible):")
for k, v in cats.most_common():
    print(f"  {k}: {v}")
