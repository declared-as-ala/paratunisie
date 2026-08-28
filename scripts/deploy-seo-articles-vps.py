import sys
import time
import urllib.request
import urllib.error
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
run("cd /opt/paratunisie/app && git fetch origin && git reset --hard origin/main")

# Step 2: Seed articles in production database
run("docker exec -i paratunisie-api node prisma/seed-articles.js || true")

# Step 3: Build & restart containers
run("cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml build paratunisie-web paratunisie-api paratunisie-admin")
run("cd /opt/paratunisie/app && docker compose -f docker-compose.prod.yml up -d")

# Step 4: Ensure network connections to proxy
run("docker network connect sobitas-full-project_sobitas-net paratunisie-web || true")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-api || true")
run("docker network connect sobitas-full-project_sobitas-net paratunisie-admin || true")

time.sleep(5)

# Step 5: Test live URLs
article_slugs = [
    "meilleure-creatine-tunisie",
    "creatine-monohydrate-bienfaits-dosage",
    "creatine-avant-ou-apres-entrainement",
    "whey-protein-tunisie-guide",
    "whey-ou-gainer-prise-de-masse",
    "prise-de-masse-tunisie-guide",
    "meilleur-pre-workout-tunisie",
    "pre-workout-ou-creatine",
    "bcaa-ou-eaa",
    "citrulline-arginine-beta-alanine",
    "ashwagandha-tunisie-guide",
    "quand-prendre-ashwagandha",
    "vitamine-d3-k2-tunisie",
    "zinc-sportif-musculation",
    "omega-3-tunisie-guide",
    "multivitamines-sportifs",
    "l-carnitine-perte-graisse",
    "bruleur-de-graisse-tunisie",
    "complements-musculation-debutant",
    "complements-avant-pendant-apres-entrainement",
]

print("\n" + "=" * 60)
print("VERIFYING 20 LIVE ARTICLE URLS ON PARATUNISIE.COM")
print("=" * 60)

ctx = urllib.request.ssl._create_unverified_context()
success_count = 0

for slug in article_slugs:
    url = f"https://paratunisie.com/conseils/{slug}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            code = response.getcode()
            body = response.read().decode(errors="replace")
            has_h1 = "<h1" in body
            has_schema = "schema.org" in body
            print(f"✓ [{code}] {url} (H1: {has_h1}, Schema: {has_schema})")
            if code == 200:
                success_count += 1
    except urllib.error.HTTPError as e:
        print(f"✗ [{e.code}] {url}")
    except Exception as e:
        print(f"✗ [ERR] {url}: {e}")

print(f"\nResult: {success_count}/{len(article_slugs)} articles returning HTTP 200 OK!")

client.close()
