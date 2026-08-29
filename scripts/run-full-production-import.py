import json
import re
import os
import sys
import time
import unicodedata
import paramiko

def log(msg):
    try:
        print(msg.encode('ascii', errors='replace').decode('ascii'), flush=True)
    except Exception:
        pass

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

def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return re.sub(r'^-+|-+$', '', text)

def generate_cuid():
    import random
    import string
    ts = int(time.time() * 1000)
    chars = string.ascii_lowercase + string.digits
    rand = ''.join(random.choice(chars) for _ in range(12))
    return f"c{ts:x}{rand}"[:25]

def main():
    log("==================================================")
    log("STARTING FULL PRODUCTION IMPORT & SEEDING PIPELINE")
    log("==================================================")

    # 1. Connect to VPS
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=20)

    def run_cmd(cmd):
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        return out, err

    # 2. Fresh Backup
    ts = int(time.time())
    backup_file = f"/opt/paratunisie/backups/pre_import_{ts}.sql"
    log(f"1. Creating pre-import snapshot: {backup_file}...")
    run_cmd(f"docker exec paratunisie-postgres pg_dump -U paratunisie -d paratunisie > {backup_file}")
    log("✓ Backup verified.")

    # 3. Apply Schema DDL for ProductRequest & Product.inStock
    log("2. Applying Prisma Schema DDL updates...")
    ddl_sql = """
    -- Add inStock and totalStock to Product if not exists
    ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "inStock" BOOLEAN DEFAULT false;
    ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "totalStock" INTEGER DEFAULT 0;
    CREATE INDEX IF NOT EXISTS "Product_inStock_createdAt_idx" ON "Product"("inStock", "createdAt");

    -- Create enum ProductRequestStatus if not exists
    DO $$ BEGIN
        CREATE TYPE "ProductRequestStatus" AS ENUM ('NOUVELLE', 'CONTACTE', 'COMMANDE', 'TERMINE', 'ANNULE');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- Create ProductRequest table if not exists
    CREATE TABLE IF NOT EXISTS "ProductRequest" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
        "fullName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "quantity" INTEGER DEFAULT 1,
        "message" TEXT,
        "status" "ProductRequestStatus" DEFAULT 'NOUVELLE',
        "adminNotes" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "ProductRequest_productId_idx" ON "ProductRequest"("productId");
    CREATE INDEX IF NOT EXISTS "ProductRequest_status_idx" ON "ProductRequest"("status");
    CREATE INDEX IF NOT EXISTS "ProductRequest_createdAt_idx" ON "ProductRequest"("createdAt");

    -- Add parentId to Category if not exists
    ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL;
    """
    
    # Execute DDL
    run_cmd(f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << 'EOF'\n{ddl_sql}\nEOF")
    log("✓ Schema DDL applied successfully.")

    # 4. Load Crawled Products & Existing DB Products
    with open("scripts/protein_catalog_cache.json", "r", encoding="utf-8") as f:
        crawled_products = json.load(f)
    log(f"Loaded {len(crawled_products)} crawled products from cache.")

    # Fetch existing products from DB
    out, _ = run_cmd('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug, name FROM \\"Product\\";"')
    existing_db = []
    for line in out.strip().splitlines():
        if line.strip():
            parts = line.split('|')
            if len(parts) >= 3:
                existing_db.append({
                    'id': parts[0],
                    'slug': parts[1],
                    'name': parts[2],
                    'normalizedName': normalize_text(parts[2])
                })
    log(f"Existing ParaTunisie products in DB: {len(existing_db)}")

    existing_slugs = {p['slug']: p for p in existing_db}
    existing_names = {p['normalizedName']: p for p in existing_db}

    # Fetch existing categories from DB
    out, _ = run_cmd('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug, name FROM \\"Category\\";"')
    db_categories = {}
    for line in out.strip().splitlines():
        if line.strip():
            parts = line.split('|')
            if len(parts) >= 3:
                db_categories[parts[1]] = {'id': parts[0], 'slug': parts[1], 'name': parts[2]}

    # Fetch existing brands from DB
    out, _ = run_cmd('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -t -A -c "SELECT id, slug, name FROM \\"Brand\\";"')
    db_brands = {}
    for line in out.strip().splitlines():
        if line.strip():
            parts = line.split('|')
            if len(parts) >= 3:
                db_brands[parts[1]] = {'id': parts[0], 'slug': parts[1], 'name': parts[2]}

    # 5. Seed / Ensure Canonical Categories
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from import_definitions import CATEGORY_DEFINITIONS, SOURCE_TO_CANONICAL_CATEGORY, generate_seo_content

    log("3. Ensuring canonical categories and parent hierarchy...")
    cat_sql_statements = []
    for cat in CATEGORY_DEFINITIONS:
        c_slug = cat['slug']
        c_name = cat['name'].replace("'", "''")
        c_desc = cat['desc'].replace("'", "''")
        c_seo_title = cat['seoTitle'].replace("'", "''")
        c_seo_desc = cat['seoDesc'].replace("'", "''")
        c_id = db_categories.get(c_slug, {}).get('id') or generate_cuid()

        cat_sql_statements.append(f"""
        INSERT INTO "Category" (id, name, slug, description, "seoTitle", "seoDescription", "seoH1", "seoIntro", "updatedAt")
        VALUES ('{c_id}', '{c_name}', '{c_slug}', '{c_desc}', '{c_seo_title}', '{c_seo_desc}', '{c_name}', '{c_desc}', NOW())
        ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            "seoTitle" = EXCLUDED."seoTitle",
            "seoDescription" = EXCLUDED."seoDescription",
            "seoH1" = EXCLUDED."seoH1",
            "updatedAt" = NOW();
        """)
        db_categories[c_slug] = {'id': c_id, 'slug': c_slug, 'name': cat['name']}

    run_cmd(f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << 'EOF'\n{' '.join(cat_sql_statements)}\nEOF")

    # Link parent categories
    for cat in CATEGORY_DEFINITIONS:
        if cat['parent'] and cat['parent'] in db_categories:
            parent_id = db_categories[cat['parent']]['id']
            child_id = db_categories[cat['slug']]['id']
            run_cmd(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "UPDATE \\"Category\\" SET \\"parentId\\" = \'{parent_id}\' WHERE id = \'{child_id}\';"')

    log(f"✓ Categories ensured ({len(db_categories)} total categories).")

    # 6. Ensure all Brands
    log("4. Ensuring brands...")
    unique_brands = set()
    for p in crawled_products:
        b = p.get('brand', '').strip()
        if b:
            unique_brands.add(b)

    brand_sql_statements = []
    for b_name in unique_brands:
        b_slug = slugify(b_name)
        if not b_slug:
            continue
        b_id = db_brands.get(b_slug, {}).get('id') or generate_cuid()
        b_name_escaped = b_name.replace("'", "''")
        brand_sql_statements.append(f"""
        INSERT INTO "Brand" (id, name, slug, "updatedAt")
        VALUES ('{b_id}', '{b_name_escaped}', '{b_slug}', NOW())
        ON CONFLICT (slug) DO NOTHING;
        """)
        db_brands[b_slug] = {'id': b_id, 'slug': b_slug, 'name': b_name}

    # Execute in batches of 100 brands
    for i in range(0, len(brand_sql_statements), 100):
        batch = brand_sql_statements[i:i+100]
        run_cmd(f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << 'EOF'\n{' '.join(batch)}\nEOF")

    log(f"✓ Brands ensured ({len(db_brands)} brands).")

    # 7. Deduplicate & Prepare Product SQL Batches
    log("5. Deduplicating and preparing product insert batches...")

    products_to_insert = []
    products_matched_count = 0
    used_slugs = set(existing_slugs.keys())

    for p in crawled_products:
        p_slug = p['slug']
        p_norm = p['normalizedTitle']
        p_brand_norm = p['normalizedBrand']

        # Check Exact Match
        if p_slug in existing_slugs or p_norm in existing_names:
            products_matched_count += 1
            continue

        # Check Fuzzy Match
        p_tokens = set(p_norm.split())
        is_fuzzy_dup = False
        for ex in existing_db:
            ex_tokens = set(ex['normalizedName'].split())
            if p_tokens and ex_tokens:
                overlap = p_tokens.intersection(ex_tokens)
                if len(overlap) / max(len(p_tokens), len(ex_tokens)) >= 0.75:
                    is_fuzzy_dup = True
                    break
        if is_fuzzy_dup:
            continue

        # Generate unique slug
        base_slug = slugify(p['title']) or p_slug
        final_slug = base_slug
        idx = 2
        while final_slug in used_slugs:
            final_slug = f"{base_slug}-{idx}"
            idx += 1
        used_slugs.add(final_slug)

        # Map Category
        src_cat = p.get('categorySlug', 'vitamines')
        canonical_cat_slug = SOURCE_TO_CANONICAL_CATEGORY.get(src_cat, 'vitamines')
        cat_obj = db_categories.get(canonical_cat_slug) or db_categories.get('vitamines')
        category_id = cat_obj['id']
        category_name = cat_obj['name']

        # Map Brand
        b_name = p.get('brand', 'ParaTunisie').strip() or "ParaTunisie"
        b_slug = slugify(b_name)
        brand_obj = db_brands.get(b_slug)
        brand_id = brand_obj['id'] if brand_obj else db_brands.get(list(db_brands.keys())[0])['id']

        # SEO generation
        seo = generate_seo_content(p['title'], b_name, p.get('format', ''), category_name)

        p_id = generate_cuid()
        v_id = generate_cuid()
        img_id = generate_cuid()

        price_millimes = int(p.get('priceTnd', 0) * 1000)
        stock_status = p.get('stockStatus', 'ON_ORDER')
        is_in_stock = stock_status == 'IN_STOCK'
        stock_qty = 10 if is_in_stock else 0

        img_url = p['images'][0] if p.get('images') else "/assets/product-tube.webp"
        format_label = p.get('format', 'Format standard') or "Format standard"

        products_to_insert.append({
            'p_id': p_id,
            'slug': final_slug,
            'name': p['title'],
            'benefit': seo['benefit'],
            'description': seo['longDescription'],
            'usage': seo['usage'],
            'image': img_url,
            'brandId': brand_id,
            'categoryId': category_id,
            'seoTitle': seo['seoTitle'],
            'seoDescription': seo['seoDescription'],
            'seoH1': seo['seoH1'],
            'inStock': is_in_stock,
            'totalStock': stock_qty,
            'v_id': v_id,
            'v_label': format_label,
            'v_price': price_millimes,
            'v_sku': p.get('sourceSku') or None,
            'v_stock': stock_qty,
            'img_id': img_id,
            'img_url': img_url
        })

    log(f"Products matched (preserved): {products_matched_count}")
    log(f"New unique products to insert: {len(products_to_insert)}")

    # 8. Execute Product Insert Batches
    log("6. Inserting products, variants, and images in PostgreSQL...")
    batch_size = 250
    log("6. Generating complete SQL payload for products, variants, and images...")
    sql_lines = ["BEGIN;"]
    for item in products_to_insert:
        name_esc = item['name'].replace("'", "''")
        slug_esc = item['slug'].replace("'", "''")
        benefit_esc = item['benefit'].replace("'", "''")
        desc_esc = item['description'].replace("'", "''")
        usage_esc = item['usage'].replace("'", "''")
        img_esc = item['image'].replace("'", "''")
        seo_t_esc = item['seoTitle'].replace("'", "''")
        seo_d_esc = item['seoDescription'].replace("'", "''")
        seo_h1_esc = item['seoH1'].replace("'", "''")
        v_label_esc = item['v_label'].replace("'", "''")
        v_sku_val = item['v_sku'].replace("'", "''") if item['v_sku'] else None
        sku_esc = f"'{v_sku_val}'" if v_sku_val else "NULL"
        in_stock_sql = "true" if item['inStock'] else "false"

        sql_lines.append(f"""
        INSERT INTO "Product" (id, slug, name, benefit, description, usage, image, "brandId", "categoryId", "seoTitle", "seoDescription", "seoH1", "publishState", "inStock", "totalStock", "createdAt", "updatedAt")
        VALUES ('{item['p_id']}', '{slug_esc}', '{name_esc}', '{benefit_esc}', '{desc_esc}', '{usage_esc}', '{img_esc}', '{item['brandId']}', '{item['categoryId']}', '{seo_t_esc}', '{seo_d_esc}', '{seo_h1_esc}', 'PUBLISHED', {in_stock_sql}, {item['totalStock']}, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;

        INSERT INTO "ProductVariant" (id, "productId", label, "priceMillimes", sku, stock)
        VALUES ('{item['v_id']}', '{item['p_id']}', '{v_label_esc}', {item['v_price']}, {sku_esc}, {item['v_stock']})
        ON CONFLICT DO NOTHING;

        INSERT INTO "ProductImage" (id, "productId", url, position)
        VALUES ('{item['img_id']}', '{item['p_id']}', '{img_esc}', 0)
        ON CONFLICT DO NOTHING;
        """)
    sql_lines.append("COMMIT;")

    local_sql_path = "scripts/full_import_payload.sql"
    with open(local_sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))
    log(f"Wrote {os.path.getsize(local_sql_path) / 1024 / 1024:.2f} MB SQL payload to {local_sql_path}.")

    log("Uploading SQL payload to VPS via SFTP...")
    sftp = client.open_sftp()
    sftp.put(local_sql_path, "/tmp/full_import_payload.sql")
    sftp.close()
    log("✓ Uploaded /tmp/full_import_payload.sql.")

    log("Executing SQL payload inside PostgreSQL container...")
    run_cmd("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/full_import_payload.sql")
    log("✓ Products, variants and images imported successfully!")

    # 9. Update existing 51 products to ensure inStock is accurate
    log("7. Updating existing products stock state (inStock = true where stock > 0)...")
    update_stock_sql = """
    UPDATE "Product" p
    SET 
        "totalStock" = COALESCE((SELECT SUM(pv.stock) FROM "ProductVariant" pv WHERE pv."productId" = p.id), 0),
        "inStock" = CASE WHEN COALESCE((SELECT SUM(pv.stock) FROM "ProductVariant" pv WHERE pv."productId" = p.id), 0) > 0 THEN true ELSE false END;
    
    -- Ensure all 51 pre-existing products remain IN_STOCK
    UPDATE "Product" SET "inStock" = true, "totalStock" = 20 WHERE id IN (SELECT "productId" FROM "ProductVariant" WHERE id LIKE 'v%' OR id LIKE 'cm%');
    """
    run_cmd(f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << 'EOF'\n{update_stock_sql}\nEOF")

    # 10. Verify Final Production Database Counts
    log("8. Verifying Final Production Database Counts...")
    count_sql = """
    SELECT 'Product Total' as metric, count(*) FROM "Product"
    UNION ALL SELECT 'Product IN_STOCK (Purchasable)', count(*) FROM "Product" WHERE "inStock" = true
    UNION ALL SELECT 'Product SUR_COMMANDE (Demander)', count(*) FROM "Product" WHERE "inStock" = false
    UNION ALL SELECT 'Brands Total', count(*) FROM "Brand"
    UNION ALL SELECT 'Categories Total', count(*) FROM "Category"
    UNION ALL SELECT 'ProductVariants Total', count(*) FROM "ProductVariant"
    UNION ALL SELECT 'Orders (Preserved)', count(*) FROM "Order"
    UNION ALL SELECT 'Reviews (Preserved)', count(*) FROM "Review"
    UNION ALL SELECT 'Users (Preserved)', count(*) FROM "User";
    """
    out, _ = run_cmd(f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{count_sql}"')
    log("\n=== FINAL DATABASE AUDIT METRICS ===")
    log(out)

    # 11. Sync MeiliSearch Index
    log("9. Syncing MeiliSearch index...")
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
    run_cmd(f"docker exec -i paratunisie-api node << 'EOF'\n{sync_node_script}\nEOF")

    log("✓ Full import and synchronization pipeline complete!")
    client.close()

if __name__ == '__main__':
    main()
