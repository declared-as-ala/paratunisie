import requests
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

url = "https://paratunisie.com/pack-anti-stress"
r = requests.get(url, timeout=15)
print("HTTP Status:", r.status_code)
print("Contains new phone 97991266 / +216 97 991 266:", "97991266" in r.text or "97 991 266" in r.text)
print("Contains old phone 27612500:", "27612500" in r.text or "27 612 500" in r.text)
print("Contains old hero showcase text:", "PACK ANTI-STRESS COMPLET" in r.text)
print("Contains trust badges:", "100% Authentiques" in r.text or "Produits Originaux" in r.text)
print("Contains 3 offer cards:", "عروض الشراء المتاحة" in r.text)
