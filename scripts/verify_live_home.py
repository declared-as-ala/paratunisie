import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://paratunisie.com", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
    html = res.read().decode('utf-8', errors='replace')
    print("Home status:", res.getcode())
    print("Contains 'hero-pack-anti-stress.webp':", "hero-pack-anti-stress.webp" in html)
    print("Contains 'Anti-Stress':", "Anti-Stress" in html)
    print("Contains 'À LA UNE RELAX':", "À LA UNE RELAX" in html or "RELAX" in html)
    print("Contains 'À LA UNE SPORT' or 'Sport':", "Sport" in html)

