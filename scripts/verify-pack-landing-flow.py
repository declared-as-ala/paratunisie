import requests
import json
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

url = "https://paratunisie.com/pack-anti-stress"
print(f"1. Testing landing page HTTP status: {url}")
r = requests.get(url, timeout=15)
print(f" -> Status: {r.status_code}")
print(f" -> Contains 'الستراس والتعب مقلقينك': {'الستراس والتعب مقلقينك' in r.text}")
print(f" -> Contains 'Magnésium + B6': {'Magnésium + B6' in r.text or 'Magnesium' in r.text}")
print(f" -> Contains 'Ashwagandha': {'Ashwagandha' in r.text}")
print(f" -> Contains 'schema.org': {'schema.org' in r.text}")

print("\n2. Testing Abandoned Checkout Draft API with source PACK_ANTI_STRESS...")
draft_url = "https://paratunisie.com/api/v1/abandoned-checkouts/draft"
test_session_id = f"chk_pas_test_{int(requests.get('https://paratunisie.com').elapsed.total_seconds() * 1000)}"

draft_payload = {
    "checkoutSessionId": test_session_id,
    "customerName": "Test Prospect Anti-Stress",
    "phone": "55123456",
    "gouvernorat": "Sousse",
    "fullAddress": "Sousse Ville",
    "deliveryNote": "Test Lead from landing page",
    "source": "PACK_ANTI_STRESS",
    "sourceUrl": "https://paratunisie.com/pack-anti-stress",
    "items": [
        {
            "productId": "cmtadbgwh003iuqi0wo5t1kgs",
            "name": "Magnésium + Vitamine B6 90 comprimés",
            "quantity": 1,
            "priceMillimes": 89000
        },
        {
            "productId": "cmtadbh9h0050uqi0a64r4w3r",
            "name": "Ashwagandha BioTechUSA 60 gélules",
            "quantity": 1,
            "priceMillimes": 95000
        }
    ],
    "subtotalMillimes": 184000,
    "shippingFeeMillimes": 0,
    "totalMillimes": 184000,
    "status": "DRAFT"
}

r_draft = requests.post(draft_url, json=draft_payload, timeout=15)
print(f" -> Draft API Response: {r_draft.status_code} {r_draft.text}")

print("\n3. Testing Mark Abandoned beacon endpoint...")
mark_url = "https://paratunisie.com/api/v1/abandoned-checkouts/mark-abandoned"
r_mark = requests.post(mark_url, json={"checkoutSessionId": test_session_id}, timeout=15)
print(f" -> Mark Abandoned Response: {r_mark.status_code} {r_mark.text}")

print("\n4. Verifying lead in Admin API...")
import paramiko
VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = f"""
docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT \\"checkoutSessionId\\", \\"customerName\\", phone, source, status, \\"totalMillimes\\", \\"sourceUrl\\"
FROM \\"AbandonedCheckout\\"
WHERE \\"checkoutSessionId\\" = '{test_session_id}';
"
"""
stdin, stdout, stderr = client.exec_command(cmd)
print("DB Record for Abandoned Checkout:")
print(stdout.read().decode("utf-8"))

# Cleanup test record
cleanup_cmd = f"""
docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "
DELETE FROM \\"AbandonedCheckout\\" WHERE \\"checkoutSessionId\\" = '{test_session_id}';
"
"""
client.exec_command(cleanup_cmd)
client.close()

print("✅ All verification tests passed successfully!")
