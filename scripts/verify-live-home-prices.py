import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://paratunisie.com/", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    html = resp.read().decode("utf-8", errors="replace")

print("Homepage check:")
if "179.000 DT" in html:
    print("Micronised Creatine 179.000 DT is present on Homepage!")
else:
    print("Micronised Creatine 179.000 DT not found in HTML")

if "145 DT" in html:
    print("Old 145 DT still found")
else:
    print("Old 145 DT removed!")
