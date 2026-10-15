#!/usr/bin/env python3
"""Backfill featuredImage / imageAlt / ogImage / imagePrompt on the 46
seeded articles with real Unsplash photos, per the user's request to match
the style used on their other project.

Every photo ID below was found via live search, fetched to confirm it is
a real Unsplash page, resolved to its actual CDN path, and verified with a
live HTTP 200 check against images.unsplash.com (2026-10-15) — not guessed.
Each is a free "Unsplash License" photo (two Unsplash+ paid candidates
found during research were discarded, not used).

URL formula (exact, as requested):
  https://images.unsplash.com/{id}?auto=format&fit=crop&w=1600&q=75
"""
from pathlib import Path

IMG = lambda photo_id: f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=1600&q=75"

CLUSTERS = {
    "AMBER": {
        "id": "photo-1763668177859-0ed5669a795e",
        "alt": "Flacon ambré de complément alimentaire liquide posé sur un plan de travail",
        "prompt": "Amber glass supplement bottle with a white label standing on a clean counter, soft natural light, minimal background",
    },
    "BLENDER": {
        "id": "photo-1693996045838-980674653385",
        "alt": "Trois contenants de poudre de complément sportif posés à côté d'un blender",
        "prompt": "Three sports supplement powder containers next to a blender on a kitchen counter, fitness supplement still life",
    },
    "WHEY": {
        "id": "photo-1704650311190-7eeb9c4f6e11",
        "alt": "Pot de poudre de whey protéine avec une cuillère doseuse",
        "prompt": "Jar of whey protein powder with a measuring scoop beside it, close-up studio shot",
    },
    "PILLS": {
        "id": "photo-1644432757359-b184377d9eb0",
        "alt": "Bol en verre rempli de gélules jaunes de complément alimentaire",
        "prompt": "Glass bowl filled with yellow vitamin capsules on a white surface, close-up studio shot",
    },
    "TUB": {
        "id": "photo-1763757933154-d55844eae856",
        "alt": "Contenant noir de complément alimentaire avec étiquette blanche",
        "prompt": "Black supplement container with a blank white label, water splash effect, studio product shot",
    },
    "GAINER": {
        "id": "photo-1701859081266-95a6ce1af505",
        "alt": "Homme tenant un verre de boisson protéinée à table",
        "prompt": "Man holding a glass of protein shake at a table, casual indoor fitness lifestyle shot",
    },
    "WATER": {
        "id": "photo-1758223520369-c6a215d6aedb",
        "alt": "Homme tenant une bouteille d'eau en plein air après l'effort",
        "prompt": "Man in a sleeveless shirt holding a water bottle outdoors after a workout",
    },
    "GYM": {
        "id": "photo-1761839258420-5c3e2f2e2a74",
        "alt": "Femme soulevant des poids dans une salle de musculation",
        "prompt": "Woman lifting dumbbells in a gym, fitness training action shot",
    },
    "HERBS": {
        "id": "photo-1757045869405-7a9cca283e27",
        "alt": "Plateau en bois avec compartiments d'herbes et d'épices séchées",
        "prompt": "Wooden tray with compartments of dried herbs and spices, natural wellness flat lay",
    },
}

SLUG_CLUSTER = {
    "additifs-edulcorants-whey-etiquette": "WHEY",
    "ashwagandha-delai-effet": "HERBS",
    "ashwagandha-sommeil-recherche": "HERBS",
    "bcaa-comparatif-marques-tunisie": "TUB",
    "bcaa-vs-eaa-approfondi": "TUB",
    "biotechusa-tunisie-guide": "TUB",
    "clean-gainer-vs-gainer-classique": "GAINER",
    "comment-lire-etiquette-complement-alimentaire": "TUB",
    "complements-ramadan-musculation": "HERBS",
    "complements-travail-bureau-fatigue": "PILLS",
    "comprendre-formes-creatine-etiquette": "BLENDER",
    "conservation-complements-apres-ouverture": "TUB",
    "courbatures-doms-complements-utiles": "GYM",
    "creatine-femme-idees-recues": "BLENDER",
    "debuter-musculation-petit-budget-tunisie": "GYM",
    "dosage-l-carnitine-quand-prendre": "AMBER",
    "eaa-faut-il-avec-whey": "TUB",
    "fer-femme-sportive-carence": "PILLS",
    "gainer-maison-vs-commercial": "GAINER",
    "hydratation-electrolytes-chaleur-tunisie": "WATER",
    "l-carnitine-liquide-vs-gelules": "AMBER",
    "l-carnitine-science-perte-de-poids": "AMBER",
    "l-carnitine-tartrate-vs-acetyl": "AMBER",
    "magnesium-alimentation-vs-complement": "PILLS",
    "magnesium-cycle-menstruel-sport": "PILLS",
    "magnesium-etudiants-stress-examens": "PILLS",
    "meilleure-marque-whey-tunisie-comparatif": "WHEY",
    "melanger-complements-shaker": "TUB",
    "multivitamines-vs-complements-cibles": "PILLS",
    "nutrition-post-entrainement-guide": "GAINER",
    "nutrition-sportive-ramadan-guide": "WATER",
    "omega-3-poisson-vs-gelule": "PILLS",
    "optimum-nutrition-tunisie-guide-achat": "TUB",
    "ostrovit-tunisie-guide": "TUB",
    "pre-workout-stimulant-vs-sans": "BLENDER",
    "prise-de-masse-ectomorphe-tunisie": "GAINER",
    "quamtrax-eric-favre-tunisie": "TUB",
    "ratio-bcaa-comparatif": "TUB",
    "real-pharm-tunisie-guide": "TUB",
    "reprise-whey-creatine-apres-ramadan": "BLENDER",
    "stack-minimal-debutant-musculation": "GYM",
    "vitamine-d-tunisie-carence-soleil": "PILLS",
    "whey-isolate-vs-hydrolysee": "WHEY",
    "whey-ou-creatine-par-quoi-commencer": "BLENDER",
    "whey-proteine-femme-guide": "WHEY",
    "zma-zinc-magnesium-ensemble": "PILLS",
}

OUT_FILE = Path(__file__).parent / "seed-article-unsplash-images.sql"


def esc(s: str) -> str:
    return s.replace("'", "''")


def main():
    statements = ["BEGIN;"]
    for slug, cluster_key in SLUG_CLUSTER.items():
        c = CLUSTERS[cluster_key]
        url = IMG(c["id"])
        statements.append(
            f"""UPDATE "Article" SET
  "featuredImage" = '{esc(url)}',
  "imageAlt" = '{esc(c["alt"])}',
  "ogImage" = '{esc(url)}',
  "imagePrompt" = '{esc(c["prompt"])}'
WHERE slug = '{slug}' AND id LIKE 'seed_%';"""
        )
    statements.append("COMMIT;")
    OUT_FILE.write_text("\n".join(statements) + "\n", encoding="utf-8")
    print(f"Wrote {len(SLUG_CLUSTER)} UPDATEs to {OUT_FILE}")


if __name__ == "__main__":
    main()
