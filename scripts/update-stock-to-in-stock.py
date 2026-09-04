import sys
import paramiko
import urllib.request
import json

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

# 1. Update all products that have valid price to inStock = true and stock = 10
sql = """
BEGIN;

-- Update ProductVariant stock to 10 for all purchasable variants with price > 0
UPDATE "ProductVariant"
SET stock = 10
WHERE "priceMillimes" > 0;

-- Update Product inStock and totalStock accordingly
UPDATE "Product" p
SET 
    "totalStock" = COALESCE((SELECT SUM(pv.stock) FROM "ProductVariant" pv WHERE pv."productId" = p.id), 0),
    "inStock" = CASE WHEN COALESCE((SELECT SUM(pv.stock) FROM "ProductVariant" pv WHERE pv."productId" = p.id), 0) > 0 THEN true ELSE false END;

COMMIT;
"""

print("1. Updating stock status in PostgreSQL...")
run(f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << 'EOF'\n{sql}\nEOF")

# 2. Check updated counts
count_sql = """
SELECT 'Product Total' as metric, count(*) FROM "Product"
UNION ALL SELECT 'Product IN_STOCK (En Stock / Ajouter au Panier)', count(*) FROM "Product" WHERE "inStock" = true
UNION ALL SELECT 'Product SUR_COMMANDE (Demander)', count(*) FROM "Product" WHERE "inStock" = false;
"""
print("2. Verifying database counts...")
run(f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c '{count_sql}'")

# 3. Resync MeiliSearch Index
print("3. Syncing MeiliSearch index...")
sync_node_script = """
const { PrismaClient } = require("@prisma/client");
const { Meilisearch } = require("meilisearch");
const prisma = new PrismaClient();
const meili = new Meilisearch({ host: "http://paratunisie-meilisearch:7700", apiKey: process.env.MEILI_API_KEY });
async function sync() {
    const index = meili.index("products");
    const products = await prisma.product.findMany({
        where: { publishState: "PUBLISHED" },
        include: { brand: true, category: true, variants: true }
    });
    const docs = products.map(p => ({
        id: p.id,
        name: p.name,
        brandName: p.brand?.name || "",
        brandSlug: p.brand?.slug || "",
        categoryName: p.category?.name || "",
        categorySlug: p.category?.slug || "",
        description: p.description || "",
        benefit: p.benefit || "",
        publishState: p.publishState,
        inStock: p.inStock
    }));
    for (let i = 0; i < docs.length; i += 500) {
        await index.addDocuments(docs.slice(i, i + 500));
    }
    console.log(`Synced ${docs.length} products to MeiliSearch.`);
}
sync().catch(console.error);
"""
run(f"docker exec -i paratunisie-api node << 'EOF'\n{sync_node_script}\nEOF")

# 4. Verify Live PDP for Nitro Tech Ripped & other sample products
print("\n" + "=" * 60)
print("TESTING LIVE PDP EN STOCK STATUS")
print("=" * 60)

ctx = urllib.request.ssl._create_unverified_context()
test_urls = [
    ("Nitro Tech Ripped", "https://paratunisie.com/produits/nitro-tech-ripped-1-8-kg-muscletech"),
    ("Animal Cuts", "https://paratunisie.com/produits/animal-cuts-42-doses"),
    ("Carlson Zinc", "https://paratunisie.com/produits/carlson-zinc-250-comprimes"),
    ("Creatine OstroVit", "https://paratunisie.com/produits/creatine-monohydrate-ostrovit-500gr")
]

for label, url in test_urls:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as res:
            code = res.getcode()
            body = res.read().decode(errors="replace")
            has_en_stock = "En stock" in body
            has_ajouter_panier = "Ajouter au panier" in body
            print(f"✓ [{code}] {label} -> {url} (En stock: {has_en_stock}, Ajouter au panier: {has_ajouter_panier})")
    except Exception as e:
        print(f"✗ [ERR] {label} -> {url}: {e}")

client.close()
