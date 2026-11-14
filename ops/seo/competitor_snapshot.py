"""Public-page technical snapshot of Tunisian competitors vs paratunisie.com (one GET per URL, no crawling).
usage: python ops/seo/competitor_snapshot.py  -> prints a table and writes docs/seo/COMPETITOR_SNAPSHOT.json
"""
import json
import os
import re
import subprocess
import time

URLS = {
    "paratunisie /vitamines": "https://paratunisie.com/vitamines",
    "paratunisie /magnesium": "https://paratunisie.com/magnesium",
    "paratunisie /whey-proteine": "https://paratunisie.com/whey-proteine",
    "primini vitamines+compl.": "https://primini.tn/liste-produit/vitamines-et-complements-alimentaires",
    "primini alimentation sportif": "https://primini.tn/liste-produit/alimentation-du-sportif",
    "parapharmacie.tn": "https://parapharmacie.tn/",
    "parapharm.tn": "https://parapharm.tn/",
    "tunisiepara.com": "https://tunisiepara.com/",
    "lagrandepara.tn": "https://lagrandepara.tn/",
    "impactnutrition.com.tn": "https://www.impactnutrition.com.tn/",
}


def fetch(url):
    t0 = time.time()
    r = subprocess.run(
        ["curl", "-sL", "-m", "25", "--compressed", "-A", "Mozilla/5.0 (compatible; seo-benchmark)", "-o", "-",
         "-w", "\n__META__%{http_code} %{time_starttransfer} %{size_download} %{num_redirects} %{url_effective}", url],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    ).stdout
    body, _, meta = r.rpartition("\n__META__")
    parts = meta.split(" ", 4)
    code = parts[0] if parts else "0"
    return body, code, float(parts[1]) if len(parts) > 1 and parts[1] else 0.0, int(parts[2]) if len(parts) > 2 and parts[2] else 0, parts[4] if len(parts) > 4 else url


def analyze(body):
    low = body
    title = re.search(r"<title[^>]*>(.*?)</title>", low, re.S | re.I)
    desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)', low, re.I) or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']description', low, re.I)
    robots = re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']*)', low, re.I)
    canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']*)', low, re.I)
    ld = re.findall(r'"@type"\s*:\s*"([A-Za-z]+)"', low)
    text = re.sub(r"<(script|style|noscript)[\s\S]*?</\1>", " ", low, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    words = len(re.findall(r"\w+", text))
    return {
        "title_len": len(title.group(1).strip()) if title else 0,
        "meta_desc_len": len(desc.group(1)) if desc else 0,
        "h1": len(re.findall(r"<h1\b", low, re.I)),
        "h2": len(re.findall(r"<h2\b", low, re.I)),
        "robots": robots.group(1) if robots else "(none)",
        "canonical": bool(canon),
        "schema_types": sorted(set(ld))[:10],
        "visible_words": words,
        "images": len(re.findall(r"<img\b", low, re.I)),
        "internal_links": len(re.findall(r'<a\b[^>]+href=["\'](?:/|https?://[^"\']*(?:paratunisie|primini|parapharm|tunisiepara|lagrandepara|impactnutrition))', low, re.I)),
        "faq_schema": "FAQPage" in ld,
    }


out = {}
print(f'{"site":32} {"http":>4} {"ttfb":>5} {"KB":>5} {"words":>6} {"h1":>2} {"h2":>3} {"links":>5} {"canon":>5} {"schema"}')
for name, url in URLS.items():
    body, code, ttfb, size, final = fetch(url)
    a = analyze(body) if code.startswith("2") else {}
    out[name] = {"url": url, "final": final, "http": code, "ttfb_s": round(ttfb, 2), "kb": size // 1024, **a}
    print(f'{name:32} {code:>4} {ttfb:5.2f} {size // 1024:5} {a.get("visible_words", 0):6} {a.get("h1", 0):2} {a.get("h2", 0):3} {a.get("internal_links", 0):5} {str(a.get("canonical", "")):>5} {",".join(a.get("schema_types", []))[:60]}')
dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs", "seo", "COMPETITOR_SNAPSHOT.json")
json.dump(out, open(dest, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
