import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

sql = """
\\echo '=== PRODUCTS SUMMARY ==='
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN indexable = true THEN 1 END) as indexable_products,
  COUNT(CASE WHEN indexable = false THEN 1 END) as noindex_products,
  COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_products,
  COUNT(CASE WHEN image LIKE '/uploads/%' THEN 1 END) as local_image_products,
  COUNT(CASE WHEN image NOT LIKE '/uploads/%' AND image IS NOT NULL THEN 1 END) as external_image_products,
  COUNT(CASE WHEN "seoQualityScore" >= 80 THEN 1 END) as high_quality_score,
  COUNT(CASE WHEN "seoQualityScore" >= 50 AND "seoQualityScore" < 80 THEN 1 END) as med_quality_score,
  COUNT(CASE WHEN "seoQualityScore" < 50 THEN 1 END) as low_quality_score
FROM "Product";

\\echo '=== CATEGORY COUNTS ==='
SELECT 
  c.name, c.slug, c.indexable, COUNT(p.id) as product_count,
  COUNT(CASE WHEN p.in_stock = true THEN 1 END) as in_stock_count,
  COUNT(CASE WHEN p.indexable = true THEN 1 END) as indexable_count
FROM "Category" c
LEFT JOIN "Product" p ON p."categoryId" = c.id
GROUP BY c.id, c.name, c.slug, c.indexable
ORDER BY product_count DESC;

\\echo '=== ARTICLES ==='
SELECT id, title, slug, published, indexable FROM "Article" ORDER BY id;

\\echo '=== INDEXABLE PRODUCTS (14) ==='
SELECT p.id, p.name, p.slug, p."seoQualityScore", p."seoQualityIssues", p.image
FROM "Product" p
WHERE p.indexable = true;
"""

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
stdin.write(sql)
stdin.flush()
stdin.channel.shutdown_write()

print(stdout.read().decode("utf-8", errors="replace"))
client.close()
