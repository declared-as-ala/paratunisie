import urllib.request
import json
import ssl
import http.cookiejar
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), urllib.request.HTTPSHandler(context=ctx))

# 1. Simuler un client sur le site qui ouvre le modal et tape son nom et ville (sans encore valider)
print("=== 1. Simuler la saisie d'un prospect (Modal Acheter Maintenant) ===")
draft_payload = {
    "checkoutSessionId": "lead-test-browser-999",
    "source": "BUY_NOW_MODAL",
    "customerName": "Mohamed Trabelsi",
    "phone": "55998877",
    "gouvernorat": "Sousse",
    "fullAddress": "Khezama Ouest, Sousse",
    "deliveryNote": "Livraison après 14h",
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

req = urllib.request.Request(
    "https://paratunisie.com/api/v1/abandoned-checkouts/draft",
    data=json.dumps(draft_payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
with opener.open(req) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    print("✓ Réponse auto-save brouillon prospect:", res)

# 2. Login Admin
print("\n=== 2. Connexion Admin & Vérification dans 'Abandonnées' ===")
login_req = urllib.request.Request(
    "https://paratunisie.com/api/v1/admin-auth/login",
    data=json.dumps({"email": "admin@paratunisie.tn", "password": "ParaTunisie2026!"}).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
opener.open(login_req)

# 3. Récupérer la liste des commandes abandonnées dans l'Admin
abandoned_req = urllib.request.Request("https://paratunisie.com/api/v1/abandoned-checkouts", headers={"Accept": "application/json"})
with opener.open(abandoned_req) as resp:
    leads = json.loads(resp.read().decode("utf-8"))
    print(f"✓ {len(leads)} prospect(s) trouvé(s) dans l'onglet 'Abandonnées' de l'Admin :")
    for lead in leads:
        print(f"  • Nom: {lead.get('customerName')} | Tél: {lead.get('phone')} | Ville: {lead.get('gouvernorat')} | Total: {lead.get('totalMillimes')/1000} DT | Statut: {lead.get('status')}")

# 4. Vérifier les counts dynamiques
counts_req = urllib.request.Request("https://paratunisie.com/api/v1/orders/counts", headers={"Accept": "application/json"})
with opener.open(counts_req) as resp:
    counts = json.loads(resp.read().decode("utf-8"))
    print(f"\n✓ Compteurs Admin actualisés : Total = {counts['total']}, Normal = {counts['normal']}, Abandonnées = {counts['abandoned']}")
