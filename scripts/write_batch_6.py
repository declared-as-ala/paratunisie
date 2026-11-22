# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 6: Remaining 4 Oméga 3 + first 6 Collagène
B6_SPECS = [
    ("sources-alimentaires-omega-3-poissons-graines", "Sources alimentaires d'Oméga 3 : poissons et graines",
     "Les meilleures sources alimentaires d'Oméga 3 en Tunisie : sardines, maquereaux, anchois, noix, graines de lin et ratio oméga-6 / oméga-3.",
     "Avant même d'ouvrir un flacon de gélules, la Méditerranée offre d'excellentes sources économiques d'Oméga 3. Voici comment optimiser votre assiette.",
     [("Les petits poissons gras méditerranéens : économiques et riches en EPA/DHA", [
         "En Tunisie, la sardine, le maquereau et l'anchois comptent parmi les poissons les plus accessibles et les plus concentrés en EPA et DHA : 100 g de sardines ou de maquereaux grillés apportent souvent entre **1,2 g et 2,2 g d'Oméga 3 marins**, soit l'équivalent de 4 à 7 capsules standard.",
         "De plus, comme ce sont de petits poissons en bas de la chaîne alimentaire à cycle de vie court, ils accumulent nettement moins de mercure que les grands prédateurs marins."
     ]),
      ("Sources végétales d'ALA et équilibre oméga-6 / oméga-3", [
          "Les noix, les graines de lin moulues, les graines de chia et l'huile de colza apportent de l'ALA. L'alimentation moderne étant souvent trop riche en oméga-6 (huiles de tournesol, maïs, fritures industrielles), réduire les fritures et cuisiner à l'huile d'olive vierge extra tout en mangeant du poisson gras 2 fois par semaine améliore déjà fortement l'équilibre lipidique."
      ]),
      ("Quand un complément d'Oméga 3 devient pertinent", [
          "Si vous mangez du poisson gras moins d'une fois par semaine ou n'aimez pas le poisson, une supplémentation ciblée de 500 à 1000 mg d'EPA+DHA par jour via notre rayon [Oméga 3](/omega-3) permet de maintenir un apport régulier (voir [EPA et DHA expliqués](/conseils/epa-et-dha-roles-complementaires-omega-3))."
      ])],
     ["2 portions de sardines ou maquereaux par semaine couvrent déjà une base solide d'EPA/DHA.",
      "Réduire les huiles riches en oméga-6 au profit de l'huile d'olive améliore le ratio lipidique.",
      "Les capsules d'Oméga 3 complètent utilement les semaines sans poisson gras."],
     [{"question": "Le thon en boîte contient-il autant d'Oméga 3 que la sardine ?", "answer": "Le thon blanc ou en conserve au naturel est plus maigre : la sardine et le maquereau restent nettement plus riches en EPA et DHA."}]),

    ("precautions-omega-3-anticoagulants-dosage", "Précautions avec les Oméga 3 : doses et traitements",
     "Limites de sécurité EFSA pour l'EPA et le DHA (5 g/j), précautions sous anticoagulants, chirurgie et troubles du rythme cardiaque.",
     "Les Oméga 3 sont globalement bien tolérés, mais certaines situations médicales et doses élevées demandent une vigilance particulière.",
     [("Ce que dit l'EFSA sur la dose maximale tolérable", [
         "L'Autorité européenne de sécurité des aliments (EFSA) indique qu'une supplémentation combinée en EPA et DHA allant jusqu'à **5 g par jour** chez l'adulte sain n'entraîne pas d'effets indésirables notables sur le saignement ou la glycémie. Pour un usage courant de bien-être, 250 mg à 1000 mg/j suffisent largement."
     ]),
      ("Interaction avec les anticoagulants et antiagrégants", [
          "À dose modérée ou élevée, les Oméga 3 possèdent un léger effet fluidifiant sur l'agrégation plaquettaire. Si vous prenez un traitement anticoagulant (AVK, AOD) ou antiagrégant plaquettaire (aspirine à dose cardiologique), ou si vous devez subir une intervention chirurgicale, demandez toujours l'avis de votre médecin avant d'entamer une cure dans le rayon [Oméga 3](/omega-3)."
      ]),
      ("Allergie au poisson et tolérance gastrique", [
          "Bien que les huiles hautement raffinées éliminent presque toutes les protéines allergisantes, par sécurité en cas d'allergie sévère aux poissons/crustacés, tournez-vous vers l'[huile d'algues](/conseils/huile-de-poisson-vs-huile-algues-omega-3). Prenez toujours vos capsules au cours du repas principal pour éviter les renvois."
      ])],
     ["L'EFSA fixe un seuil de sécurité général jusqu'à 5 g/jour combinés d'EPA+DHA chez l'adulte sain.",
      "Avis médical indispensable sous anticoagulants ou avant une chirurgie.",
      "Les personnes allergiques au poisson doivent privilégier l'huile de microalgues."],
     [{"question": "Les Oméga 3 font-ils prendre du poids ?", "answer": "Non : 2 capsules apportent environ 20 kcal, ce qui est négligeable dans la balance énergétique quotidienne."}]),

    ("verifier-etiquette-purete-metaux-lourds-omega-3", "Pureté des Oméga 3 : distillation et métaux lourds",
     "Comment s'assurer qu'une huile de poisson est purifiée des métaux lourds (mercure, plomb) et PCB : distillation moléculaire et petits poissons.",
     "La pollution marine inquiète souvent les acheteurs d'huile de poisson. Voici les procédés industriels qui garantissent la pureté d'un flacon.",
     [("Pourquoi la purification industrielle est indispensable", [
         "Les océans contiennent des traces de métaux lourds (mercure, arsenic, plomb) et de polluants organiques persistants (dioxines, PCB) qui peuvent se concentrer dans les tissus des poissons. Une huile brute non raffinée ne doit donc jamais être consommée sans étape de purification."
     ]),
      ("Distillation moléculaire et choix de petits poissons sauvages", [
          "Les fabricants sérieux disponibles dans notre sélection [Oméga 3](/omega-3) utilisent la **distillation moléculaire sous vide** (ou extraction au CO2 supercritique) qui sépare et élimine les contaminants tout en préservant les acides gras fragiles. Privilégiez aussi les huiles issues de petits poissons pélagiques sauvages (anchois, sardines, maquereaux) plutôt que de gros poissons prédateurs."
      ]),
      ("Labels qualité et transparence du fabricant", [
          "Des certifications indépendantes comme IFOS ou Friend of the Sea, ainsi que la conformité aux normes européennes strictes (règlement UE sur les contaminants), garantissent des taux de métaux lourds très inférieurs aux seuils détectables. Complétez ce contrôle avec notre guide [lire les quantités EPA et DHA](/conseils/lire-quantites-epa-dha-etiquette-omega-3)."
      ])],
     ["La distillation moléculaire élimine métaux lourds (mercure) et PCB de l'huile brute.",
      "Les huiles d'anchois et sardines de petite taille sont naturellement moins exposées aux polluants.",
      "Exigez des marques transparentes sur leur origine et leurs contrôles qualité."],
     [{"question": "L'huile de foie de morue est-elle identique à l'huile de poisson classique ?", "answer": "Non : l'huile de foie de morue est riche en vitamines A et D (attention au surdosage de vitamine A), alors que l'huile de chair de poisson apporte principalement EPA et DHA."}]),

    ("comparatif-formats-omega-3-cout-epa-dha", "Comparer les Oméga 3 : coût par gramme d'EPA + DHA",
     "Méthode chiffrée en Dinars Tunisiens pour comparer deux flacons d'Oméga 3 selon leur concentration réelle en EPA et DHA actifs.",
     "Un flacon à 45 DT n'est pas toujours moins cher qu'un flacon à 75 DT : tout dépend de la quantité totale d'EPA et DHA qu'il renferme.",
     [("Pourquoi le prix du flacon seul trompe les acheteurs", [
         "Prenons deux flacons du marché : le Flacon A coûte 45 DT pour 60 capsules dosées à 180 mg EPA + 120 mg DHA (300 mg actifs/capsule). Il contient au total **18 g d'EPA+DHA** (60 × 0,3 g), soit **2,500 DT par gramme d'EPA+DHA actif**.",
         "Le Flacon B coûte 75 DT pour 90 capsules concentrées à 330 mg EPA + 220 mg DHA (550 mg actifs/capsule). Il contient au total **49,5 g d'EPA+DHA** (90 × 0,55 g), soit **1,515 DT par gramme actif** — près de 40 % moins cher à dose efficace !"
     ]),
      ("La formule en 3 étapes avant d'ajouter au panier", [
          "1. Additionnez EPA + DHA d'une seule capsule (en g). 2. Multipliez par le nombre total de capsules du flacon. 3. Divisez le prix en TND par ce total en grammes. Appliquez cette méthode dans notre rayon [Oméga 3](/omega-3) et vérifiez aussi la fraîcheur dans [indice TOTOX et fraîcheur](/conseils/qualite-fraicheur-indice-totox-omega-3)."
      ])],
     ["Calculez toujours : Prix en TND / (Nombre de capsules × (EPA+DHA par capsule en g)).",
      "Les formules concentrées à 50–70 % reviennent souvent moins cher par gramme actif que les formules à 30 %.",
      "Réduisez aussi le nombre de capsules à avaler chaque jour."],
     [{"question": "Vaut-il mieux prendre 1 capsule concentrée ou 2 capsules standard ?", "answer": "À quantité totale d'EPA+DHA égale, l'effet est similaire ; la capsule concentrée offre simplement plus de confort de prise."}]),

    # ── COLLAGÈNE (6) ──
    ("collagene-marin-vs-bovin-origine-differences", "Collagène marin vs bovin : origine et différences",
     "Comparaison entre collagène marin (poisson) et collagène bovin : types de collagène (I, II, III), assimilation, allergènes et coût en Tunisie.",
     "Collagène marin ou bovin : au-delà de l'origine animale, quelles sont les différences réelles en peptides, tolérance et budget ?",
     [("Origine biologique et types de collagène majoritaires", [
         "Le **collagène marin** est extrait de la peau, des arêtes et des écailles de poissons. Il est composé très majoritairement de **collagène de type I**, celui que l'on retrouve abondamment dans le derme cutané, les tendons et les os.",
         "Le **collagène bovin** provient du derme ou des os de bovins. Il apporte un mélange naturel de **types I et III** (peau, tissus conjonctifs, vaisseaux) ou, selon les extraits cartilagineux spécifiques, du type II."
     ]),
      ("Assimilation : la taille des peptides compte plus que l'animal", [
          "On lit parfois que le collagène marin serait automatiquement mieux absorbé que le bovin. En réalité, la vitesse et l'efficacité de digestion dépendent surtout du **degré d'hydrolyse** (poids moléculaire en Daltons). Un [collagène hydrolysé](/conseils/collagene-hydrolyse-peptides-explication) bovin à 2000 Daltons s'assimile tout aussi bien qu'un collagène marin à 2000 Daltons."
      ]),
      ("Allergènes, goût, préférences alimentaires et prix", [
          "Le collagène marin est contre-indiqué en cas d'allergie au poisson, tandis que le collagène bovin convient aux personnes ne consommant pas de poisson mais exclut les régimes pesco-végétariens. Côté budget dans notre rayon [Collagène](/collagene), le collagène bovin en poudre reste souvent un peu plus économique aux 10 g de peptides que le marin."
      ])],
     ["Marin : principalement type I (issu de poisson) ; Bovin : types I et III.",
      "L'absorption dépend du poids moléculaire (hydrolyse en Daltons), pas uniquement de l'espèce.",
      "Vérifiez les allergènes marins et la certification d'origine avant achat."],
     [{"question": "Existe-t-il du collagène 100 % végétal ou vegan ?", "answer": "Non : le collagène est une protéine exclusivement animale. Les produits dits « boosters de collagène vegan » apportent des acides aminés libres et de la vitamine C pour soutenir la synthèse interne."}]),

    ("collagene-hydrolyse-peptides-explication", "Collagène hydrolysé et peptides : poids moléculaire",
     "Que signifie collagène hydrolysé en peptides et pourquoi le poids moléculaire (2000–5000 Daltons) influence la solubilité et la digestion ?",
     "Le collagène natif est une énorme molécule gélatineuse difficile à dissoudre. L'hydrolyse enzymatique le transforme en peptides digestes. Explications.",
     [("Du collagène natif aux peptides hydrolysés", [
         "À l'état brut (comme dans le bouillon d'os refroidi ou la gélatine alimentaire), le collagène forme une longue triple hélice d'environ 300 000 Daltons qui gélifie dans l'eau froide.",
         "Pour le transformer en complément facile à boire, les fabricants appliquent une **hydrolyse enzymatique** contrôlée : des enzymes découpent ces longues chaînes en petits fragments appelés **peptides de collagène** (ou hydrolysat de collagène), dont la taille moyenne descend autour de **2000 à 5000 Daltons**."
     ]),
      ("Pourquoi 2000 à 5000 Daltons changent tout à l'usage", [
          "À cette taille réduite, la poudre devient instantanément soluble même dans l'eau froide, un café ou un yaourt, sans former de gelée. Sur le plan digestif, ces peptides sont rapidement scindés en dipeptides (comme la prolyl-hydroxyproline) et tripeptides capables de traverser la paroi intestinale."
      ]),
      ("Comment repérer un bon hydrolysat dans le rayon Collagène ?", [
          "Recherchez les mentions « peptides de collagène hydrolysé » sur nos fiches [Collagène](/collagene). Pour connaître les quantités étudiées selon l'objectif, poursuivez avec [peptides de collagène : dosage et utilisation](/conseils/peptides-de-collagene-utilisation-dosage)."
      ])],
     ["L'hydrolyse enzymatique réduit le poids moléculaire de ~300 000 Da à 2000–5000 Da.",
      "Les peptides hydrolysés se dissolvent à froid sans gélifier.",
      "La mention « peptides de collagène » garantit ce format pré-découpé."],
     [{"question": "Gélatine alimentaire et collagène hydrolysé sont-ils identiques ?", "answer": "Ils ont le même profil d'acides aminés, mais la gélatine n'est que partiellement hydrolysée et gélifie à froid, alors que les peptides restent liquides."}]),

    ("peptides-de-collagene-utilisation-dosage", "Peptides de collagène : utilisation et dosage",
     "À quel dosage prendre les peptides de collagène (2,5 g à 10 g/j) ? Moment de prise, dilution dans le café ou l'eau et durée de cure.",
     "Entre 2,5 g pour la peau et 10 g dans certaines études articulaires, voici comment doser et intégrer facilement les peptides de collagène.",
     [("Quelles fourchettes de dosage retrouve-t-on dans les essais cliniques ?", [
         "Dans les études publiées sur l'adulte : les protocoles ciblant l'hydratation et l'élasticité cutanée utilisent généralement **2,5 g à 5 g par jour** sur 8 à 12 semaines. Les protocoles orientés vers le confort articulaire ou les tissus tendineux chez les sportifs utilisent plutôt **5 g à 10 g par jour** (et jusqu'à 15 g dans quelques études récentes associées à de la vitamine C avant l'effort)."
     ]),
      ("Comment les prendre sans contrainte au quotidien ?", [
          "Les peptides de [collagène hydrolysé](/conseils/collagene-hydrolyse-peptides-explication) nature sont presque sans goût. Vous pouvez les mélanger dans un grand verre d'eau, un café tiède ou chaud (les peptides hydrolysés supportent bien la chaleur modérée d'une boisson), un smoothie ou un yaourt nature."
      ]),
      ("Faut-il le prendre à jeun ou le soir ?", [
          "Aucune donnée solide n'impose un horaire strict à jeun. La régularité quotidienne pendant au moins 8 semaines compte nettement plus que l'heure exacte. Pour les sportifs, prendre 10 g avec une source de vitamine C 45 à 60 minutes avant une séance de rééducation tendineuse est parfois utilisé dans la littérature."
      ])],
     ["Fourchettes étudiées : 2,5–5 g/j (peau) à 5–10 g/j (confort articulaire et sport).",
      "La régularité sur 8 à 12 semaines est nécessaire pour évaluer une cure.",
      "Les peptides se dissolvent facilement dans l'eau, le yaourt ou le café."],
     [{"question": "Le collagène remplace-t-il ma whey protéine après le sport ?", "answer": "Non ! Le collagène est très pauvre en tryptophane et en leucine : il ne stimule pas la prise de masse musculaire comme la whey."}]),

    ("types-de-collagene-1-2-3-differences", "Types de collagène I, II et III : différences",
     "À quoi correspondent les types I, II et III sur les pots de collagène ? Localisation anatomique, collagène hydrolysé vs UC-II non dénaturé.",
     "On dénombre près de 28 types de collagène dans le corps humain, mais trois dominent les compléments alimentaires. Voici comment les distinguer.",
     [("Type I : peau, tendons, ligaments et os", [
         "Le collagène de type I représente environ 90 % du collagène total du corps humain. C'est la charpente principale du derme cutané, des tendons, des ligaments et de la matrice osseuse. Le [collagène marin](/conseils/collagene-marin-vs-bovin-origine-differences) est presque exclusivement de type I."
     ]),
      ("Type III : tissus souples et synergie avec le type I", [
          "Le type III accompagne souvent le type I dans la peau, les muscles et les parois des vaisseaux sanguins. Les hydrolysats bovins apportent naturellement une combinaison de types I et III."
      ]),
      ("Type II : spécifique au cartilage articulaire (hydrolysé vs UC-II)", [
          "Le type II est le composant majeur du cartilage hyalin qui recouvre nos articulations. Attention à deux formes très différentes dans le rayon [Collagène](/collagene) : le collagène de type II hydrolysé (pris à 2–10 g/j comme apport d'acides aminés) et le collagène de type II non dénaturé (UC-II), dosé à seulement **40 mg par jour** et étudié pour des mécanismes immunitaires spécifiques au niveau articulaire."
      ])],
     ["Type I & III : peau, os et tendons (peptides marins ou bovins à 2,5–10 g/j).",
      "Type II : cartilage articulaire.",
      "Distinguez les peptides de type II (grammes) du collagène non dénaturé UC-II (40 mg/j)."],
     [{"question": "Un collagène « multi-types » (I, II, III, V, X) est-il forcément supérieur ?", "answer": "Pas nécessairement : l'essentiel reste le grammage total en peptides hydrolysés (5 à 10 g) plutôt qu'une longue liste de types en micro-quantités."}]),

    ("collagene-etudes-scientifiques-ce-quelles-montrent", "Collagène : ce que montrent les études cliniques",
     "Synthèse prudente des méta-analyses PubMed sur les peptides de collagène : élasticité de la peau, hydratation et confort articulaire chez l'adulte.",
     "Au-delà des promesses esthétiques excessives, que montrent réellement les essais cliniques contrôlés publiés sur le collagène ?",
     [("Données sur l'hydratation et l'élasticité cutanée", [
         "Plusieurs revues systématiques et méta-analyses (dont de Miranda et al., *International Journal of Dermatology*, PubMed) ont compilé des essais randomisés contre placebo durant 8 à 12 semaines avec 2,5 à 10 g/j de peptides de collagène. Elles rapportent globalement une amélioration statistiquement mesurable de l'hydratation de la couche cornée et de l'élasticité cutanée par rapport au placebo."
     ]),
      ("Données sur le confort articulaire chez le sportif et l'adulte", [
          "Dans le domaine articulaire, certains essais (notamment chez des sportifs souffrant de gêne mécanique du genou ou dans l'arthrose légère) suggèrent une réduction modeste des scores de gêne à l'effort après 12 à 24 semaines de prise de 5 à 10 g d'hydrolysat ou de 40 mg d'UC-II."
      ]),
      ("Garder des attentes mesurées et réalistes", [
          "Ces effets restent progressifs et modestes, et s'inscrivent en appui d'une bonne hygiène de vie (protection solaire UV, hydratation, protéines suffisantes, renforcement musculaire). Pour comprendre les réserves méthodologiques de l'EFSA, consultez [limites des preuves scientifiques du collagène](/conseils/limites-preuves-scientifiques-collagene) et parcourez [Collagène](/collagene)."
      ])],
     ["Des essais de 8–12 semaines rapportent une hausse modeste de l'hydratation et élasticité cutanée.",
      "Certaines études montrent un soutien modéré du confort articulaire à l'effort.",
      "Le collagène ne remplace ni la protection solaire ni un traitement médical articulaire."],
     [{"question": "Au bout de combien de temps observe-t-on les résultats dans les études ?", "answer": "Les mesures instrumentales dans les essais cliniques sont généralement effectuées après 8 à 12 semaines de prise quotidienne."}]),

    ("limites-preuves-scientifiques-collagene", "Collagène : limites des études et marketing",
     "Pourquoi l'EFSA reste prudente sur les allégations du collagène : digestion en acides aminés, biais de financement et attentes réalistes.",
     "Entre engouement sur les réseaux sociaux et prudence réglementaire de l'EFSA, voici pourquoi il faut garder un regard critique sur le collagène.",
     [("1. Que devient le collagène pendant la digestion ?", [
         "Une question scientifique légitime se pose : une fois avalés, les peptides de collagène sont en grande partie découpés en acides aminés (glycine, proline, hydroxyproline) comme n'importe quelle protéine alimentaire. Bien que certains dipeptides spécifiques passent intacts dans la circulation, le corps ne dirige pas exclusivement chaque gramme ingéré vers la peau du visage ou le genou."
     ]),
      ("2. Conflits d'intérêts et taille des essais", [
          "Une part non négligeable des études cliniques positives sur des marques brevetées de peptides de collagène a été financée par les fabricants d'ingrédients eux-mêmes, sur des effectifs parfois modestes (40 à 100 volontaires). Plus d'essais indépendants à grande échelle restent souhaitables."
      ]),
      ("3. Pourquoi l'EFSA encadre strictement les allégations", [
          "À ce jour, l'Autorité européenne de sécurité des aliments (EFSA) n'a pas validé d'allégation de santé spécifique affirmant que le collagène oral « rajeunit la peau » ou « régénère le cartilage ». En revanche, la vitamine C ajoutée dans de nombreuses formules de notre rayon [Collagène](/collagene) possède, elle, une allégation validée pour sa contribution à la formation normale du collagène !"
      ])],
     ["Beaucoup d'études positives restent de taille modeste ou financées par l'industrie.",
      "L'EFSA n'autorise pas d'allégations anti-âge ou de réparation du cartilage pour le collagène seul.",
      "La vitamine C associée contribue officiellement à la formation normale de collagène."],
     [{"question": "Faut-il tout de même acheter du collagène malgré ces limites ?", "answer": "Si votre apport global en protéines est déjà bon, le collagène reste une option sûre et bien tolérée à tester sur 8–12 semaines, sans attendre de miracles."}]),
]

batch6 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B6_SPECS]
with open("scripts/batches/batch_06.json", "w", encoding="utf-8") as f:
    json.dump(batch6, f, ensure_ascii=False, indent=2)
print(f"Created batch_06.json ({len(batch6)} articles).")
