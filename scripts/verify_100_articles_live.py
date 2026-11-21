# -*- coding: utf-8 -*-
import json
import re
import urllib.request
import concurrent.futures

BASE = "https://paratunisie.com"

with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
    manifest = json.load(f)

# 1. Check sitemap
print("1. Checking live sitemap.xml...")
req = urllib.request.Request(f"{BASE}/sitemap.xml", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=20) as r:
    sm_xml = r.read().decode("utf-8", errors="ignore")
sm_urls = set(re.findall(r"<loc>([^<]+)</loc>", sm_xml))
print(f"   Sitemap status: {r.status}, total <loc> URLs: {len(sm_urls)}")

missing_in_sm = [m["live_url"] for m in manifest if m["live_url"] not in sm_urls]
print(f"   New articles in sitemap: {100 - len(missing_in_sm)}/100")
if missing_in_sm:
    print("   Missing in sitemap sample:", missing_in_sm[:5])

# 2. Verify all 100 live article URLs + cover images
def check_article(m):
    url = m["live_url"]
    img_url = f"{BASE}{m['local_image_path']}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", errors="ignore")
            status = r.status
        h1_count = len(re.findall(r"<h1\b", html))
        canon_m = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]*)"', html, re.I)
        canon = canon_m.group(1) if canon_m else ""
        has_article_schema = '"@type":"Article"' in html or '"@type": "Article"' in html or 'BlogPosting' in html
        has_faq_schema = '"@type":"FAQPage"' in html or '"@type": "FAQPage"' in html
        has_hub_link = f'href="{m["internal_links"]["hub_category"]}"' in html
        noindex = bool(re.search(r'<meta[^>]+name="robots"[^>]+noindex', html, re.I))

        # Check cover image HTTP 200
        ireq = urllib.request.Request(img_url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(ireq, timeout=15) as ir:
            img_ok = (ir.status == 200)

        ok = (
            status == 200
            and h1_count == 1
            and canon == url
            and not noindex
            and has_article_schema
            and has_faq_schema
            and has_hub_link
            and img_ok
        )
        return {
            "slug": m["slug"],
            "ok": ok,
            "status": status,
            "h1": h1_count,
            "canon_ok": canon == url,
            "noindex": noindex,
            "article_schema": has_article_schema,
            "faq_schema": has_faq_schema,
            "hub_link": has_hub_link,
            "img_ok": img_ok,
        }
    except Exception as e:
        return {"slug": m["slug"], "ok": False, "error": str(e)}

print("2. Checking all 100 live article URLs and cover images...")
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    art_results = list(ex.map(check_article, manifest))

passed = sum(1 for r in art_results if r["ok"])
failed = [r for r in art_results if not r["ok"]]
print(f"   Article checks PASSED: {passed}/100, FAILED: {len(failed)}")
for f_item in failed[:10]:
    print("   FAIL:", f_item)

# 3. Verify target commercial category hubs
CAT_SLUGS = [
    "creatine", "whey-proteine", "whey-isolate", "ashwagandha", "magnesium",
    "omega-3", "vitamines", "mineraux", "collagene", "probiotiques",
    "pre-workout", "complements-alimentaires"
]
print("3. Checking 12 target commercial category hubs...")
for cslug in CAT_SLUGS:
    curl = f"{BASE}/{cslug}"
    try:
        req = urllib.request.Request(curl, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", errors="ignore")
        noindex = bool(re.search(r'<meta[^>]+name="robots"[^>]+noindex', html, re.I))
        has_guides = "Approfondir vos connaissances" in html or "Guides éducatifs associés" in html
        print(f"   /{cslug}: status={r.status}, indexable={not noindex}, supporting_guides={has_guides}")
    except Exception as e:
        print(f"   /{cslug}: ERR {e}")

with open("scripts/live_verification_results.json", "w", encoding="utf-8") as f:
    json.dump({"sitemap_total": len(sm_urls), "missing_in_sitemap": missing_in_sm, "articles": art_results}, f, ensure_ascii=False, indent=2)
