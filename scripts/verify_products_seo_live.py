# -*- coding: utf-8 -*-
import json
import re
import sys
import urllib.request
import concurrent.futures

BASE_URL = "https://paratunisie.com"

with open("scripts/enriched_123_products.json", encoding="utf-8") as f:
    ITEMS = json.load(f)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "ParaTunisie-Product-SEO-Verifier/1.0"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.getcode(), r.read().decode("utf-8", errors="ignore")


def check_sitemap(items):
    code, xml = fetch(f"{BASE_URL}/sitemap.xml")
    assert code == 200, f"sitemap.xml returned {code}"
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    all_xml = xml
    for loc in locs:
        if "sitemap" in loc.lower() and loc.endswith(".xml"):
            _, sub = fetch(loc)
            all_xml += "\n" + sub
    present = sum(1 for it in items if f"/produits/{it['slug']}" in all_xml)
    print(f"Sitemap check: {present}/{len(items)} eligible products found in sitemap XML(s)")
    return present


def verify_one(it):
    slug = it["slug"]
    url = f"{BASE_URL}/produits/{slug}"
    issues = []
    try:
        st, html = fetch(url)
        if st != 200:
            issues.append(f"HTTP {st}")
        h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
        if len(h1s) != 1:
            issues.append(f"H1 count={len(h1s)}")
        if f'href="{url}"' not in html and f"href='{url}'" not in html:
            issues.append("missing self-canonical")
        if 'name="robots" content="noindex' in html.lower():
            issues.append("unexpected noindex")
        if '"@type":"Product"' not in html and '"@type": "Product"' not in html:
            issues.append("missing Product JSON-LD")
        if '"priceCurrency":"TND"' not in html and '"priceCurrency": "TND"' not in html:
            issues.append("missing TND currency in JSON-LD")
        if '"availability":"https://schema.org/InStock"' not in html and '"availability": "https://schema.org/InStock"' not in html:
            issues.append("missing InStock in JSON-LD")
        if '"@type":"BreadcrumbList"' not in html and '"@type": "BreadcrumbList"' not in html:
            issues.append("missing BreadcrumbList JSON-LD")
        if "À propos de" not in html:
            issues.append("missing rendered seoContent section")
    except Exception as e:
        issues.append(f"EXC: {e}")
    return slug, issues


def main():
    target = ITEMS[:10] if "--pilot" in sys.argv else ITEMS
    if "--pilot" not in sys.argv:
        check_sitemap(target)

    print(f"Verifying {len(target)} live product pages (max_workers=4)...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(verify_one, target))

    passed = [r for r in results if not r[1]]
    failed = [r for r in results if r[1]]
    print(f"Live verification: {len(passed)}/{len(target)} PASS, {len(failed)} FAIL")
    for s, iss in failed[:15]:
        print(f"  [FAIL] {s}: {iss}")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
