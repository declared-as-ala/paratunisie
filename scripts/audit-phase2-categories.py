import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

sftp = client.open_sftp()
with sftp.file('/tmp/seo_audit_categories.sql', 'w') as f:
    f.write("""
\\x off
\\echo '=== CATEGORY BREAKDOWN ==='
SELECT 
  c.id, c.name, c.slug, c.indexable, 
  COUNT(p.id) as total_products, 
  COUNT(CASE WHEN p."inStock" = true THEN 1 END) as in_stock, 
  COUNT(CASE WHEN p.indexable = true THEN 1 END) as indexable
FROM "Category" c 
LEFT JOIN "Product" p ON p."categoryId" = c.id 
GROUP BY c.id, c.name, c.slug, c.indexable 
ORDER BY total_products DESC;

\\echo '=== IN STOCK PRODUCTS BY IMAGE SOURCE ==='
SELECT 
  CASE 
    WHEN image LIKE '/uploads/%' THEN 'Local (/uploads/)'
    WHEN image LIKE 'https://admin.protein.tn/%' THEN 'Protein.tn CDN'
    ELSE 'Other external (iHerb/Cloudinary)'
  END as image_source,
  COUNT(*) as total_prods,
  COUNT(CASE WHEN "inStock" = true THEN 1 END) as in_stock_prods,
  COUNT(CASE WHEN indexable = true THEN 1 END) as indexable_prods
FROM "Product"
GROUP BY 1
ORDER BY 2 DESC;
""")
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/seo_audit_categories.sql")
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
