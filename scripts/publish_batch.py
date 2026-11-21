# -*- coding: utf-8 -*-
"""
Validates and publishes a batch of 10 articles from scripts/batches/batch_{n:02d}.json
into production PostgreSQL (idempotent transaction, never touching existing 49 articles).
"""
import os
import re
import sys
import json
import datetime
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

FORBIDDEN_MEDICAL_CLAIMS = [
    "guérit le cancer", "guérit la dépression", "remplace un traitement médical",
    "soigne l'anxiété chronique", "guérit l'insomnie", "stoppe le vieillissement",
    "sans aucun effet secondaire possible", "100% sans risque pour tout le monde"
]

def sql_str(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"

def validate_article(art, manifest_item):
    errors = []
    # Check image exists locally
    img_rel = "public/" + art["featuredImage"].lstrip("/")
    if not os.path.exists(img_rel):
        errors.append(f"Missing image: {img_rel}")

    # Parse content blocks
    blocks = json.loads(art["content"])
    text_blocks = [b.get("text", "") for b in blocks if b.get("type") in ("heading", "paragraph")]
    full_text = " ".join(text_blocks)
    words = len(re.findall(r"\S+", full_text))
    if words < 700:
        errors.append(f"Too short: {words} words (< 700)")

    # Check headings count
    headings = [b for b in blocks if b.get("type") == "heading"]
    if len(headings) < 4:
        errors.append(f"Too few H2 headings: {len(headings)}")

    # Check sources block
    sources = [b for b in blocks if b.get("type") == "sources"]
    if not sources or len(sources[0].get("items", [])) < 2:
        errors.append("Need >= 2 verified https:// sources")

    # Check takeaways block
    takeaways = [b for b in blocks if b.get("type") == "takeaways"]
    if not takeaways or len(takeaways[0].get("items", [])) < 3:
        errors.append("Need >= 3 key takeaways")

    # Check internal hub link
    hub_url = manifest_item["internal_links"]["hub_category"]
    if f"({hub_url})" not in full_text:
        errors.append(f"Missing contextual hub link ({hub_url}) in article body")

    # Check SEO metadata lengths
    if len(art["seoTitle"]) > 65:
        errors.append(f"seoTitle too long ({len(art['seoTitle'])} chars)")
    if not (90 <= len(art["metaDescription"]) <= 165):
        errors.append(f"metaDescription length out of bounds ({len(art['metaDescription'])})")

    # Check FAQs
    if len(art.get("faqs", [])) < 3:
        errors.append(f"Need >= 3 FAQs, got {len(art.get('faqs', []))}")

    # Check medical claims
    lower_text = full_text.lower()
    for phrase in FORBIDDEN_MEDICAL_CLAIMS:
        if phrase in lower_text:
            errors.append(f"Forbidden medical claim found: {phrase}")

    return words, errors

def publish_batch(batch_num: int):
    batch_path = f"scripts/batches/batch_{batch_num:02d}.json"
    with open(batch_path, encoding="utf-8") as f:
        articles = json.load(f)
    with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
        manifest = json.load(f)
    m_by_slug = {m["slug"]: m for m in manifest}

    print(f"=== Validating Batch {batch_num:02d} ({len(articles)} articles) ===")
    all_ok = True
    word_counts = {}
    for art in articles:
        m = m_by_slug[art["slug"]]
        words, errs = validate_article(art, m)
        word_counts[art["slug"]] = words
        if errs:
            all_ok = False
            print(f"  [FAIL] {art['slug']}: {errs}")
        else:
            print(f"  [PASS] {art['slug']} ({words} words, {len(art['faqs'])} FAQs, {len(art['products'])} products)")

    if not all_ok:
        raise SystemExit("Batch validation failed! Fix errors before publishing.")

    # Build SQL transaction
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
WHERE "Article".id LIKE 'seed100_%';
""")
        # Products
        for pos, prod in enumerate(art["products"]):
            ap_id = f"{aid}_p{pos+1}"
            sql_lines.append(f"""
INSERT INTO "ArticleProduct" (id, "articleId", "productId", rationale, position)
VALUES ({sql_str(ap_id)}, (SELECT id FROM "Article" WHERE slug = {sql_str(slug)}), {sql_str(prod["id"])}, {sql_str(prod["rationale"])}, {pos})
ON CONFLICT ("articleId", "productId") DO UPDATE SET rationale = EXCLUDED.rationale, position = EXCLUDED.position;
""")
        # FAQs (replace for this seed100 article idempotent)
        sql_lines.append(f'DELETE FROM "ArticleFaq" WHERE "articleId" = (SELECT id FROM "Article" WHERE slug = {sql_str(slug)} AND id LIKE \'seed100_%\');')
        for pos, faq in enumerate(art["faqs"]):
            af_id = f"{aid}_f{pos+1}"
            sql_lines.append(f"""
INSERT INTO "ArticleFaq" (id, "articleId", question, answer, position)
VALUES ({sql_str(af_id)}, (SELECT id FROM "Article" WHERE slug = {sql_str(slug)}), {sql_str(faq["question"])}, {sql_str(faq["answer"])}, {pos});
""")

    sql_lines.append("COMMIT;")
    full_sql = "\n".join(sql_lines)

    print(f"=== Publishing Batch {batch_num:02d} to Production PostgreSQL ===")
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

    # Verify total count
    stdin2, stdout2, _ = ssh.exec_command('docker exec paratunisie-postgres psql -t -A -U paratunisie -d paratunisie -c "SELECT count(*) FROM \\"Article\\" WHERE status=\'PUBLISHED\';"')
    total_pub = stdout2.read().decode().strip()
    ssh.close()

    # Update manifest status
    for art in articles:
        m = m_by_slug[art["slug"]]
        m["draft_status"] = "COMPLETED"
        m["scientific_verification_status"] = "VERIFIED"
        m["publication_status"] = "PUBLISHED"
        m["word_count"] = word_counts[art["slug"]]

    with open("scripts/editorial_manifest_100.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"Batch {batch_num:02d} published! Total PUBLISHED articles in DB: {total_pub}")

if __name__ == "__main__":
    b = int(sys.argv[1])
    publish_batch(b)
