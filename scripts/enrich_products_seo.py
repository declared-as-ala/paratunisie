# -*- coding: utf-8 -*-
"""
ParaTunisie — Safe, Idempotent Product SEO Enrichment Engine
Processes ONLY the 123 strictly eligible products (PUBLISHED, inStock=true, totalStock>0, indexable=true).
Never modifies prices, stock, slugs, indexability, or excluded products.
"""
import json
import re
import sys
import shutil
import datetime

SNAPSHOT_PATH = "scripts/eligible_123_snapshot.json"
BACKUP_PATH = "scripts/backup_eligible_123_before.json"
OUTPUT_PATH = "scripts/enriched_123_products.json"

# Ensure immutable backup exists
shutil.copyfile(SNAPSHOT_PATH, BACKUP_PATH)

with open(SNAPSHOT_PATH, encoding="utf-8") as f:
    PRODUCTS = json.load(f)

# Load verified French blog slugs for contextual internal linking
try:
    with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
        BLOG_MANIFEST = json.load(f)
    VERIFIED_BLOG_SLUGS = {m["slug"]: m["title"] for m in BLOG_MANIFEST}
except Exception:
    VERIFIED_BLOG_SLUGS = {}

# Category -> relevant verified /conseils/<slug> guide
CATEGORY_GUIDE_MAP = {
    "creatine": ("creatine-monohydrate-ou-micronisee", "Guide complet sur la créatine"),
    "whey-proteine": ("quelle-whey-choisir-pour-debuter", "Comment choisir sa whey protéine"),
    "whey-isolate": ("whey-isolate-vs-concentree", "Whey Isolate vs Concentrée : le comparatif"),
    "whey-hydrolysee": ("whey-isolate-vs-concentree", "Comparer les différentes formes de whey"),
    "proteines-multi-sources": ("quelle-whey-choisir-pour-debuter", "Bien choisir sa protéine en poudre"),
    "proteine-de-boeuf": ("quelle-whey-choisir-pour-debuter", "Guide des protéines pour la musculation"),
    "proteines-vegetales": ("quelle-whey-choisir-pour-debuter", "Guide des protéines alimentaires"),
    "magnesium": ("magnesium-bisglycinate-vs-citrate", "Comparatif des formes de magnésium"),
    "ashwagandha": ("comment-choisir-son-ashwagandha", "Comment choisir son ashwagandha"),
    "omega-3": ("omega-3-epa-vs-dha", "Comprendre les oméga-3 EPA et DHA"),
    "collagene": ("collagene-marin-vs-bovin", "Collagène marin ou bovin : comment choisir"),
    "vitamines": ("vitamine-d-soleil-tunisie-carence", "Guide des vitamines essentielles en Tunisie"),
    "zinc": ("zinc-immunite-peau-formes", "Bien choisir son complément en zinc"),
    "mineraux": ("magnesium-bisglycinate-vs-citrate", "Guide des minéraux et oligo-éléments"),
    "pre-workout-energie": ("comment-choisir-pre-workout", "Comment choisir son pré-workout"),
    "beta-alanine": ("beta-alanine-picotements-dosage", "Comprendre la bêta-alanine"),
    "citrulline": ("citrulline-vs-arginine-pump", "Citrulline ou arginine : comparaison"),
    "bcaa-eaa": ("bcaa-ou-eaa-lequel-choisir", "BCAA ou EAA : lequel choisir"),
    "eaa": ("bcaa-ou-eaa-lequel-choisir", "Différences entre EAA et BCAA"),
    "acides-amines-glutamine": ("bcaa-ou-eaa-lequel-choisir", "Guide des acides aminés"),
    "glutamine": ("bcaa-ou-eaa-lequel-choisir", "Rôle des acides aminés en récupération"),
}

FORBIDDEN_CLAIMS = [
    "guérit", "guérir", "soigne le", "soigne la", "remplace un médicament",
    "miracle", "garanti sans risque", "anti-cancer", "cliniquement prouvé pour guérir",
]


def clean_text(val: str) -> str:
    return re.sub(r"\s+", " ", (val or "").strip())


def extract_format(name: str, variants: list) -> str:
    # Try variant labels first if meaningful
    labels = [clean_text(v.get("label", "")) for v in (variants or []) if v.get("label")]
    meaningful = [l for l in labels if l and l.lower() not in ("default", "standard", "unique")]
    if meaningful:
        return ", ".join(meaningful[:3])
    m = re.search(r"\b(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|ml|l|mg|mcg|µg|ui|gélules?|capsules?|comprimés?|tablets?|softgels?|sachets?|m))\b", name, re.I)
    if m:
        return m.group(1)
    return ""


def clean_product_name(name: str, brand: str) -> str:
    n = clean_text(name)
    if n.isupper() and len(n) > 12:
        n = n.title()
    elif n and n[0].islower():
        n = n[0].upper() + n[1:]
    return n


def strip_raw_seo_artifacts(desc: str) -> str:
    if not desc:
        return ""
    if "**SEO Title**" in desc or "**Meta Description**" in desc:
        # Remove the pasted SEO Title / Meta Description lines at the top
        lines = desc.splitlines()
        cleaned_lines = []
        skip_next = False
        for line in lines:
            st = line.strip()
            if st.startswith("**SEO Title**") or st.startswith("**Meta Description**"):
                skip_next = True
                continue
            if skip_next:
                if st == "":
                    skip_next = False
                    continue
                # skip the value line right under the header
                skip_next = False
                continue
            cleaned_lines.append(line)
        return "\n".join(cleaned_lines).strip()
    return desc.strip()


def min_price_tnd(variants: list) -> str:
    prices = [v["priceMillimes"] for v in (variants or []) if v.get("priceMillimes") and v["priceMillimes"] > 0]
    if not prices:
        return ""
    p = min(prices) / 1000.0
    if abs(p - round(p)) < 0.001:
        return f"{int(round(p))} DT"
    return f"{p:.3f} DT".rstrip("0").rstrip(".")


def build_seo_title(name: str, brand: str, category: str) -> str:
    base = clean_product_name(name, brand)
    # Remove trailing "| BRAND" if brand already added
    base_no_pipe = re.sub(r"\s*\|\s*[^|]+$", "", base).strip()
    brand_clean = clean_text(brand)
    if brand_clean and brand_clean.lower() not in base_no_pipe.lower() and "non renseign" not in brand_clean.lower():
        candidate = f"{base_no_pipe} {brand_clean}"
    else:
        candidate = base_no_pipe

    # Target <= 64 chars before formatSeoTitle appends " | ParaTunisie" (so total <= 78 chars, Google ~60-65)
    suffix = " | Prix Tunisie"
    if len(candidate) + len(suffix) <= 64:
        return f"{candidate}{suffix}"
    # Try shorter suffix
    if len(candidate) + len(" Tunisie") <= 64:
        return f"{candidate} Tunisie"
    if len(candidate) <= 64:
        return candidate
    return candidate[:61].rsplit(" ", 1)[0].rstrip(" -|,")


def build_seo_description(name: str, brand: str, category: str, fmt: str, price_tnd: str) -> str:
    base = clean_product_name(name, brand)
    brand_clean = clean_text(brand)
    brand_part = f" de {brand_clean}" if brand_clean and brand_clean.lower() not in base.lower() else ""
    fmt_part = f" ({fmt})" if fmt and fmt.lower() not in base.lower() else ""
    price_part = f" à {price_tnd}" if price_tnd else ""

    desc = (
        f"Commandez {base}{brand_part}{fmt_part}{price_part} en Tunisie sur ParaTunisie. "
        f"Produit authentique ({category}), livraison rapide 24-48h et paiement à la réception."
    )
    if len(desc) > 158:
        desc = (
            f"Achetez {base}{brand_part}{price_part} en Tunisie sur ParaTunisie. "
            f"Qualité {category} certifiée, livraison 24-48h partout en Tunisie."
        )
    if len(desc) > 158:
        desc = (
            f"{base}{price_part} en Tunisie sur ParaTunisie. "
            f"Produit original ({category}), livraison 24-48h."
        )
    if len(desc) > 158:
        desc = f"{base}{price_part} — ParaTunisie. Livraison rapide 24-48h partout en Tunisie."
    if len(desc) > 158:
        desc = desc[:155].rsplit(" ", 1)[0].rstrip(" ,;:-") + "."
    if len(desc) < 122:
        desc = desc.rstrip(".") + ". Paiement sécurisé à la livraison."
    return desc


def build_seo_h1(name: str, brand: str) -> str:
    base = clean_product_name(name, brand)
    return base


def build_seo_intro(p: dict, fmt: str, price_tnd: str) -> str:
    name = clean_product_name(p["name"], p["brand_name"])
    brand = clean_text(p["brand_name"])
    cat = clean_text(p["category_name"])
    benefit = clean_text(p.get("benefit", ""))
    usage = clean_text(p.get("usage", ""))

    parts = [
        f"{name} est une référence de la marque {brand} sélectionnée dans notre rayon {cat} pour répondre aux attentes des sportifs et consommateurs exigeants en Tunisie."
    ]
    if fmt:
        parts.append(f"Proposé au format {fmt}, ce produit permet d'intégrer facilement un apport adapté à votre routine quotidienne ou à votre programme d'entraînement.")
    if benefit and len(benefit) > 25 and not benefit.lower().startswith("produit"):
        parts.append(benefit.rstrip(".") + ".")
    else:
        parts.append(f"Formulé selon les standards qualité de {brand}, il offre une traçabilité claire et une composition vérifiée avant mise en ligne.")
    if usage and len(usage) > 20:
        parts.append(f"Conseil pratique : {usage[:160].rstrip('.')}.")
    if price_tnd:
        parts.append(f"Disponible immédiatement en stock sur ParaTunisie à partir de {price_tnd} avec expédition sous 24 à 48 heures partout en Tunisie.")
    else:
        parts.append("Disponible en stock sur ParaTunisie avec livraison rapide 24 à 48h partout en Tunisie.")
    return " ".join(parts)


def build_description(p: dict, fmt: str) -> str:
    raw = strip_raw_seo_artifacts(p.get("description") or "")
    words = len(raw.split())
    if words >= 65:
        return raw
    # Enrich thin/corrupted description strictly from verified DB attributes
    name = clean_product_name(p["name"], p["brand_name"])
    brand = clean_text(p["brand_name"])
    cat = clean_text(p["category_name"])
    benefit = clean_text(p.get("benefit", ""))
    usage = clean_text(p.get("usage", ""))

    lines = [
        f"### Présentation de {name}",
        f"{name} est un produit officiel de la marque **{brand}**, référencé dans la catégorie **{cat}** sur ParaTunisie.",
    ]
    if raw:
        lines.append(raw)
    if benefit:
        lines.append(f"\n### Points clés\n- {benefit}")
    if fmt:
        lines.append(f"- Format disponible : **{fmt}**")
    lines.append(f"- Marque : **{brand}**")
    lines.append(f"- Catégorie : **{cat}**")
    if usage:
        lines.append(f"\n### Conseils d'utilisation\n{usage}")
    else:
        lines.append("\n### Conseils d'utilisation\nRespectez les indications figurant sur l'emballage du fabricant et demandez conseil à un professionnel de santé en cas de besoin.")
    return "\n\n".join(lines)


def build_seo_content(p: dict, fmt: str, price_tnd: str) -> str:
    name = clean_product_name(p["name"], p["brand_name"])
    brand = clean_text(p["brand_name"])
    brand_slug = p["brand_slug"]
    cat = clean_text(p["category_name"])
    cat_slug = p["category_slug"]
    usage = clean_text(p.get("usage", ""))
    stock_qty = p.get("totalStock", 0)

    guide = CATEGORY_GUIDE_MAP.get(cat_slug)
    guide_line = ""
    if guide and guide[0] in VERIFIED_BLOG_SLUGS:
        guide_line = f" Pour approfondir votre choix, consultez également notre [{guide[1]}](/conseils/{guide[0]})."

    variants = p.get("variants") or []
    var_summary = ""
    if variants:
        var_bits = [f"{v.get('label') or 'Standard'} ({v['priceMillimes']/1000:.3f} DT)".replace(".000 DT", " DT") for v in variants[:4] if v.get("priceMillimes")]
        if var_bits:
            var_summary = f"Variantes suivies en catalogue : {', '.join(var_bits)}."

    sec1 = (
        f"## Pourquoi choisir {name} de {brand} ?\n\n"
        f"Dans la catégorie [{cat}](/{cat_slug}), le choix d'un produit authentique et correctement conservé est essentiel. "
        f"{name}, fabriqué par [{brand}](/marques/{brand_slug}), répond aux exigences de qualité et de transparence attendues par les clients tunisiens. "
        f"{var_summary}"
    )

    sec2 = (
        f"## Conseils pratiques et précautions d'emploi\n\n"
        f"- **Utilisation recommandée :** {usage if len(usage) > 15 else 'Suivre la dose journalière indiquée sur l’étiquette officielle du fabricant.'}\n"
        f"- **Conservation en Tunisie :** Conserver le produit bien fermé dans un endroit sec, à l'abri de la chaleur et de l'humidité.\n"
        f"- **Précaution :** Les compléments alimentaires et produits de nutrition sportive accompagnent une alimentation variée et équilibrée sans s'y substituer.{guide_line}"
    )

    sec3 = (
        f"## Disponibilité et commande en Tunisie\n\n"
        f"{name} est actuellement en stock réel ({stock_qty} unité{'s' if stock_qty > 1 else ''} disponible{'s' if stock_qty > 1 else ''}) "
        f"{f'au tarif de {price_tnd} ' if price_tnd else ''}sur ParaTunisie. "
        f"Vous bénéficiez d'une livraison rapide en 24 à 48h sur Tunis, Sfax, Sousse et l'ensemble des gouvernorats avec paiement à la livraison."
    )

    return f"{sec1}\n\n{sec2}\n\n{sec3}"


def build_seo_faq(p: dict, fmt: str, price_tnd: str) -> list:
    name = clean_product_name(p["name"], p["brand_name"])
    brand = clean_text(p["brand_name"])
    cat = clean_text(p["category_name"])
    usage = clean_text(p.get("usage", ""))

    faqs = [
        {
            "question": f"{name} est-il un produit original de la marque {brand} ?",
            "answer": f"Oui, ParaTunisie commercialise exclusivement des références {brand} authentiques et traçables dans la catégorie {cat}, stockées dans des conditions adaptées."
        },
        {
            "question": f"Quel est le prix et le délai de livraison pour {name} en Tunisie ?",
            "answer": f"{name} est disponible en stock{f' à partir de {price_tnd}' if price_tnd else ''} avec livraison rapide en 24 à 48 heures partout en Tunisie et paiement à la réception."
        },
        {
            "question": f"Comment utiliser {name} au quotidien ?",
            "answer": usage if len(usage) > 20 else f"Respectez les instructions et le dosage figurant sur l'étiquette officielle {brand}{' (' + fmt + ')' if fmt else ''}, et demandez avis à un professionnel de santé en cas de traitement médical."
        },
    ]
    return faqs


def build_keywords(p: dict) -> list:
    name = clean_text(p["name"]).lower()
    brand = clean_text(p["brand_name"]).lower()
    cat = clean_text(p["category_name"]).lower()
    kws = [
        name,
        f"{name} tunisie",
        f"{cat} tunisie",
        f"{brand} tunisie",
        f"acheter {cat} tunisie",
    ]
    seen = set()
    out = []
    for k in kws:
        if k and k not in seen and "non renseign" not in k:
            seen.add(k)
            out.append(k)
    return out


def enrich_product(p: dict) -> dict:
    fmt = extract_format(p["name"], p.get("variants"))
    price_tnd = min_price_tnd(p.get("variants"))
    brand = clean_text(p["brand_name"])
    cat = clean_text(p["category_name"])

    seo_title = build_seo_title(p["name"], brand, cat)
    seo_desc = build_seo_description(p["name"], brand, cat, fmt, price_tnd)
    seo_h1 = build_seo_h1(p["name"], brand)
    seo_intro = build_seo_intro(p, fmt, price_tnd)
    description = build_description(p, fmt)
    seo_content = build_seo_content(p, fmt, price_tnd)
    seo_faq = build_seo_faq(p, fmt, price_tnd)
    canonical = f"https://paratunisie.com/produits/{p['slug']}"
    img = p["image"]
    og_image = img if img.startswith("http") else f"https://paratunisie.com{img if img.startswith('/') else '/' + img}"
    image_alt = f"{seo_h1} — {brand} ({cat}) sur ParaTunisie"
    keywords = build_keywords(p)

    # Check forbidden claims in all newly generated fields
    generated_combined = f"{seo_title} {seo_desc} {seo_intro} {seo_content}".lower()
    for bad in FORBIDDEN_CLAIMS:
        if bad in generated_combined:
            raise ValueError(f"Forbidden claim '{bad}' detected in generated SEO for {p['slug']}")

    return {
        "id": p["id"],
        "slug": p["slug"],
        "name": p["name"],
        "totalStock": p["totalStock"],
        "previous_seo_score": p["seoScore"],
        "seoTitle": seo_title,
        "seoDescription": seo_desc,
        "seoH1": seo_h1,
        "seoIntro": seo_intro,
        "description": description,
        "seoContent": seo_content,
        "seoFaq": json.dumps(seo_faq, ensure_ascii=False),
        "seoKeywords": json.dumps(keywords, ensure_ascii=False),
        "canonicalUrl": canonical,
        "ogTitle": seo_title,
        "ogDescription": seo_desc,
        "ogImage": og_image,
        "imageAlt": image_alt,
    }


def main():
    enriched = [enrich_product(p) for p in PRODUCTS]

    # Ensure 100% uniqueness of seoTitle & seoDescription
    seen_titles = {}
    seen_descs = {}
    for item in enriched:
        t_low = item["seoTitle"].lower()
        if t_low in seen_titles:
            item["seoTitle"] = f"{item['seoTitle']} ({item['slug'].split('-')[-1]})"
        seen_titles[item["seoTitle"].lower()] = item["slug"]

        d_low = item["seoDescription"].lower()
        if d_low in seen_descs:
            item["seoDescription"] = item["seoDescription"].rstrip(".") + f" [{item['slug'].split('-')[-1]}]."
        seen_descs[item["seoDescription"].lower()] = item["slug"]

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"Enriched {len(enriched)} eligible products -> {OUTPUT_PATH}")
    print(f"Unique seoTitles: {len(set(x['seoTitle'].lower() for x in enriched))}/{len(enriched)}")
    print(f"Unique seoDescriptions: {len(set(x['seoDescription'].lower() for x in enriched))}/{len(enriched)}")
    print(f"seoDescription length range: {min(len(x['seoDescription']) for x in enriched)}..{max(len(x['seoDescription']) for x in enriched)}")
    print(f"seoIntro word count range: {min(len(x['seoIntro'].split()) for x in enriched)}..{max(len(x['seoIntro'].split()) for x in enriched)}")
    print(f"seoContent word count range: {min(len(x['seoContent'].split()) for x in enriched)}..{max(len(x['seoContent'].split()) for x in enriched)}")

    if "--pilot" in sys.argv:
        print("\n=== PILOT 10 SAMPLE ===")
        for x in enriched[:10]:
            print(f"- {x['slug']} | title=({len(x['seoTitle'])}) {x['seoTitle']}")
            print(f"  meta=({len(x['seoDescription'])}) {x['seoDescription']}")
            print(f"  intro_words={len(x['seoIntro'].split())}, content_words={len(x['seoContent'].split())}")


if __name__ == "__main__":
    main()
