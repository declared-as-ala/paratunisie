# -*- coding: utf-8 -*-
import json
import re
import urllib.request
import concurrent.futures

BASE_URL = "https://paratunisie.com"

with open("scripts/editorial_manifest_100_ar.json", encoding="utf-8") as f:
    manifest = json.load(f)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ParaTunisie-SEO-Verifier/1.0"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.getcode(), r.read().decode("utf-8", errors="ignore")


def check_head(url):
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "ParaTunisie-SEO-Verifier/1.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.getcode()


print("1. Checking sitemap.xml for all 100 Tunisian Arabic article URLs...")
code, sm_xml = fetch(f"{BASE_URL}/sitemap.xml")
assert code == 200, f"Sitemap returned {code}"
in_sitemap = sum(1 for m in manifest if f"/conseils/{m['slug']}" in sm_xml)
print(f"   Sitemap HTTP {code}: {in_sitemap}/100 Tunisian Arabic articles present in sitemap.xml")

print("2. Checking all 100 live Tunisian Arabic article URLs (max_workers=4)...")


def verify_one(m):
    slug = m["slug"]
    url = f"{BASE_URL}/conseils/{slug}"
    hub = m["internal_links"]["hub_category"]
    img_url = f"{BASE_URL}/assets/blog/{slug}.webp"
    issues = []
    try:
        st, html = fetch(url)
        if st != 200:
            issues.append(f"HTTP {st}")
        h1_matches = re.findall(r"<h1[^>]*>", html, re.I)
        if len(h1_matches) != 1:
            issues.append(f"H1 count={len(h1_matches)}")
        if f'href="{url}"' not in html and f"href='{url}'" not in html:
            issues.append("missing self-canonical")
        if 'dir="rtl"' not in html:
            issues.append("missing dir=rtl")
        if '"inLanguage":"ar-TN"' not in html and '"inLanguage": "ar-TN"' not in html:
            issues.append("missing inLanguage ar-TN")
        if '"@type":"Article"' not in html and '"@type": "Article"' not in html:
            issues.append("missing Article schema")
        if '"@type":"FAQPage"' not in html and '"@type": "FAQPage"' not in html:
            issues.append("missing FAQPage schema")
        if f'href="{hub}"' not in html:
            issues.append(f"missing hub link {hub}")
        img_st = check_head(img_url)
        if img_st != 200:
            issues.append(f"image HTTP {img_st}")
    except Exception as e:
        issues.append(f"EXC: {e}")
    return slug, issues


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    results = list(ex.map(verify_one, manifest))

passed = [r for r in results if not r[1]]
failed = [r for r in results if r[1]]
print(f"   Live verification: {len(passed)}/100 PASS, {len(failed)} FAIL")
for slug, iss in failed[:15]:
    print(f"   [FAIL] {slug}: {iss}")

if in_sitemap != 100 or failed:
    raise SystemExit(1)
print("ALL 100 TUNISIAN ARABIC ARTICLES VERIFIED LIVE!")
