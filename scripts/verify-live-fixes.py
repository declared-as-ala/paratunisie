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

print("=== 1. Testing Aramex Tracking Endpoint ===")
track_url = "https://paratunisie.com/api/v1/orders/50918472905/aramex/track"
try:
    req = urllib.request.Request(track_url, headers={"User-Agent": "TestClient/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        body = resp.read().decode("utf-8")
        print(f"Status: {resp.status}")
        data = json.loads(body)
        print("Response JSON:", json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error on track: {e}")
    if hasattr(e, "read"):
        print("Body:", e.read().decode("utf-8"))

print("\n=== 2. Testing Abandoned Checkout Draft Ingestion ===")
draft_url = "https://paratunisie.com/api/v1/abandoned-checkouts/draft"
draft_payload = {
    "checkoutSessionId": "test-session-live-001",
    "source": "BUY_NOW_MODAL",
    "customerName": "Test Lead Client",
    "phone": "98123456",
    "email": "testlead@example.com",
    "gouvernorat": "Tunis",
    "fullAddress": "Avenue Habib Bourguiba, Tunis",
    "deliveryNote": "Appeler avant la livraison",
    "items": [
        {
            "productId": "prod-test-01",
            "name": "Créatine Monohydrate Ostrovit 500g",
            "quantity": 2,
            "priceMillimes": 145000,
        }
    ],
    "subtotalMillimes": 290000,
    "shippingFeeMillimes": 0,
    "totalMillimes": 290000,
}

try:
    req = urllib.request.Request(
        draft_url,
        data=json.dumps(draft_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "TestClient/1.0"},
    )
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        body = resp.read().decode("utf-8")
        print(f"Draft Status: {resp.status}")
        print("Draft Response:", body)
except Exception as e:
    print(f"Error on draft: {e}")
    if hasattr(e, "read"):
        print("Body:", e.read().decode("utf-8"))

print("\n=== 3. Testing Order Counts ===")
counts_url = "https://paratunisie.com/api/v1/orders/counts"
try:
    req = urllib.request.Request(counts_url, headers={"User-Agent": "TestClient/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        body = resp.read().decode("utf-8")
        print(f"Counts Status: {resp.status}")
        print("Counts Response:", body)
except Exception as e:
    print(f"Error on counts: {e}")
