import urllib.request
import re

url = "https://paratunisie.com/conseils/whey-sans-lactose-tunisie"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req).read().decode("utf-8")

imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print("Total images on article page:", len(imgs))
for img in imgs:
    print("Image src:", img)
    full_url = img if img.startswith("http") else "https://paratunisie.com" + img
    try:
        r = urllib.request.urlopen(urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"}))
        print(f"  -> Status: {r.status}, Content-Type: {r.headers.get('Content-Type')}, Bytes: {len(r.read())}")
    except Exception as e:
        print(f"  -> Error fetching image: {e}")

# Check blog hub /conseils
url_hub = "https://paratunisie.com/conseils"
req_hub = urllib.request.Request(url_hub, headers={"User-Agent": "Mozilla/5.0"})
html_hub = urllib.request.urlopen(req_hub).read().decode("utf-8")
hub_imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html_hub)
print("\nTotal images on /conseils hub page:", len(hub_imgs))
for img in hub_imgs[:5]:
    print("Hub image src:", img)
    full_url = img if img.startswith("http") else "https://paratunisie.com" + img
    try:
        r = urllib.request.urlopen(urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"}))
        print(f"  -> Status: {r.status}, Content-Type: {r.headers.get('Content-Type')}, Bytes: {len(r.read())}")
    except Exception as e:
        print(f"  -> Error fetching hub image: {e}")
