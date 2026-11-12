import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://paratunisie.com/assets/pack-anti-stress.jpg",
    "https://paratunisie.com/assets/pack-anti-stress-poster.jpg",
    "https://paratunisie.com/assets/pack-anti-stress.mp4"
]

for u in urls:
    try:
        req = urllib.request.Request(u, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            print(f"{u} -> HTTP {res.getcode()}, length: {res.headers.get('Content-Length')}")
    except Exception as e:
        print(f"{u} -> ERROR: {e}")

