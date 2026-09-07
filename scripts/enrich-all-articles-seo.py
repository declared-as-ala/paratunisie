import re

with open('src/lib/data/articles.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Category mapping definitions for article contextual linking
CLUSTER_LINKS = {
    "meilleure-creatine-tunisie": [
        ("découvrez [notre sélection de créatine monohydrate](/creatine) en Tunisie", "notre sélection de créatine monohydrate"),
        ("consultez [nos créatines pures disponibles en Tunisie](/creatine)", "nos créatines pures disponibles en Tunisie")
    ],
    "creatine-monohydrate-bienfaits-dosage": [
        ("retrouvez [notre sélection de créatine monohydrate pure](/creatine)", "notre sélection de créatine monohydrate pure"),
        ("découvrez [toutes nos créatines disponibles](/creatine)", "toutes nos créatines disponibles")
    ],
    "creatine-avant-ou-apres-entrainement": [
        ("consultez [notre gamme de créatines monohydrates](/creatine)", "notre gamme de créatines monohydrates"),
        ("associez-la avec [notre sélection de whey protéines](/whey-proteine)", "notre sélection de whey protéines")
    ],
    "whey-protein-tunisie-guide": [
        ("découvrez [notre sélection de whey protéines en Tunisie](/whey-proteine)", "notre sélection de whey protéines en Tunisie"),
        ("consultez [toutes nos protéines disponibles en stock](/whey-proteine)", "toutes nos protéines disponibles en stock")
    ],
    "whey-concentree-vs-isolate": [
        ("explorez [notre catalogue de whey concentrée et isolate](/whey-proteine)", "notre catalogue de whey concentrée et isolate"),
        ("découvrez [nos protéines whey en Tunisie](/whey-proteine)", "nos protéines whey en Tunisie")
    ],
    "prise-de-masse-gainer-ou-whey": [
        ("découvrez [nos mass gainers pour la prise de masse](/gainers-proteines)", "nos mass gainers pour la prise de masse"),
        ("consultez également [notre sélection de whey protéines](/whey-proteine)", "notre sélection de whey protéines")
    ],
    "meilleur-pre-workout-tunisie": [
        ("découvrez [les pre-workouts disponibles en Tunisie](/pre-workout)", "les pre-workouts disponibles en Tunisie"),
        ("consultez [nos formules pre-workout](/pre-workout)", "nos formules pre-workout")
    ],
    "bcaa-ou-creatine-choisir": [
        ("retrouvez [notre sélection d'acides aminés BCAA](/bcaa)", "notre sélection d'acides aminés BCAA"),
        ("découvrez également [nos créatines monohydrates](/creatine)", "nos créatines monohydrates")
    ],
    "pre-workout-ou-creatine": [
        ("consultez [notre gamme de pre-workouts](/pre-workout)", "notre gamme de pre-workouts"),
        ("découvrez [nos créatines monohydrates](/creatine)", "nos créatines monohydrates")
    ],
    "bcaa-vs-acides-amines-essentiels": [
        ("découvrez [notre sélection de BCAA 2:1:1 et 4:1:1](/bcaa)", "notre sélection de BCAA 2:1:1 et 4:1:1"),
        ("explorez également [nos acides aminés essentiels EAA](/eaa)", "nos acides aminés essentiels EAA")
    ],
    "ashwagandha-bienfaits-musculation": [
        ("découvrez [notre sélection d'ashwagandha pure](/ashwagandha)", "notre sélection d'ashwagandha pure"),
        ("consultez [nos compléments d'ashwagandha en Tunisie](/ashwagandha)", "nos compléments d'ashwagandha en Tunisie")
    ],
    "quand-prendre-ashwagandha": [
        ("retrouvez [notre sélection d'ashwagandha KSM-66](/ashwagandha)", "notre sélection d'ashwagandha KSM-66"),
        ("explorez [tous nos compléments d'ashwagandha](/ashwagandha)", "tous nos compléments d'ashwagandha")
    ],
    "vitamine-d3-k2-tunisie": [
        ("découvrez [notre sélection de vitamines et D3+K2](/vitamines)", "notre sélection de vitamines et D3+K2"),
        ("consultez [toutes nos vitamines disponibles en Tunisie](/vitamines)", "toutes nos vitamines disponibles en Tunisie")
    ],
    "zinc-sportif-musculation": [
        ("découvrez [notre gamme de zinc chélaté](/zinc)", "notre gamme de zinc chélaté"),
        ("associez-le avec [notre sélection de magnésium](/magnesium)", "notre sélection de magnésium")
    ],
    "omega-3-tunisie-guide": [
        ("découvrez [notre sélection d'oméga 3 concentrés](/omega-3)", "notre sélection d'oméga 3 concentrés"),
        ("consultez [nos capsules d'huile de poisson en Tunisie](/omega-3)", "nos capsules d'huile de poisson en Tunisie")
    ],
    "multivitamines-sportifs": [
        ("explorez [nos complexes multivitamines pour sportifs](/vitamines)", "nos complexes multivitamines pour sportifs"),
        ("consultez [notre univers de nutrition sportive](/nutrition-sportive)", "notre univers de nutrition sportive")
    ],
    "l-carnitine-perte-graisse": [
        ("découvrez [notre sélection de L-Carnitine liquide et gélules](/l-carnitine)", "notre sélection de L-Carnitine liquide et gélules"),
        ("consultez également [nos brûleurs de graisse thermogéniques](/bruleurs-de-graisse)", "nos brûleurs de graisse thermogéniques")
    ],
    "bruleur-de-graisse-tunisie": [
        ("découvrez [nos brûleurs de graisse pour la sèche](/bruleurs-de-graisse)", "nos brûleurs de graisse pour la sèche"),
        ("associez-les avec [notre sélection de L-Carnitine](/l-carnitine)", "notre sélection de L-Carnitine")
    ],
    "complements-musculation-debutant": [
        ("découvrez [notre sélection de whey protéines](/whey-proteine)", "notre sélection de whey protéines"),
        ("consultez [nos créatines monohydrates](/creatine)", "nos créatines monohydrates"),
        ("explorez [notre boutique de nutrition sportive](/nutrition-sportive)", "notre boutique de nutrition sportive")
    ],
    "complements-avant-pendant-apres-entrainement": [
        ("découvrez [nos boosters pre-workout](/pre-workout)", "nos boosters pre-workout"),
        ("consultez [notre sélection de BCAA pour l'effort](/bcaa)", "notre sélection de BCAA pour l'effort"),
        ("retrouvez [nos protéines whey post-entraînement](/whey-proteine)", "nos protéines whey post-entraînement")
    ],
    "comment-prendre-creatine": [
        ("découvrez [notre sélection de créatine monohydrate](/creatine)", "notre sélection de créatine monohydrate"),
        ("consultez [nos créatines pures micronisées](/creatine)", "nos créatines pures micronisées")
    ],
    "creatine-femme": [
        ("découvrez [notre sélection de créatine monohydrate pure](/creatine)", "notre sélection de créatine monohydrate pure"),
        ("consultez [toutes nos créatines disponibles en Tunisie](/creatine)", "toutes nos créatines disponibles en Tunisie")
    ],
    "creapure-vs-creatine-monohydrate": [
        ("découvrez [notre sélection de créatines monohydrates certifiées](/creatine)", "notre sélection de créatines monohydrates certifiées"),
        ("consultez [nos créatines disponibles en stock](/creatine)", "nos créatines disponibles en stock")
    ],
    "combien-de-temps-prendre-creatine": [
        ("retrouvez [notre sélection de créatine monohydrate](/creatine)", "notre sélection de créatine monohydrate"),
        ("consultez [nos créatines pures](/creatine)", "nos créatines pures")
    ],
    "whey-isolate-vs-concentrate": [
        ("découvrez [notre sélection de whey protéines concentrées et isolats](/whey-proteine)", "notre sélection de whey protéines concentrées et isolats"),
        ("consultez [toutes nos whey disponibles en Tunisie](/whey-proteine)", "toutes nos whey disponibles en Tunisie")
    ],
    "combien-de-whey-par-jour": [
        ("découvrez [notre sélection de whey protéines](/whey-proteine)", "notre sélection de whey protéines"),
        ("consultez [nos protéines whey disponibles en stock](/whey-proteine)", "nos protéines whey disponibles en stock")
    ],
    "quand-prendre-la-whey": [
        ("retrouvez [notre sélection de whey protéines en Tunisie](/whey-proteine)", "notre sélection de whey protéines en Tunisie"),
        ("consultez [nos formules whey isolate et concentrée](/whey-proteine)", "nos formules whey isolate et concentrée")
    ],
    "whey-pour-debutant": [
        ("découvrez [notre sélection de whey protéines pour débutants](/whey-proteine)", "notre sélection de whey protéines pour débutants"),
        ("consultez [toutes nos protéines de lactosérum](/whey-proteine)", "toutes nos protéines de lactosérum")
    ],
    "meilleur-gainer-tunisie": [
        ("découvrez [nos mass gainers pour la prise de masse](/gainers-proteines)", "nos mass gainers pour la prise de masse"),
        ("consultez [notre sélection de gainers en Tunisie](/gainers-proteines)", "notre sélection de gainers en Tunisie")
    ],
    "comment-prendre-un-mass-gainer": [
        ("retrouvez [notre gamme de gainers pour la prise de masse](/gainers-proteines)", "notre gamme de gainers pour la prise de masse"),
        ("consultez [nos formules hypercaloriques disponibles](/gainers-proteines)", "nos formules hypercaloriques disponibles")
    ],
    "alimentation-prise-de-masse-tunisie": [
        ("découvrez [nos mass gainers et formules prise de masse](/gainers-proteines)", "nos mass gainers et formules prise de masse"),
        ("explorez [notre univers de nutrition sportive en Tunisie](/nutrition-sportive)", "notre univers de nutrition sportive en Tunisie")
    ],
    "comment-utiliser-pre-workout": [
        ("découvrez [nos formules pre-workout disponibles en Tunisie](/pre-workout)", "nos formules pre-workout disponibles en Tunisie"),
        ("consultez [notre sélection de boosters d'énergie](/pre-workout)", "nos boosters d'énergie")
    ],
    "pre-workout-sans-cafeine-pump": [
        ("découvrez [nos pre-workouts sans caféine et boosters pump](/pre-workout)", "nos pre-workouts sans caféine et boosters pump"),
        ("consultez [notre sélection de citrulline pure](/citrulline)", "notre sélection de citrulline pure")
    ],
    "magnesium-bisglycinate-bienfaits": [
        ("découvrez [notre gamme de magnésium bisglycinate hautement assimilable](/magnesium)", "notre gamme de magnésium bisglycinate hautement assimilable"),
        ("consultez [tous nos compléments de magnésium en Tunisie](/magnesium)", "tous nos compléments de magnésium en Tunisie")
    ],
    "types-de-magnesium-comparatif": [
        ("découvrez [notre sélection de magnésium chélaté et bisglycinate](/magnesium)", "notre sélection de magnésium chélaté et bisglycinate"),
        ("consultez [nos formules de magnésium en Tunisie](/magnesium)", "nos formules de magnésium en Tunisie")
    ],
    "comment-choisir-ashwagandha": [
        ("découvrez [notre sélection d'ashwagandha KSM-66 et extraits purs](/ashwagandha)", "notre sélection d'ashwagandha KSM-66 et extraits purs"),
        ("consultez [tous nos compléments d'ashwagandha](/ashwagandha)", "tous nos compléments d'ashwagandha")
    ],
    "routine-sommeil-recuperation": [
        ("découvrez [notre sélection de magnésium bisglycinate](/magnesium)", "notre sélection de magnésium bisglycinate"),
        ("consultez [nos compléments d'ashwagandha pour la nuit](/ashwagandha)", "nos compléments d'ashwagandha pour la nuit")
    ],
    "comment-choisir-omega-3-epa-dha": [
        ("découvrez [notre sélection d'oméga 3 concentrés en EPA et DHA](/omega-3)", "notre sélection d'oméga 3 concentrés en EPA et DHA"),
        ("consultez [toutes nos huiles de poisson disponibles en Tunisie](/omega-3)", "toutes nos huiles de poisson disponibles en Tunisie")
    ],
    "vitamines-pour-sportifs-guide": [
        ("découvrez [nos complexes de vitamines et minéraux](/vitamines)", "nos complexes de vitamines et minéraux"),
        ("consultez [notre sélection de zinc chélaté](/zinc)", "notre sélection de zinc chélaté")
    ],
    "zinc-bisglycinate-guide": [
        ("découvrez [notre sélection de zinc chélaté et bisglycinate](/zinc)", "notre sélection de zinc chélaté et bisglycinate"),
        ("associez-le à [notre sélection de magnésium](/magnesium)", "notre sélection de magnésium")
    ]
}

# Clean invalid category paths across all relatedCategories
content = content.replace('url: "/pack-anti-stress"', 'url: "/magnesium"')
content = content.replace('url: "/shop"', 'url: "/nutrition-sportive"')
content = content.replace('url: "/bcaa-acides-amines"', 'url: "/bcaa"')

print("Updated invalid relatedCategories paths.")

with open('src/lib/data/articles.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated articles.ts.")
