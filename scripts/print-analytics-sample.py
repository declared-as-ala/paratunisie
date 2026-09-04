import urllib.request
import json
import ssl
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "https://paratunisie.com/api/v1"

login_data = json.dumps({"email": "admin@paratunisie.tn", "password": "ParaTunisie2026!"}).encode("utf-8")
login_req = urllib.request.Request(
    f"{BASE_URL}/admin-auth/login",
    data=login_data,
    headers={"Content-Type": "application/json"},
)

session_cookie = None
with urllib.request.urlopen(login_req, context=ctx, timeout=10) as resp:
    set_cookie = resp.headers.get("Set-Cookie")
    for cookie in set_cookie.split(";"):
        if "paratunisie_admin_session=" in cookie:
            session_cookie = cookie.strip()
            break

auth_headers = {"Cookie": session_cookie, "Content-Type": "application/json"}

print("="*60)
print("OVERVIEW KPIS:")
req = urllib.request.Request(f"{BASE_URL}/analytics/overview?period=7d", headers=auth_headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    for k, v in data["kpis"].items():
        print(f"  {k}: {v}")

print("\n"+"="*60)
print("CONVERSION FUNNEL:")
req = urllib.request.Request(f"{BASE_URL}/analytics/funnel?period=7d", headers=auth_headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    for s in data["steps"]:
        print(f"  Step {s['step']}: {s['name']} -> {s['count']} ({s['overallConversion']}% du total, drop-off: {s['dropOffRate']}%)")

print("\n"+"="*60)
print("TOP PRODUCTS:")
req = urllib.request.Request(f"{BASE_URL}/analytics/products?period=7d", headers=auth_headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    for p in data["products"][:5]:
        print(f"  • {p['name']} ({p['brandName']}) | {p['currentPriceTnd']} DT | Vues: {p['views']} | Carts: {p['addToCart']} | Ventes: {p['purchases']} | Revenu: {p['revenueTnd']} DT | Conv: {p['conversionRate']}%")

print("\n"+"="*60)
print("SEARCH ANALYTICS & ZERO RESULTS:")
req = urllib.request.Request(f"{BASE_URL}/analytics/searches?period=7d", headers=auth_headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    print("  Top Searches:", data["topSearches"][:5])
    print("  Zero Results:", data["zeroResultSearches"])
