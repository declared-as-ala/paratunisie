import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

sftp = client.open_sftp()
with sftp.file('/tmp/seo_audit.sql', 'w') as f:
    f.write("""
\\x off
\\echo '=== 1. PRODUCT SUMMARY ==='
SELECT 
  COUNT(*) as total, 
  COUNT(CASE WHEN indexable = true THEN 1 END) as indexable, 
  COUNT(CASE WHEN indexable = false THEN 1 END) as noindex, 
  COUNT(CASE WHEN "inStock" = true THEN 1 END) as in_stock,
  COUNT(CASE WHEN image LIKE '/uploads/%' THEN 1 END) as local_images,
  COUNT(CASE WHEN image LIKE 'https://admin.protein.tn/%' THEN 1 END) as protein_tn_images,
  COUNT(CASE WHEN image NOT LIKE '/uploads/%' AND image NOT LIKE 'https://admin.protein.tn/%' THEN 1 END) as other_external
FROM "Product";

\\echo '=== 2. CATEGORIES BREAKDOWN ==='
SELECT 
  c.id, c.name, c.slug, c.indexable, 
  COUNT(p.id) as total_products, 
  COUNT(CASE WHEN p."inStock" = true THEN 1 END) as in_stock, 
  COUNT(CASE WHEN p.indexable = true THEN 1 END) as indexable
FROM "Category" c 
LEFT JOIN "Product" p ON p."categoryId" = c.id 
GROUP BY c.id, c.name, c.slug, c.indexable 
ORDER BY total_products DESC;

\\echo '=== 3. ARTICLES (20) ==='
SELECT id, title, slug, "publishedAt", indexable, "authorName" FROM "Article" ORDER BY id;

\\echo '=== 4. LOCAL IMAGE PRODUCTS (50) ==='
SELECT id, name, slug, "seoQualityScore", "inStock", indexable, image 
FROM "Product" 
WHERE image LIKE '/uploads/%' 
ORDER BY "seoQualityScore" DESC, name ASC;

\\echo '=== 5. PROTEIN.TN IN-STOCK PRODUCTS SAMPLE (High Intent) ==='
SELECT id, name, slug, "seoQualityScore", "inStock", indexable, brand, category
FROM "Product" 
WHERE image LIKE 'https://admin.protein.tn/%' AND "inStock" = true
ORDER BY "seoQualityScore" DESC, name ASC
LIMIT 30;
""")
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/seo_audit.sql")
print(stdout.read().decode("utf-8", errors="replace"))
err = stderr.read().decode("utf-8", errors="replace")
if err:
    print("ERR:", err)

client.close()
