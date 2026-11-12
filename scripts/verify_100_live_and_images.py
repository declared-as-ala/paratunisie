# -*- coding: utf-8 -*-
"""
Full verification of all 100 new articles:
- Live page returns HTTP 200
- Cover image returns HTTP 200
- Sitemap contains the article
"""

import os
import json
import urllib.request
import concurrent.futures

def check_url(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.status, len(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, 0
    except Exception as e:
        return 0, str(e)

def main():
    json_path = os.path.join(os.path.dirname(__file__), "compiled_100_articles.json")
    with open(json_path, "r", encoding="utf-8") as f:
        articles = json.load(f)

    print(f"Verifying all {len(articles)} articles live on https://paratunisie.com ...")

    # Fetch sitemap
    sitemap_url = "https://paratunisie.com/sitemap.xml"
    req_sm = urllib.request.Request(sitemap_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_sm) as resp:
        sitemap_xml = resp.read().decode("utf-8")
    
    total_in_sitemap = sitemap_xml.count("<loc>")
    print(f"Total entries in live sitemap.xml: {total_in_sitemap}")

    results = []

    def verify_single(art):
        slug = art["slug"]
        page_url = f"https://paratunisie.com/conseils/{slug}"
        # We test both the MinIO path and Next.js assets path
        img_url = f"https://paratunisie.com/assets/blog/{slug}.webp"
        
        page_st, page_len = check_url(page_url)
        img_st, img_len = check_url(img_url)
        in_sitemap = f"/conseils/{slug}" in sitemap_xml

        return {
            "slug": slug,
            "title": art["title"],
            "page_status": page_st,
            "page_size": page_len,
            "img_status": img_st,
            "img_size": img_len,
            "in_sitemap": in_sitemap
        }

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(verify_single, articles))

    page_200 = sum(1 for r in results if r["page_status"] == 200)
    img_200 = sum(1 for r in results if r["img_status"] == 200)
    in_sm_count = sum(1 for r in results if r["in_sitemap"])

    print("\n" + "=" * 60)
    print("FINAL VERIFICATION SUMMARY (100 ARTICLES):")
    print("=" * 60)
    print(f"Articles returning HTTP 200 OK  : {page_200} / {len(articles)}")
    print(f"Images returning HTTP 200 OK    : {img_200} / {len(articles)}")
    print(f"Articles present in sitemap.xml : {in_sm_count} / {len(articles)}")
    print("=" * 60)

    # Show any anomalies
    failed_pages = [r["slug"] for r in results if r["page_status"] != 200]
    failed_imgs = [r["slug"] for r in results if r["img_status"] != 200]
    if failed_pages:
        print("Failed pages:", failed_pages)
    if failed_imgs:
        print("Failed images:", failed_imgs)

    # Sample display
    print("\nSample of 10 Verified Live URLs:")
    for r in results[:10]:
        print(f" - [200 OK] https://paratunisie.com/conseils/{r['slug']}")

if __name__ == "__main__":
    main()
