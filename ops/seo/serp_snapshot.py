"""Competitor page snapshot for a keyword (read-only, one public GET per URL, descriptive User-Agent).

usage: python ops/seo/serp_snapshot.py <out.json> <url> [<url> ...]
Extracts what ranks: title, meta description, canonical, H1/H2/H3, visible word count, number of product links, price range in DT,
FAQ / ItemList / Product / BreadcrumbList schema, internal link count. No rank or traffic data is claimed (none is available).
"""
import json, re, sys, time, urllib.request, html as htmllib

UA = "Mozilla/5.0 (compatible; ParaTunisie-SEO-research/1.0)"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "fr"})
    t0 = time.time()
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return r.status, r.read().decode("utf-8", "ignore"), round(time.time() - t0, 2)
    except urllib.error.HTTPError as e:
        return e.code, "", round(time.time() - t0, 2)
    except Exception as e:  # noqa: BLE001
        return 0, str(e), round(time.time() - t0, 2)


def strip(h):
    h = re.sub(r"<(script|style|noscript)[\s\S]*?</\1>", " ", h, flags=re.I)
    return htmllib.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))).strip()


def snap(url):
    status, h, secs = fetch(url)
    out = {"url": url, "status": status, "ttfb_s": secs}
    if status != 200 or not h:
        return out
    g = lambda pat: (re.search(pat, h, re.I | re.S) or [None, ""])[1]
    out["title"] = strip(g(r"<title[^>]*>(.*?)</title>"))
    out["meta_description"] = htmllib.unescape(g(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)'))
    out["canonical"] = g(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']*)')
    out["robots"] = g(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']*)')
    heads = lambda tag: [strip(x) for x in re.findall(rf"<{tag}[^>]*>(.*?)</{tag}>", h, re.I | re.S)]
    out["h1"] = heads("h1")[:3]
    out["h2"] = [x for x in heads("h2") if x][:14]
    out["h3_count"] = len(heads("h3"))
    body = strip(re.sub(r"<(header|nav|footer)[\s\S]*?</\1>", " ", h, flags=re.I))
    out["words"] = len(body.split())
    prices = [float(p.replace(",", ".").replace(" ", "")) for p in re.findall(r"(\d{1,4}(?:[.,]\d{1,3})?)\s*(?:DT|TND|dt)\b", body)]
    prices = [p for p in prices if 5 <= p <= 1000]
    if prices:
        out["price_dt"] = {"min": min(prices), "max": max(prices), "n": len(prices)}
    out["product_links"] = len(set(re.findall(r'href=["\']([^"\']*(?:/produit/|/produits/|/product/|/p/)[^"\']*)', h, re.I)))
    out["internal_links"] = len(re.findall(r"<a [^>]*href=", h, re.I))
    ld = " ".join(re.findall(r'<script[^>]+application/ld\+json[^>]*>([\s\S]*?)</script>', h, re.I))
    out["schema"] = sorted({t for t in ["FAQPage", "ItemList", "Product", "BreadcrumbList", "CollectionPage", "Organization", "WebSite", "OnlineStore", "Article"] if f'"{t}"' in ld})
    out["has_faq_text"] = bool(re.search(r"questions? fr[ée]quentes|faq", h, re.I))
    out["mentions"] = {k: len(re.findall(k, body, re.I)) for k in ["cr[ée]atine", "tunisie", "monohydrate", "creapure", "livraison", "prix"]}
    return out


if __name__ == "__main__":
    dest, urls = sys.argv[1], sys.argv[2:]
    result = [snap(u) for u in urls]
    json.dump(result, open(dest, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for r in result:
        print(f"{r['status']} {r['url']}\n   title: {r.get('title','')[:95]}\n   words={r.get('words')} h2={len(r.get('h2',[]))} products={r.get('product_links')} price={r.get('price_dt')} schema={r.get('schema')} faq_text={r.get('has_faq_text')}")
