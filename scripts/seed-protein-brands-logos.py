import json
import psycopg2
import paramiko
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

# Load extracted protein brands
with open("scripts/all_protein_brands.json", "r", encoding="utf-8") as f:
    brands_data = json.load(f)

print(f"Loaded {len(brands_data)} brands from all_protein_brands.json")

# Connect to VPS and run SQL updates inside paratunisie-postgres
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Build SQL statements
sql_statements = []
for b in brands_data:
    name = b["name"].replace("'", "''")
    slug = b["slug"].replace("'", "''")
    logo = b["logo"].replace("'", "''")
    tagline = f"Marque officielle {b['name']} en Tunisie".replace("'", "''")
    desc = f"Découvrez tous les produits et compléments alimentaires authentiques de la marque {b['name']} chez ParaTunisie. Livraison rapide 24/48h partout en Tunisie avec paiement à la livraison.".replace("'", "''")
    seo_title = f"{b['name']} Tunisie — Compléments & Nutrition Sportive | ParaTunisie".replace("'", "''")
    seo_desc = f"Achetez les produits {b['name']} 100% authentiques en Tunisie au meilleur prix. Livraison express 24-48h, paiement à la livraison et conseils experts.".replace("'", "''")
    
    # Upsert by slug or name
    sql = f"""
    INSERT INTO "Brand" (id, name, slug, image, tagline, description, "shortDescription", "seoTitle", "seoDescription", "seoH1", "seoIntro", "featured", "status", "updatedAt")
    VALUES (gen_random_uuid()::text, '{name}', '{slug}', '{logo}', '{tagline}', '{desc}', '{desc}', '{seo_title}', '{seo_desc}', '{name} en Tunisie', '{desc}', true, 'ACTIVE', NOW())
    ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name,
        image = EXCLUDED.image,
        tagline = COALESCE("Brand".tagline, EXCLUDED.tagline),
        description = COALESCE("Brand".description, EXCLUDED.description),
        "shortDescription" = COALESCE("Brand"."shortDescription", EXCLUDED."shortDescription"),
        "seoTitle" = COALESCE("Brand"."seoTitle", EXCLUDED."seoTitle"),
        "seoDescription" = COALESCE("Brand"."seoDescription", EXCLUDED."seoDescription"),
        "seoH1" = COALESCE("Brand"."seoH1", EXCLUDED."seoH1"),
        "seoIntro" = COALESCE("Brand"."seoIntro", EXCLUDED."seoIntro"),
        "featured" = true,
        "status" = 'ACTIVE',
        "updatedAt" = NOW();
    """
    sql_statements.append(sql)

full_sql = "\n".join(sql_statements)
with open("scripts/seed_brands.sql", "w", encoding="utf-8") as f:
    f.write(full_sql)

# Upload script to VPS and run in docker postgres
sftp = client.open_sftp()
sftp.put("scripts/seed_brands.sql", "/tmp/seed_brands.sql")
sftp.close()

run_cmd = "docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/seed_brands.sql"
stdin, stdout, stderr = client.exec_command(run_cmd)
print(stdout.read().decode("utf-8"))
err = stderr.read().decode("utf-8")
if err.strip():
    print("STDERR:", err)

# Check count
count_cmd = "docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c 'SELECT count(*), count(image) FROM \"Brand\";'"
stdin, stdout, stderr = client.exec_command(count_cmd)
print(stdout.read().decode("utf-8"))

client.close()
print("✅ Seeding completed!")
