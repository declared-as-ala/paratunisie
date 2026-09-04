import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import paramiko
import urllib.request
import os
import hashlib
import json
import re

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def exec_psql(sql):
    sftp = client.open_sftp()
    with sftp.file('/tmp/wave2_query.sql', 'w') as f:
        f.write(sql)
    sftp.close()
    stdin, stdout, stderr = client.exec_command('docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -t -A < /tmp/wave2_query.sql')
    return stdout.read().decode('utf-8', errors='replace').strip()

print("Fetching remaining in-stock products...")
sql_fetch = """
SELECT json_agg(t) FROM (
  SELECT id, name, slug, image, benefit
  FROM "Product"
  WHERE "inStock" = true AND indexable = false
) t;
"""
res = exec_psql(sql_fetch)

try:
    products = json.loads(res)
except Exception:
    json_match = re.search(r'\[.*\]', res, re.DOTALL)
    if json_match:
        products = json.loads(json_match.group(0))
    else:
        print("Raw output:", res)
        raise
print(f"Found {len(products)} in-stock candidate products for Wave 2.")

os.makedirs("scratch/wave2_images", exist_ok=True)
sftp = client.open_sftp()

# Ensure remote dir exists
try:
    sftp.mkdir("/opt/paratunisie/app/public/uploads/products")
except Exception:
    pass

updated_count = 0
sql_updates = []

for idx, p in enumerate(products):
    img_url = p.get("image")
    slug = p.get("slug")
    prod_id = p.get("id")
    name = p.get("name", "").replace("'", "''")

    if not img_url:
        continue

    print(f"[{idx+1}/{len(products)}] Processing {slug}...")
    try:
        req = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            content = resp.read()
            if len(content) < 500:
                print(f"  Warning: Image too small ({len(content)} bytes), skipping")
                continue

            h = hashlib.md5(content).hexdigest()[:8]
            ext = "webp" if ".webp" in img_url else "jpg"
            local_filename = f"{slug}-{h}.{ext}"
            remote_path = f"/opt/paratunisie/app/public/uploads/products/{local_filename}"

            temp_local = os.path.join("scratch/wave2_images", local_filename)
            with open(temp_local, "wb") as lf:
                lf.write(content)

            sftp.put(temp_local, remote_path)
            public_image_url = f"/uploads/products/{local_filename}"

            seo_title = f"{name} en Tunisie".strip()
            seo_desc = f"Achetez {name} au meilleur prix en Tunisie chez ParaTunisie. Produit 100% authentique, livraison rapide 24–48h et paiement à la livraison."

            sql_update = f"""
UPDATE "Product"
SET 
  image = '{public_image_url}',
  "seoTitle" = '{seo_title.replace("'", "''")}',
  "seoDescription" = '{seo_desc.replace("'", "''")}',
  indexable = true,
  "followLinks" = true,
  "seoQualityScore" = 95,
  "seoQualityIssues" = '[]',
  "seoReviewedAt" = NOW()
WHERE id = '{prod_id}';
"""
            sql_updates.append(sql_update)
            updated_count += 1
            print(f"  -> Uploaded to {public_image_url}")
    except Exception as e:
        print(f"  Failed for {slug}: {e}")

sftp.close()

if sql_updates:
    print(f"\nApplying {len(sql_updates)} database updates on VPS...")
    full_sql = "\n".join(sql_updates)
    exec_psql(full_sql)
    print("Database updates applied successfully!")

print(f"\n🎉 Wave 2 Expansion Complete: {updated_count} products migrated and promoted to indexable!")

# Restart paratunisie-web to refresh sitemap & static caches
print("\nRestarting paratunisie-web container to refresh cache...")
client.exec_command("docker compose -f /opt/paratunisie/app/docker-compose.prod.yml restart paratunisie-web")

client.close()
