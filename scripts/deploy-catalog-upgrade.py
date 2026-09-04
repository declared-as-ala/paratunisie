import sys
import time
import urllib.request
import urllib.error
import json
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def run(cmd):
    print("=" * 60)
    print(f"COMMAND: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    print(out)
    if err:
        print("[STDERR]", err)
    return out

# Step 1: Git pull on VPS
print("1. Pulling latest code from origin/main...")
run("cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main")

# Step 2: Build & restart containers
print("2. Building & restarting containers (API, Admin, Web)...")
run("cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml build paratunisie-api paratunisie-admin paratunisie-web")
run("cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml up -d")

# Step 3: Ensure network connections to proxy
print("3. Connecting containers to proxy network...")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-web || true")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-api || true")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-admin || true")

time.sleep(6)

print("\n" + "=" * 60)
print("VERIFYING LIVE PRODUCTION ENDPOINTS")
print("=" * 60)

ctx = urllib.request.ssl._create_unverified_context()

test_urls = [
    ("Accueil", "https://paratunisie.com/"),
    ("Shop / Boutique", "https://paratunisie.com/shop"),
    ("Catégorie Créatine", "https://paratunisie.com/shop?category=creatine"),
    ("Catégorie Whey", "https://paratunisie.com/shop?category=whey-proteine"),
    ("Catégorie Vitamines", "https://paratunisie.com/shop?category=vitamines"),
    ("Produit En Stock (OstroVit)", "https://paratunisie.com/produits/creatine-monohydrate-pure-300g-ostrovit"),
    ("Produit Sur Commande", "https://paratunisie.com/produits/anabolic-mass-3-kg-kevin-levrone"),
    ("API Produits", "https://paratunisie.com/api/v1/catalogue/products?limit=5"),
    ("API Demandes (Public)", "https://paratunisie.com/api/v1/product-requests"),
]

for label, url in test_urls:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            code = response.getcode()
            print(f"✓ [{code}] {label} -> {url}")
    except urllib.error.HTTPError as e:
        print(f"✗ [{e.code}] {label} -> {url}")
    except Exception as e:
        print(f"✗ [ERR] {label} -> {url}: {e}")

client.close()
