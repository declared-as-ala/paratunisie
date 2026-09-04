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

opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

# 1. Test Demande Produit
print("=== 1. Test Demande Produit avec notification Email ===")
demande_payload = {
    "productId": "p01",
    "fullName": "Karim Ben Salah",
    "phone": "21987654",
    "email": "karim.test@gmail.com",
    "quantity": 2,
    "message": "Merci de me contacter dès que vous recevez du nouveau stock !",
}

req_demande = urllib.request.Request(
    "https://paratunisie.com/api/v1/product-requests",
    data=json.dumps(demande_payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)

try:
    with opener.open(req_demande) as resp:
        res_demande = json.loads(resp.read().decode("utf-8"))
        print("✓ Demande produit enregistrée et email admin envoyé :", res_demande.get("id"), "-", res_demande.get("product", {}).get("name"))
except Exception as e:
    print("Erreur demande:", e)

# 2. Test Panier Abandonné avec notification Email
print("\n=== 2. Test Panier Abandonné avec notification Email ===")
draft_payload = {
    "checkoutSessionId": f"lead-email-test-{int(sys.float_info.max % 100000)}",
    "source": "BUY_NOW_MODAL",
    "customerName": "Sonia Mansouri",
    "phone": "98112233",
    "email": "sonia.mansouri@gmail.com",
    "gouvernorat": "Ariana",
    "fullAddress": "Ennasr 2, Ariana",
    "items": [
        {
            "productId": "p01",
            "name": "Anthelios Fluide Invisible SPF50+ La Roche-Posay",
            "quantity": 1,
            "priceMillimes": 58000,
        }
    ],
    "subtotalMillimes": 58000,
    "shippingFeeMillimes": 10000,
    "totalMillimes": 68000,
}

req_draft = urllib.request.Request(
    "https://paratunisie.com/api/v1/abandoned-checkouts/draft",
    data=json.dumps(draft_payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)

try:
    with opener.open(req_draft) as resp:
        res_draft = json.loads(resp.read().decode("utf-8"))
        print("✓ Panier abandonné enregistré et email admin envoyé :", res_draft)
except Exception as e:
    print("Erreur draft:", e)
