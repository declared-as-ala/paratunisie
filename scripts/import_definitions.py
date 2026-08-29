import re
import unicodedata

CATEGORY_DEFINITIONS = [
    # Top Parents
    {"name": "Nutrition Sportive", "slug": "nutrition-sportive", "parent": None, "desc": "Gamme complète de compléments de nutrition sportive pour la performance et le muscle en Tunisie.", "seoTitle": "Nutrition Sportive en Tunisie | Compléments & Protéines ParaTunisie", "seoDesc": "Boutique en ligne de nutrition sportive en Tunisie : whey, créatine, gainers, BCAA et boosters 100% authentiques avec livraison rapide."},
    {"name": "Compléments Alimentaires", "slug": "complements-alimentaires", "parent": None, "desc": "Sélection de compléments alimentaires pour la santé, l'énergie et la vitalité au quotidien.", "seoTitle": "Compléments Alimentaires en Tunisie | Santé & Vitalité ParaTunisie", "seoDesc": "Achetez vos compléments alimentaires en Tunisie : vitamines, minéraux, oméga 3, probiotiques et extraits de plantes livrés partout en Tunisie."},
    
    # Nutrition Sportive Children
    {"name": "Créatine", "slug": "creatine", "parent": "nutrition-sportive", "desc": "Créatine monohydrate et formules avancées pour la force, la puissance et la prise de masse.", "seoTitle": "Créatine Monohydrate en Tunisie | Force & Muscle ParaTunisie", "seoDesc": "Découvrez notre sélection de créatines monohydrate pures en Tunisie. Qualité pharmaceutique, labels Creapure et livraison rapide."},
    {"name": "Whey Protéine", "slug": "whey-proteine", "parent": "nutrition-sportive", "desc": "Protéines de lactosérum de haute qualité pour la construction musculaire et la récupération.", "seoTitle": "Whey Protéine en Tunisie | Poudre de Protéine ParaTunisie", "seoDesc": "Achetez votre whey protéine en Tunisie au meilleur prix. Whey concentrée, native et isolate pour la récupération musculaire."},
    {"name": "Whey Isolate", "slug": "whey-isolate", "parent": "nutrition-sportive", "desc": "Isolat de whey à assimilation ultra-rapide, sans sucre ni graisses superflues.", "seoTitle": "Whey Isolate en Tunisie | Protéine Pure Sans Sucre ParaTunisie", "seoDesc": "Whey Isolate 100% pure pour sèche et définition musculaire en Tunisie. Zéro lactose, haute teneur en protéines."},
    {"name": "Gainers & Prise de Masse", "slug": "gainers-proteines", "parent": "nutrition-sportive", "desc": "Formules riches en protéines et glucides complexes pour un développement musculaire optimal.", "seoTitle": "Gainer Prise de Masse en Tunisie | Mass Gainer ParaTunisie", "seoDesc": "Hard gainers et formules mass gainers riches en calories saines pour la prise de masse rapide en Tunisie."},
    {"name": "Pre-Workout & Énergie", "slug": "pre-workout", "parent": "nutrition-sportive", "desc": "Boosters pré-entraînement pour maximiser l'énergie, la congestion et la concentration.", "seoTitle": "Pre-Workout en Tunisie | Booster d'Énergie & Congestion ParaTunisie", "seoDesc": "Boosters pré-workout intenses avec citrulline, bêta-alanine et caféine pour des séances explosives en Tunisie."},
    {"name": "BCAA & EAA", "slug": "bcaa", "parent": "nutrition-sportive", "desc": "Acides aminés branchés et essentiels pour préserver le muscle et accélérer la récupération.", "seoTitle": "BCAA & EAA en Tunisie | Acides Aminés Récupération ParaTunisie", "seoDesc": "BCAA 2:1:1, 4:1:1 et EAA complets pour l'endurance et l'anti-catabolisme pendant l'entraînement en Tunisie."},
    {"name": "Acides Aminés & Glutamine", "slug": "acides-amines", "parent": "nutrition-sportive", "desc": "L-Glutamine, arginine, citrulline et complexes aminés pour le métabolisme sportif.", "seoTitle": "Acides Aminés & L-Glutamine en Tunisie | ParaTunisie", "seoDesc": "L-Glutamine et acides aminés essentiels purs pour la régénération cellulaire et l'immunité sportive en Tunisie."},
    {"name": "Accessoires & Shakers", "slug": "accessoires", "parent": "nutrition-sportive", "desc": "Shakers sans BPA, ceintures de lestage, sangles de tirage et accessoires de fitness.", "seoTitle": "Accessoires de Musculation & Shakers en Tunisie | ParaTunisie", "seoDesc": "Shakers étanches, ceintures de musculation et sangles de force robustes disponibles en Tunisie."},

    # Compléments Alimentaires Children
    {"name": "Vitamines", "slug": "vitamines", "parent": "complements-alimentaires", "desc": "Vitamines C, D3, K2, groupe B et complexes multivitaminés complets.", "seoTitle": "Vitamines & Multivitamines en Tunisie | ParaTunisie", "seoDesc": "Large choix de vitamines C 1000mg, vitamine D3+K2 et complexes antioxydants en Tunisie."},
    {"name": "Minéraux", "slug": "mineraux", "parent": "complements-alimentaires", "desc": "Minéraux essentiels : magnésium, zinc, calcium, fer et oligo-éléments chélatés.", "seoTitle": "Minéraux & Oligo-Éléments en Tunisie | ParaTunisie", "seoDesc": "Minéraux haute biodisponibilité pour la santé musculaire, nerveuse et osseuse en Tunisie."},
    {"name": "Magnésium", "slug": "magnesium", "parent": "complements-alimentaires", "desc": "Magnésium bisglycinate, citrate et formules associées à la vitamine B6.", "seoTitle": "Magnésium B6 & Bisglycinate en Tunisie | ParaTunisie", "seoDesc": "Compléments de magnésium contre la fatigue, les crampes et le stress en Tunisie."},
    {"name": "Zinc", "slug": "zinc", "parent": "complements-alimentaires", "desc": "Zinc chélaté et picolinate pour l'immunité, la peau et le système hormonal.", "seoTitle": "Zinc Chélaté & ZMA en Tunisie | ParaTunisie", "seoDesc": "Zinc hautement assimilable pour le système immunitaire et la santé masculine en Tunisie."},
    {"name": "Oméga 3", "slug": "omega-3", "parent": "complements-alimentaires", "desc": "Huiles de poisson purifiées riches en EPA et DHA pour le cœur et les articulations.", "seoTitle": "Oméga 3 EPA & DHA en Tunisie | ParaTunisie", "seoDesc": "Capsules d'oméga 3 ultra-concentrées en acides gras essentiels EPA/DHA en Tunisie."},
    {"name": "Probiotiques & Digestion", "slug": "probiotiques", "parent": "complements-alimentaires", "desc": "Souches probiotiques actives et enzymes digestives pour le confort intestinal.", "seoTitle": "Probiotiques & Flore Intestinale en Tunisie | ParaTunisie", "seoDesc": "Probiotiques multi-souches et enzymes digestives pour la flore intestinale et l'assimilation en Tunisie."},
    {"name": "Immunité & Antioxydants", "slug": "immunite", "parent": "complements-alimentaires", "desc": "Défenses naturelles, propolis, échinacée, vitamine C et antioxydants cellulaires.", "seoTitle": "Compléments Immunité & Antioxydants en Tunisie | ParaTunisie", "seoDesc": "Renforcez vos défenses naturelles avec notre sélection de compléments pour l'immunité en Tunisie."},
    {"name": "Sommeil & Anti-Stress", "slug": "sommeil-stress", "parent": "complements-alimentaires", "desc": "Mélatonine, ashwagandha, passiflore et magnésium pour un sommeil réparateur.", "seoTitle": "Sommeil & Anti-Stress en Tunisie | ParaTunisie", "seoDesc": "Solutions naturelles pour le stress, l'anxiété et le sommeil réparateur en Tunisie."},
    {"name": "Ashwagandha", "slug": "ashwagandha", "parent": "complements-alimentaires", "desc": "Extraits purs d'Ashwagandha KSM-66 adaptogènes pour la vitalité et l'apaisement.", "seoTitle": "Ashwagandha KSM-66 en Tunisie | Plante Adaptogène ParaTunisie", "seoDesc": "Ashwagandha standardisée en withanolides pour la réduction du cortisol et le tonus en Tunisie."},
    {"name": "Articulations & Collagène", "slug": "articulations", "parent": "complements-alimentaires", "desc": "Collagène hydrolysé, glucosamine, chondroïtine et MSM pour la flexibilité articulaire.", "seoTitle": "Collagène & Soin des Articulations en Tunisie | ParaTunisie", "seoDesc": "Collagène marin et complexes articulaires pour sportifs et confort quotidien en Tunisie."},
    {"name": "Plantes & Herbes", "slug": "plantes-et-herbes", "parent": "complements-alimentaires", "desc": "Phytothérapie et extraits botaniques titrés pour le bien-être naturel.", "seoTitle": "Plantes & Phytothérapie en Tunisie | ParaTunisie", "seoDesc": "Extraits de plantes traditionnelles et bio pour le bien-être et la vitalité en Tunisie."},
    {"name": "Brûleurs de Graisse & Sèche", "slug": "bruleurs-de-graisse", "parent": "complements-alimentaires", "desc": "Formules thermogéniques et lipotropes pour la définition musculaire et le métabolisme.", "seoTitle": "Brûleurs de Graisse & Fat Burners en Tunisie | ParaTunisie", "seoDesc": "Brûleurs de graisse efficaces pour homme et femme, thermo-burners et stimulants en Tunisie."},
    {"name": "L-Carnitine", "slug": "l-carnitine", "parent": "complements-alimentaires", "desc": "L-Carnitine liquide et gélules pour le métabolisme énergétique et l'endurance.", "seoTitle": "L-Carnitine Pure en Tunisie | Énergie & Sèche ParaTunisie", "seoDesc": "L-Carnitine liquide 3000mg et tartrate pour la conversion des graisses en énergie en Tunisie."},
]

SOURCE_TO_CANONICAL_CATEGORY = {
    "creatine": "creatine",
    "whey-proteine": "whey-proteine",
    "whey-isolate": "whey-isolate",
    "gainers-proteines": "gainers-proteines",
    "mass-gainers": "gainers-proteines",
    "pre-workout": "pre-workout",
    "bcaa": "bcaa",
    "eaa": "bcaa",
    "beta-alanine": "pre-workout",
    "citrulline": "acides-amines",
    "l-arginine": "acides-amines",
    "glutamine": "acides-amines",
    "acides-amines": "acides-amines",
    "hmb": "acides-amines",
    "vitamines": "vitamines",
    "mineraux": "mineraux",
    "magnesium": "magnesium",
    "zinc": "zinc",
    "zma": "zinc",
    "omega-3": "omega-3",
    "probiotiques": "probiotiques",
    "digestion": "probiotiques",
    "antioxydants": "immunite",
    "immunite": "immunite",
    "sommeil-stress": "sommeil-stress",
    "ashwagandha": "ashwagandha",
    "articulations": "articulations",
    "collagene": "articulations",
    "plantes-et-herbes": "plantes-et-herbes",
    "tribulus": "plantes-et-herbes",
    "boosters-hormonaux": "nutrition-sportive",
    "bruleurs-de-graisse": "bruleurs-de-graisse",
    "l-carnitine": "l-carnitine",
    "cla": "bruleurs-de-graisse",
    "accessoires": "accessoires",
    "materiel-de-musculation": "accessoires",
    "barres-proteinees": "nutrition-sportive",
    "proteines-vegetales": "whey-proteine",
    "proteines-multi-sources": "whey-proteine",
    "caseine": "whey-proteine",
    "proteine-de-boeuf": "whey-proteine",
    "glucides-energie": "gainers-proteines",
    "glucides": "gainers-proteines",
    "post-workout": "nutrition-sportive",
    "beaute-cheveux": "complements-alimentaires",
    "enfants": "complements-alimentaires",
    "cardio-fitness": "nutrition-sportive"
}

def generate_seo_content(product_name: str, brand_name: str, format_str: str, category_name: str):
    format_label = f" {format_str}" if format_str else ""
    seo_title = f"{brand_name} {product_name}{format_label} en Tunisie | ParaTunisie"
    if len(seo_title) > 70:
        seo_title = f"{product_name}{format_label} en Tunisie | ParaTunisie"
    if len(seo_title) > 70:
        seo_title = f"{product_name[:45]}... en Tunisie | ParaTunisie"

    meta_desc = f"Achetez {product_name} de {brand_name}{format_label} sur ParaTunisie. Rayon {category_name}, produit 100% authentique avec livraison rapide et paiement à la livraison en Tunisie."
    if len(meta_desc) > 160:
        meta_desc = f"Découvrez {product_name} de {brand_name}{format_label} sur ParaTunisie. Disponibilité, caractéristiques et livraison sur toute la Tunisie."

    h1 = f"{brand_name} - {product_name}{format_label}"

    short_desc = f"Produit authentique de la marque {brand_name}, formulé avec des ingrédients de haute qualité pour répondre à vos exigences en {category_name}."
    
    long_desc = f"""Découvrez **{product_name}** de la marque **{brand_name}** sur ParaTunisie.

### Points Forts
- Produit 100% original et certifié
- Formule hautement dosée et biodisponible
- Idéal pour accompagner vos objectifs en {category_name}

### Conseils d'Utilisation
Consommez ce produit conformément aux instructions figurant sur l'emballage. Respectez les doses quotidiennes recommandées.

### Composition & Qualité
Élaboré selon les normes internationales de fabrication (GMP / BPF). Sans additifs superflus.
"""

    return {
        "seoTitle": seo_title,
        "seoDescription": meta_desc,
        "seoH1": h1,
        "shortDescription": short_desc,
        "longDescription": long_desc,
        "benefit": f"Formule de qualité supérieure {brand_name} pour votre santé et bien-être.",
        "usage": "Prendre selon la posologie recommandée sur l'emballage."
    }
