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

# 1. Login
login_url = "https://paratunisie.com/api/v1/admin-auth/login"
login_payload = {
    "email": "admin@paratunisie.tn",
    "password": "ParaTunisie2026!",
}

print("Logging in as Admin...")
req = urllib.request.Request(
    login_url,
    data=json.dumps(login_payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
with opener.open(req) as resp:
    staff = json.loads(resp.read().decode("utf-8"))
    print(f"✓ Login successful as {staff.get('name')} ({staff.get('role')})")

# 2. Test Aramex Tracking with HAWB 50918472905
print("\n--- 1. Testing Aramex Tracking (50918472905) ---")
track_url = "https://paratunisie.com/api/v1/orders/50918472905/aramex/track"
req = urllib.request.Request(track_url, headers={"Accept": "application/json"})
try:
    with opener.open(req) as resp:
        body = resp.read().decode("utf-8")
        data = json.loads(body)
        print("✓ Tracking Status:", resp.status)
        print("✓ Tracking Checkpoints:", json.dumps(data.get("checkpoints"), indent=2, ensure_ascii=False))
except Exception as e:
    print("✗ Error tracking:", e)
    if hasattr(e, "read"):
        print(e.read().decode("utf-8"))

# 3. Test Order Counts
print("\n--- 2. Testing Order Counts ---")
counts_url = "https://paratunisie.com/api/v1/orders/counts"
req = urllib.request.Request(counts_url, headers={"Accept": "application/json"})
with opener.open(req) as resp:
    body = resp.read().decode("utf-8")
    data = json.loads(body)
    print("✓ Order Counts:", json.dumps(data, indent=2))

# 4. Test Abandoned Checkouts List
print("\n--- 3. Testing Abandoned Checkouts List ---")
abandoned_url = "https://paratunisie.com/api/v1/abandoned-checkouts"
req = urllib.request.Request(abandoned_url, headers={"Accept": "application/json"})
with opener.open(req) as resp:
    body = resp.read().decode("utf-8")
    data = json.loads(body)
    print(f"✓ Found {len(data)} abandoned checkout records in DB:")
    for it in data:
        print(f"  • ID: {it['id']} | Client: {it.get('customerName')} | Phone: {it.get('phone')} | Total: {it.get('totalMillimes')} millimes | Status: {it.get('status')}")
