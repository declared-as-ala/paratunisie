import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://paratunisie.com/pack-anti-stress"
req = urllib.request.Request(
    url,
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
        code = response.getcode()
        html = response.read().decode('utf-8', errors='replace')
        print(f"Status: {code}")
        print(f"Contains 'PACK ANTI-STRESS': {'PACK ANTI-STRESS' in html}")
        print(f"Contains 'Ce pack est indisponible': {'Ce pack est indisponible' in html}")
        print(f"Contains '159 DT': {'159 DT' in html}")
        print(f"Contains 'pack-anti-stress.mp4': {'pack-anti-stress.mp4' in html}")
        print(f"Contains 'pack-anti-stress.jpg': {'pack-anti-stress.jpg' in html}")
except Exception as e:
    print(f"Error: {e}")

