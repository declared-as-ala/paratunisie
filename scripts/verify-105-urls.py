import requests

urls = [
    ("Issam Mekki (105 DT)", "https://ws.aramex.net/ShippingAPI.V2/rpt_cache/e9c2e871934b45a7b1ee4d9d162ec3ef.pdf"),
    ("Tarek Weslati (105 DT)", "https://ws.aramex.net/ShippingAPI.V2/rpt_cache/0c74aface3c34d36960f364218fc8819.pdf"),
    ("nhidi sarah (105 DT)", "https://ws.aramex.net/ShippingAPI.V2/rpt_cache/0ef9b66bcae34e8e814f9483cc8bd088.pdf"),
]

for name, url in urls:
    r = requests.get(url, timeout=15)
    print(f"{name}: Status {r.status_code}, Length {len(r.content)} bytes")
