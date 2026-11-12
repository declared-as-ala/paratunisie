# -*- coding: utf-8 -*-
"""
Idempotent Seeder for 100 SEO Articles into PostgreSQL on VPS.
Inserts into "Article", "ArticleProduct", and "ArticleFaq".
All articles seeded as status 'DRAFT'.
"""

import sys
import os
import json
import argparse
import paramiko

VPS_HOST = "187.53.136.225"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

def escape_sql_string(val):
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def run_sql_on_vps(client, sql):
    # Stream SQL to psql via stdin
    cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -v ON_ERROR_STOP=1'
    stdin, stdout, stderr = client.exec_command(cmd)
    stdin.write(sql)
    stdin.flush()
    stdin.channel.shutdown_write()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Perform a dry-run without writing to DB")
    args = parser.parse_args()

    json_path = os.path.join(os.path.dirname(__file__), "compiled_100_articles.json")
    with open(json_path, "r", encoding="utf-8") as f:
        articles = json.load(f)

    print(f"Loaded {len(articles)} articles from {json_path}")
    print(f"Mode: {'DRY-RUN (Simulated)' if args.dry_run else 'LIVE SEEDING'}")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

    # 1. Check existing count
    out, err = run_sql_on_vps(client, 'SELECT COUNT(*) FROM "Article";')
    print("Initial Article count:", out.strip())

    if args.dry_run:
        print("Dry run completed successfully. No records were modified.")
        client.close()
        return

    # Build SQL transaction
    sql_statements = ["BEGIN;"]

    articles_count = 0
    products_count = 0
    faqs_count = 0

    for art in articles:
        art_id = escape_sql_string(art["id"])
        slug = escape_sql_string(art["slug"])
        title = escape_sql_string(art["title"])
        excerpt = escape_sql_string(art["excerpt"])
        category = escape_sql_string(art["category"])
        read_time = escape_sql_string(art["readTime"])
        date_str = escape_sql_string(art["date"])
        content = escape_sql_string(art["content"])
        author = escape_sql_string(art["authorName"])
        reviewer = escape_sql_string(art["expertReviewer"])
        featured_image = escape_sql_string(art["featuredImage"])
        canonical_url = escape_sql_string(art["canonicalUrl"])
        meta_desc = escape_sql_string(art["metaDescription"])
        og_title = escape_sql_string(art["ogTitle"])
        og_desc = escape_sql_string(art["ogDescription"])
        og_image = escape_sql_string(art["ogImage"])
        seo_title = escape_sql_string(art["seoTitle"])
        target_kw = escape_sql_string(art["targetKeyword"])
        image_prompt = escape_sql_string(art["imagePrompt"])
        image_alt = escape_sql_string(art["imageAlt"])

        # Insert Article (ON CONFLICT DO NOTHING)
        insert_art = f"""
INSERT INTO "Article" (
    id, slug, title, excerpt, category, "readTime", date, content,
    "createdAt", "updatedAt", "authorName", "expertReviewer", "featuredImage",
    "canonicalUrl", indexable, "metaDescription", "ogTitle", "ogDescription",
    "ogImage", "seoTitle", status, "targetKeyword", "imagePrompt", "imageAlt"
) VALUES (
    {art_id}, {slug}, {title}, {excerpt}, {category}, {read_time}, {date_str}, {content},
    NOW(), NOW(), {author}, {reviewer}, {featured_image},
    {canonical_url}, true, {meta_desc}, {og_title}, {og_desc},
    {og_image}, {seo_title}, 'DRAFT', {target_kw}, {image_prompt}, {image_alt}
) ON CONFLICT (slug) DO NOTHING;
"""
        sql_statements.append(insert_art)
        articles_count += 1

        # Insert Products
        for prod in art.get("products", []):
            ap_id = escape_sql_string(prod["id"])
            prod_id = escape_sql_string(prod["productId"])
            rationale = escape_sql_string(prod.get("rationale", ""))
            position = prod.get("position", 0)

            # Get actual articleId from DB or use art_id
            insert_prod = f"""
INSERT INTO "ArticleProduct" (id, "articleId", "productId", rationale, position)
SELECT {ap_id}, id, {prod_id}, {rationale}, {position}
FROM "Article" WHERE slug = {slug}
ON CONFLICT ("articleId", "productId") DO NOTHING;
"""
            sql_statements.append(insert_prod)
            products_count += 1

        # Insert FAQs
        for faq in art.get("faqs", []):
            af_id = escape_sql_string(faq["id"])
            q = escape_sql_string(faq["question"])
            a = escape_sql_string(faq["answer"])
            pos = faq.get("position", 0)

            insert_faq = f"""
INSERT INTO "ArticleFaq" (id, "articleId", question, answer, position)
SELECT {af_id}, id, {q}, {a}, {pos}
FROM "Article" WHERE slug = {slug}
ON CONFLICT DO NOTHING;
"""
            sql_statements.append(insert_faq)
            faqs_count += 1

    sql_statements.append("COMMIT;")

    full_sql = "\n".join(sql_statements)
    print(f"Generated SQL batch: {len(sql_statements)} statements. Executing on VPS...")

    out, err = run_sql_on_vps(client, full_sql)
    if err and "ERROR" in err:
        print("SQL Error encountered:\n", err)
    else:
        print("SQL execution output summary:")
        lines = out.strip().split("\n")
        print(f"Total output lines: {len(lines)}. Last line: {lines[-1] if lines else ''}")

    # Verify counts
    out_count, _ = run_sql_on_vps(client, 'SELECT COUNT(*) as total_articles, status FROM "Article" GROUP BY status;')
    print("\n--- Article Counts by Status in DB ---")
    print(out_count.strip())

    out_ap, _ = run_sql_on_vps(client, 'SELECT COUNT(*) FROM "ArticleProduct";')
    print("Total ArticleProduct count:", out_ap.strip())

    out_af, _ = run_sql_on_vps(client, 'SELECT COUNT(*) FROM "ArticleFaq";')
    print("Total ArticleFaq count:", out_af.strip())

    client.close()
    print("\nDatabase seeding completed successfully.")

if __name__ == "__main__":
    main()
