"""Internal broken-link check (read-only). Crawls sitemap pages that are not products (+ a product sample) and requests every
unique internal href once. usage: python ops/seo/link-check.py [product_sample=60]"""
import re, sys, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
BASE = "https://paratunisie.com"
UA = {"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"}
N = int(sys.argv[1]) if len(sys.argv) > 1 else 60
def get(u):
    try:
        class NR(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k): return None
        r = urllib.request.build_opener(NR).open(urllib.request.Request(u, headers=UA), timeout=30)
        return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e: return e.code, ""
    except Exception: return 0, ""
sm = get(BASE + "/sitemap.xml")[1]
urls = re.findall(r"<loc>([^<]+)</loc>", sm)
pages = [u for u in urls if "/produits/" not in u]
prods = [u for u in urls if "/produits/" in u]
pages += prods[:: max(1, len(prods) // N)][:N]
def links(u):
    _, h = get(u)
    h = re.sub(r"<script[^>]*>.*?</script>", "", h, flags=re.S)
    out = set()
    for m in re.findall(r'href="([^"#]+)"', h):
        m = urllib.parse.unquote(m)
        if m.startswith("/") and not m.startswith("//") and not m.startswith("/_next") and not re.search(r"\.(png|jpg|webp|svg|css|js|ico|xml|txt)(\?|$)", m): out.add(m.split("?")[0])
        elif m.startswith(BASE): out.add(m[len(BASE):].split("?")[0] or "/")
    return u, out
with ThreadPoolExecutor(8) as ex: res = list(ex.map(links, pages))
where = {}
for u, ls in res:
    for l in ls: where.setdefault(l, []).append(u)
with ThreadPoolExecutor(8) as ex: codes = dict(zip(where, ex.map(lambda l: get(BASE + l)[0], where)))
bad = {l: c for l, c in codes.items() if c != 200}
print(f"pages crawled {len(pages)} | unique internal links {len(where)} | non-200: {len(bad)}")
for l, c in sorted(bad.items()): print(f"  {c} {l}  <- {where[l][0].replace(BASE,'')} (+{len(where[l])-1})")
