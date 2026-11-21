# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 5: Remaining 4 Magnésium + first 6 Oméga 3
B5_SPECS = [
    ("magnesium-exces-effets-secondaires-securite", "Magnésium : limite de sécurité et excès",
     "Quelle est la limite supérieure de sécurité du magnésium en complément (EFSA 250 mg/j) ? Diarrhée osmotique, insuffisance rénale et bonnes pratiques.",
     "Le magnésium alimentaire ne pose aucun risque chez l'adulte sain, mais une dose trop élevée en complément peut provoquer des troubles digestifs.",
     [("Magnésium alimentaire vs magnésium en complément", [
         "L'Autorité européenne de sécurité des aliments (EFSA) n'a pas fixé de limite supérieure pour le magnésium issu des aliments naturels, car les reins sains éliminent facilement l'excès alimentaire.",
         "En revanche, pour les sels de magnésium dissociables apportés sous forme de compléments (comprimés, gélules, poudres), l'EFSA établit une dose limite tolérable (UL) de **250 mg par jour** en supplémentation chez l'adulte afin d'éviter l'effet laxatif."
     ]),
      ("La diarrhée osmotique : premier signal d'un excès", [
          "Lorsque vous ingérez trop de magnésium d'un seul coup (surtout sous forme d'oxyde, de chlorure ou de sulfate), la fraction non absorbée reste dans l'intestin et attire l'eau par osmose, déclenchant ballonnements, crampes et diarrhée passagère. Fractionner la prise (ex. matin et soir) ou passer au [bisglycinate](/conseils/magnesium-bisglycinate-vs-citrate-comparatif) corrige généralement le problème."
      ]),
      ("La contre-indication majeure : l'insuffisance rénale", [
          "Chez une personne présentant une insuffisance rénale sévère, les reins ne filtrent plus correctement l'excès de magnésium sanguin, exposant à un risque d'hypermagnésémie (hypotension, faiblesse musculaire, troubles du rythme). Demandez toujours un avis médical en cas de pathologie rénale avant de commander dans le rayon [Magnésium](/magnesium)."
      ])],
     ["La limite de tolérance EFSA en supplémentation pour les sels dissociables est de 250 mg/jour.",
      "L'excès digestif se manifeste d'abord par des selles molles ou une diarrhée osmotique.",
      "Contre-indiqué sans suivi médical en cas d'insuffisance rénale."],
     [{"question": "Que faire si mon magnésium me donne mal au ventre ?", "answer": "Prenez-le pendant un repas, divisez la dose en deux prises ou choisissez une forme chélatée (bisglycinate)."}]),

    ("magnesium-et-vitamine-b6-taurine-associations", "Magnésium avec B6, taurine ou D3 : associations",
     "Pourquoi associer magnésium, vitamine B6, taurine ou vitamine D3 ? Comprendre les synergies cellulaires et éviter les doublons.",
     "Sur les étiquettes, le magnésium est rarement seul. Découvrez le rôle réel de la vitamine B6, de la taurine et de la vitamine D dans son métabolisme.",
     [("Magnésium + Vitamine B6 : un duo classique", [
         "La vitamine B6 (pyridoxine ou P-5-P) facilite l'entrée cellulaire du magnésium et participe avec lui au fonctionnement normal du système nerveux ainsi qu'au métabolisme énergétique. Une dose modérée de 1,4 à 2 mg de vitamine B6 par jour suffit largement."
     ]),
      ("Le rôle de la taurine comme « fixateur » cellulaire", [
          "La taurine est un dérivé d'acide aminé soufré naturellement présent dans le corps (à ne pas confondre avec un excitant comme la caféine). Elle aide à stabiliser les membranes cellulaires et à limiter la fuite du magnésium hors des cellules lors d'épisodes de stress ou d'effort intense."
      ]),
      ("L'interaction clé avec la Vitamine D3", [
          "Moins connu mais essentiel : toutes les enzymes qui convertissent la vitamine D dans le foie et les reins en forme active sont dépendantes du magnésium ! Inversement, un apport normal en vitamine D améliore légèrement l'absorption intestinale du magnésium. Parcourez nos formules dans [Magnésium](/magnesium) et [Vitamines](/vitamines)."
      ])],
     ["La vitamine B6 et la taurine soutiennent l'utilisation intracellulaire du magnésium.",
      "Le magnésium est indispensable à l'activation métabolique de la vitamine D.",
      "Vérifiez vos autres compléments pour ne pas cumuler trop de vitamine B6."],
     [{"question": "La taurine associée au magnésium empêche-t-elle de dormir ?", "answer": "Non ! Contrairement à une idée reçue liée aux boissons énergisantes caféinées, la taurine seule n'est pas un stimulant nerveux."}]),

    ("choisir-son-magnesium-criteres-objectif", "Choisir son magnésium : critères selon votre besoin",
     "Arbre de décision complet pour choisir votre magnésium : sportif, stress passager, intestin sensible ou petit budget en Tunisie.",
     "Entre bisglycinate, citrate, malate ou complexe multi-sels, voici comment sélectionner le magnésium le mieux adapté à votre objectif.",
     [("Profil 1 : Intestin sensible, stress ou prise le soir", [
         "Privilégiez un **magnésium bisglycinate** pur (avec ou sans B6/taurine). Sa tolérance gastrique est remarquable et la glycine associée convient parfaitement en fin de journée. Voir [bisglycinate vs citrate](/conseils/magnesium-bisglycinate-vs-citrate-comparatif)."
     ]),
      ("Profil 2 : Sportif en climat chaud ou fatigue musculaire", [
          "Un **citrate**, un **malate** ou un **bisglycinate** apportant 200 à 300 mg de magnésium élémentaire par jour permet de compenser les pertes sudorales. Le malate (lié à l'acide malique) est souvent pris le matin ou à midi."
      ]),
      ("Profil 3 : Budget maîtrisé sur le long terme", [
          "Le citrate de magnésium en comprimés ou en poudre offre généralement l'un des meilleurs coûts par dose de 100 mg de [magnésium élémentaire](/conseils/magnesium-elementaire-vs-poids-compose) dans notre rayon [Magnésium](/magnesium)."
      ]),
      ("Les 3 vérifications finales avant de valider votre panier", [
          "Vérifiez la forme chimique (évitez 100 % oxyde si vous cherchez une assimilation optimale), comptez le nombre de comprimés nécessaires pour obtenir 200 mg élémentaires et calculez le nombre de jours de cure du flacon."
      ])],
     ["Intestin sensible ou soirée : bisglycinate ; énergie et budget : citrate ou malate.",
      "Visez 150 à 250 mg de magnésium élémentaire par jour en complément.",
      "Comparez toujours le nombre de jours de cure réels de la boîte."],
     [{"question": "Vaut-il mieux prendre son magnésium le matin ou le soir ?", "answer": "Il n'y a pas d'heure obligatoire, mais beaucoup préfèrent le prendre au dîner ou réparti matin et soir pendant les repas."}]),

    ("idees-recues-sur-le-magnesium-marin-oxyde", "Magnésium marin et oxyde : démêler le vrai du faux",
     "Le magnésium marin est-il vraiment mieux absorbé ? Analyse objective de sa composition réelle (oxyde/hydroxyde) face aux formes chélatées.",
     "Très populaire en parapharmacie sous l'étiquette « naturel », le magnésium marin cache souvent de l'oxyde de magnésium. Faisons le point objectivement.",
     [("Que contient réellement une gélule de « magnésium marin » ?", [
         "Le magnésium marin est obtenu par évaporation d'eau de mer. S'il porte une image naturelle rassurante, il est chimiquement composé en grande majorité d'oxyde, d'hydroxyde, de chlorure et de sulfate de magnésium — des sels inorganiques."
     ]),
      ("Teneur élevée sur l'étiquette, mais biodisponibilité modeste", [
          "L'oxyde de magnésium contient près de 60 % de magnésium élémentaire en poids, ce qui permet aux fabricants d'afficher « 300 mg dans une seule gélule ». Toutefois, les études comparatives de biodisponibilité (PubMed) montrent que les sels inorganiques peu solubles comme l'oxyde présentent un taux d'absorption nettement inférieur au citrate, au lactate ou au bisglycinate."
      ]),
      ("Quand le magnésium marin reste acceptable, et quand l'éviter", [
          "Si vous le digérez bien et que votre budget est très serré, il apporte tout de même une petite fraction absorbable (environ 4 à 15 % selon les études). En revanche, si vous ressentez des ballonnements ou cherchez une assimilation optimisée, choisissez un sel organique ou chélaté dans notre catégorie [Magnésium](/magnesium)."
      ])],
     ["Le magnésium marin est majoritairement composé de sels inorganiques (oxyde, hydroxyde).",
      "Il permet de concentrer 300 mg dans 1 gélule, mais son absorption intestinale est plus faible.",
      "Les formes citrate, malate et bisglycinate offrent une bien meilleure biodisponibilité."],
     [{"question": "Pourquoi le magnésium marin est-il souvent moins cher ?", "answer": "Parce que l'extraction d'oxyde/sels marins coûte beaucoup moins cher que la chélation du magnésium avec la glycine ou l'acide citrique."}]),

    # ── OMÉGA 3 (6) ──
    ("epa-et-dha-roles-complementaires-omega-3", "EPA et DHA : différences entre ces Oméga 3",
     "Comprendre les rôles distincts de l'EPA et du DHA (Oméga 3 marins) face à l'ALA végétal : cœur, vision, fonction cérébrale et allégations EFSA.",
     "Toutes les graisses « Oméga 3 » ne s'équivalent pas : l'EPA et le DHA d'origine marine ont des fonctions spécifiques que l'ALA végétal convertit peu.",
     [("ALA végétal vs EPA et DHA marins", [
         "Il existe trois principaux acides gras Oméga 3 : l'ALA (acide alpha-linolénique, présent dans les noix, le lin et le chia), et les deux acides gras à longue chaîne **EPA** (acide eicosapentaénoïque) et **DHA** (acide docosahexaénoïque), présents dans les poissons gras et les microalgues.",
         "Chez l'humain, le taux de conversion de l'ALA végétal en EPA et surtout en DHA reste très faible (souvent inférieur à 5–10 % pour l'EPA et < 1–5 % pour le DHA). D'où l'intérêt d'un apport direct via l'alimentation marine ou notre rayon [Oméga 3](/omega-3)."
     ]),
      ("Rôles complémentaires de l'EPA et du DHA selon l'EFSA", [
          "Selon les évaluations scientifiques de l'EFSA : l'**EPA et le DHA** contribuent ensemble à une **fonction cardiaque normale** dès 250 mg/jour combinés. Le **DHA** seul contribue au **maintien d'une vision normale** et au **fonctionnement normal du cerveau** dès 250 mg/jour."
      ]),
      ("Quel ratio EPA / DHA rechercher ?", [
          "Les huiles de poisson classiques affichent souvent un ratio proche de 180 mg d'EPA pour 120 mg de DHA par capsule de 1000 mg (ratio 3:2). Pour un usage général bien-être et sportif, visez simplement 500 à 1000 mg d'EPA + DHA combinés par jour (voir [concentration réelle EPA/DHA](/conseils/concentration-epa-dha-taille-portion-omega-3))."
      ])],
     ["L'ALA végétal se convertit très faiblement en EPA et encore moins en DHA.",
      "250 mg/jour d'EPA+DHA contribuent à une fonction cardiaque normale (EFSA).",
      "250 mg/jour de DHA soutiennent la vision et le fonctionnement normal du cerveau."],
     [{"question": "Les graines de chia remplacent-elles l'huile de poisson ?", "answer": "Elles apportent de l'ALA mais ne fournissent pas directement d'EPA ni de DHA : seule l'huile de poisson ou de microalgues apporte directement EPA et DHA."}]),

    ("huile-de-poisson-vs-huile-algues-omega-3", "Huile de poisson vs huile d'algues Oméga 3 : comparatif",
     "Huile de poisson ou huile de microalgues (Schizochytrium) : biodisponibilité du DHA/EPA, goût, pureté et choix vegan en Tunisie.",
     "Les poissons ne fabriquent pas leurs Oméga 3 : ils les accumulent en mangeant des microalgues. Comparons directement les deux sources.",
     [("Pourquoi les microalgues sont à la source de tous les Oméga 3 marins", [
         "Dans la chaîne alimentaire marine, ce sont les microalgues (comme *Schizochytrium*) qui synthétisent l'EPA et le DHA. Les petits poissons gras les accumulent ensuite dans leurs tissus. L'huile d'algues court-circuite donc cette chaîne en cultivant directement les microalgues en fermenteurs contrôlés."
     ]),
      ("Biodisponibilité, pureté et goût", [
          "Les études cliniques montrent que le DHA et l'EPA issus d'huile d'algues présentent une biodisponibilité équivalente à celle de l'huile de poisson ou du saumon cuit. Cultivées en milieu clos, les algues sont naturellement exemptes de métaux lourds marins (mercure) et conviennent aux régimes végétariens, végans ou aux personnes allergiques au poisson."
      ]),
      ("Teneur en EPA vs DHA et écart de prix", [
          "L'huile d'algues est souvent très riche en DHA et contient parfois moins d'EPA (bien que certaines souches soient désormais équilibrées). Son coût de production reste plus élevé que l'huile d'anchois ou de sardine. Parcourez les formats disponibles dans notre sélection [Oméga 3](/omega-3)."
      ])],
     ["L'huile de microalgues apporte directement du DHA et de l'EPA sans origine animale.",
      "Sa biodisponibilité est comparable à celle de l'huile de poisson.",
      "L'huile de poisson purifiée reste généralement plus économique par gramme d'EPA+DHA."],
     [{"question": "L'huile d'algues provoque-t-elle des renvois goût poisson ?", "answer": "Non, son profil aromatique est neutre ou légèrement marin/végétal, sans goût prononcé de poisson."}]),

    ("concentration-epa-dha-taille-portion-omega-3", "Concentration EPA et DHA : ne pas confondre avec 1000 mg",
     "Pourquoi 1000 mg d'huile de poisson n'apporte que 300 mg d'Oméga 3 actifs dans les formules standard vs 600–800 mg dans les formules concentrées.",
     "C'est l'erreur numéro 1 lors de l'achat d'Oméga 3 : lire « 1000 mg » sur le flacon et croire que l'on obtient 1000 mg d'EPA et DHA.",
     [("Huile totale (1000 mg) vs Acides gras actifs (EPA + DHA)", [
         "Une capsule molle standard pèse presque toujours **1000 mg d'huile de poisson**. Mais dans une huile naturelle non concentrée, les Oméga 3 EPA et DHA ne représentent qu'environ **30 %** du poids total : typiquement **180 mg d'EPA + 120 mg de DHA = 300 mg d'Oméga 3 actifs** pour 1000 mg d'huile ! Les 700 mg restants sont d'autres lipides neutres.",
         "Les formules concentrées (souvent titrées à 50 %, 65 % ou 75 %) apportent entre **500 mg et 750 mg d'EPA + DHA** dans une seule capsule de 1000 mg."
     ]),
      ("Conséquence sur le nombre de capsules par jour", [
          "Si vous visez un apport quotidien de 600 à 900 mg d'EPA + DHA combinés : avec une formule standard à 30 %, il vous faudra **2 à 3 capsules par jour** ; avec une formule concentrée à 65 %, **1 à 2 capsules** suffisent. Comparez toujours le nombre de jours réels dans notre rayon [Oméga 3](/omega-3)."
      ]),
      ("Forme triglycérides (TG) vs esters éthyliques (EE)", [
          "Les huiles naturelles sont sous forme triglycérides (TG). Pour concentrer fortement l'EPA/DHA (> 50 %), les fabricants passent souvent par la forme ester éthylique (EE) — ou la ré-estérifient en triglycérides (rTG). Prendre vos capsules au milieu d'un repas contenant un peu de lipides optimise l'absorption dans les deux cas."
      ])],
     ["Une capsule standard de 1000 mg d'huile de poisson apporte souvent 300 mg d'EPA+DHA (180+120).",
      "Additionnez toujours EPA + DHA par capsule pour connaître la vraie concentration.",
      "Prenez toujours vos Oméga 3 pendant un repas contenant des graisses pour maximiser l'absorption."],
     [{"question": "Quelle dose totale d'EPA + DHA viser par jour ?", "answer": "Pour l'entretien général, 250 à 500 mg/j (EFSA) ; chez les sportifs mangeant peu de poisson gras, 500 à 1000 mg/j combinés EPA+DHA."}]),

    ("lire-quantites-epa-dha-etiquette-omega-3", "Lire les quantités d'EPA et DHA sur une étiquette",
     "Comment décrypter une boîte d'Oméga 3 : portion de référence (1 vs 2 capsules), somme EPA+DHA et calcul du vrai dosage.",
     "Certaines boîtes affichent « 1000 mg d'Oméga 3 » pour une portion de 2 ou 3 capsules ! Voici comment lire l'étiquette sans piège.",
     [("Piège n°1 : La taille de la portion (« Serving Size »)", [
         "Sur de nombreux flacons importés, le tableau indique en grand : « EPA 360 mg / DHA 240 mg », mais juste au-dessus il est écrit en petit : **Serving size : 2 softgels**. Chaque capsule individuelle ne contient donc que 180 mg d'EPA et 120 mg de DHA ! Divisez toujours les chiffres du tableau par le nombre de capsules de la portion."
     ]),
      ("Piège n°2 : Additionner uniquement EPA + DHA", [
          "Certains produits affichent « Total Omega-3 : 350 mg » dont EPA 180 mg et DHA 120 mg (les 50 mg restants étant d'autres acides gras mineurs). Basez toujours votre comparaison sur la somme exacte **EPA + DHA**."
      ]),
      ("Vérifier les antioxydants protecteurs dans les ingrédients", [
          "Une bonne étiquette du rayon [Oméga 3](/omega-3) mentionne l'ajout de **vitamine E (D-alpha-tocophérol)** ou d'extrait de romarin : ce sont des antioxydants indispensables pour éviter le rancissement de l'huile à l'intérieur de la capsule (voir [qualité et indice TOTOX](/conseils/qualite-fraicheur-indice-totox-omega-3))."
      ])],
     ["Vérifiez toujours si les mg d'EPA et DHA du tableau valent pour 1, 2 ou 3 capsules.",
      "Additionnez EPA + DHA pour juger la puissance réelle.",
      "La présence de vitamine E (tocophérols) protège l'huile contre l'oxydation."],
     [{"question": "Comment savoir si une capsule contient 30 % ou 60 % d'EPA+DHA ?", "answer": "Divisez (EPA + DHA d'une capsule) par le poids d'huile d'une capsule (souvent 1000 mg). Par exemple, (330 + 220) / 1000 = 55 %."}]),

    ("qualite-fraicheur-indice-totox-omega-3", "Qualité et fraîcheur des Oméga 3 : indice TOTOX",
     "Tout savoir sur l'oxydation des huiles de poisson : indice de peroxyde (PV), anisidine (p-AV), indice TOTOX et test simple de fraîcheur.",
     "Les acides gras Oméga 3 sont très sensibles à la chaleur, à l'oxygène et à la lumière. Voici comment évaluer la fraîcheur d'une huile de poisson.",
     [("Pourquoi les Oméga 3 s'oxydent-ils facilement ?", [
         "L'EPA et le DHA possèdent respectivement 5 et 6 doubles liaisons chimiques : cette structure polyinsaturée les rend extrêmement flexibles dans nos membranes cellulaires, mais aussi vulnérables à l'oxydation au contact de l'air, de la chaleur ou des UV."
     ]),
      ("Comprendre l'indice TOTOX (Total Oxidation)", [
          "Pour mesurer l'état de fraîcheur d'une huile marine, les laboratoires calculent l'indice **TOTOX = (2 × Indice de peroxyde) + Indice d'anisidine**. La pharmacopée européenne et les standards qualité internationaux (GOED) fixent un plafond strict à **TOTOX ≤ 26** (les meilleures huiles fraîches se situent souvent sous 10–15)."
      ]),
      ("Comment tester concrètement une capsule à la maison ?", [
          "Percez une capsule avec une aiguille et goûtez une goutte d'huile : une huile fraîche a un goût marin très doux et discret. Si vous sentez une odeur âcre de poisson avarié ou de peinture rance, ou si chaque prise déclenche des renvois acides persistants, l'huile est probablement oxydée. Pour protéger vos flacons en Tunisie, suivez [conservation des Oméga 3](/conseils/conserver-omega-3-chaleur-lumiere-frigo) et comparez nos flacons opaques dans [Oméga 3](/omega-3)."
      ])],
     ["L'indice TOTOX mesure l'oxydation totale d'une huile de poisson (seuil max GOED : 26).",
      "Les flacons opaques protègent nettement mieux les huiles que les flacons transparents.",
      "Un goût âcre et rance ou des renvois forts traduisent souvent une huile oxydée."],
     [{"question": "Les capsules entériques empêchent-elles de sentir si l'huile est rance ?", "answer": "Elles réduisent les renvois gastriques, mais il reste utile de vérifier la DDM, la conservation au frais et de tester une capsule à l'ouverture."}]),

    ("conserver-omega-3-chaleur-lumiere-frigo", "Conserver ses Oméga 3 : chaleur et réfrigérateur",
     "Faut-il mettre les Oméga 3 au réfrigérateur en Tunisie ? Conseils de stockage selon la saison pour préserver la fraîcheur de l'huile de poisson.",
     "Avec des étés dépassant 35 °C, mal stocker un flacon d'Oméga 3 accélère son oxydation. Voici les bons réflexes de conservation.",
     [("L'ennemi numéro 1 des Oméga 3 en Tunisie : la chaleur estivale", [
         "La vitesse d'oxydation des lipides polyinsaturés augmente nettement avec la température. Laisser un pot d'[Oméga 3](/omega-3) sur le plan de travail de la cuisine, près d'une fenêtre ensoleillée ou dans un sac de sport laissé dans une voiture en été dégrade rapidement l'huile."
     ]),
      ("Faut-il les mettre au réfrigérateur (frigo) ?", [
          "Oui, en période estivale ou lorsque la température de votre pièce dépasse 24–25 °C, conserver le flacon bien refermé dans le bac à légumes ou une étagère du réfrigérateur (autour de 4–8 °C, jamais au congélateur) ralentit considérablement l'oxydation. Veillez simplement à bien revisser le bouchon immédiatement après chaque prise pour éviter la condensation."
      ]),
      ("Le reste de l'année : placard frais, sec et sombre", [
          "En automne/hiver, un placard fermé à température ambiante fraîche (15–22 °C) convient parfaitement pour les capsules molles. Les flacons d'huile liquide en bouteille doivent en revanche impérativement aller au réfrigérateur après ouverture et être consommés sous 6 à 8 semaines."
      ])],
     ["Ne laissez jamais vos Oméga 3 près d'une fenêtre, d'un four ou dans une voiture.",
      "En été (> 25 °C), le réfrigérateur (4–8 °C, bouchon bien vissé) préserve la fraîcheur.",
      "Privilégiez des flacons opaques et vérifiez toujours la date de durabilité (DDM)."],
     [{"question": "Mes capsules deviennent un peu troubles au frigo, est-ce normal ?", "answer": "Oui, certaines graisses naturelles figent légèrement au froid sans altérer la qualité : elles redeviennent limpides à température ambiante."}]),
]

batch5 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B5_SPECS]
with open("scripts/batches/batch_05.json", "w", encoding="utf-8") as f:
    json.dump(batch5, f, ensure_ascii=False, indent=2)
print(f"Created batch_05.json ({len(batch5)} articles).")
