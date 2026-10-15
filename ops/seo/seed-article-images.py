#!/usr/bin/env python3
"""Generate SQL to backfill featuredImage on the 46 seeded articles, using
real product/brand images already live in the catalogue (same convention
other published articles use: a representative real photo, or the site's
generic hero image for topics with no single matching product/brand)."""

FALLBACK = "/assets/hero-paratunisie.webp"

# Real images confirmed via direct DB query against production (2026-10-15).
CATEGORY_IMAGE = {
    "l-carnitine": "/uploads/products/gold-l-carnitine-3000-500ml-f9c4c91a.webp",
    "creatine": "/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp",
    "whey": "/uploads/products/anabolic-whey-80-2-25kg-proactive-d1e70098.webp",
    "bcaa": "/uploads/products/bcaa-8-1-1-400g-real-pharm-5d58c733.webp",
    "ashwagandha": "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp",
    "vitamines": "/uploads/products/magnesium-vitamin-b6-90-tablets-4a8b69cd.webp",
    "omega3": "/uploads/products/zumub-omega-3-90-caps-36ace772.webp",
    "gainer": "/uploads/products/thunder-gainer-5-4kg-challenger-nutrition-20b49293.webp",
    "preworkout": "/uploads/products/victor-martinez-break-out-pre-workout-e54cafd2.webp",
    "brule": "/uploads/products/lipo-6-black-ultra-concentrate-60caps-7abcdedc.webp",
}

BRAND_IMAGE = {
    "optimum-nutrition-tunisie-guide-achat": "/uploads/products/micronised-creatine-optimum-nutrition-317g-b84738f3.webp",
    "real-pharm-tunisie-guide": "/uploads/products/creatine-real-pharm-300g-f2ec3b61.webp",
    "ostrovit-tunisie-guide": "/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp",
    "biotechusa-tunisie-guide": "/uploads/products/100-creatine-monohydrate-300g-biotech-usa-eca8075b.webp",
    "quamtrax-eric-favre-tunisie": "/uploads/products/creatine-monohydrate-500g-quamtrax-fc4afe10.webp",
}

SLUG_IMAGE = {
    **BRAND_IMAGE,
    "l-carnitine-liquide-vs-gelules": CATEGORY_IMAGE["l-carnitine"],
    "l-carnitine-science-perte-de-poids": CATEGORY_IMAGE["l-carnitine"],
    "dosage-l-carnitine-quand-prendre": CATEGORY_IMAGE["l-carnitine"],
    "l-carnitine-tartrate-vs-acetyl": CATEGORY_IMAGE["l-carnitine"],
    "comprendre-formes-creatine-etiquette": CATEGORY_IMAGE["creatine"],
    "creatine-femme-idees-recues": CATEGORY_IMAGE["creatine"],
    "whey-ou-creatine-par-quoi-commencer": CATEGORY_IMAGE["creatine"],
    "reprise-whey-creatine-apres-ramadan": CATEGORY_IMAGE["creatine"],
    "additifs-edulcorants-whey-etiquette": CATEGORY_IMAGE["whey"],
    "meilleure-marque-whey-tunisie-comparatif": CATEGORY_IMAGE["whey"],
    "whey-proteine-femme-guide": CATEGORY_IMAGE["whey"],
    "whey-isolate-vs-hydrolysee": CATEGORY_IMAGE["whey"],
    "bcaa-vs-eaa-approfondi": CATEGORY_IMAGE["bcaa"],
    "ratio-bcaa-comparatif": CATEGORY_IMAGE["bcaa"],
    "eaa-faut-il-avec-whey": CATEGORY_IMAGE["bcaa"],
    "bcaa-comparatif-marques-tunisie": CATEGORY_IMAGE["bcaa"],
    "ashwagandha-delai-effet": CATEGORY_IMAGE["ashwagandha"],
    "ashwagandha-sommeil-recherche": CATEGORY_IMAGE["ashwagandha"],
    "magnesium-cycle-menstruel-sport": CATEGORY_IMAGE["vitamines"],
    "magnesium-alimentation-vs-complement": CATEGORY_IMAGE["vitamines"],
    "magnesium-etudiants-stress-examens": CATEGORY_IMAGE["vitamines"],
    "zma-zinc-magnesium-ensemble": CATEGORY_IMAGE["vitamines"],
    "fer-femme-sportive-carence": CATEGORY_IMAGE["vitamines"],
    "vitamine-d-tunisie-carence-soleil": CATEGORY_IMAGE["vitamines"],
    "multivitamines-vs-complements-cibles": CATEGORY_IMAGE["vitamines"],
    "omega-3-poisson-vs-gelule": CATEGORY_IMAGE["omega3"],
    "clean-gainer-vs-gainer-classique": CATEGORY_IMAGE["gainer"],
    "prise-de-masse-ectomorphe-tunisie": CATEGORY_IMAGE["gainer"],
    "gainer-maison-vs-commercial": CATEGORY_IMAGE["gainer"],
    "pre-workout-stimulant-vs-sans": CATEGORY_IMAGE["preworkout"],
    "nutrition-post-entrainement-guide": CATEGORY_IMAGE["preworkout"],
    "comment-lire-etiquette-complement-alimentaire": "/uploads/products/magnesium-vitamin-b6-90-tablets-4a8b69cd.webp",
}

import re
from pathlib import Path

DRAFTS_DIR = Path(__file__).parent / "drafts"
OUT_FILE = Path(__file__).parent / "seed-article-images.sql"


def main():
    slugs = sorted(f.stem for f in DRAFTS_DIR.glob("*.md") if f.stem != "category-content-thickening")
    statements = ["BEGIN;"]
    for slug in slugs:
        image = SLUG_IMAGE.get(slug, FALLBACK)
        safe = image.replace("'", "''")
        statements.append(
            f"UPDATE \"Article\" SET \"featuredImage\" = '{safe}' WHERE slug = '{slug}' AND id LIKE 'seed_%';"
        )
    statements.append("COMMIT;")
    OUT_FILE.write_text("\n".join(statements) + "\n", encoding="utf-8")
    print(f"Wrote {len(slugs)} UPDATEs to {OUT_FILE}")


if __name__ == "__main__":
    main()
