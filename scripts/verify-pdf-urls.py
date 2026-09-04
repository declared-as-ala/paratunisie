import requests

urls = [
    ("Issam Mekki", "https://ws.aramex.net/ShippingAPI.V2/rpt_cache/128021c8b4f84f18afdafcf6a3001369.pdf"),
    ("Tarek Weslati", "https://ws.aramex.net/ShippingAPI.V2/rpt_cache/47265dffdeeb4f8e941b969aab95aad7.pdf"),
    ("nhidi sarah", "https://ws.aramex.net/ShippingAPI.V2/rpt_cache/1bbb55d9547e4f8a89ad687e812a6f79.pdf"),
]

for name, url in urls:
    r = requests.get(url, timeout=15)
    print(f"{name}: Status {r.status_code}, Length {len(r.content)} bytes, Content-Type: {r.headers.get('content-type')}")
