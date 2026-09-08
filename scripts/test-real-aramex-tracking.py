import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

hawbs = [
    "50919094483",
    "50918858896",
    "50918767395",
    "50918649375",
    "50918649386",
    "50918649390"
]

endpoint = "https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments"

client_info = {
    "UserName": "bitoutawalid@gmail.com",
    "Password": "Walid@bitouta@0000",
    "Version": "v1.0",
    "AccountNumber": "60506486",
    "AccountPin": "321321",
    "AccountEntity": "TUN",
    "AccountCountryCode": "TN",
    "Source": 24
}

payload = {
    "ClientInfo": client_info,
    "Transaction": {
        "Reference1": "test-batch",
        "Reference2": "",
        "Reference3": "",
        "Reference4": "",
        "Reference5": ""
    },
    "Shipments": hawbs,
    "GetLastTrackingUpdateOnly": False
}

req = urllib.request.Request(
    endpoint,
    data=json.dumps(payload).encode('utf-8'),
    headers={"Content-Type": "application/json", "Accept": "application/json"}
)

try:
    with urllib.request.urlopen(req, context=ctx) as resp:
        res_data = json.loads(resp.read().decode('utf-8'))
        print("HasErrors:", res_data.get("HasErrors"))
        tracking_results = res_data.get("TrackingResults", [])
        print(f"Tracking results count: {len(tracking_results)}\n")
        
        for tr in tracking_results:
            key = tr.get("Key")
            values = tr.get("Value", [])
            print(f"=== HAWB: {key} (Checkpoints: {len(values)}) ===")
            for v in values:
                print(f"  Code: {v.get('UpdateCode')} | Desc: {v.get('UpdateDescription')} | Location: {v.get('UpdateLocation')} | Date: {v.get('UpdateDateTime')}")
                if v.get('Comments'):
                    print(f"    Comments: {v.get('Comments')}")
            print()
except Exception as e:
    print("Error querying Aramex:", e)
