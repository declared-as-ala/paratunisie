import time
import json
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8'), stderr.read().decode('utf-8')

# 1. Check if Real Pharm brand exists, or create it
out, _ = run_cmd('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug FROM \\"Brand\\" WHERE slug = \'real-pharm\' OR name ILIKE \'%Real Pharm%\';"')
brand_id = None
if out.strip():
    brand_id = out.strip().split('|')[0]
    print(f"Found existing brand Real Pharm ID: {brand_id}")
else:
    ts = int(time.time() * 1000)
    brand_id = f"c{ts:x}brandrp"[:25]
    run_cmd(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "INSERT INTO \\"Brand\\" (id, name, slug, \\"updatedAt\\") VALUES (\'{brand_id}\', \'Real Pharm\', \'real-pharm\', NOW()) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id;"')
    print(f"Created/Upserted brand Real Pharm ID: {brand_id}")

# 2. Get category Créatine ID
out, _ = run_cmd('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id FROM \\"Category\\" WHERE slug = \'creatine\';"')
cat_id = out.strip()
print(f"Category Créatine ID: {cat_id}")

# 3. Prepare product data
product_slug = "creatine-monohydrate-150gr-real-pharm"
product_name = "Créatine Monohydrate 150g - Real Pharm"
product_benefit = "Créatine monohydrate pure de qualité pharmaceutique pour booster la force explosive et le volume musculaire."
product_desc = """Découvrez la **Créatine Monohydrate 150g** de la marque **Real Pharm** sur ParaTunisie.

### Points Forts
- **Pureté Maximale** : 100% créatine monohydrate micronisée pour une dissolution parfaite et une absorption rapide.
- **Gain de Force & Puissance** : Améliore les capacités physiques lors de séries successives d'exercices très intenses et de courte durée.
- **Volume & Récupération** : Favorise la volumisation cellulaire et accélère la resynthèse de l'ATP entre les séries.
- **Format Pratique** : 150g idéal pour une cure d'un mois à dosage optimal.

### Conseils d'Utilisation
Mélangez 1 dose (5g) dans 200 à 250 ml d'eau ou de jus de fruits. Consommez de préférence 30 minutes avant l'entraînement ou immédiatement après l'effort avec une source de glucides simples.

### Composition
100% Créatine monohydrate pure, sans sucre ni additifs superflus.
"""
product_usage = "Prendre 5g par jour mélangés dans de l'eau ou du jus, idéalement autour de l'entraînement."
product_image = "https://admin.protein.tn/storage/produits/February2026/gtKdsfqVL9xlxfcE9sxI.webp"
seo_title = "Créatine Monohydrate 150g Real Pharm en Tunisie | ParaTunisie"
seo_desc = "Achetez la Créatine Monohydrate 150g Real Pharm au meilleur prix en Tunisie. Pureté maximale pour force et masse musculaire. Livraison 24-48h."
seo_h1 = "Real Pharm - Créatine Monohydrate 150g"

ts = int(time.time() * 1000)
prod_id = f"c{ts:x}prodcrearp"[:25]
var_id = f"c{ts:x}varcrearp"[:25]
img_id = f"c{ts:x}imgcrearp"[:25]
price_millimes = 59000  # 59 DT
sku = "462"

sql = f"""
BEGIN;

-- Check if exists by slug, update or insert
INSERT INTO "Product" (
    id, slug, name, benefit, description, usage, image, "brandId", "categoryId",
    "seoTitle", "seoDescription", "seoH1", "publishState", "inStock", "totalStock",
    "createdAt", "updatedAt"
)
VALUES (
    '{prod_id}', '{product_slug}', '{product_name}', '{product_benefit.replace("'", "''")}',
    '{product_desc.replace("'", "''")}', '{product_usage.replace("'", "''")}', '{product_image}',
    '{brand_id}', '{cat_id}', '{seo_title.replace("'", "''")}', '{seo_desc.replace("'", "''")}',
    '{seo_h1.replace("'", "''")}', 'PUBLISHED', true, 10, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    benefit = EXCLUDED.benefit,
    description = EXCLUDED.description,
    usage = EXCLUDED.usage,
    image = EXCLUDED.image,
    "brandId" = EXCLUDED."brandId",
    "categoryId" = EXCLUDED."categoryId",
    "seoTitle" = EXCLUDED."seoTitle",
    "seoDescription" = EXCLUDED."seoDescription",
    "seoH1" = EXCLUDED."seoH1",
    "publishState" = 'PUBLISHED',
    "inStock" = true,
    "totalStock" = 10,
    "updatedAt" = NOW();

-- Upsert variant
INSERT INTO "ProductVariant" (id, "productId", label, "priceMillimes", sku, stock)
SELECT '{var_id}', id, '150 g', {price_millimes}, '{sku}', 10
FROM "Product" WHERE slug = '{product_slug}'
ON CONFLICT DO NOTHING;

-- Upsert image
INSERT INTO "ProductImage" (id, "productId", url, position)
SELECT '{img_id}', id, '{product_image}', 0
FROM "Product" WHERE slug = '{product_slug}'
ON CONFLICT DO NOTHING;

COMMIT;
"""

sftp = client.open_sftp()
with sftp.open("/tmp/insert_real_pharm_creatine.sql", "w") as f:
    f.write(sql)
sftp.close()

out, err = run_cmd("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/insert_real_pharm_creatine.sql")
print("PostgreSQL output:", out)
if err:
    print("PostgreSQL err:", err)

# Sync MeiliSearch
print("Syncing MeiliSearch index...")
sync_node_script = f"""
const {{ PrismaClient }} = require("@prisma/client");
const {{ Meilisearch }} = require("meilisearch");
const prisma = new PrismaClient();
const meili = new Meilisearch({{ host: "http://paratunisie-meilisearch:7700", apiKey: process.env.MEILI_API_KEY }});
async function sync() {{
    const p = await prisma.product.findUnique({{
        where: {{ slug: "{product_slug}" }},
        include: {{ brand: true, category: true, variants: true }}
    }});
    if (p) {{
        const index = meili.index("products");
        await index.addDocuments([{{
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
        }}]);
        console.log("Successfully synced " + p.name + " to MeiliSearch.");
    }}
}}
sync().catch(console.error);
"""
out, _ = run_cmd(f"docker exec -i paratunisie-api node << 'EOF'\n{sync_node_script}\nEOF")
print("MeiliSearch output:", out)

client.close()
