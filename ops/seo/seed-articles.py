#!/usr/bin/env python3
"""Parse ops/seo/drafts/*.md into SQL INSERTs for Article + ArticleFaq.
All articles seeded with status='DRAFT' — nothing goes live until a human
reviews and flips status to PUBLISHED in the admin. Read-only on the repo;
writes only seed-articles.sql next to this script."""
import re
import json
import uuid
from pathlib import Path

DRAFTS_DIR = Path(__file__).parent / "drafts"
OUT_FILE = Path(__file__).parent / "seed-articles.sql"

# slug -> (category, readTime)
CATEGORY_MAP = {
    "l-carnitine-liquide-vs-gelules": ("Sèche & Minceur", "6 min"),
    "l-carnitine-science-perte-de-poids": ("Sèche & Minceur", "7 min"),
    "dosage-l-carnitine-quand-prendre": ("Sèche & Minceur", "5 min"),
    "l-carnitine-tartrate-vs-acetyl": ("Sèche & Minceur", "5 min"),
    "comment-lire-etiquette-complement-alimentaire": ("Débutants", "6 min"),
    "comprendre-formes-creatine-etiquette": ("Créatine", "5 min"),
    "additifs-edulcorants-whey-etiquette": ("Protéines", "5 min"),
    "optimum-nutrition-tunisie-guide-achat": ("Protéines & Masse", "6 min"),
    "real-pharm-tunisie-guide": ("Protéines & Masse", "6 min"),
    "ostrovit-tunisie-guide": ("Protéines & Masse", "6 min"),
    "biotechusa-tunisie-guide": ("Protéines & Masse", "5 min"),
    "meilleure-marque-whey-tunisie-comparatif": ("Protéines", "7 min"),
    "bcaa-vs-eaa-approfondi": ("Acides Aminés", "6 min"),
    "ratio-bcaa-comparatif": ("Acides Aminés", "5 min"),
    "eaa-faut-il-avec-whey": ("Acides Aminés", "5 min"),
    "whey-proteine-femme-guide": ("Protéines", "6 min"),
    "creatine-femme-idees-recues": ("Créatine", "6 min"),
    "fer-femme-sportive-carence": ("Vitamines & Santé", "5 min"),
    "magnesium-cycle-menstruel-sport": ("Minéraux", "5 min"),
    "nutrition-sportive-ramadan-guide": ("Bien-être", "7 min"),
    "complements-ramadan-musculation": ("Bien-être", "6 min"),
    "reprise-whey-creatine-apres-ramadan": ("Bien-être", "5 min"),
    "debuter-musculation-petit-budget-tunisie": ("Débutants", "7 min"),
    "whey-ou-creatine-par-quoi-commencer": ("Débutants", "5 min"),
    "stack-minimal-debutant-musculation": ("Débutants", "5 min"),
    "magnesium-alimentation-vs-complement": ("Minéraux", "6 min"),
    "omega-3-poisson-vs-gelule": ("Vitamines & Santé", "5 min"),
    "vitamine-d-tunisie-carence-soleil": ("Vitamines & Santé", "6 min"),
    "magnesium-etudiants-stress-examens": ("Minéraux", "5 min"),
    "complements-travail-bureau-fatigue": ("Bien-être", "5 min"),
    "hydratation-electrolytes-chaleur-tunisie": ("Bien-être", "5 min"),
    "nutrition-post-entrainement-guide": ("Performance", "6 min"),
    "courbatures-doms-complements-utiles": ("Bien-être", "6 min"),
    "whey-isolate-vs-hydrolysee": ("Protéines", "5 min"),
    "pre-workout-stimulant-vs-sans": ("Performance", "6 min"),
    "clean-gainer-vs-gainer-classique": ("Prise de Masse", "5 min"),
    "prise-de-masse-ectomorphe-tunisie": ("Prise de Masse", "7 min"),
    "gainer-maison-vs-commercial": ("Prise de Masse", "5 min"),
    "ashwagandha-delai-effet": ("Bien-être", "4 min"),
    "ashwagandha-sommeil-recherche": ("Bien-être", "5 min"),
    "zma-zinc-magnesium-ensemble": ("Minéraux", "5 min"),
    "bcaa-comparatif-marques-tunisie": ("Acides Aminés", "6 min"),
    "quamtrax-eric-favre-tunisie": ("Protéines & Masse", "5 min"),
    "multivitamines-vs-complements-cibles": ("Vitamines & Santé", "6 min"),
    "conservation-complements-apres-ouverture": ("Débutants", "4 min"),
    "melanger-complements-shaker": ("Débutants", "5 min"),
}

SEED_DATE = "2026-10-15"
AUTHOR = "Équipe éditoriale ParaTunisie"


def sql_dollar(text: str) -> str:
    """Dollar-quote a string for SQL, sidestepping apostrophe escaping."""
    tag = "art"
    while f"${tag}$" in text:
        tag += "x"
    return f"${tag}${text}${tag}$"


def parse_frontmatter(lines):
    meta = {}
    i = 0
    while i < len(lines) and lines[i].strip() != "---":
        m = re.match(r"\*\*([^:]+):\*\*\s*(.*)", lines[i].strip())
        if m:
            key = m.group(1).strip().lower()
            val = m.group(2).strip().strip("`")
            meta[key] = val
        i += 1
    return meta, i + 1


def parse_body(lines):
    """Returns (blocks, faqs). blocks: [{type,text}]. faqs: [(q,a)]."""
    blocks = []
    faqs = []
    current_faq_q = None
    in_faq = False

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith("## "):
            heading = line[3:].strip()
            in_faq = heading.upper() == "FAQ"
            if not in_faq:
                blocks.append({"type": "heading", "text": heading})
            continue
        if line.startswith("# "):
            continue
        if line.startswith("|"):
            # markdown table row -> flatten to a readable text line
            cells = [c.strip() for c in line.strip("|").split("|")]
            if all(re.match(r"^:?-+:?$", c) for c in cells if c):
                continue
            blocks.append({"type": "paragraph", "text": " — ".join(cells)})
            continue

        if in_faq:
            qmatch = re.match(r"^\*\*(.+)\*\*$", line.strip())
            if qmatch:
                current_faq_q = qmatch.group(1).strip()
            elif current_faq_q:
                faqs.append((current_faq_q, line.strip()))
                current_faq_q = None
            continue

        blocks.append({"type": "paragraph", "text": line.strip()})

    return blocks, faqs


def main():
    files = sorted(DRAFTS_DIR.glob("*.md"))
    files = [f for f in files if f.stem != "category-content-thickening"]

    statements = []
    skipped = []

    for f in files:
        slug = f.stem
        text = f.read_text(encoding="utf-8")
        lines = text.splitlines()

        title = lines[0].lstrip("#").strip() if lines[0].startswith("#") else slug
        meta, body_start = parse_frontmatter(lines[1:])
        body_lines = lines[1:][body_start:]

        blocks, faqs = parse_body(body_lines)
        if not blocks:
            skipped.append(slug)
            continue

        # First paragraph block (pre-first-heading) becomes the excerpt source.
        first_para = next((b["text"] for b in blocks if b["type"] == "paragraph"), title)
        excerpt = first_para[:220].rsplit(" ", 1)[0] + ("…" if len(first_para) > 220 else "")

        category, read_time = CATEGORY_MAP.get(slug, ("Bien-être", "5 min"))
        meta_title = meta.get("meta title", title + " | ParaTunisie")
        meta_desc = meta.get("meta description", excerpt)
        target_kw = meta.get("target keyword", "")

        content_json = json.dumps(blocks, ensure_ascii=False)
        article_id = f"seed_{uuid.uuid4().hex[:20]}"

        stmt = f"""INSERT INTO "Article"
  (id, slug, title, excerpt, category, "readTime", date, content, status, "authorName", "seoTitle", "metaDescription", "targetKeyword", indexable, "createdAt", "updatedAt")
VALUES
  ('{article_id}', {sql_dollar(slug)}, {sql_dollar(title)}, {sql_dollar(excerpt)}, {sql_dollar(category)}, {sql_dollar(read_time)}, '{SEED_DATE}', {sql_dollar(content_json)}, 'DRAFT', {sql_dollar(AUTHOR)}, {sql_dollar(meta_title)}, {sql_dollar(meta_desc)}, {sql_dollar(target_kw)}, false, now(), now());"""
        statements.append(stmt)

        for pos, (q, a) in enumerate(faqs):
            faq_id = f"seedfaq_{uuid.uuid4().hex[:20]}"
            statements.append(
                f"""INSERT INTO "ArticleFaq" (id, "articleId", question, answer, position)
VALUES ('{faq_id}', '{article_id}', {sql_dollar(q)}, {sql_dollar(a)}, {pos});"""
            )

    OUT_FILE.write_text("\nBEGIN;\n" + "\n\n".join(statements) + "\nCOMMIT;\n", encoding="utf-8")
    print(f"Wrote {len(files) - len(skipped)} articles ({len(statements)} statements) to {OUT_FILE}")
    if skipped:
        print("Skipped (no parseable body):", skipped)


if __name__ == "__main__":
    main()
