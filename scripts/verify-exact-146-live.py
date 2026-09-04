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

count_cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \'EN STOCK (Ajouter au Panier)\' as type, count(*) FROM \\"Product\\" WHERE \\"inStock\\" = true UNION ALL SELECT \'SUR COMMANDE (Demander / En bas)\', count(*) FROM \\"Product\\" WHERE \\"inStock\\" = false;"'
stdin, stdout, stderr = client.exec_command(count_cmd)
print("=" * 60)
print("EXACT STOCK METRICS ON PRODUCTION")
print("=" * 60)
print(stdout.read().decode())

ctx = urllib.request.ssl._create_unverified_context()

test_products = [
    ("En Stock: Thunder Gainer 5.4kg", "https://paratunisie.com/produits/thunder-gainer-5-4kg-challenger-nutrition"),
    ("En Stock: Big Whey 2kg", "https://paratunisie.com/produits/big-whey-2kg-big-ramy-labs"),
    ("En Stock: Serious Mass 5.45kg", "https://paratunisie.com/produits/serious-mass-5-45-kg-optimum-nutrition"),
    ("En Stock: Creatine OstroVit", "https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr"),
    ("Sur Commande: Animal Cuts (Rupture/Sur demande)", "https://paratunisie.com/produits/animal-cuts-42-doses"),
    ("Sur Commande: Rameur Assis", "https://paratunisie.com/produits/rameur-assis-musculation"),
]

print("=" * 60)
print("TESTING LIVE PDP EN STOCK VS SUR COMMANDE")
print("=" * 60)

for label, url in test_products:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
            code = res.getcode()
            body = res.read().decode(errors="replace")
            has_en_stock = "En stock" in body
            has_ajouter = "Ajouter au panier" in body
            has_demander = "Demander ce produit" in body or "○ Sur commande" in body
            print(f"✓ [{code}] {label} -> {url}")
            print(f"    En stock: {has_en_stock} | Ajouter au panier: {has_ajouter} | Demander: {has_demander}")
    except Exception as e:
        print(f"✗ [ERR] {label} -> {url}: {e}")

client.close()
