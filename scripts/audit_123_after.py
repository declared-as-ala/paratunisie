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
  count(*) FILTER (WHERE length(trim(description)) < 120) AS short_or_thin_desc
FROM "Product"
WHERE "publishState"::text = 'PUBLISHED'
  AND "totalStock" > 0
  AND "inStock" = true
  AND indexable = true;
"""

stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
stdin.write(sql)
stdin.channel.shutdown_write()
print("=== AFTER METRICS (123 ELIGIBLE PRODUCTS) ===")
print(stdout.read().decode("utf-8", errors="ignore"))

# Verify excluded products count didn't change
sql_excl = """
SELECT count(*) AS excluded_untouched
FROM "Product"
WHERE NOT ("publishState"::text = 'PUBLISHED' AND "totalStock" > 0 AND "inStock" = true AND indexable = true)
  AND "seoGeneratedAt" >= '2026-11-21 20:00:00';
"""
stdin2, stdout2, _ = ssh.exec_command("docker exec -i paratunisie-postgres psql -t -A -U paratunisie -d paratunisie")
stdin2.write(sql_excl)
stdin2.channel.shutdown_write()
print("Excluded products touched since 20:00 UTC:", stdout2.read().decode().strip())

ssh.close()
