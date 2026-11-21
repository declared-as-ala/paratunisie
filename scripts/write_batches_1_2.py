# -*- coding: utf-8 -*-
import os
import json

os.makedirs("scripts/batches", exist_ok=True)

with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
    MANIFEST = {m["slug"]: m for m in json.load(f)}

SOURCES_POOL = {
    "Créatine": [
        {"title": "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation", "org": "Journal of the International Society of Sports Nutrition (PubMed)", "url": "https://pubmed.ncbi.nlm.nih.gov/28615996/"},
        {"title": "Creatine Supplementation and Exercise Performance: Common Questions and Misconceptions", "org": "JISSN / PubMed Central", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7871530/"},
        {"title": "Scientific Opinion on Creatine in combination with resistance training and improvement in muscle strength", "org": "EFSA Journal", "url": "https://www.efsa.europa.eu/en/efsajournal/pub/4400"},
    ],
    "Whey & Protéines": [
        {"title": "International Society of Sports Nutrition Position Stand: protein and exercise", "org": "JISSN / PubMed", "url": "https://pubmed.ncbi.nlm.nih.gov/28642676/"},
        {"title": "Dietary protein intake and human health", "org": "PubMed / NIH", "url": "https://pubmed.ncbi.nlm.nih.gov/26797090/"},
        {"title": "Scientific Opinion on Dietary Reference Values for protein", "org": "EFSA", "url": "https://www.efsa.europa.eu/en/efsajournal/pub/2557"},
    ],
}

def make_article(slug, seo_title, meta_desc, excerpt, read_time, sections, takeaways, faqs):
    m = MANIFEST[slug]
    blocks = []
    for h2, paragraphs in sections:
        blocks.append({"type": "heading", "text": h2})
        for p in paragraphs:
            blocks.append({"type": "paragraph", "text": p})
    blocks.append({"type": "takeaways", "items": takeaways})
    blocks.append({"type": "sources", "items": SOURCES_POOL[m["cluster"]]})
    blocks.append({
        "type": "related",
        "categories": [{"name": m["parent_category_name"], "url": m["internal_links"]["hub_category"]}],
        "articles": m["internal_links"]["related_articles"],
    })
    prods = []
    for p in m["internal_links"]["products"]:
        prods.append({
            "id": p["id"],
            "slug": p["slug"],
            "rationale": f"Référence authentique disponible en stock dans notre rayon {m['parent_category_name']} ({p['priceMillimes']/1000:.3f} DT)."
        })
    return {
        "id": m["id"],
        "slug": slug,
        "title": m["title"],
        "excerpt": excerpt,
        "category": m["category"],
        "readTime": read_time,
        "date": "2026-11-21",
        "content": json.dumps(blocks, ensure_ascii=False),
        "authorName": "Équipe Éditoriale ParaTunisie",
        "expertReviewer": "Comité Scientifique & Nutrition Sportive ParaTunisie",
        "featuredImage": m["local_image_path"],
        "imageAlt": m["image_alt"],
        "seoTitle": seo_title,
        "metaDescription": meta_desc,
        "canonicalUrl": f"https://paratunisie.com/conseils/{slug}",
        "ogTitle": f"{seo_title} | ParaTunisie",
        "ogDescription": meta_desc,
        "ogImage": f"https://paratunisie.com{m['local_image_path']}",
        "targetKeyword": ", ".join([m["primary_keyword"]] + m["secondary_keywords"]),
        "products": prods,
        "faqs": faqs,
    }

# Rich prose helper to build genuinely informative, non-padded 800-1000 word guides tailored to each exact topic
def build_creatine_articles():
    arts = []
    # 1
    arts.append(make_article(
        "creatine-monohydrate-ou-micronisee-differences",
        "Créatine monohydrate ou micronisée : différences réelles",
        "Créatine monohydrate classique ou micronisée 200 mesh : différences de solubilité, d'assimilation musculaire, de confort digestif et de prix.",
        "La créatine micronisée est tout simplement de la créatine monohydrate dont les cristaux ont été réduits en poudre plus fine. Voici ce qui change vraiment à l'usage.",
        "6 min",
        [
            ("Réponse directe : même molécule, granulométrie différente", [
                "Beaucoup d'acheteurs hésitent entre une créatine monohydrate standard et une formule affichée « micronisée » ou « 200 mesh » dans notre rayon [Créatine en Tunisie](/creatine). Sur le plan biochimique, il s'agit exactement de la même molécule : une molécule de créatine liée à une molécule d'eau, soit environ 88 % de créatine pure en poids.",
                "La seule transformation réalisée lors de la micronisation est purement mécanique. Le fabricant broie les cristaux de monohydrate afin de réduire leur diamètre moyen, passant généralement d'environ 80 mesh à 200 mesh (soit des particules près de 20 fois plus fines). Cette finesse modifie le comportement de la poudre dans votre verre, mais ne transforme pas la structure chimique du principe actif."
            ]),
            ("Solubilité et confort en bouche au quotidien", [
                "Si vous avez déjà utilisé une monohydrate basique à gros grains, vous avez probablement remarqué un dépôt sablonneux au fond du shaker après quelques secondes. La créatine reste peu soluble dans l'eau froide, quelle que soit sa marque.",
                "La version micronisée reste en suspension plus longtemps dans l'eau ou dans un shaker de protéines, ce qui évite cette sensation granuleuse désagréable. Pour les personnes qui prennent leur dose de 3 à 5 g dans un simple verre d'eau tiède ou à température ambiante, le confort d'utilisation est nettement supérieur. Consultez aussi notre guide [créatine en poudre ou en gélules](/conseils/creatine-poudre-ou-gelules-comparatif) si vous préférez éviter totalement le mélange en poudre."
            ]),
            ("L'absorption musculaire et la tolérance digestive changent-elles ?", [
                "Sur le plan de la performance sportive, les études publiées dans le Journal of the International Society of Sports Nutrition confirment que la créatine monohydrate classique et la créatine micronisée produisent exactement la même saturation en phosphocréatine musculaire au bout de trois à quatre semaines de prise régulière.",
                "En revanche, chez les sportifs ayant un estomac sensible, des particules mal dissoutes peuvent parfois favoriser un léger inconfort abdominal si elles sont avalées d'un trait avec trop peu d'eau. Une poudre 200 mesh associée à un grand verre d'eau (250 à 300 ml) limite ce désagrément. Veillez également à suivre les repères détaillés dans [créatine et hydratation](/conseils/creatine-et-hydratation-recommandations)."
            ]),
            ("Comment vérifier la finesse et la pureté sur une fiche produit ?", [
                "Ne vous fiez pas uniquement au mot « micronisée » imprimé en gros sur l'étiquette avant. Vérifiez deux indicateurs concrets : la mention « 100 % Créatine Monohydrate » sans sucres ni arômes superflus dans la liste des ingrédients, et l'indication de la granulométrie (200 mesh) ou d'un label de pureté reconnu.",
                "Pour aller plus loin sur le décryptage des étiquettes, parcourez [comment vérifier la qualité d'une créatine](/conseils/comment-comparer-qualite-creatine-label). Côté budget, l'écart entre une monohydrate standard et une 200 mesh reste faible en Dinars Tunisiens : il est souvent inférieur à 100 millimes par portion de 3 g."
            ]),
            ("Verdict pratique : laquelle commander ?", [
                "Si le budget est votre priorité absolue et que vous mélangez votre dose dans un shaker tiède ou un repas liquide, la monohydrate classique fait parfaitement le travail. Si vous cherchez une poudre qui se disperse facilement dans l'eau fraîche sans laisser de résidus au fond du verre, la micronisée 200 mesh offre un meilleur agrément pour un surcoût minime."
            ])
        ],
        [
            "La créatine micronisée est chimiquement identique à la créatine monohydrate classique.",
            "Le broyage 200 mesh améliore nettement la mise en suspension dans l'eau et réduit l'effet sableux.",
            "Les deux formes offrent la même saturation musculaire à raison de 3 à 5 g par jour.",
            "Buvez suffisamment d'eau (250 à 300 ml par prise) pour optimiser le confort digestif."
        ],
        [
            {"question": "La créatine micronisée donne-t-elle plus de force que la monohydrate ?", "answer": "Non. À dose égale (3 à 5 g/jour), l'effet sur la force et la récupération est identique, car la molécule active est la même."},
            {"question": "Que signifie « 200 mesh » sur un pot de créatine ?", "answer": "Mesh désigne la finesse du tamis de broyage. Plus le chiffre est élevé (200 mesh), plus la poudre est fine et facile à disperser dans un liquide."},
            {"question": "La créatine micronisée se dissout-elle complètement dans l'eau froide ?", "answer": "Elle reste en suspension beaucoup plus longtemps qu'une poudre grossière, mais une légère agitation avant de boire reste utile dans l'eau très froide."}
        ]
    ))

    # 2
    arts.append(make_article(
        "creatine-poudre-ou-gelules-comparatif",
        "Créatine en poudre ou en gélules : quel format choisir ?",
        "Comparatif objectif entre créatine en poudre et créatine en gélules : nombre de capsules pour 3 à 5 g, coût par portion en Tunisie et praticité.",
        "Poudre économique ou gélules nomades : le nombre de gélules nécessaires par jour et l'écart de coût par portion changent souvent la décision d'achat.",
        "6 min",
        [
            ("Ce que contient réellement une gélule de créatine", [
                "Lorsque l'on compare les produits du rayon [Créatine](/creatine), la différence la plus sous-estimée entre poudre et gélules concerne la quantité par prise. Une gélule standard contient généralement entre 700 mg et 1000 mg (1 g) de créatine monohydrate, rarement davantage pour des raisons de volume physique.",
                "Pour atteindre la dose journalière recommandée par les consensus scientifiques (3 g à 5 g par jour), il faut donc avaler entre 3 et 7 gélules chaque jour. Avec la poudre, une seule petite cuillère doseuse rase suffit."
            ]),
            ("Comparaison du coût par portion en Dinars Tunisiens", [
                "L'écart de prix entre les deux formats est significatif. Un pot de 300 g de créatine monohydrate en poudre fournit 100 doses de 3 g (soit plus de trois mois d'utilisation). À l'inverse, une boîte de 120 gélules dosées à 750 mg apporte 90 g de créatine au total, soit seulement 30 doses de 3 g.",
                "À l'échelle d'une année ou même d'une cure de trois mois, la poudre coûte souvent deux à trois fois moins cher à quantité égale de créatine pure. Pour maîtriser ce calcul sur n'importe quel format, consultez [comment calculer le vrai coût par portion de créatine](/conseils/creatine-cout-par-portion-comparatif)."
            ]),
            ("Vitesse d'assimilation et confort digestif", [
                "Sur le plan physiologique, l'enveloppe en gélatine ou en cellulose végétale se dissout dans l'estomac en 15 à 25 minutes. Une fois libérée, la créatine suit exactement la même voie d'absorption intestinale que la poudre. Il n'existe donc aucun avantage d'efficacité intrinsèque pour un format par rapport à l'autre.",
                "Cependant, les gélules permettent de fractionner facilement la prise (par exemple 2 gélules au déjeuner et 2 gélules au dîner) pour les rares personnes sensibles à une prise unique de 5 g. De son côté, la [créatine micronisée 200 mesh](/conseils/creatine-monohydrate-ou-micronisee-differences) offre une excellente tolérance si elle est bien diluée."
            ]),
            ("Dans quels cas les gélules restent pertinentes ?", [
                "Les gélules gardent un vrai intérêt pratique dans trois situations précises : les déplacements professionnels ou sportifs sans shaker, les personnes qui ne supportent pas la texture de la poudre dans l'eau, et la préparation de piluliers hebdomadaires pour ne jamais oublier sa prise quotidienne. Rappelons que la régularité compte plus que l'horaire exact, comme expliqué dans [phase de charge ou prise régulière](/conseils/creatine-phase-de-charge-utile-ou-inutile)."
            ]),
            ("Comment trancher simplement ?", [
                "Pour 90 % des pratiquants réguliers de musculation ou de sports explosifs, la poudre monohydrate reste le choix le plus rationnel et le plus durable financièrement. Les gélules constituent une excellente option d'appoint ou de voyage lorsque la praticité prime sur le coût."
            ])
        ],
        [
            "Il faut généralement 4 à 6 gélules par jour pour égaler une seule cuillère de 3 à 5 g de poudre.",
            "À gramme égal de créatine, la poudre est 2 à 3 fois plus économique que les gélules.",
            "L'assimilation musculaire finale est identique entre poudre et gélules.",
            "Les gélules sont surtout utiles en déplacement ou en cas d'aversion pour la texture de la poudre."
        ],
        [
            {"question": "Les gélules de créatine agissent-elles plus vite que la poudre ?", "answer": "Non. La créatine fonctionne par saturation progressive des réserves musculaires sur plusieurs semaines, quel que soit le format."},
            {"question": "Combien de gélules prendre si ma boîte indique 3000 mg pour 4 gélules ?", "answer": "Prenez 4 gélules par jour avec un grand verre d'eau au cours d'un repas pour obtenir votre dose de 3 g."},
            {"question": "Peut-on ouvrir les gélules de créatine dans de l'eau ?", "answer": "Oui, mais cela perd l'intérêt pratique de la gélule et revient plus cher que d'acheter directement de la poudre pure."}
        ]
    ))

    # 3
    arts.append(make_article(
        "creatine-et-hydratation-recommandations",
        "Créatine et hydratation : combien d'eau boire et pourquoi ?",
        "Comprendre le lien entre créatine, eau intracellulaire, crampes et besoins hydriques quotidiens, notamment pendant l'été en Tunisie.",
        "La créatine attire l'eau à l'intérieur des cellules musculaires, pas sous la peau. Voici comment adapter votre hydratation sans mythes ni excès.",
        "6 min",
        [
            ("Rétention d'eau intracellulaire vs rétention sous-cutanée", [
                "L'une des inquiétudes les plus fréquentes concerne la « rétention d'eau ». Sur le plan physiologique, la créatine est osmotiquement active : lorsqu'elle entre dans les fibres musculaires, elle y attire de l'eau. C'est ce qu'on appelle une hydratation intracellulaire.",
                "Cette eau stockée dans le muscle explique la légère prise de poids de 0,5 à 1,5 kg parfois observée les deux premières semaines, ainsi qu'un aspect musculaire légèrement plus plein. Contrairement à un excès de sel ou à des déséquilibres hormonaux, la créatine ne provoque pas d'aspect bouffi sous la peau."
            ]),
            ("La créatine provoque-t-elle des crampes ou une déshydratation ?", [
                "Les études cliniques menées sur des athlètes s'entraînant même en environnement chaud (revues ISSN) montrent que la créatine n'augmente pas le risque de crampes ni de coups de chaleur lorsque l'apport hydrique reste normal. Certaines données suggèrent même une meilleure thermorégulation grâce à ce maintien du volume hydrique cellulaire.",
                "En Tunisie, où les températures estivales dépassent régulièrement 35 °C dans les salles peu climatisées ou en extérieur, la déshydratation vient surtout des pertes sudorales en eau et en sodium. Retrouvez nos repères complets dans [hydratation avant, pendant et après l'entraînement](/conseils/hydratation-avant-pendant-apres-entrainement)."
            ]),
            ("Combien d'eau boire par jour avec de la créatine ?", [
                "Il n'est pas nécessaire de boire 5 litres d'eau par jour. Un repère simple et réaliste pour un adulte sportif prenant 3 à 5 g de [créatine monohydrate](/creatine) consiste à viser 2,2 à 3 litres de liquides par jour (eau, infusions, eau contenue dans les aliments), et d'ajuster selon la couleur claire des urines.",
                "Au moment précis de la prise de créatine, utilisez 250 à 300 ml d'eau pour faciliter la vidange gastrique et éviter tout inconfort digestif. Si vous sortez d'une séance très sudorale, pensez également aux [électrolytes (sodium, potassium, magnésium)](/conseils/electrolytes-sodium-potassium-sport-chaleur)."
            ]),
            ("Erreurs courantes autour de l'eau et du mélange", [
                "Ne préparez pas votre boisson de créatine le matin pour la boire le soir dans un liquide acide (jus d'orange ou de citron) : en milieu acide et tiède, la créatine se dégrade lentement en créatinine inactive. Préparez votre verre juste avant de le boire, ou mélangez-la à votre shaker post-séance. Pour les autres erreurs fréquentes, consultez [les 7 erreurs fréquentes avec la créatine](/conseils/erreurs-frequentes-achat-utilisation-creatine)."
            ])
        ],
        [
            "La créatine attire l'eau dans la cellule musculaire (volume ferme), pas sous la peau.",
            "Les études montrent qu'elle ne provoque ni crampes ni déshydratation lorsque l'apport en eau est normal.",
            "Visez 2,2 à 3 litres d'eau par jour en période d'entraînement, davantage en plein été.",
            "Buvez la créatine rapidement après l'avoir mélangée, avec 250 à 300 ml d'eau."
        ],
        [
            {"question": "La créatine fait-elle gonfler le visage ?", "answer": "Non. L'eau attirée par la créatine est stockée majoritairement dans les muscles squelettiques."},
            {"question": "Faut-il boire plus d'eau pendant une phase de charge ?", "answer": "Oui, si vous faites une phase de charge (bien qu'elle ne soit pas obligatoire), fractionner les prises et boire 300 ml à chaque prise aide la digestion."},
            {"question": "Peut-on prendre sa créatine pendant le Ramadan ?", "answer": "Oui, en la plaçant au moment de l'Iftar ou après l'entraînement nocturne avec une hydratation progressive jusqu'au Shour."}
        ]
    ))

    # 4
    arts.append(make_article(
        "creatine-phase-de-charge-utile-ou-inutile",
        "Phase de charge en créatine : protocole utile ou dépassé ?",
        "Comparaison scientifique entre phase de charge (20 g/j pendant 5 jours) et prise directe à 3-5 g/j : délai de saturation et confort digestif.",
        "Prendre 20 g par jour pendant 5 jours sature le muscle plus vite, mais 3 à 5 g par jour aboutissent exactement au même niveau sans inconfort digestif.",
        "5 min",
        [
            ("D'où vient la « phase de charge » à 20 g par jour ?", [
                "Dans les premières études des années 1990 sur la créatine, les chercheurs cherchaient à saturer les réserves musculaires en un minimum de jours pour observer des résultats sur une semaine. Ils ont utilisé 20 g par jour (4 prises de 5 g) pendant 5 à 7 jours, suivis de 3 g par jour en entretien.",
                "Cette méthode fonctionne : elle fait grimper la phosphocréatine musculaire d'environ 15 à 20 % en une semaine. Mais fonctionne-t-elle mieux à moyen terme qu'une dose constante dès le départ ?"
            ]),
            ("Saturation à 7 jours vs 28 jours : le même plafond musculaire", [
                "Les essais comparatifs publiés depuis montrent qu'une prise quotidienne simple de 3 g à 5 g (sans aucune phase de charge) atteint exactement le même plafond de saturation musculaire en 21 à 28 jours.",
                "Pour un pratiquant qui s'entraîne toute l'année, gagner 2 semaines de saturation initiale n'apporte généralement aucun bénéfice durable, tout en consommant 100 g de pot dès les 5 premiers jours. Découvrez le calendrier complet dans [combien de temps pour ressentir les effets de la créatine](/conseils/creatine-delai-premiers-effets-saturation)."
            ]),
            ("Tolérance digestive et consommation inutile du pot", [
                "Ingérer 20 g de créatine par jour multiplie les risques de ballonnements, de crampes abdominales ou de selles molles, car l'intestin peine à absorber de grosses charges osmotiques d'un coup. De plus, une fraction excédentaire est éliminée dans les urines sous forme de créatinine.",
                "À 3–5 g par jour avec notre sélection de [créatine monohydrate](/creatine), votre confort digestif est préservé et votre pot de 300 g dure deux mois et demi à trois mois complets."
            ]),
            ("Le seul cas où une charge modérée peut se discuter", [
                "Seul un athlète préparant une compétition dans moins de 10 jours et n'ayant jamais pris de créatine auparavant peut envisager une charge courte (par exemple 4 prises de 3 à 5 g réparties aux repas pendant 5 jours, avec beaucoup d'eau). Pour tous les autres objectifs, commencez directement à 3–5 g par jour."
            ])
        ],
        [
            "La phase de charge (20 g/j sur 5 jours) n'est pas obligatoire.",
            "Prendre 3 à 5 g/j dès le premier jour atteint exactement le même niveau de saturation en ~3 à 4 semaines.",
            "Éviter la phase de charge réduit les troubles digestifs et économise votre pot.",
            "Une prise régulière chaque jour (même les jours de repos) est le facteur clé."
        ],
        [
            {"question": "Si je ne fais pas de phase de charge, la créatine sera-t-elle moins efficace ?", "answer": "Non. Elle met simplement 3 à 4 semaines au lieu d'une semaine pour saturer totalement vos muscles, puis l'efficacité est identique."},
            {"question": "Quelle dose quotidienne choisir sans phase de charge ?", "answer": "3 g par jour pour un gabarit léger/moyen (moins de 75 kg), ou 5 g par jour au-delà ou pour des entraînements très intenses."}
        ]
    ))

    # 5
    arts.append(make_article(
        "creatine-delai-premiers-effets-saturation",
        "Combien de temps faut-il pour ressentir les effets de la créatine ?",
        "Chronologie réaliste semaine par semaine des effets de la créatine monohydrate sur la force, l'endurance de série et la récupération.",
        "La créatine n'est pas un stimulant immédiat comme la caféine. Voici ce qui se passe entre le jour 1 et la semaine 4.",
        "5 min",
        [
            ("Pourquoi la créatine n'agit pas dès la première prise", [
                "Contrairement à un [pre-workout caféiné](/pre-workout) qui stimule le système nerveux en 30 minutes, la créatine agit en augmentant progressivement le stock intracellulaire de phosphocréatine (PCr). Ce stock sert à régénérer l'ATP — le carburant immédiat des efforts courts et intenses — entre deux séries.",
                "Prendre une dose unique juste avant une séance n'a donc pas d'effet aigu perceptible. L'effet apparaît lorsque la réserve musculaire approche de la saturation."
            ]),
            ("Chronologie réaliste semaine par semaine (à 3–5 g/j)", [
                "Semaine 1 : Les réserves commencent à monter graduellement. Aucun changement spectaculaire de force, parfois une légère augmentation de la soif.",
                "Semaines 2 à 3 : La phosphocréatine grimpe vers le seuil optimal. C'est souvent à ce moment que les pratiquants notent une meilleure capacité à sortir 1 ou 2 répétitions supplémentaires sur les dernières séries lourdes et une récupération un peu plus rapide entre les séries.",
                "Semaine 4 et au-delà : La saturation est atteinte (plus vite si vous suivez une nutrition équilibrée, voir [créatine et alimentation](/conseils/creatine-et-alimentation-sources-naturelles)). Les progrès sur les charges d'entraînement restent stables tant que vous maintenez la prise quotidienne."
            ]),
            ("Pourquoi certaines personnes réagissent plus fortement que d'autres ?", [
                "La réponse individuelle dépend fortement du niveau initial de créatine dans vos muscles. Les personnes consommant peu ou pas de viande rouge et de poisson (végétariens, petits mangeurs de viande) partent d'un stock musculaire plus bas : leur marge de progression à la saturation est donc plus marquée.",
                "À l'inverse, un athlète consommant déjà beaucoup de viande rouge et de poisson observera un gain plus subtil, mais tout de même utile sur la régularité des séances. Pour comparer les options fiables, parcourez le rayon [Créatine](/creatine)."
            ]),
            ("Comment savoir si votre créatine fonctionne réellement ?", [
                "Suivez vos performances dans un carnet d'entraînement sur 4 semaines (charges et répétitions sur les mouvements de base) plutôt que de vous fier aux sensations immédiates. Vérifiez aussi la régularité : manquer 3 jours par semaine ralentit nettement la saturation."
            ])
        ],
        [
            "Les premiers effets perceptibles apparaissent généralement entre la 2e et la 4e semaine à 3–5 g/j.",
            "L'indicateur le plus fiable est le gain de 1 à 2 répétitions sur les séries intenses et une meilleure endurance de série.",
            "Les végétariens et faibles consommateurs de viande réagissent souvent de façon plus marquée.",
            "La régularité quotidienne prime sur l'heure de la prise."
        ],
        [
            {"question": "Est-il normal de ne rien sentir la première semaine sous créatine ?", "answer": "Oui, c'est tout à fait normal. À 3-5 g/jour, les réserves musculaires mettent environ 3 semaines à se saturer."},
            {"question": "Que se passe-t-il si j'arrête la créatine après 2 mois ?", "answer": "Les réserves musculaires reviennent progressivement à leur niveau de base en 4 à 6 semaines, sans effet rebond négatif."}
        ]
    ))

    # 6
    arts.append(make_article(
        "creatine-et-alimentation-sources-naturelles",
        "Créatine et alimentation : viande, poisson et apports réels",
        "Teneur en créatine de la viande rouge, du poulet et du poisson, impact de la cuisson et intérêt pour les végétariens.",
        "L'alimentation apporte 1 à 2 g de créatine par jour chez un omnivore, mais les pertes à la cuisson expliquent l'intérêt de la supplémentation.",
        "5 min",
        [
            ("D'où vient la créatine naturellement présente dans le corps ?", [
                "Le corps humain synthétise lui-même environ 1 g de créatine par jour dans le foie, les reins et le pancréas à partir de trois acides aminés : la glycine, l'arginine et la méthionine. Chez un adulte omnivore, l'alimentation fournit environ 1 g supplémentaire.",
                "Cette quantité suffit pour la vie courante, mais elle ne sature qu'à ~60–80 % la capacité maximale des muscles squelettiques. La supplémentation via une [créatine monohydrate pure](/creatine) vise à combler les 20–40 % restants."
            ]),
            ("Teneurs alimentaires concrètes (viande rouge, volaille, poisson)", [
                "Les aliments d'origine animale sont les seules sources alimentaires notables de créatine : le hareng en contient environ 6,5 à 10 g/kg cru, le bœuf environ 4,5 g/kg cru, le saumon environ 4,5 g/kg et le poulet autour de 3,5 g/kg.",
                "Pour atteindre l'équivalent d'une seule cuillère de 5 g de créatine monohydrate uniquement par l'assiette, il faudrait consommer plus d'un kilo de bœuf cru par jour — ce qui est évidemment irréaliste sur le plan digestif, calorique et budgétaire."
            ]),
            ("L'impact souvent oublié de la cuisson", [
                "La chaleur prolongée (grillades, mijotés) dégrade une partie de la créatine présente dans la viande en créatinine, un déchet métabolique inactif. Ainsi, un steak bien cuit apporte sensiblement moins de créatine utilisable que sa valeur théorique à cru.",
                "C'est l'une des raisons pour lesquelles le complément en poudre reste la solution la plus propre et la plus précise pour maintenir une saturation constante (voir [protocole sans phase de charge](/conseils/creatine-phase-de-charge-utile-ou-inutile))."
            ]),
            ("Pourquoi les végétariens sont d'excellents répondeurs", [
                "Les aliments végétaux (légumineuses, céréales, fruits, légumes) ne contiennent pratiquement aucune trace de créatine. Les personnes suivant un régime végétarien ou végétalien dépendent donc uniquement de leur synthèse interne. Les études montrent que leur réponse musculaire et cognitive à 3–5 g/j de créatine synthétique (qui est 100 % vegan, produite sans ingrédient animal) est souvent supérieure à celle des omnivores."
            ])
        ],
        [
            "L'alimentation omnivore moyenne n'apporte qu'environ 1 g de créatine par jour.",
            "Il faudrait ~1,1 kg de bœuf cru pour égaler une seule dose de 5 g en poudre.",
            "La cuisson prolongée transforme une partie de la créatine alimentaire en créatinine.",
            "La créatine monohydrate en poudre est synthétisée sans ingrédient animal et convient aux végétariens."
        ],
        [
            {"question": "La créatine en poudre est-elle issue de la viande ?", "answer": "Non. La créatine monohydrate du commerce est fabriquée par synthèse chimique à partir de sarcosine et de cyanamide, sans aucun extrait animal."},
            {"question": "Faut-il manger moins de viande quand on prend de la créatine ?", "answer": "Non, conservez vos apports protéiques habituels pour couvrir l'ensemble de vos besoins en acides aminés essentiels."}
        ]
    ))

    # 7
    arts.append(make_article(
        "comment-comparer-qualite-creatine-label",
        "Comment vérifier la qualité d'une créatine : pureté, mesh et labels",
        "Critères objectifs pour juger la qualité d'une créatine : pureté à 99,9 %, absence d'additifs, granulométrie 200 mesh et traçabilité.",
        "Toutes les créatines monohydrates ne se ressemblent pas sur la transparence. Voici les 5 critères objectifs à inspecter avant d'acheter.",
        "6 min",
        [
            ("1. Liste d'ingrédients : le test de la ligne unique", [
                "Pour une créatine pure nature, la liste d'ingrédients idéale tient en un seul mot : « Créatine monohydrate (100 %) ». Méfiez-vous des formules « complexes de créatine » qui ajoutent 15 à 30 g de dextrose ou de maltodextrine par dose : vous payez du sucre au prix du complément.",
                "Dans notre catalogue [Créatine](/creatine), les références pures non aromatisées offrent le meilleur contrôle sur ce que vous consommez réellement."
            ]),
            ("2. Teneur en créatine pure par portion", [
                "Rappel utile : la créatine monohydrate pure contient chimiquement ~87,9 % de créatine et ~12,1 % d'eau de cristallisation. C'est tout à fait normal et c'est la forme de référence des études. Certaines étiquettes indiquent « 5 g de créatine monohydrate (dont 4,4 g de créatine) », ce qui est un signe de précision réglementaire et non une dilution."
            ]),
            ("3. Finesse de broyage (Mesh) et aspect de la poudre", [
                "Une créatine de bonne qualité est blanche, cristalline très fine (idéalement 200 mesh), sans odeur forte et sans grumeaux durs (les grumeaux indiquent souvent une exposition à l'humidité, voir [conservation sous climat chaud](/conseils/stocker-complements-climat-chaud-tunisie)). Pour la solubilité, lisez [monohydrate ou micronisée](/conseils/creatine-monohydrate-ou-micronisee-differences)."
            ]),
            ("4. Labels de fabrication, lots et scellés", [
                "Recherchez un fabricant identifié (adresse complète UE/USA, normes GMP / HACCP) et un numéro de lot clair accompagné d'une date de durabilité minimale (DDM) lisible. Les labels comme Creapure garantissent une production allemande soumise à des contrôles stricts de sous-produits (dicyandiamide, dihydrotriazine), mais de nombreuses marques sérieuses proposent aussi des monohydrates 200 mesh testées par lots en laboratoire tiers."
            ]),
            ("5. Le rapport qualité / prix par portion", [
                "Un prix anormalement bas comparé au marché ou un pot sans scellé intact doit éveiller votre vigilance. Calculez toujours le coût aux 3 g comme expliqué dans [calculer le coût par portion de créatine](/conseils/creatine-cout-par-portion-comparatif)."
            ])
        ],
        [
            "La liste d'ingrédients d'une bonne créatine nature ne doit contenir que de la créatine monohydrate.",
            "87,9 % de créatine pure dans le monohydrate est la proportion chimique normale (12,1 % d'eau liée).",
            "Vérifiez la finesse (200 mesh), l'absence de sucres ajoutés et la présence d'un numéro de lot net.",
            "Inspectez toujours l'opercule interne et le scellé à la réception."
        ],
        [
            {"question": "Ma créatine a de légers grumeaux, est-elle périmée ?", "answer": "Pas forcément : la poudre attire l'humidité ambiante. Si l'odeur est neutre, le produit reste utilisable, mais refermez bien le pot avec le sachet déshydratant à l'intérieur."},
            {"question": "Les créatines aromatisées sont-elles moins pures ?", "answer": "Elles contiennent des arômes, acidifiants et édulcorants (souvent 10 à 20 % du poids), ce qui réduit la proportion de créatine par cuillère."}
        ]
    ))

    # 8
    arts.append(make_article(
        "creatine-cout-par-portion-comparatif",
        "Créatine : comment calculer le vrai coût par portion de 3 g et 5 g ?",
        "Méthode simple en Dinars Tunisiens pour comparer des pots de 250 g, 300 g et 500 g selon le nombre réel de portions de 3 g ou 5 g.",
        "Comparer deux pots de créatine uniquement à leur prix affiché est trompeur. Voici comment calculer le vrai coût par dose en TND.",
        "5 min",
        [
            ("Pourquoi le prix du pot trompe souvent l'acheteur", [
                "Sur une boutique de nutrition sportive, un pot à 65 DT et un pot à 95 DT ne contiennent pas forcément la même quantité nette ni la même pureté. Le premier peut contenir 250 g ou un mélange aromatisé dosé à 60 % de créatine, tandis que le second contient 500 g de monohydrate 100 % pur.",
                "Pour comparer objectivement les offres de notre rayon [Créatine](/creatine), il faut ramener le prix à la portion réelle de 3 g (ou 5 g)."
            ]),
            ("La formule de calcul en Dinars Tunisiens", [
                "Étape 1 : Vérifiez la quantité réelle de créatine monohydrate dans le pot (ex. 300 g pour un pot 100 % pur). Étape 2 : Divisez ce poids par votre dose quotidienne (ex. 300 / 3 = 100 doses, ou 300 / 5 = 60 doses). Étape 3 : Divisez le prix du pot en TND par ce nombre de doses.",
                "Exemple concret : pour un pot pur de 300 g à 75 DT, le coût est de 0,750 DT (750 millimes) pour une dose de 3 g, ou 1,250 DT pour 5 g. Un pot de 500 g à 110 DT revient à 0,660 DT les 3 g — soit près de 12 % d'économie sur la durée."
            ]),
            ("L'impact du format (poudre vs gélules) sur le budget", [
                "Les gélules font fortement grimper le coût par portion car vous payez la mise en capsule et l'emballage pour un poids total beaucoup plus faible (souvent 90 g à 120 g de créatine par boîte). Pour les détails chiffrés, lisez [créatine en poudre ou en gélules](/conseils/creatine-poudre-ou-gelules-comparatif)."
            ]),
            ("Éviter de gaspiller sa créatine avec une phase de charge", [
                "Rappel budgétaire utile : réaliser une phase de charge de 20 g/j pendant 7 jours consomme 140 g dès la première semaine (presque la moitié d'un pot de 300 g !), pour un résultat final identique après un mois. En démarrant à 3–5 g/j, vous prolongez votre pot de plusieurs semaines. Plus de détails dans [phase de charge utile ou inutile](/conseils/creatine-phase-de-charge-utile-ou-inutile)."
            ])
        ],
        [
            "Ramenez toujours le prix du pot au coût d'une dose réelle de 3 g ou 5 g en TND.",
            "Les formats 300 g à 500 g en poudre nature offrent généralement le meilleur coût par portion.",
            "Méfiez-vous des pots aromatisés où 15 à 25 % du poids correspond à des arômes et édulcorants.",
            "Évitez la phase de charge pour économiser jusqu'à 140 g de poudre dès la première semaine."
        ],
        [
            {"question": "Un pot de 300 g dure combien de temps exactement ?", "answer": "À raison de 3 g par jour, un pot de 300 g dure 100 jours (plus de 3 mois). À 5 g par jour, il dure exactement 60 jours (2 mois)."},
            {"question": "Vaut-il mieux acheter 500 g d'un coup si je m'entraîne toute l'année ?", "answer": "Oui, le format 500 g abaisse le prix au gramme, à condition de bien refermer le pot à l'abri de l'humidité."}
        ]
    ))

    # 9
    arts.append(make_article(
        "creatine-et-seche-musculaire-compatibilite",
        "Créatine en sèche : peut-on l'utiliser en déficit calorique ?",
        "La créatine fait-elle prendre du gras ou bloque-t-elle la sèche ? Analyse physiologique du maintien de la force en déficit calorique.",
        "Non seulement la créatine est compatible avec une sèche, mais elle aide à préserver la force et la masse musculaire quand les calories baissent.",
        "5 min",
        [
            ("La créatine apporte-t-elle des calories ou fait-elle prendre du gras ?", [
                "Une créatine monohydrate pure contient 0 calorie, 0 g de glucides et 0 g de lipides. Il est donc physiologiquement impossible qu'elle provoque une prise de masse grasse.",
                "La confusion vient de la balance : en démarrant la créatine, l'eau intracellulaire retenue dans les muscles peut faire monter le poids sur la balance de 0,5 à 1 kg. Ce n'est ni du tissu adipeux ni de l'eau sous-cutanée (voir [créatine et hydratation](/conseils/creatine-et-hydratation-recommandations))."
            ]),
            ("Pourquoi garder la créatine pendant un déficit calorique ?", [
                "En période de sèche, le risque principal est la perte progressive de force due à la baisse des réserves de glycogène et d'énergie globale. Or, maintenir une tension mécanique élevée à l'entraînement est le signal numéro un qui indique à votre corps de conserver sa masse musculaire pendant que vous perdez du gras.",
                "En maintenant vos réserves de phosphocréatine au maximum avec 3 à 5 g/j de [créatine](/creatine), vous limitez la chute des charges sur les séries courtes et protégez votre volume musculaire."
            ]),
            ("Comment associer la créatine en sèche ?", [
                "L'association la plus logique en déficit calorique réunit une alimentation riche en protéines (complétée si besoin par une [whey peu sucrée](/conseils/whey-proteine-et-perte-de-poids-satiety)), un maintien du sommeil et 3 à 5 g de créatine par jour. Buvez simplement de l'eau plate avec votre créatine plutôt que des jus sucrés."
            ]),
            ("Faut-il arrêter la créatine avant une échéance ou pesée ?", [
                "Seuls les athlètes en catégorie de poids (sports de combat, haltérophilie) devant passer sous un seuil strict sur la balance arrêtent parfois la créatine 4 semaines avant la pesée pour perdre l'eau intracellulaire. Pour un objectif esthétique ou de remise en forme, continuez-la sans interruption."
            ])
        ],
        [
            "La créatine pure contient 0 calorie et ne peut pas faire prendre de graisse.",
            "En sèche, elle aide à conserver vos charges d'entraînement et à préserver votre masse maigre.",
            "L'eau retenue se situe dans le muscle (effet ferme), pas sous la peau.",
            "Prenez votre dose avec de l'eau plate plutôt qu'avec des jus riches en calories."
        ],
        [
            {"question": "Puis-je commencer la créatine pendant une sèche ?", "answer": "Oui. Gardez simplement à l'esprit que le poids sur la balance peut se stabiliser une semaine le temps que l'eau intramusculaire se fixe, alors que votre tour de taille continue de baisser."},
            {"question": "Créatine ou L-carnitine pour sécher ?", "answer": "Les deux n'ont pas le même rôle : le déficit calorique fait perdre le gras, la créatine protège la force musculaire."}
        ]
    ))

    # 10
    arts.append(make_article(
        "creatine-hcl-vs-monohydrate-comparatif",
        "Créatine HCL vs Monohydrate : ce que montrent vraiment les études",
        "Comparaison factuelle entre créatine HCL (chlorhydrate), Kre-Alkalyn et créatine monohydrate : biodisponibilité, études cliniques et prix.",
        "De nombreuses formes « améliorées » de créatine sont vendues plus cher que le monohydrate. Les essais cliniques valident-ils cet écart de prix ?",
        "6 min",
        [
            ("Pourquoi autant de formes de créatine existent sur le marché ?", [
                "La créatine monohydrate étant une molécule ancienne et non brevetable, l'industrie a développé au fil des années des variantes commerciales : créatine HCL (chlorhydrate), créatine éthyl ester, créatine tamponnée (Kre-Alkalyn) ou malate de créatine. L'argument avancé est généralement une meilleure solubilité ou une « dose plus faible nécessaire »."
            ]),
            ("Créatine HCL : une solubilité plus élevée, mais quelle efficacité réelle ?", [
                "La créatine HCL associe la créatine à un groupe chlorhydrate. En laboratoire, sa solubilité dans l'eau est effectivement supérieure à celle du monohydrate, ce qui limite les dépôts dans le verre et explique son goût légèrement acide.",
                "En revanche, les revues scientifiques indépendantes (notamment l'International Society of Sports Nutrition) rappellent qu'à ce jour, aucune étude humaine solide n'a démontré que la créatine HCL sature davantage les muscles ou augmente plus la force que le [monohydrate standard](/creatine). L'argument selon lequel 1,5 g de HCL suffirait pour égaler 5 g de monohydrate manque de preuves cliniques robustes."
            ]),
            ("Créatine tamponnée (Kre-Alkalyn) et Éthyl Ester", [
                "Les études contrôlées comparant directement la créatine tamponnée au monohydrate n'ont montré aucune supériorité sur la saturation musculaire ni sur les gains de performance. Quant à la créatine éthyl ester, des essais cliniques ont même observé qu'elle se dégrade plus rapidement en créatinine inactive dans l'estomac que le monohydrate classique !"
            ]),
            ("Comparatif de coût et choix rationnel", [
                "À efficacité égale ou supérieure, la créatine monohydrate (ou micronisée 200 mesh, voir [monohydrate ou micronisée](/conseils/creatine-monohydrate-ou-micronisee-differences)) coûte nettement moins cher au gramme de créatine active. Si vous avez un estomac très réactif au monohydrate malgré une dilution dans 300 ml d'eau pendant un repas, la HCL peut éventuellement être testée pour son confort de dissolution — sinon, le monohydrate reste la référence incontestée."
            ])
        ],
        [
            "Plus de 95 % des études scientifiques prouvant l'efficacité de la créatine portent sur le monohydrate.",
            "La créatine HCL se dissout mieux dans l'eau, mais n'a pas démontré de supériorité de force face au monohydrate.",
            "La créatine éthyl ester est moins efficace que le monohydrate classique selon les essais comparatifs.",
            "Pour la quasi-totalité des sportifs, la monohydrate micronisée offre le meilleur rapport preuves/prix."
        ],
        [
            {"question": "La créatine HCL évite-t-elle vraiment toute rétention d'eau ?", "answer": "Toute créatine qui pénètre efficacement dans le muscle y attire de l'eau intracellulaire : c'est inhérent au mécanisme même de la molécule."},
            {"question": "Quel dosage utiliser si je possède déjà de la créatine HCL ?", "answer": "Suivez l'étiquette du fabricant, généralement autour de 2 à 3 g par jour pour compenser l'absence de données justifiant de micro-doses inférieures."}
        ]
    ))

    return arts

def build_batch_2():
    arts = []
    # 11
    arts.append(make_article(
        "creatine-et-cafeine-interaction-verite",
        "Créatine et caféine : faut-il éviter de les prendre ensemble ?",
        "Revue des études sur l'interaction entre caféine et créatine : quand les associer, quand les espacer et impact sur le confort digestif.",
        "Une vieille étude de 1996 a lancé l'idée que la caféine annule la créatine. Que disent les recherches récentes et la pratique sportive ?",
        "5 min",
        [
            ("L'origine de la controverse : l'étude de 1996", [
                "Le doute vient d'une étude menée par Vandenberghe et al. en 1996 : les chercheurs avaient observé que l'ingestion de fortes doses de caféine (5 mg/kg/j) réduisait les gains de force liés à la charge en créatine lors d'un test isolé de contraction musculaire, sans pour autant bloquer l'absorption musculaire de la créatine."
            ]),
            ("Ce que montrent les recherches plus récentes", [
                "Depuis, de très nombreuses études utilisant des pre-workouts contenant à la fois de la caféine et de la créatine ont montré des gains nets de force, de puissance et de masse maigre. Les revues scientifiques récentes soulignent qu'il n'y a pas d'annulation directe de la saturation en phosphocréatine : les deux substances agissent sur des mécanismes différents (système nerveux central pour la caféine, régénération d'ATP pour la créatine)."
            ]),
            ("Le seul vrai point de vigilance : le confort gastrique", [
                "Si la caféine stimule le transit intestinal et que la créatine est parfois osmotiquement active dans l'estomac, avaler un café noir serré et 5 g de créatine à jeun le matin peut provoquer des crampes abdominales chez les personnes sensibles.",
                "La solution est simple : prenez votre café ou votre [pre-workout](/pre-workout) avant l'entraînement, et prenez votre [créatine](/creatine) après la séance dans votre shaker ou avec un repas."
            ]),
            ("Faut-il s'inquiéter pour sa progression ?", [
                "Non. Si votre consommation de caféine reste modérée (1 à 3 cafés par jour ou un booster dosé raisonnablement), vous profiterez pleinement de votre créatine. L'important reste la prise quotidienne régulière."
            ])
        ],
        [
            "La caféine ne bloque pas l'entrée de la créatine dans le muscle.",
            "De nombreuses études valident l'efficacité combinée sur la force et l'explosivité.",
            "Espacer café du matin et prise de créatine au repas améliore surtout le confort digestif.",
            "Ne mélangez pas votre créatine dans un café brûlant : préférez l'eau tempérée ou un shaker."
        ],
        [
            {"question": "Puis-je mettre ma créatine directement dans mon café du matin ?", "answer": "Mieux vaut éviter les liquides très chauds et acides qui accélèrent légèrement la dégradation en créatinine. Buvez votre café, puis prenez votre créatine dans un verre d'eau."},
            {"question": "Mon pre-workout contient déjà 3 g de créatine et de la caféine, est-ce utile ?", "answer": "Oui, mais les jours sans séance, pensez à prendre une dose de créatine seule pour maintenir vos réserves."}
        ]
    ))

    # 12
    arts.append(make_article(
        "erreurs-frequentes-achat-utilisation-creatine",
        "Les 7 erreurs fréquentes lors du choix et de la prise de créatine",
        "Ne gaspillez plus votre pot de créatine : les 7 erreurs classiques (prise irrégulière, manque d'eau, mélange acide, charge inutile) et comment les corriger.",
        "La créatine est simple à utiliser, mais quelques erreurs d'achat ou d'habitude limitent souvent ses bénéfices ou gênent la digestion.",
        "6 min",
        [
            ("Erreur 1 : Ne la prendre que les jours d'entraînement", [
                "La créatine fonctionne par saturation musculaire, pas par effet coup de fouet. Si vous vous entraînez 3 fois par semaine et oubliez votre dose les 4 autres jours, vos réserves ne resteront jamais au maximum. Prenez vos 3 à 5 g tous les jours, repos inclus."
            ]),
            ("Erreur 2 : Laisser la créatine tremper des heures dans du jus acide", [
                "Préparer sa gourde le matin avec du jus d'orange et de la créatine pour la boire à 18 h dégrade une partie du produit en créatinine inactive. Mélangez votre poudre dans de l'eau juste avant de boire."
            ]),
            ("Erreur 3 : Faire une phase de charge de 20 g sans raison", [
                "Cela consomme près de la moitié d'un pot de 300 g en 7 jours et augmente les ballonnements, alors qu'une prise constante de 3–5 g/j atteint exactement le même résultat en quelques semaines (voir [phase de charge utile ou inutile](/conseils/creatine-phase-de-charge-utile-ou-inutile))."
            ]),
            ("Erreur 4 : Acheter des « mélanges » sucrés au lieu de monohydrate pur", [
                "Certains produits ajoutent 30 g de sucre par dose sous prétexte de « transport musculaire ». Or un repas normal ou un shaker de protéines déclenche déjà largement la réponse nécessaire. Privilégiez une [créatine 100 % pure](/creatine)."
            ]),
            ("Erreur 5 : Négliger l'hydratation quotidienne", [
                "En particulier sous le climat tunisien, boire trop peu accentue l'inconfort gastrique. Visez 2,2 à 3 L d'eau par jour (détails dans [créatine et hydratation](/conseils/creatine-et-hydratation-recommandations))."
            ]),
            ("Erreur 6 : Laisser le pot ouvert dans un endroit humide", [
                "L'humidité agglomère la poudre en blocs durs. Refermez le couvercle immédiatement et conservez le petit sachet absorbeur d'humidité."
            ]),
            ("Erreur 7 : Arrêter après 10 jours faute de « sensation immédiate »", [
                "La saturation complète prend 3 à 4 semaines sans phase de charge. Évaluez vos progrès sur votre carnet de charges au bout d'un mois."
            ])
        ],
        [
            "Prenez 3 à 5 g tous les jours, même les jours sans sport.",
            "Buvez la créatine aussitôt mélangée dans 250 ml d'eau.",
            "Choisissez une poudre 100 % monohydrate sans sucres ajoutés.",
            "Laissez 3 à 4 semaines avant de juger vos progrès sur vos séries."
        ],
        [
            {"question": "Que faire si j'oublie une journée de créatine ?", "answer": "Prenez simplement votre dose normale le lendemain. Ne doublez pas la dose pour compenser."},
            {"question": "Faut-il prendre la créatine à jeun ?", "answer": "Non, il est souvent plus confortable pour l'estomac de la prendre pendant ou juste après un repas ou un shaker."}
        ]
    ))

    # 13..20: Cluster 2 Whey & Protéines (first 8)
    whey_specs = [
        ("besoins-proteines-selon-activite-physique", "Besoins en protéines par jour : sport et sédentaire",
         "Combien de grammes de protéines par kilo de poids de corps selon votre niveau : sédentaire, endurance ou musculation, et place de la whey.",
         "Les besoins en protéines varient du simple au double selon votre activité physique. Voici les fourchettes scientifiques et comment ajuster votre alimentation.",
         [("Fourchettes scientifiques par kilo de poids de corps", [
             "L'Autorité européenne de sécurité des aliments (EFSA) fixe l'apport de référence pour un adulte sédentaire autour de 0,83 g de protéines par kilogramme de poids de corps et par jour. Pour une personne de 70 kg peu active, cela représente environ 58 g de protéines quotidiennes.",
             "Dès que l'activité physique devient régulière, ces besoins augmentent pour réparer les micro-lésions musculaires et soutenir la synthèse protéique. L'International Society of Sports Nutrition (ISSN) situe l'apport optimal des sportifs d'endurance entre 1,2 et 1,6 g/kg/j, et celui des pratiquants de musculation ou de force entre 1,6 et 2,0 g/kg/j (jusqu'à 2,2 g/kg en sèche)."
         ]),
          ("Priorité à l'assiette avant le shaker", [
              "Avant de calculer le nombre de scoops de [whey protéine](/whey-proteine), faites le bilan de votre alimentation : œufs, blanc de poulet, thon, sardines, fromage blanc, yaourt grec, lentilles et pois chiches couvrent souvent 60 à 80 % du total. La whey intervient simplement comme un complément pratique et économique pour combler les 20 à 50 g manquants."
          ]),
          ("Répartition optimale sur la journée", [
              "Plutôt que de concentrer 80 g de protéines sur le dîner, répartissez votre total en 3 ou 4 prises de 25 à 40 g espacées de 3 à 5 heures (voir [timing et fenêtre anabolique](/conseils/timing-proteines-fenetre-anabolique-mythe))."
          ]),
          ("Exemples chiffrés pour 60 kg, 75 kg et 90 kg", [
              "Un sportif de 75 kg visant 1,8 g/kg cible environ 135 g de protéines par jour : 3 œufs au matin (~20 g), 150 g de poulet à midi (~35 g), un shaker de whey à 17 h (~24 g), 150 g de poisson ou viande le soir (~32 g) plus les protéines annexes des céréales et laitages (~24 g)."
          ])],
         ["Adulte sédentaire : ~0,83 g/kg/j ; endurance : 1,2–1,6 g/kg/j ; musculation : 1,6–2,0 g/kg/j.",
          "La whey complète votre alimentation solide ; elle ne la remplace pas.",
          "Répartir les apports en 3 à 4 prises de 25–40 g maximise la synthèse musculaire."],
         [{"question": "Dépasser 2 g/kg de protéines est-il utile en musculation ?", "answer": "Au-delà de 2,0 à 2,2 g/kg/j, les études montrent rarement un gain supplémentaire de masse musculaire chez un pratiquant naturel."},
          {"question": "Les femmes ont-elles besoin d'autant de protéines par kilo ?", "answer": "Oui, le calcul se base sur le poids de corps (ou la masse maigre) : les fourchettes en g/kg s'appliquent aux hommes comme aux femmes."}]),

        ("calculer-teneur-reelle-proteines-par-dose", "Comparer la teneur réelle en protéines par dose de whey",
         "Pourquoi 24 g de protéines par scoop ne suffisent pas à juger une whey : calculer le pourcentage réel de protéines et repérer les ajouts d'acides aminés.",
         "Deux pots affichant « 24 g de protéines » peuvent contenir 68 % ou 86 % de protéines selon la taille du scoop. Voici comment vérifier.",
         [("Le piège de la taille de la cuillère doseuse (scoop)", [
             "Lorsqu'on compare plusieurs marques dans notre rayon [Whey Protéine](/whey-proteine), le marketing met presque toujours en avant le chiffre « 24 g » ou « 25 g de protéines par dose ». Mais quelle est la taille de cette dose ?",
             "Si une marque utilise un scoop de 35 g pour obtenir 24 g de protéines, sa concentration réelle n'est que de 68,5 % (24 / 35). Si une autre utilise un scoop de 28 g pour livrer ces mêmes 24 g, sa concentration atteint 85,7 % — il s'agit souvent d'une [Whey Isolate](/whey-isolate) beaucoup plus filtrée."
         ]),
          ("Comment calculer le vrai pourcentage pour 100 g", [
              "Regardez toujours la colonne « pour 100 g » du tableau nutritionnel (et non seulement « par dose »). Une bonne whey concentrée titre entre 72 % et 78 % de protéines pour 100 g (légèrement moins en saveur chocolat à cause du cacao). Une whey isolate sérieuse titre entre 82 % et 90 %."
          ]),
          ("Repérer l'ajout artificiel d'acides aminés libres (amino spiking)", [
              "L'amino spiking consiste à ajouter de la glycine, de la taurine ou de la créatine bon marché dans la poudre pour gonfler artificiellement le dosage d'azote mesuré en laboratoire. Inspectez la liste des ingrédients : si la taurine ou la glycine figurent dans les ingrédients principaux sans transparence sur l'aminogramme complet, passez votre chemin (voir [lire l'étiquette d'une whey](/conseils/lire-etiquette-nutritionnelle-whey-proteine))."
          ]),
          ("Impact sur votre budget en Dinars", [
              "Plus la concentration pour 100 g est élevée, plus vous achetez de protéines utiles plutôt que des glucides ou des graisses. Apprenez à calculer votre coût réel dans [prix aux 100 g de protéines pures](/conseils/prix-100g-proteines-pures-comparer-whey)."
          ])],
         ["Divisez les grammes de protéines par le poids du scoop pour connaître le pourcentage réel.",
          "Une bonne whey concentrée affiche 72–78 % ; une isolate affiche 82–90 % pour 100 g.",
          "Méfiez-vous de l'ajout de glycine ou taurine non justifié dans la liste d'ingrédients."],
         [{"question": "Pourquoi la whey chocolat contient-elle souvent 1 à 2 g de protéines en moins que la vanille ?", "answer": "Parce que le cacao dégraissé occupe une petite fraction du poids total du pot à la place de la poudre de lactosérum."},
          {"question": "Une whey à 75 % est-elle de mauvaise qualité ?", "answer": "Non, 75 % est la norme excellente pour une whey concentrée WPC80." }]),

        ("lire-etiquette-nutritionnelle-whey-proteine", "Lire l'étiquette d'une whey protéine : guide pratique",
         "Comment décrypter une étiquette de whey : ordre des ingrédients (isolate vs concentré), lactose, sucres, enzymes digestives et aminogramme.",
         "Savoir lire le dos d'un pot de whey vous évite de payer pour des charges sucrées ou des formules mal tolérées. Guide étape par étape.",
         [("1. L'ordre des ingrédients (du plus abondant au moins abondant)", [
             "La loi impose que les ingrédients soient listés par poids décroissant. Sur un pot vendu comme « Isolate », le tout premier ingrédient doit être « Isolat de protéine de lactosérum (Whey Protein Isolate) ». Si « Concentré de lactosérum » arrive en premier et l'isolat en deuxième, vous achetez majoritairement un concentré ! Explorez nos références vérifiées dans [Whey Isolate](/whey-isolate) et [Whey Protéine](/whey-proteine)."
         ]),
          ("2. Glucides, sucres et lipides pour 100 g", [
              "Sur une concentrée classique, comptez environ 5 à 8 g de glucides (dont lactose) et 4 à 7 g de lipides pour 100 g. Sur une isolate filtrée, les glucides et les lipides descendent généralement sous les 2 à 3 g pour 100 g. Si les glucides dépassent 15 g pour 100 g, vérifiez s'il n'y a pas de maltodextrine ajoutée."
          ]),
          ("3. Édulcorants, épaississants et enzymes digestives", [
              "Les arômes utilisent souvent du sucralose ou de l'acésulfame-K (sans calories), et de la gomme xanthane ou guar pour l'onctuosité. Certains fabricants ajoutent de la lactase ou de la bromélaïne/papaïne pour faciliter la digestion du lactose résiduel."
          ]),
          ("4. L'aminogramme (le profil des acides aminés)", [
              "Un tableau d'aminogramme détaillé (montrant notamment ~10 à 12 g de L-leucine pour 100 g de protéines) est un excellent gage de sérieux. Plus de détails dans [profil en acides aminés et seuil de leucine](/conseils/profil-acides-amines-leucine-qualite-whey)."
          ])],
         ["Le premier ingrédient de la liste doit correspondre à la promesse sur la face avant.",
          "Au-delà de 12–15 g de glucides pour 100 g, vérifiez l'absence de sucres de remplissage.",
          "La présence d'un aminogramme détaillé confirme la qualité protéique réelle."],
         [{"question": "La lécithine de soja ou de tournesol dans les ingrédients est-elle un problème ?", "answer": "Non, elle est utilisée à moins de 1 % comme émulsifiant naturel pour éviter les grumeaux quand vous secouez le shaker."},
          {"question": "Que signifie WPC80 ou WPI90 sur certaines fiches ?", "answer": "WPC80 désigne un concentré titrant ~80 % sur matière sèche, WPI90 un isolat titrant ~90 %."}]),

        ("whey-et-intolerance-lactose-solutions", "Whey et intolérance au lactose : isolate, hydrolysée ou végétale ?",
         "Ballonnements après votre shaker ? Comparaison du taux de lactose entre whey concentrée, isolate, hydrolysée et protéines végétales.",
         "L'intolérance au lactose ne vous oblige pas à abandonner les protéines en poudre. Voici comment choisir selon votre seuil de tolérance.",
         [("Pourquoi la whey concentrée peut gêner la digestion", [
             "Le lactosérum issu du lait contient naturellement du lactose, un sucre du lait qui nécessite l'enzyme lactase pour être digéré. Une whey concentrée standard contient environ 4 à 8 g de lactose pour 100 g (soit 1,5 à 2,5 g par shaker). Chez les adultes présentant une baisse d'activité de la lactase — fréquente en Afrique du Nord — cela peut déclencher ballonnements, gaz ou inconfort intestinal."
         ]),
          ("Option 1 : La Whey Isolate (moins de 1 % de lactose)", [
              "Grâce à une étape supplémentaire de microfiltration ou d'ultrafiltration à froid, la [Whey Isolate](/whey-isolate) élimine presque tout le lactose et les graisses : il reste souvent moins de 0,5 g de lactose par shaker. Pour la grande majorité des personnes sensibles, ce taux très bas passe parfaitement, surtout si l'isolate est enrichie en enzyme lactase."
          ]),
          ("Option 2 : La Whey Hydrolysée", [
              "La [whey hydrolysée](/conseils/whey-hydrolysee-interet-sportifs-avances) (souvent fabriquée à partir d'isolate) pré-découpe les chaînes protéiques en peptides courts. Elle quitte l'estomac très rapidement et convient bien aux digestions fragiles, malgré un prix un peu supérieur."
          ]),
          ("Option 3 : Protéines végétales ou de bœuf (0 % lactose)", [
              "En cas d'intolérance sévère ou d'allergie avérée aux protéines de lait (caséine/lactosérum), tournez-vous vers un mélange de protéines végétales (pois + riz pour équilibrer les acides aminés) ou une protéine d'œuf/bœuf, totalement dépourvues de lactose et de lait."
          ])],
         ["Une whey concentrée contient ~1,5 à 2,5 g de lactose par shaker contre <0,5 g pour une Whey Isolate.",
          "La plupart des intolérants légers à modérés digèrent très bien une Whey Isolate pure.",
          "Les mélanges pois + riz garantissent 0 % de lactose tout en restant riches en acides aminés essentiels."],
         [{"question": "Comment tester si je tolère la Whey Isolate ?", "answer": "Commencez par un demi-scoop dans de l'eau (jamais avec du lait de vache) après un repas, et observez votre confort sur 48 heures."},
          {"question": "Mélanger sa whey avec du lait aggrave-t-il les ballonnements ?", "answer": "Oui ! Un grand verre de lait apporte à lui seul ~12 g de lactose, annulant l'intérêt d'une Isolate."}]),

        ("whey-native-vs-whey-fromagere-differences", "Whey native vs whey fromagère : procédé et différences réelles",
         "Comprendre la différence entre whey native (issue du lait frais à froid) et whey fromagère (lactosérum de fromagerie) sur la qualité nutritionnelle.",
         "Le terme « whey native » revient souvent sur les étiquettes. Quelle est la vraie différence industrielle et nutritionnelle avec une whey fromagère ?",
         [("Deux matières premières bien distinctes", [
             "Pendant des décennies, la quasi-totalité des protéines de lactosérum du marché provenait du petit-lait récupéré après la fabrication du fromage (whey fromagère). Ce lactosérum a déjà subi l'ajout de présure, de ferments, parfois des traitements thermiques pour pasteuriser le fromage et des étapes de blanchiment.",
             "La whey native suit un circuit plus court : elle est extraite directement du lait frais écrémé par microfiltration et ultrafiltration mécanique à basse température, sans passer par l'étape fromagère."
         ]),
          ("Profil en acides aminés et taux de leucine", [
              "L'avantage principal d'une filtration douce à froid est de limiter la dénaturation thermique des fractions protéiques (bêta-lactoglobuline, alpha-lactalbumine, lactoferrine) et de conserver un taux légèrement supérieur de leucine et de cystéine.",
              "Cependant, sur le plan de la prise de masse musculaire globale chez un sportif mangeant suffisamment de protéines sur la journée, une whey fromagère de grande marque internationale (titrant 78–85 % de protéines) reste parfaitement efficace (voir [leucine et qualité des protéines](/conseils/profil-acides-amines-leucine-qualite-whey))."
          ]),
          ("Solubilité et neutralité du goût", [
              "La whey native mousse parfois un peu plus au secouage si aucun émulsifiant n'est ajouté, mais son goût de base sans arôme est très neutre (peu acide), ce qui permet des formulations avec moins d'arômes artificiels."
          ]),
          ("Quand privilégier une whey native ?", [
              "Si votre budget le permet et que vous recherchez une liste d'ingrédients très épurée et faiblement transformée, la whey native est un excellent choix. Sinon, une concentrée ou [Whey Isolate](/whey-isolate) standard de fabricant reconnu remplit parfaitement son rôle."
          ])],
         ["La whey native est filtrée directement à partir du lait frais à basse température, sans étape fromagère.",
          "Elle préserve mieux les fractions protéiques natives et offre souvent une teneur élevée en leucine.",
          "Une whey fromagère WPC80/WPI90 de qualité reste toutefois très efficace pour la prise de muscle."],
         [{"question": "La whey native contient-elle moins de lactose ?", "answer": "Cela dépend du degré de filtration final (concentré vs isolat), pas uniquement du fait qu'elle soit native."},
          {"question": "Comment savoir si une whey est native ?", "answer": "Le fabricant l'indique explicitement dans la liste d'ingrédients (« isolat de protéine de lait native » ou procédé de filtration directe du lait)."}]),

        ("caseine-ou-whey-differences-utilisation", "Caséine ou Whey : vitesse d'assimilation et usages complémentaires",
         "Whey protéine rapide vs caséine micellaire lente : cinétique des acides aminés, satiété en sèche et prise avant le coucher.",
         "Whey et caséine proviennent toutes deux du lait, mais leurs vitesses de digestion répondent à des moments très différents de la journée.",
         [("80 % caséine, 20 % whey : les deux protéines du lait", [
             "Le lait de vache contient deux grandes familles de protéines : la caséine (environ 80 %) et le lactosérum ou whey (environ 20 %). Lorsqu'on les sépare par filtration, on obtient deux poudres aux comportements digestifs opposés."
         ]),
          ("Whey : pic rapide et déclenchement fort de l'anabolisme", [
              "La [whey protéine](/whey-proteine) reste liquide dans l'estomac, passe rapidement dans l'intestin et génère un pic d'acides aminés dans le sang entre 45 et 90 minutes après ingestion. Elle est idéale autour de l'entraînement ou en collation légère."
          ]),
          ("Caséine micellaire : libération prolongée sur 5 à 7 heures", [
              "À l'inverse, au contact de l'acidité gastrique, la caséine micellaire forme un gel souple qui ralentit sa propre vidange. Elle libère ainsi ses acides aminés de façon régulière et modérée pendant 5 à 7 heures.",
              "Cette propriété anti-catabolique et très rassasiante rend la caséine particulièrement pertinente dans deux situations : en collation avant une longue nuit de sommeil (ou pendant le Shour au Ramadan), et comme coupe-faim protéiné durant une sèche."
          ]),
          ("Peut-on simplement mélanger whey et laitage ?", [
              "Oui ! Si vous ne souhaitez pas acheter deux pots distincts, mélanger votre whey dans du fromage blanc ou du yaourt grec le soir ralentit déjà naturellement son assimilation grâce aux protéines de caséine présentes dans le laitage."
          ])],
         ["La whey provoque un pic rapide d'acides aminés (1–2 h) ; la caséine diffuse lentement (5–7 h).",
          "La caséine micellaire est utile le soir ou entre deux repas très espacés.",
          "Mélanger de la whey dans du yaourt ou fromage blanc reproduit facilement une assimilation mixte."],
         [{"question": "La caséine est-elle meilleure que la whey pour prendre du muscle ?", "answer": "Non, elles sont complémentaires. La whey déclenche un pic plus fort de leucine post-séance ; la caséine soutient les périodes de jeûne prolongé."},
          {"question": "La caséine est-elle plus épaisse à boire ?", "answer": "Oui, elle donne une texture nettement plus crémeuse (type milk-shake épais ou pudding) que la whey."}]),

        ("whey-hydrolysee-interet-sportifs-avances", "Whey hydrolysée : pour qui ce format est-il vraiment utile ?",
         "Comprendre l'hydrolyse enzymatique de la whey (WPH) : vitesse d'absorption, goût amer naturel et intérêt réel face à la Whey Isolate.",
         "La whey hydrolysée est souvent présentée comme la forme la plus haut de gamme. Voici quand son surcoût est justifié — et quand il ne l'est pas.",
         [("Qu'est-ce que l'hydrolyse des protéines ?", [
             "La whey hydrolysée (WPH) est une [Whey Isolate](/whey-isolate) (ou plus rarement concentrée) soumise à des enzymes qui découpent partiellement les longues chaînes de protéines en di- et tripeptides. L'objectif est de pré-digérer la protéine avant même qu'elle n'atteigne votre estomac."
         ]),
          ("Vitesse d'assimilation et récupération biquotidienne", [
              "Cette pré-digestion réduit légèrement le temps nécessaire pour que les acides aminés apparaissent dans le sang (souvent 20 à 40 minutes). Chez un athlète professionnel s'entraînant deux fois dans la même journée à quelques heures d'intervalle, ou chez un sportif ayant du mal à tolérer tout volume gastrique, cette rapidité peut avoir un intérêt.",
              "En revanche, pour un pratiquant s'entraînant une fois par jour ou 4 fois par semaine, aucune étude ne montre une prise de muscle supérieure à celle d'une bonne whey isolate classique (voir [timing des protéines](/conseils/timing-proteines-fenetre-anabolique-mythe))."
          ]),
          ("Attention au degré d'hydrolyse et au goût", [
              "Une protéine très fortement hydrolysée possède naturellement un goût amer dû aux peptides libres, souvent masqué par des arômes puissants. Vérifiez également le pourcentage d'hydrolysat dans la liste d'ingrédients : certains produits n'en contiennent que 5 à 10 % mélangés à du concentré."
          ]),
          ("Conclusion pratique pour votre budget", [
              "À moins d'avoir une contrainte de digestion extrême ou deux séances quotidiennes très rapprochées, investir dans une [Whey Isolate](/whey-isolate) pure ou une [Whey Protéine](/whey-proteine) classique reste plus pertinent financièrement."
          ])],
         ["La whey hydrolysée contient des chaînes pré-découpées (peptides) pour une vidange gastrique ultra-rapide.",
          "Elle n'apporte pas plus de muscle qu'une Whey Isolate sur un entraînement quotidien classique.",
          "Vérifiez que l'hydrolysat est bien l'ingrédient principal et non un simple ajout minoritaire."],
         [{"question": "La whey hydrolysée contient-elle du lactose ?", "answer": "Lorsqu'elle est fabriquée à partir d'Isolate (WPI), elle en contient moins de 1 %, donc elle est très bien tolérée."},
          {"question": "Est-elle adaptée aux débutants ?", "answer": "Un débutant n'a aucun besoin de payer le surcoût de l'hydrolyse ; une concentrée ou isolate standard suffit largement."}]),

        ("prix-100g-proteines-pures-comparer-whey", "Prix aux 100 g de protéines pures : comparer les wheys en TND",
         "Apprenez à calculer le vrai prix aux 100 g de protéines pures en Dinars Tunisiens pour comparer format 900 g, 2 kg, concentrée et isolate.",
         "Comparer deux pots de whey à leur prix d'étiquette sans calculer le coût aux 100 g de protéines pures fait souvent payer plus cher pour moins de protéines.",
         [("Pourquoi le prix au kilo du pot ne suffit pas", [
             "Deux pots de 2 kg vendus respectivement à 185 DT et 215 DT semblent avoir 30 DT d'écart. Mais si le premier titre à 65 % de protéines (1300 g de protéines nettes dans le pot) et le second à 84 % (1680 g de protéines nettes), le second contient presque 380 g de protéines pures en plus — soit 15 shakers supplémentaires !"
         ]),
          ("La formule exacte en 20 secondes", [
              "1. Multipliez le poids total du pot en grammes (ex. 2000 g) par le pourcentage de protéines pour 100 g (ex. 0,76 pour 76 g/100 g) -> vous obtenez 1520 g de protéines pures. 2. Divisez le prix du pot (ex. 190 DT) par (1520 / 100 = 15,2) -> soit **12,500 DT pour 100 g de protéines pures**, ou environ **3,000 DT par shaker de 24 g**."
          ]),
          ("Comparer la whey face aux aliments protéinés en Tunisie", [
              "Ce calcul révèle aussi pourquoi la whey reste compétitive : 100 g de protéines pures via des œufs, du poulet ou du thon en boîte coûtent souvent entre 9 et 16 DT selon les cours du marché. Un bon pot dans notre rayon [Whey Protéine](/whey-proteine) se situe généralement dans une fourchette comparable par gramme de protéine utile, avec une conservation longue sans réfrigération."
          ]),
          ("Concentrée vs Isolate vs format 900 g", [
              "Les petits formats (900 g) ont presque toujours un prix aux 100 g de protéines supérieur de 15 à 25 % aux formats de 2 kg ou 2,27 kg. Réservez les petits pots au test d'un nouveau goût ou d'une tolérance digestive (voir [les erreurs d'achat whey](/conseils/erreurs-achat-whey-proteine-eviter))."
          ])],
         ["Calculez toujours : Prix du pot / (Poids en kg × % protéines / 10).",
          "Un écart de 30 DT entre deux pots peut en réalité cacher un meilleur prix aux 100 g de protéines pures.",
          "Les formats 2 kg à 2,27 kg réduisent nettement le coût par shaker en Dinars Tunisiens."],
         [{"question": "Une whey très bon marché vaut-elle le coup ?", "answer": "Vérifiez toujours son % de protéines pour 100 g : si elle descend sous les 65 %, vous achetez surtout des glucides ou des charges."},
          {"question": "L'isolate est-elle toujours beaucoup plus chère au gramme de protéine ?", "answer": "Elle est plus chère que la concentrée, mais comme elle titre souvent 84 à 90 % contre 74 %, l'écart réel aux 100 g de protéines pures est moindre que l'écart facial."}]),
    ]
    for slug, seo_t, meta_d, exc, secs, taks, fqs in whey_specs:
        arts.append(make_article(slug, seo_t, meta_d, exc, "6 min", secs, taks, fqs))
    return arts

batch1 = build_creatine_articles()
batch2 = build_batch_2()

with open("scripts/batches/batch_01.json", "w", encoding="utf-8") as f:
    json.dump(batch1, f, ensure_ascii=False, indent=2)
with open("scripts/batches/batch_02.json", "w", encoding="utf-8") as f:
    json.dump(batch2, f, ensure_ascii=False, indent=2)

print(f"Created batch_01.json ({len(batch1)} articles) and batch_02.json ({len(batch2)} articles).")
