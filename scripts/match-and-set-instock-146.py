import json
import re
import unicodedata
import paramiko

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().strip()
    text = re.sub(r'(\d+)\s*,\s*(\d+)', r'\1.\2', text)
    text = re.sub(r'(\d+(?:\.\d+)?)\s*k(?:g|ilo|ilos)?\b', lambda m: f"{int(float(m.group(1))*1000)}g", text)
    text = re.sub(r'(\d+)\s*gr?\b', r'\1g', text)
    text = re.sub(r'(\d+)\s*tabs?\b', r'\1tabs', text)
    text = re.sub(r'(\d+)\s*gelules?\b', r'\1gelules', text)
    text = re.sub(r'(\d+)\s*caps(?:ules?)?\b', r'\1caps', text)
    text = re.sub(r'(\d+)\s*servings?\b', r'\1servings', text)
    text = re.sub(r'[^a-z0-9]+', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

# Load 147 in-stock products from protein.tn
with open("scripts/exact_146_in_stock_products.json", "r", encoding="utf-8") as f:
    pt_instock = json.load(f)

# Fetch all DB products
stdin, stdout, stderr = client.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug, name FROM \\"Product\\";"')
lines = stdout.read().decode('utf-8').strip().splitlines()

db_prods = []
for line in lines:
    parts = line.split('|')
    if len(parts) >= 3:
        db_prods.append({
            'id': parts[0],
            'slug': parts[1],
            'name': parts[2],
            'norm': normalize_text(parts[2])
        })

db_by_slug = {p['slug']: p for p in db_prods}
db_by_norm = {p['norm']: p for p in db_prods}

matched_ids = set()

for item in pt_instock:
    slug = item['slug']
    title = item['title']
    norm = normalize_text(title)

    # 1. Exact slug match
    if slug in db_by_slug:
        matched_ids.add(db_by_slug[slug]['id'])
        continue

    # 2. Exact normalized title match
    if norm in db_by_norm:
        matched_ids.add(db_by_norm[norm]['id'])
        continue

    # 3. Fuzzy match
    tokens = set(norm.split())
    best_match = None
    best_score = 0
    for p in db_prods:
        p_tokens = set(p['norm'].split())
        if tokens and p_tokens:
            overlap = tokens.intersection(p_tokens)
            score = len(overlap) / max(len(tokens), len(p_tokens))
            if score > best_score:
                best_score = score
                best_match = p

    if best_match and best_score >= 0.70:
        matched_ids.add(best_match['id'])

print(f"Matched {len(matched_ids)} out of {len(pt_instock)} protein.tn in-stock products in ParaTunisie DB.")

# Generate SQL script
matched_ids_list = ",".join([f"'{i}'" for i in matched_ids])

sql = f"""
BEGIN;

-- 1. Reset all products to SUR COMMANDE
UPDATE "ProductVariant" SET stock = 0;
UPDATE "Product" SET "inStock" = false, "totalStock" = 0;

-- 2. Set the exact matched protein.tn in-stock products to IN STOCK
UPDATE "ProductVariant"
SET stock = 10
WHERE "productId" IN ({matched_ids_list});

UPDATE "Product"
SET "inStock" = true, "totalStock" = 10
WHERE id IN ({matched_ids_list});

-- 3. Set the 51 original ParaTunisie products to IN STOCK
UPDATE "ProductVariant" SET stock = 20 WHERE id LIKE 'v%' OR id LIKE 'cm%';
UPDATE "Product" SET "inStock" = true, "totalStock" = 20 WHERE id IN (SELECT "productId" FROM "ProductVariant" WHERE id LIKE 'v%' OR id LIKE 'cm%');

COMMIT;
"""

sftp = client.open_sftp()
with sftp.open("/tmp/set_instock_exact_146.sql", "w") as f:
    f.write(sql)
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/set_instock_exact_146.sql")
print("PostgreSQL:", stdout.read().decode())

# Check exact counts
count_cmd = 'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \'EN STOCK (Ajouter au Panier)\' as type, count(*) FROM \\"Product\\" WHERE \\"inStock\\" = true UNION ALL SELECT \'SUR COMMANDE (Demander / En bas)\', count(*) FROM \\"Product\\" WHERE \\"inStock\\" = false;"'
stdin, stdout, stderr = client.exec_command(count_cmd)
print("=" * 60)
print("FINAL PRECISE STOCK BREAKDOWN")
print("=" * 60)
print(stdout.read().decode())

# Sync MeiliSearch Index
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
client.exec_command(f"docker exec -i paratunisie-api node << 'EOF'\n{sync_node_script}\nEOF")
print("✓ MeiliSearch resynced.")

client.close()
