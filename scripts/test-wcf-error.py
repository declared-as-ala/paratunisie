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

# In WCF Aramex JSON API:
# Let's test different payload structures for TrackShipments:
payloads = [
    {
        "ClientInfo": client_info,
        "Transaction": {"Reference1": hawb, "Reference2": "", "Reference3": "", "Reference4": "", "Reference5": ""},
        "Shipments": [hawb],
        "GetLastTrackingUpdateOnly": False,
    },
    {
        "ClientInfo": client_info,
        "Transaction": None,
        "Shipments": [hawb],
        "GetLastTrackingUpdateOnly": False,
    },
    {
        "clientInfo": client_info,
        "shipments": [hawb],
    },
    {
        "ClientInfo": client_info,
        "Shipments": [hawb],
    }
]

url = "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments"

for i, p in enumerate(payloads):
    print(f"\n--- Testing Payload #{i+1} ---")
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(p).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            print("SUCCESS! Status:", resp.status)
            print("Body:", body[:500])
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP {e.code} Error:")
        print(err_body[:800])
