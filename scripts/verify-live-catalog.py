import json
import sys
import urllib.request
import urllib.error
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

# 1. Fetch sample slugs from DB
stdin, stdout, stderr = client.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT slug, name, \\"inStock\\", id FROM \\"Product\\" WHERE \\"inStock\\" = true LIMIT 3; SELECT slug, name, \\"inStock\\", id FROM \\"Product\\" WHERE \\"inStock\\" = false LIMIT 3;"')
lines = stdout.read().decode('utf-8').strip().splitlines()

in_stock_samples = []
sur_commande_samples = []

for line in lines:
    parts = line.split('|')
    if len(parts) >= 4:
        item = {'slug': parts[0], 'name': parts[1], 'inStock': parts[2] == 't', 'id': parts[3]}
        if item['inStock']:
            in_stock_samples.append(item)
        else:
            sur_commande_samples.append(item)

print("=" * 60)
print("SAMPLE PRODUCTS FROM DATABASE")
print("=" * 60)
print(f"IN STOCK (Preserved): {in_stock_samples}")
print(f"SUR COMMANDE (New): {sur_commande_samples}")

ctx = urllib.request.ssl._create_unverified_context()

# 2. Test Live HTTP requests for these PDPs
print("\n" + "=" * 60)
print("TESTING LIVE PDP URLs")
print("=" * 60)

for p in in_stock_samples + sur_commande_samples:
    url = f"https://paratunisie.com/produits/{p['slug']}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
            code = res.getcode()
            body = res.read().decode(errors="replace")
            print(f"✓ [{code}] ({'EN STOCK' if p['inStock'] else 'SUR COMMANDE'}) {url}")
    except Exception as e:
        print(f"✗ [ERR] {url}: {e}")

# 3. Test API POST /product-requests
if sur_commande_samples:
    test_prod = sur_commande_samples[0]
    print("\n" + "=" * 60)
    print("TESTING PUBLIC POST /api/v1/product-requests")
    print("=" * 60)

    post_url = "https://paratunisie.com/api/v1/product-requests"
    payload = {
        "productId": test_prod['id'],
        "fullName": "Test Client Verification",
        "phone": "98123456",
        "email": "test@paratunisie.com",
        "quantity": 2,
        "message": "Demande de test automatique pour verification du workflow."
    }
    
    post_req = urllib.request.Request(
        post_url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(post_req, timeout=15, context=ctx) as res:
            code = res.getcode()
            resp_body = res.read().decode('utf-8')
            print(f"✓ [{code}] POST /api/v1/product-requests success! Response:")
            print(resp_body)
    except Exception as e:
        print(f"✗ [ERR] POST /api/v1/product-requests: {e}")

# 4. Verify in DB that the request was stored
stdin, stdout, stderr = client.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT id, \\"fullName\\", phone, status, \\"createdAt\\" FROM \\"ProductRequest\\" ORDER BY \\"createdAt\\" DESC LIMIT 3;"')
print("\n" + "=" * 60)
print("STORED PRODUCT REQUESTS IN DATABASE")
print("=" * 60)
print(stdout.read().decode('utf-8'))

client.close()
