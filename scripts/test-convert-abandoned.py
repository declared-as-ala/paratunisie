import urllib.request
import json
import ssl
import http.cookiejar
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), urllib.request.HTTPSHandler(context=ctx))

# Login
login_url = "https://paratunisie.com/api/v1/admin-auth/login"
login_payload = {
    "email": "admin@paratunisie.tn",
    "password": "ParaTunisie2026!",
}

req = urllib.request.Request(
    login_url,
    data=json.dumps(login_payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
opener.open(req)

# Convert test draft cmthukpb20000o101mca2avtu
convert_url = "https://paratunisie.com/api/v1/abandoned-checkouts/cmthukpb20000o101mca2avtu/convert"
req = urllib.request.Request(convert_url, data=b"{}", headers={"Content-Type": "application/json"})
with opener.open(req) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    print("✓ Conversion result:", json.dumps(res, indent=2, ensure_ascii=False))
