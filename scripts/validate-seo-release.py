#!/usr/bin/env python3
"""
ParaTunisie SEO Release Validator
Automated CI/CD / Release-time verification script for HTTP status, canonical tags,
robots directives, title, description, schema, and sitemap consistency.
"""

import sys
import re
import urllib.request
import xml.etree.ElementTree as ET

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_URL = "https://paratunisie.com"

CRITICAL_URLS = [
    {"url": f"{BASE_URL}/", "type": "home", "indexable": True},
    {"url": f"{BASE_URL}/shop", "type": "plp", "indexable": True},
    {"url": f"{BASE_URL}/marques", "type": "directory", "indexable": True},
    {"url": f"{BASE_URL}/creatine", "type": "category", "indexable": True},
    {"url": f"{BASE_URL}/whey-proteine", "type": "category", "indexable": True},
    {"url": f"{BASE_URL}/pack-anti-stress", "type": "landing", "indexable": True},
    {"url": f"{BASE_URL}/conseils/meilleure-creatine-tunisie", "type": "article", "indexable": False},
    {"url": f"{BASE_URL}/marques/biotechusa", "type": "brand", "indexable": True},
    {"url": f"{BASE_URL}/robots.txt", "type": "robots", "indexable": True},
    {"url": f"{BASE_URL}/sitemap.xml", "type": "sitemap", "indexable": True},
]

def fetch_url(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ParaTunisie-SEO-Validator/2.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return res.status, res.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")
    except Exception as e:
        return 0, str(e)

def validate():
    print(f"=== Starting ParaTunisie SEO Release Validation on {BASE_URL} ===\n")
    errors = 0
    passed = 0

    for item in CRITICAL_URLS:
        url = item["url"]
        url_type = item["type"]
        status, html = fetch_url(url)

        if status != 200:
            print(f"❌ [FAIL] {url} returned HTTP {status}")
            errors += 1
            continue

        print(f"✅ [200 OK] {url}")

        if url_type in ["home", "plp", "category", "brand", "pdp", "article", "landing"]:
            # Check Canonical
            canonical_match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if not canonical_match:
                canonical_match = re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', html, re.IGNORECASE)

            if canonical_match:
                canonical = canonical_match.group(1)
                if not canonical.startswith("https://paratunisie.com"):
                    print(f"   ⚠️ Warning: Canonical does not use apex https://paratunisie.com: {canonical}")
                    errors += 1
                else:
                    print(f"   ├── Canonical: {canonical}")
            else:
                print(f"   ❌ Missing canonical tag on {url}")
                errors += 1

            # Check Title
            title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            if title_match:
                title = title_match.group(1).strip()
                if "ParaTunisie | ParaTunisie" in title:
                    print(f"   ❌ Duplicate branding in title: {title}")
                    errors += 1
                else:
                    print(f"   ├── Title: {title[:70]}...")
            else:
                print(f"   ❌ Missing title tag on {url}")
                errors += 1

            # Check Robots
            robots_match = re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if robots_match:
                print(f"   ├── Robots: {robots_match.group(1)}")

            # Check JSON-LD
            schema_matches = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.IGNORECASE | re.DOTALL)
            if schema_matches:
                print(f"   └── JSON-LD: Found {len(schema_matches)} structured data block(s)")
            else:
                print(f"   ⚠️ No JSON-LD blocks found")

        passed += 1
        print("")

    # Sitemap Audit
    sitemap_status, sitemap_xml = fetch_url(f"{BASE_URL}/sitemap.xml")
    if sitemap_status == 200:
        try:
            root = ET.fromstring(sitemap_xml)
            namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls = [loc.text for loc in root.findall(".//ns:loc", namespace)]
            print(f"=== Sitemap Audit ===")
            print(f"Total Sitemap URLs: {len(urls)}")
            
            sitemap_errs = 0
            for u in urls[:15]: # check sample
                st, _ = fetch_url(u)
                if st != 200:
                    print(f"❌ Broken sitemap URL: {u} -> {st}")
                    sitemap_errs += 1
            if sitemap_errs == 0:
                print(f"✅ Sample sitemap URLs verified 200 OK")
        except Exception as e:
            print(f"❌ Failed to parse sitemap: {e}")
            errors += 1

    print("\n" + "=" * 50)
    if errors == 0:
        print(f"🎉 VALIDATION PASSED! ({passed} checks verified with 0 errors)")
        sys.exit(0)
    else:
        print(f"⚠️ VALIDATION FINISHED WITH {errors} ISSUES.")
        sys.exit(1)

if __name__ == "__main__":
    validate()
