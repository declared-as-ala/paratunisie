# -*- coding: utf-8 -*-
import json
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=30)

sql = """
SELECT json_agg(t) FROM (
  SELECT
    p.id,
    p.slug,
    p.name,
    b.name AS brand_name,
    b.slug AS brand_slug,
    c.name AS category_name,
    c.slug AS category_slug,
    p."totalStock",
    p."inStock",
    p.indexable,
    p."seoIsCustom",
    p."seoScore",
    p."seoQualityScore",
    p."seoTitle",
    p."seoDescription",
    p."seoH1",
    p."seoIntro",
    p."seoContent",
    p."seoFaq",
    p."seoKeywords",
    p."canonicalUrl",
    p."ogTitle",
    p."ogDescription",
    p."ogImage",
    p."imageAlt",
    p.image,
    p.benefit,
    p.description,
    p.usage,
    COALESCE((SELECT sum(GREATEST(v.stock, 0)) FROM "ProductVariant" v WHERE v."productId" = p.id), 0) AS variant_stock_sum,
    (SELECT json_agg(json_build_object('id', v.id, 'sku', v.sku, 'label', v.label, 'priceMillimes', v."priceMillimes", 'stock', v.stock)) FROM "ProductVariant" v WHERE v."productId" = p.id) AS variants
  FROM "Product" p
  LEFT JOIN "Brand" b ON b.id = p."brandId"
  LEFT JOIN "Category" c ON c.id = p."categoryId"
  WHERE p."publishState"::text = 'PUBLISHED'
    AND p."totalStock" > 0
    AND p."inStock" = true
    AND p.indexable = true
  ORDER BY p."seoScore" ASC, p.name ASC
) t;
"""

stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -t -A -U paratunisie -d paratunisie")
stdin.write(sql)
stdin.channel.shutdown_write()
raw = stdout.read().decode("utf-8", errors="ignore").strip()
err = stderr.read().decode("utf-8", errors="ignore")
ssh.close()

if err:
    print("ERR:", err)

rows = json.loads(raw)
with open("scripts/eligible_123_snapshot.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

print(f"Exported {len(rows)} eligible products to scripts/eligible_123_snapshot.json")

# Audit duplicates & anomalies
from collections import Counter
titles = Counter((r["seoTitle"] or "").strip().lower() for r in rows if r["seoTitle"])
descs = Counter((r["seoDescription"] or "").strip().lower() for r in rows if r["seoDescription"])
long_descs = Counter((r["description"] or "").strip().lower() for r in rows if r["description"])
intros = Counter((r["seoIntro"] or "").strip().lower() for r in rows if r["seoIntro"])

print("Duplicate seoTitle:", sum(1 for k, v in titles.items() if v > 1))
print("Duplicate seoDescription:", sum(1 for k, v in descs.items() if v > 1))
print("Duplicate description:", sum(1 for k, v in long_descs.items() if v > 1))
print("Duplicate seoIntro:", sum(1 for k, v in intros.items() if v > 1))

zero_var_stock = [r["slug"] for r in rows if r["variant_stock_sum"] <= 0]
print("Products with variant_stock_sum <= 0:", len(zero_var_stock), zero_var_stock[:10])

print("\nLowest 15 SEO scores among eligible 123:")
for r in rows[:15]:
    print(f"  [{r['seoScore']}] {r['slug']} | title={bool(r['seoTitle'])} | desc={bool(r['seoDescription'])} | intro={bool(r['seoIntro'])} | content={bool(r['seoContent'])} | alt={bool(r['imageAlt'])}")
