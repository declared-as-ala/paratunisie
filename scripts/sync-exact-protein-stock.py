import json
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

with open("scripts/protein_catalog_cache.json", "r", encoding="utf-8") as f:
    products = json.load(f)

out_of_stock_slugs = []
in_stock_slugs = []

for p in products:
    slug = p['slug']
    if p.get('stockStatus') == 'OUT_OF_STOCK' or p.get('priceTnd', 0) == 0:
        out_of_stock_slugs.append(slug.replace("'", "''"))
    else:
        in_stock_slugs.append(slug.replace("'", "''"))

print(f"Total In-Stock Products to set: {len(in_stock_slugs)}")
print(f"Total Out-Of-Stock Products (Sur Commande / Rupture) to set: {len(out_of_stock_slugs)}")

# Generate SQL script
sql_lines = ["BEGIN;"]

# 1. Update In Stock products
sql_lines.append(f"""
-- Set in-stock products
UPDATE "ProductVariant"
SET stock = 10
WHERE "productId" IN (
    SELECT id FROM "Product" WHERE slug IN ({','.join([f"'{s}'" for s in in_stock_slugs[:1000]])})
);
""")

# Batch the slug IN clauses if needed or use a temporary table
# A cleaner and faster way:
# 1) Set all products to inStock = true where price > 0
# 2) Set the exact out_of_stock_slugs to inStock = false, stock = 0
out_of_stock_in_list = ",".join([f"'{s}'" for s in out_of_stock_slugs])

sql_script = f"""
BEGIN;

-- 1. By default, all products with price > 0 are IN STOCK (stock = 10, inStock = true)
UPDATE "ProductVariant"
SET stock = 10
WHERE "priceMillimes" > 0;

UPDATE "Product"
SET "inStock" = true, "totalStock" = 10
WHERE id IN (SELECT "productId" FROM "ProductVariant" WHERE "priceMillimes" > 0);

-- 2. Explicitly set OUT OF STOCK products from protein.tn to SUR COMMANDE (stock = 0, inStock = false)
UPDATE "ProductVariant"
SET stock = 0
WHERE "productId" IN (
    SELECT id FROM "Product" 
    WHERE slug IN ({out_of_stock_in_list}) OR "priceMillimes" = 0
);

UPDATE "Product"
SET "inStock" = false, "totalStock" = 0
WHERE slug IN ({out_of_stock_in_list}) 
   OR id NOT IN (SELECT "productId" FROM "ProductVariant" WHERE "priceMillimes" > 0 AND stock > 0);

-- 3. Ensure all 51 original ParaTunisie products remain IN STOCK
UPDATE "ProductVariant" SET stock = 20 WHERE id LIKE 'v%' OR id LIKE 'cm%';
UPDATE "Product" SET "inStock" = true, "totalStock" = 20 WHERE id IN (SELECT "productId" FROM "ProductVariant" WHERE id LIKE 'v%' OR id LIKE 'cm%');

COMMIT;
"""

print("Executing SQL on PostgreSQL...")
sftp = client.open_sftp()
with sftp.open("/tmp/sync_exact_stock.sql", "w") as f:
    f.write(sql_script)
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/sync_exact_stock.sql")
print("Postgres output:", stdout.read().decode())
err = stderr.read().decode()
if err:
    print("Postgres stderr:", err)

# Check results
count_sql = """
SELECT 'Product Total' as metric, count(*) FROM "Product"
UNION ALL SELECT 'Product IN_STOCK (En Stock -> Ajouter au Panier)', count(*) FROM "Product" WHERE "inStock" = true
UNION ALL SELECT 'Product SUR_COMMANDE (Rupture / Demande Devis -> En bas)', count(*) FROM "Product" WHERE "inStock" = false;
"""
stdin, stdout, stderr = client.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{count_sql}"')
print("=== UPDATED STOCK METRICS ===")
print(stdout.read().decode())

# Sync MeiliSearch
print("Resyncing MeiliSearch...")
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
stdin, stdout, stderr = client.exec_command(f"docker exec -i paratunisie-api node << 'EOF'\n{sync_node_script}\nEOF")
print(stdout.read().decode())

client.close()
