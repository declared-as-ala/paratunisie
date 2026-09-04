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

hawb = "50918472905"

client_info = {
    "UserName": "bitoutawalid@gmail.com",
    "Password": "Walid@bitouta@0000",
    "Version": "v1.0",
    "AccountNumber": "60506486",
    "AccountPin": "321321",
    "AccountEntity": "TUN",
    "AccountCountryCode": "TN",
    "Source": 24,
}

endpoints_to_test = [
    # 1. Standard TrackShipments JSON
    "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments",
    # 2. Track_Shipments
    "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/Track_Shipments",
    # 3. Rate calculator / other service path
    "https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate",
]

payload = {
    "ClientInfo": client_info,
    "Transaction": {"Reference1": hawb},
    "Shipments": [hawb],
    "GetLastTrackingUpdateOnly": False,
}

for ep in endpoints_to_test:
    print(f"\nTesting endpoint: {ep}")
    try:
        req = urllib.request.Request(
            ep,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            print(f"  ✓ Status: {resp.status}")
            print(f"  ✓ Content-Type: {resp.headers.get('Content-Type')}")
            print(f"  ✓ Body snippet: {body[:300]}")
    except Exception as e:
        print(f"  ✗ Error: {e}")
        if hasattr(e, "read"):
            err_body = e.read().decode("utf-8")
            print(f"    Error body snippet: {err_body[:300]}")
