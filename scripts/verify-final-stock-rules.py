import sys
import paramiko
import urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

# 1. Check exact counts
count_cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \'IN STOCK (Ajouter au Panier)\' as type, count(*) FROM \\"Product\\" WHERE \\"inStock\\" = true UNION ALL SELECT \'OUT OF STOCK (Sur Commande / Devis)\', count(*) FROM \\"Product\\" WHERE \\"inStock\\" = false;"'
stdin, stdout, stderr = client.exec_command(count_cmd)
print("=" * 60)
print("FINAL STOCK BREAKDOWN IN DATABASE")
print("=" * 60)
print(stdout.read().decode())

# 2. Fetch sample slugs
stdin, stdout, stderr = client.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT slug, name FROM \\"Product\\" WHERE \\"inStock\\" = true LIMIT 2; SELECT slug, name FROM \\"Product\\" WHERE \\"inStock\\" = false LIMIT 2;"')
lines = stdout.read().decode().strip().splitlines()

ctx = urllib.request.ssl._create_unverified_context()

print("=" * 60)
print("TESTING LIVE PAGES")
print("=" * 60)

for line in lines:
    parts = line.split('|')
    if len(parts) >= 2:
        slug = parts[0]
        name = parts[1]
        url = f"https://paratunisie.com/produits/{slug}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        try:
            with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
                code = res.getcode()
                body = res.read().decode(errors="replace")
                has_en_stock = "En stock" in body
                has_ajouter = "Ajouter au panier" in body
                has_demander = "Demander" in body
                print(f"✓ [{code}] {name} -> {url}")
                print(f"    En stock: {has_en_stock} | Ajouter au panier: {has_ajouter} | Demander: {has_demander}")
        except Exception as e:
            print(f"✗ [ERR] {url}: {e}")

client.close()
