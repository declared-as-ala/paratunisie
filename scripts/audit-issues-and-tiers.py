import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def run_query(title, sql):
    stdin, stdout, stderr = client.exec_command(f'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql}"')
    print(f"\n==================== {title} ====================")
    print(stdout.read().decode("utf-8", errors="replace"))

run_query("CATEGORIES", "SELECT c.name, c.slug, c.indexable, count(p.id) as total_products, count(case when p.in_stock then 1 end) as in_stock, count(case when p.indexable then 1 end) as indexable FROM \\\"Category\\\" c LEFT JOIN \\\"Product\\\" p ON p.\\\"categoryId\\\" = c.id GROUP BY c.id, c.name, c.slug, c.indexable ORDER BY total_products DESC;")

run_query("TOP ISSUE CODES", "SELECT jsonb_array_elements(\\\"seoQualityIssues\\\"::jsonb)->>'code' as issue_code, count(*) FROM \\\"Product\\\" GROUP BY 1 ORDER BY 2 DESC;")

run_query("SCORE TIERS", "SELECT CASE WHEN \\\"seoQualityScore\\\" >= 80 THEN 'Tier A (80-100)' WHEN \\\"seoQualityScore\\\" >= 60 THEN 'Tier B (60-79)' WHEN \\\"seoQualityScore\\\" >= 40 THEN 'Tier C (40-59)' ELSE 'Tier D (<40)' END as tier, count(*) as count, count(case when in_stock then 1 end) as in_stock FROM \\\"Product\\\" GROUP BY 1 ORDER BY 1;")

run_query("PROTEIN.TN IN-STOCK PRODUCTS (162)", "SELECT id, name, slug, \\\"seoQualityScore\\\", in_stock, \\\"seoQualityIssues\\\" FROM \\\"Product\\\" WHERE image LIKE 'https://admin.protein.tn/%' AND in_stock = true LIMIT 10;")

run_query("LOCAL IMAGE PRODUCTS (50)", "SELECT id, name, slug, \\\"seoQualityScore\\\", in_stock, indexable, image FROM \\\"Product\\\" WHERE image LIKE '/uploads/%' ORDER BY \\\"seoQualityScore\\\" DESC;")

client.close()
