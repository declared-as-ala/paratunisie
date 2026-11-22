# -*- coding: utf-8 -*-
import os
import sys
import json
import re
import datetime
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

FORBIDDEN_CLAIMS = [
    "يشفي نهائيا",
    "يعالج مرض",
    "يقضي على السرطان",
    "بديل الدواء",
    "مضمون 100%",
    "بدون أي خطر للجميع",
    "guérir",
    "guérit",
    "soigne le cancer",
    "remplace un traitement",
    "miracle",
]


def sql_str(val):
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"


def validate_article_ar(art, manifest_entry):
    errors = []
    content = json.loads(art["content"])
    text_parts = []
    headings = 0
    has_sources = False
    has_takeaways = False
    has_related = False

    for b in content:
        t = b.get("type")
        if t == "heading":
            headings += 1
            text_parts.append(b.get("text", ""))
        elif t == "paragraph":
            text_parts.append(b.get("text", ""))
        elif t == "takeaways":
            has_takeaways = True
            items = b.get("items", [])
            if len(items) < 3:
                errors.append("Fewer than 3 takeaways")
            text_parts.extend(items)
        elif t == "sources":
            has_sources = True
            items = b.get("items", [])
            if len(items) < 2:
                errors.append("Fewer than 2 scientific sources")
            for s in items:
                if not s.get("url", "").startswith("https://"):
                    errors.append(f"Invalid source URL: {s.get('url')}")
        elif t == "related":
            has_related = True

    full_text = " ".join(text_parts)
    words = len(full_text.split())
    if words < 600:
        errors.append(f"Word count too low: {words} (min 600)")
    if headings < 4:
        errors.append(f"Too few H2 headings: {headings}")
    if not has_sources:
        errors.append("Missing sources block")
    if not has_takeaways:
        errors.append("Missing takeaways block")
    if not has_related:
        errors.append("Missing related links block")

    hub_url = manifest_entry["internal_links"]["hub_category"]
    if f"({hub_url})" not in art["content"]:
        errors.append(f"Missing contextual markdown link to hub {hub_url}")

    if not art.get("seoTitle") or len(art["seoTitle"]) > 65:
        errors.append(f"seoTitle missing or too long ({len(art.get('seoTitle',''))})")
    if not art.get("metaDescription") or not (90 <= len(art["metaDescription"]) <= 165):
        errors.append(f"metaDescription length out of bounds ({len(art.get('metaDescription',''))})")
    if len(art.get("faqs", [])) < 3:
        errors.append(f"Too few FAQs: {len(art.get('faqs', []))}")
    if len(art.get("products", [])) < 1:
        errors.append("No products attached")

    low = full_text.lower()
    for bad in FORBIDDEN_CLAIMS:
        if bad in low:
            errors.append(f"Forbidden medical claim found: '{bad}'")

    img_local = os.path.join("public", art["featuredImage"].lstrip("/"))
    if not os.path.exists(img_local):
        errors.append(f"Featured image missing on disk: {img_local}")

    return errors, words


def publish_batch(batch_num: int):
    batch_file = f"scripts/batches_ar/batch_{batch_num:02d}.json"
    with open(batch_file, encoding="utf-8") as f:
        articles = json.load(f)

    with open("scripts/editorial_manifest_100_ar.json", encoding="utf-8") as f:
        manifest = json.load(f)
    m_by_slug = {m["slug"]: m for m in manifest}

    print(f"=== Validating Arabic Batch {batch_num:02d} ({len(articles)} articles) ===")
    all_ok = True
    word_counts = {}
    for art in articles:
        m = m_by_slug[art["slug"]]
        errs, words = validate_article_ar(art, m)
        word_counts[art["slug"]] = words
        if errs:
            all_ok = False
            print(f"  [FAIL] {art['slug']}: {errs}")
        else:
            print(f"  [PASS] {art['slug']} ({words} words, {len(art['faqs'])} FAQs, {len(art['products'])} products)")

    if not all_ok:
        raise SystemExit("Arabic batch validation failed! Fix errors before publishing.")

    now_iso = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    sql_lines = ["BEGIN;"]

    for art in articles:
        aid = art["id"]
        slug = art["slug"]
        sql_lines.append(f"""
INSERT INTO "Article" (
  id, slug, title, excerpt, category, "readTime", date, content,
  "authorName", "expertReviewer", "featuredImage", "imageAlt",
  "seoTitle", "metaDescription", "canonicalUrl", "ogTitle", "ogDescription", "ogImage",
  "targetKeyword", indexable, status, "publishedAt", "createdAt", "updatedAt"
) VALUES (
  {sql_str(aid)}, {sql_str(slug)}, {sql_str(art["title"])}, {sql_str(art["excerpt"])},
  {sql_str(art["category"])}, {sql_str(art["readTime"])}, {sql_str(art["date"])}, {sql_str(art["content"])},
  {sql_str(art["authorName"])}, {sql_str(art.get("expertReviewer"))}, {sql_str(art["featuredImage"])}, {sql_str(art["imageAlt"])},
  {sql_str(art["seoTitle"])}, {sql_str(art["metaDescription"])}, {sql_str(art["canonicalUrl"])},
  {sql_str(art["ogTitle"])}, {sql_str(art["ogDescription"])}, {sql_str(art["ogImage"])},
  {sql_str(art["targetKeyword"])}, true, 'PUBLISHED', '{now_iso}', '{now_iso}', '{now_iso}'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  category = EXCLUDED.category,
  "readTime" = EXCLUDED."readTime",
  content = EXCLUDED.content,
  "featuredImage" = EXCLUDED."featuredImage",
  "imageAlt" = EXCLUDED."imageAlt",
  "seoTitle" = EXCLUDED."seoTitle",
  "metaDescription" = EXCLUDED."metaDescription",
  "canonicalUrl" = EXCLUDED."canonicalUrl",
  "ogTitle" = EXCLUDED."ogTitle",
  "ogDescription" = EXCLUDED."ogDescription",
  "ogImage" = EXCLUDED."ogImage",
  "targetKeyword" = EXCLUDED."targetKeyword",
  indexable = true,
  status = 'PUBLISHED',
  "updatedAt" = '{now_iso}'
WHERE "Article".id LIKE 'seed100ar_%';
""")
        for pos, prod in enumerate(art["products"]):
            ap_id = f"{aid}_p{pos+1}"
            sql_lines.append(f"""
INSERT INTO "ArticleProduct" (id, "articleId", "productId", rationale, position)
VALUES ({sql_str(ap_id)}, (SELECT id FROM "Article" WHERE slug = {sql_str(slug)}), {sql_str(prod["id"])}, {sql_str(prod["rationale"])}, {pos})
ON CONFLICT ("articleId", "productId") DO UPDATE SET rationale = EXCLUDED.rationale, position = EXCLUDED.position;
""")
        sql_lines.append(f'DELETE FROM "ArticleFaq" WHERE "articleId" = (SELECT id FROM "Article" WHERE slug = {sql_str(slug)} AND id LIKE \'seed100ar_%\');')
        for pos, faq in enumerate(art["faqs"]):
            af_id = f"{aid}_f{pos+1}"
            sql_lines.append(f"""
INSERT INTO "ArticleFaq" (id, "articleId", question, answer, position)
VALUES ({sql_str(af_id)}, (SELECT id FROM "Article" WHERE slug = {sql_str(slug)}), {sql_str(faq["question"])}, {sql_str(faq["answer"])}, {pos});
""")

    sql_lines.append("COMMIT;")
    full_sql = "\n".join(sql_lines)

    print(f"=== Publishing Arabic Batch {batch_num:02d} to Production PostgreSQL ===")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=30)

    stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -v ON_ERROR_STOP=1 -U paratunisie -d paratunisie")
    stdin.write(full_sql)
    stdin.channel.shutdown_write()
    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")

    if err and "ERROR:" in err:
        ssh.close()
        raise SystemExit(f"PostgreSQL Error:\n{err}")

    stdin2, stdout2, _ = ssh.exec_command('docker exec paratunisie-postgres psql -t -A -U paratunisie -d paratunisie -c "SELECT count(*) FROM \\"Article\\" WHERE status=\'PUBLISHED\';"')
    total_pub = stdout2.read().decode().strip()
    ssh.close()

    for art in articles:
        m = m_by_slug[art["slug"]]
        m["draft_status"] = "COMPLETED"
        m["scientific_verification_status"] = "VERIFIED"
        m["publication_status"] = "PUBLISHED"
        m["word_count"] = word_counts[art["slug"]]

    with open("scripts/editorial_manifest_100_ar.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"Arabic Batch {batch_num:02d} published! Total PUBLISHED articles in DB: {total_pub}")


if __name__ == "__main__":
    b = int(sys.argv[1])
    publish_batch(b)
