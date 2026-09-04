import json
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

with open("scripts/exact_146_in_stock_products.json", "r", encoding="utf-8") as f:
    in_stock_items = json.load(f)

in_stock_slugs = [p['slug'].replace("'", "''") for p in in_stock_items]
print(f"Loaded {len(in_stock_slugs)} exact in-stock slugs from protein.tn.")

in_stock_slugs_sql = ",".join([f"'{s}'" for s in in_stock_slugs])

sql = f"""
BEGIN;

-- 1. First, set ALL products to Sur Commande (stock = 0, inStock = false)
UPDATE "ProductVariant"
SET stock = 0;

UPDATE "Product"
SET "inStock" = false, "totalStock" = 0;

-- 2. Set ONLY the exact in-stock products from protein.tn to IN STOCK (stock = 10, inStock = true)
UPDATE "ProductVariant"
SET stock = 10
WHERE "productId" IN (
    SELECT id FROM "Product" 
    WHERE slug IN ({in_stock_slugs_sql})
);

UPDATE "Product"
SET "inStock" = true, "totalStock" = 10
WHERE slug IN ({in_stock_slugs_sql});

-- 3. Ensure all 51 original ParaTunisie products are ALSO IN STOCK (stock = 20, inStock = true)
UPDATE "ProductVariant"
SET stock = 20
WHERE id LIKE 'v%' OR id LIKE 'cm%';

UPDATE "Product"
SET "inStock" = true, "totalStock" = 20
WHERE id IN (SELECT "productId" FROM "ProductVariant" WHERE id LIKE 'v%' OR id LIKE 'cm%');

COMMIT;
"""

print("Executing SQL updates on PostgreSQL container...")
sftp = client.open_sftp()
with sftp.open("/tmp/apply_exact_146_stock.sql", "w") as f:
    f.write(sql)
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/apply_exact_146_stock.sql")
print("PostgreSQL output:", stdout.read().decode())
err = stderr.read().decode()
if err:
    print("PostgreSQL stderr:", err)

# Audit exact numbers in database
count_sql = """
SELECT 'Produits EN STOCK (Ajouter au Panier / 1-Clic)' as metric, count(*) FROM "Product" WHERE "inStock" = true
UNION ALL SELECT 'Produits SUR COMMANDE (Demander / En bas)', count(*) FROM "Product" WHERE "inStock" = false
UNION ALL SELECT 'Total Catalogue', count(*) FROM "Product";
"""
stdin, stdout, stderr = client.exec_command(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{count_sql}"')
print("=" * 60)
print("FINAL EXACT PRODUCTION STOCK COUNTS")
print("=" * 60)
print(stdout.read().decode())

# Sync MeiliSearch Index
print("Syncing MeiliSearch index...")
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
