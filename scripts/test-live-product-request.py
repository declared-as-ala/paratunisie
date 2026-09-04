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

# Récupérer un vrai ID produit du catalogue
req_prod = urllib.request.Request("https://paratunisie.com/api/v1/catalogue/products?limit=1")
with opener.open(req_prod) as resp:
    prods = json.loads(resp.read().decode("utf-8"))
    prod = prods["data"][0]
    prod_id = prod["id"]
    prod_name = prod["name"]
    print(f"Produit test: {prod_name} (ID: {prod_id})")

# Test Demande Produit
demande_payload = {
    "productId": prod_id,
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

with opener.open(req_demande) as resp:
    res_demande = json.loads(resp.read().decode("utf-8"))
    print("✓ Demande produit enregistrée avec succès :", res_demande.get("id"), "-", res_demande.get("product", {}).get("name"))
