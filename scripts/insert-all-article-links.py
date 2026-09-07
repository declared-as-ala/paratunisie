import re

with open('src/lib/data/articles.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace invalid category references
text = text.replace('url: "/pack-anti-stress"', 'url: "/magnesium"')
text = text.replace('url: "/shop"', 'url: "/nutrition-sportive"')
text = text.replace('url: "/bcaa-acides-amines"', 'url: "/bcaa"')

# Specific contextual insertions for each article
ARTICLE_INSERTS = {
    "meilleure-creatine-tunisie": {
        "target": "Face à la multitude d'offres sur le marché tunisien, il est essentiel d'évaluer les produits selon des critères transparents :",
        "addition": " Pour faire le bon choix, consultez [notre sélection de créatine monohydrate](/creatine) disponible avec livraison 24-48h."
    },
    "creatine-monohydrate-bienfaits-dosage": {
        "target": "• Soutien cognitif émergent documenté par plusieurs études chez les sujets fatigués ou actifs.",
        "addition": "\nPour vous équiper, découvrez [nos créatines pures disponibles en Tunisie](/creatine)."
    },
    "creatine-avant-ou-apres-entrainement": {
        "target": "L'important est la saturation continue des réserves musculaires jour après jour.",
        "addition": " Choisissez votre formule parmi [notre gamme de créatines monohydrates](/creatine)."
    },
    "whey-protein-tunisie-guide": {
        "target": "En Tunisie, le marché de la nutrition sportive s'est considérablement développé ces dernières années,",
        "addition": " et vous pouvez explorer [notre sélection de whey protéines en Tunisie](/whey-proteine) adaptées à tous les profils."
    },
    "whey-concentree-vs-isolate": {
        "target": "Pour la majorité des pratiquants de musculation dont le budget est un critère important,",
        "addition": " retrouvez [notre sélection de whey concentrée et isolate](/whey-proteine) au meilleur rapport qualité/prix."
    },
    "prise-de-masse-gainer-ou-whey": {
        "target": "Le choix entre gainer et whey dépend principalement de votre morphologie, de votre appétit et de votre métabolisme de base.",
        "addition": " Découvrez [nos mass gainers pour la prise de masse](/gainers-proteines) ainsi que [notre gamme de whey protéines](/whey-proteine)."
    },
    "meilleur-pre-workout-tunisie": {
        "target": "Face à la diversité des formules proposées sur le marché,",
        "addition": " découvrez [les pre-workouts disponibles en Tunisie](/pre-workout) et [nos formules pre-workout](/pre-workout) adaptées à votre sensibilité."
    },
    "bcaa-ou-creatine-choisir": {
        "target": "La créatine et les BCAA ne répondent pas aux mêmes besoins physiologiques :",
        "addition": " Retrouvez [notre sélection d'acides aminés BCAA](/bcaa) et [nos créatines monohydrates](/creatine) pour construire votre stack."
    },
    "pre-workout-ou-creatine": {
        "target": "La créatine et le pre-workout sont deux compléments aux modes d'action totalement complémentaires :",
        "addition": " Découvrez [notre sélection de pre-workouts](/pre-workout) et [nos créatines pures micronisées](/creatine)."
    },
    "bcaa-vs-acides-amines-essentiels": {
        "target": "Les EAA apportent la totalité des 9 acides aminés que l'organisme ne peut synthétiser,",
        "addition": " à retrouver dans [notre sélection de BCAA](/bcaa) et [notre gamme d'EAA](/eaa)."
    },
    "ashwagandha-bienfaits-musculation": {
        "target": "L'ashwagandha est l'une des plantes adaptogènes les plus documentées scientifiquement pour la gestion du stress et la récupération.",
        "addition": " Découvrez [notre sélection d'ashwagandha pure](/ashwagandha) pour accompagner vos périodes d'entraînement intense."
    },
    "quand-prendre-ashwagandha": {
        "target": "Le timing de prise de l'ashwagandha dépend principalement de l'effet recherché :",
        "addition": " Retrouvez [nos compléments d'ashwagandha en Tunisie](/ashwagandha) sous forme d'extraits titrés."
    },
    "vitamine-d3-k2-tunisie": {
        "target": "L'association de la vitamine D3 et de la vitamine K2 (ménadione MK-7) constitue l'un des duos les plus synergiques pour la santé osseuse et l'immunité.",
        "addition": " Découvrez [notre sélection de vitamines et D3+K2](/vitamines) de qualité pharmaceutique."
    },
    "zinc-sportif-musculation": {
        "target": "Le zinc est un oligo-élément indispensable qui intervient dans plus de 300 réactions enzymatiques,",
        "addition": " disponible dans [notre gamme de zinc chélaté](/zinc) et [notre sélection de magnésium](/magnesium)."
    },
    "omega-3-tunisie-guide": {
        "target": "Les acides gras oméga-3 (EPA et DHA) sont des nutriments essentiels indispensables au bon fonctionnement cardiovasculaire, cérébral et articulaire.",
        "addition": " Retrouvez [notre sélection d'oméga 3 concentrés](/omega-3) hautement purifiés."
    },
    "multivitamines-sportifs": {
        "target": "Les athlètes et pratiquants réguliers de musculation ont des besoins accrus en micronutriments.",
        "addition": " Explorez [nos complexes multivitamines pour sportifs](/vitamines) ainsi que [notre boutique de nutrition sportive](/nutrition-sportive)."
    },
    "l-carnitine-perte-graisse": {
        "target": "La L-Carnitine joue un rôle clé dans le transport des acides gras à chaîne longue vers les mitochondries,",
        "addition": " à découvrir dans [notre sélection de L-Carnitine](/l-carnitine) et [nos brûleurs de graisse](/bruleurs-de-graisse)."
    },
    "bruleur-de-graisse-tunisie": {
        "target": "Les brûleurs de graisse thermogéniques associent plusieurs principes actifs pour stimuler la dépense calorique.",
        "addition": " Consultez [nos brûleurs de graisse pour la sèche](/bruleurs-de-graisse) et respectez scrupuleusement les dosages recommandés."
    },
    "complements-musculation-debutant": {
        "target": "Pour un débutant, la priorité absolue reste l'apprentissage des mouvements et la mise en place d'une alimentation adaptée.",
        "addition": " En complément, vous pouvez vous tourner vers [notre sélection de whey protéines](/whey-proteine) et [nos créatines monohydrates](/creatine) sur [ParaTunisie](/nutrition-sportive)."
    },
    "complements-avant-pendant-apres-entrainement": {
        "target": "La péri-nutrition sportive permet d'optimiser l'énergie disponible pendant la séance et d'accélérer la récupération musculaire.",
        "addition": " Retrouvez [nos formules pre-workout](/pre-workout), [nos acides aminés BCAA](/bcaa) et [nos protéines whey post-training](/whey-proteine)."
    },
    "comment-prendre-creatine": {
        "target": "La créatine monohydrate est simple d'utilisation mais suscite encore de nombreuses interrogations sur les dosages optimaux.",
        "addition": " Découvrez [notre sélection de créatine monohydrate](/creatine) et [nos créatines pures micronisées](/creatine) garanties sans additifs."
    },
    "creatine-femme": {
        "target": "De nombreuses femmes hésitent à consommer de la créatine par peur de prendre du volume excessif ou de gonfler.",
        "addition": " Rassurez-vous avec [notre sélection de créatine monohydrate pure](/creatine) adaptée aux sportives."
    },
    "creapure-vs-creatine-monohydrate": {
        "target": "Le logo Creapure® est souvent mis en avant comme le summum de la qualité pour la créatine monohydrate.",
        "addition": " Découvrez [nos créatines monohydrates certifiées](/creatine) rigoureusement sélectionnées."
    },
    "combien-de-temps-prendre-creatine": {
        "target": "L'idée qu'il faut obligatoirement faire des pauses après quelques semaines de créatine est un mythe hérité des années 1990.",
        "addition": " Retrouvez [nos créatines pures disponibles en stock](/creatine) pour une utilisation sereine."
    },
    "whey-isolate-vs-concentrate": {
        "target": "Entre whey concentrée et whey isolate, les différences de filtration impactent la teneur en protéines, en lactose et en lipides.",
        "addition": " Explorez [notre catalogue de whey concentrées et isolats](/whey-proteine) en Tunisie."
    },
    "combien-de-whey-par-jour": {
        "target": "Le nombre de shakers de whey à consommer quotidiennement dépend avant tout de votre poids de corps et de vos apports alimentaires totaux.",
        "addition": " Commandez votre complément parmi [notre sélection de whey protéines](/whey-proteine)."
    },
    "quand-prendre-la-whey": {
        "target": "Le moment idéal pour consommer son shaker de whey dépend de votre organisation et de l'espacement de vos repas solides.",
        "addition": " Retrouvez [nos formules whey isolate et concentrée](/whey-proteine) pour optimiser vos créneaux de récupération."
    },
    "whey-pour-debutant": {
        "target": "Choisir sa première protéine peut paraître complexe face à la profusion de termes techniques.",
        "addition": " Consultez [notre sélection de whey protéines pour débutants](/whey-proteine) faciles à doser et à mélanger."
    },
    "meilleur-gainer-tunisie": {
        "target": "Un mass gainer de qualité apporte un ratio équilibré entre glucides complexes et protéines de haute valeur biologique.",
        "addition": " Découvrez [notre sélection de gainers en Tunisie](/gainers-proteines) pour franchir un cap sur la balance."
    },
    "comment-prendre-un-mass-gainer": {
        "target": "Pour réussir sa prise de masse sans accumuler de tissu adipeux excessif, la progressivité calorique est indispensable.",
        "addition": " Retrouvez [nos formules hypercaloriques disponibles](/gainers-proteines) sur notre boutique en ligne."
    },
    "alimentation-prise-de-masse-tunisie": {
        "target": "En Tunisie, structurer ses repas avec des aliments locaux riches en glucides complexes et en protéines permet d'atteindre facilement son surplus calorique.",
        "addition": " Complétez votre diète avec [nos mass gainers de qualité](/gainers-proteines) sur [notre univers nutrition sportive](/nutrition-sportive)."
    },
    "comment-utiliser-pre-workout": {
        "target": "Un pre-workout est un supplément puissant qui nécessite une approche méthodique pour éviter les désagréments liés à une surconsommation de stimulants.",
        "addition": " Découvrez [nos formules pre-workout disponibles en Tunisie](/pre-workout) et démarrez toujours par une demi-dose."
    },
    "pre-workout-sans-cafeine-pump": {
        "target": "Pour les séances d'entraînement en fin de journée ou les personnes sensibles aux stimulants, les boosters non-stimulés offrent une alternative idéale.",
        "addition": " Retrouvez [nos pre-workouts sans caféine et boosters pump](/pre-workout) enrichis en [citrulline pure](/citrulline)."
    },
    "magnesium-bisglycinate-bienfaits": {
        "target": "Le magnésium bisglycinate associe une molécule de magnésium à deux molécules de glycine, lui conférant une assimilation digestive optimale.",
        "addition": " Découvrez [notre gamme de magnésium bisglycinate](/magnesium) disponible avec livraison 24-48h."
    },
    "types-de-magnesium-comparatif": {
        "target": "Toutes les formes de magnésium ne se valent pas en termes de biodisponibilité et de tolérance intestinale.",
        "addition": " Consultez [notre sélection de magnésium chélaté et bisglycinate](/magnesium) pour un confort maximal."
    },
    "comment-choisir-ashwagandha": {
        "target": "L'efficacité de l'ashwagandha repose sur sa concentration en withanolides et la qualité de son extrait de racine.",
        "addition": " Retrouvez [notre sélection d'ashwagandha KSM-66 et extraits purs](/ashwagandha) certifiés."
    },
    "routine-sommeil-recuperation": {
        "target": "Un sommeil de qualité est le premier pilier de la récupération physique et nerveuse.",
        "addition": " Vous pouvez soutenir vos nuits avec [notre sélection de magnésium bisglycinate](/magnesium) et [nos compléments d'ashwagandha](/ashwagandha)."
    },
    "comment-choisir-omega-3-epa-dha": {
        "target": "Pour évaluer la qualité d'une huile de poisson oméga-3, deux critères sont primordiaux : la concentration réelle en EPA/DHA et l'indice d'oxydation Totox.",
        "addition": " Découvrez [notre sélection d'oméga 3 concentrés en EPA et DHA](/omega-3) de pureté contrôlée."
    },
    "vitamines-pour-sportifs-guide": {
        "target": "Un apport suffisant en micronutriments soutient le métabolisme énergétique et renforce les défenses naturelles.",
        "addition": " Consultez [nos complexes de vitamines et minéraux](/vitamines) ainsi que [notre sélection de zinc chélaté](/zinc)."
    },
    "zinc-bisglycinate-guide": {
        "target": "La forme bisglycinate garantit une excellente tolérance gastrique et une absorption supérieure du zinc par les cellules.",
        "addition": " Retrouvez [notre sélection de zinc chélaté et bisglycinate](/zinc) sur ParaTunisie."
    }
}

updated_count = 0
for slug, item in ARTICLE_INSERTS.items():
    target = item["target"]
    addition = item["addition"]
    if target in text:
        # Only add if not already present
        if addition.strip() not in text:
            text = text.replace(target, target + addition, 1)
            updated_count += 1
            print(f"Added links to: {slug}")
        else:
            print(f"Already linked in: {slug}")
    else:
        print(f"Target text not found in: {slug}")

with open('src/lib/data/articles.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print(f"\nSuccessfully updated {updated_count} articles in articles.ts!")
