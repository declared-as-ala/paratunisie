# -*- coding: utf-8 -*-
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=30)

queries = {
    "publish_and_stock_breakdown": """
        SELECT "publishState", "inStock", "indexable",
               count(*) AS cnt,
               count(*) FILTER (WHERE "totalStock" > 0) AS total_stock_gt0,
               count(*) FILTER (WHERE "totalStock" <= 0) AS total_stock_le0
        FROM "Product"
        GROUP BY "publishState", "inStock", "indexable"
        ORDER BY cnt DESC;
    """,
    "variant_stock_check": """
        SELECT
          count(*) AS total_products,
          count(*) FILTER (WHERE p."publishState"::text IN ('PUBLISHED', 'ACTIVE')) AS published_or_active,
          count(*) FILTER (WHERE p."publishState"::text IN ('PUBLISHED', 'ACTIVE') AND p."totalStock" > 0) AS pub_total_stock_gt0,
          count(*) FILTER (WHERE p."publishState"::text IN ('PUBLISHED', 'ACTIVE') AND p."totalStock" > 0 AND p."inStock" = true) AS pub_instock_gt0,
          count(*) FILTER (WHERE p."publishState"::text IN ('PUBLISHED', 'ACTIVE') AND p."totalStock" > 0 AND p."inStock" = true AND p."indexable" = true) AS eligible_strict,
          count(*) FILTER (WHERE p."publishState"::text IN ('PUBLISHED', 'ACTIVE') AND p."totalStock" > 0 AND p."inStock" = true AND p."indexable" = false) AS excluded_noindex
        FROM "Product" p;
    """,
    "eligible_seo_audit": """
        SELECT
          count(*) AS eligible_count,
          round(avg("seoScore"), 1) AS avg_seo_score,
          round(avg("seoQualityScore"), 1) AS avg_seo_quality_score,
          count(*) FILTER (WHERE coalesce(trim("seoTitle"), '') = '') AS missing_seo_title,
          count(*) FILTER (WHERE coalesce(trim("seoDescription"), '') = '') AS missing_seo_desc,
          count(*) FILTER (WHERE coalesce(trim("seoH1"), '') = '') AS missing_seo_h1,
          count(*) FILTER (WHERE coalesce(trim("seoIntro"), '') = '') AS missing_seo_intro,
          count(*) FILTER (WHERE coalesce(trim("seoContent"), '') = '') AS missing_seo_content,
          count(*) FILTER (WHERE coalesce(trim("canonicalUrl"), '') = '') AS missing_canonical,
          count(*) FILTER (WHERE coalesce(trim("ogTitle"), '') = '') AS missing_og_title,
          count(*) FILTER (WHERE coalesce(trim("ogDescription"), '') = '') AS missing_og_desc,
          count(*) FILTER (WHERE coalesce(trim("ogImage"), '') = '') AS missing_og_image,
          count(*) FILTER (WHERE coalesce(trim("imageAlt"), '') = '') AS missing_image_alt,
          count(*) FILTER (WHERE length(trim(description)) < 120) AS short_or_thin_desc,
          count(*) FILTER (WHERE "seoIsCustom" = true) AS custom_seo_count
        FROM "Product"
        WHERE "publishState"::text IN ('PUBLISHED', 'ACTIVE')
          AND "totalStock" > 0
          AND "inStock" = true
          AND "indexable" = true;
    """,
    "excluded_noindex_samples": """
        SELECT id, slug, name, "publishState", "inStock", "totalStock", indexable
        FROM "Product"
        WHERE indexable = false
        LIMIT 20;
    """
}

for label, sql in queries.items():
    print(f"\n=== {label} ===")
    stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
    stdin.write(sql)
    stdin.channel.shutdown_write()
    print(stdout.read().decode("utf-8", errors="ignore"))
    err = stderr.read().decode("utf-8", errors="ignore")
    if err:
        print("ERR:", err)

ssh.close()
