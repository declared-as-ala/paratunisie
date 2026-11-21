# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 4: 4 Ashwagandha + 6 Magnésium
B4_SPECS = [
    ("ashwagandha-interactions-medicamenteuses", "Ashwagandha et interactions médicamenteuses",
     "Avec quels traitements médicamenteux l'ashwagandha peut-elle interférer ? Thyroïde, sédatifs, hypoglycémiants, tension et immunosuppresseurs.",
     "Avant d'associer l'ashwagandha à un traitement médical, vérifiez ces 5 familles d'interactions médicamenteuses documentées.",
     [("1. Traitements de la thyroïde (lévothyroxine)", [
         "Des études cliniques et rapports de cas montrent que l'ashwagandha peut stimuler la production d'hormones thyroïdiennes (T3, T4). Chez une personne traitée pour hypothyroïdie (ou présentant une hyperthyroïdie), l'ajout d'un extrait de [ashwagandha](/ashwagandha) sans suivi médical risque de déséquilibrer le dosage hormonal."
     ]),
      ("2. Médicaments sédatifs, anxiolytiques et somnifères", [
          "Comme l'ashwagandha peut exercer un léger effet calmant sur le système nerveux central, son association avec des benzodiazépines, des somnifères ou d'autres plantes sédatives peut potentialiser la somnolence diurne ou réduire la vigilance au volant."
      ]),
      ("3. Immunosuppresseurs et maladies auto-immunes", [
          "L'ashwagandha est décrite dans les monographies du NIH (NCCIH) comme pouvant stimuler l'activité immunitaire. Elle est donc déconseillée en cas de prise de médicaments immunosuppresseurs (après greffe, ou dans le cadre d'une maladie auto-immune comme la polyarthrite rhumatoïde, le lupus ou la sclérose en plaques)."
      ]),
      ("4. Traitements du diabète et de l'hypertension", [
          "L'ashwagandha pouvant légèrement abaisser la glycémie et la pression artérielle chez certains individus, une surveillance accrue est recommandée sous antidiabétiques ou antihypertenseurs pour éviter une baisse excessive."
      ]),
      ("Que faire si vous prenez un traitement ?", [
          "Montrez la liste exacte des ingrédients de votre flacon à votre médecin ou pharmacien avant de commencer. Pour connaître les autres situations à risque, lisez [ashwagandha : grossesse et contre-indications](/conseils/ashwagandha-grossesse-allaitement-contre-indications)."
      ])],
     ["L'ashwagandha peut modifier les taux d'hormones thyroïdiennes (prudence sous lévothyroxine).",
      "Évitez l'association avec des immunosuppresseurs ou des sédatifs sans avis médical.",
      "Surveillez glycémie et tension en cas de traitement antidiabétique ou antihypertenseur."],
     [{"question": "Puis-je prendre de l'ashwagandha si j'ai une hypothyroïdie traitée ?", "answer": "Uniquement après accord de votre endocrinologue ou médecin traitant, car un ajustement ou un contrôle de TSH peut être nécessaire."}]),

    ("ashwagandha-grossesse-allaitement-contre-indications", "Ashwagandha : grossesse et contre-indications",
     "Dans quels cas l'ashwagandha est-elle contre-indiquée ? Grossesse, allaitement, chirurgie programmée, troubles thyroïdiens et maladies auto-immunes.",
     "Par mesure de sécurité, l'ashwagandha est formellement déconseillée dans plusieurs situations physiologiques et médicales précises.",
     [("Grossesse et allaitement : précaution absolue", [
         "Les autorités de santé (NIH NCCIH, agences européennes de sécurité sanitaire) déconseillent formellement l'usage de l'ashwagandha pendant la grossesse. Certaines données historiques et précliniques suggèrent qu'à forte dose, des extraits pourraient stimuler les contractions utérines.",
         "Pendant l'allaitement, par manque de données fiables sur le passage des withanolides dans le lait maternel, il convient également de s'abstenir et de privilégier des mesures d'hygiène de vie ou l'avis d'un professionnel de santé."
     ]),
      ("Chirurgie programmée (arrêt 15 jours avant)", [
          "En raison de son effet potentiel sur le système nerveux central (anesthésie), la glycémie et la tension, il est recommandé d'arrêter tout complément d'[ashwagandha](/ashwagandha) au moins deux semaines avant une intervention chirurgicale programmée."
      ]),
      ("Troubles hépatiques, thyroïdiens et auto-immuns", [
          "Comme rappelé dans notre guide sur la [sécurité de l'ashwagandha](/conseils/ashwagandha-effets-secondaires-securite), les personnes souffrant d'une maladie du foie, d'hyperthyroïdie ou d'une maladie auto-immune active doivent éviter cette plante sans encadrement médical."
      ]),
      ("Âge et population pédiatrique", [
          "Ces extraits concentrés sont formulés pour l'adulte. Ils ne sont pas destinés aux enfants ni aux adolescents sans avis pédiatrique spécifique."
      ])],
     ["Contre-indiquée pendant toute la grossesse et l'allaitement.",
      "Interrompez la prise au moins 15 jours avant toute anesthésie ou chirurgie.",
      "Déconseillée en cas d'hyperthyroïdie, de maladie auto-immune ou d'antécédent hépatique."],
     [{"question": "Une femme qui allaite peut-elle prendre une demi-dose d'ashwagandha ?", "answer": "Non, par principe de précaution en l'absence d'études cliniques chez la femme allaitante, il est préférable de s'en abstenir."}]),

    ("ashwagandha-poudre-ou-gelules-comparatif", "Ashwagandha en poudre ou en gélules : que choisir ?",
     "Comparaison pratique entre poudre de racine d'ashwagandha et gélules standardisées : goût, précision du dosage en withanolides et prix.",
     "La poudre brute séduit les adeptes du naturel, mais les gélules standardisées garantissent un dosage précis et sans amertume. Comparons les deux.",
     [("Le problème du goût et de la solubilité de la poudre", [
         "Le nom sanskrit « Ashwagandha » signifie littéralement « odeur de cheval », en référence à l'odeur terreuse et très amère de la racine fraîche. En poudre brute mélangée dans de l'eau ou du lait chaud, le goût reste particulièrement prononcé et peu apprécié au quotidien.",
         "Les gélules du rayon [Ashwagandha](/ashwagandha) contournent complètement ce problème : aucune odeur, aucun goût, et une prise en 5 secondes avec un verre d'eau."
     ]),
      ("Précision du dosage en withanolides", [
          "Une poudre de racine non standardisée voit sa teneur en [withanolides](/conseils/withanolides-ashwagandha-comprendre-titrage) varier fortement d'une récolte à l'autre. Avec une demi-cuillère à café approximative, il est difficile de savoir combien d'actifs vous consommez chaque jour. À l'inverse, une gélule d'extrait standardisé (ex. 300 ou 500 mg à 5 %) garantit un apport exact à chaque prise."
      ]),
      ("Conservation sous climat chaud et humide", [
          "Un sachet de poudre ouvert chaque matin absorbe rapidement l'humidité de l'air, favorisant les grumeaux et la perte d'arôme. Un flacon de gélules bien fermé protège nettement mieux la stabilité du produit durant l'été tunisien."
      ]),
      ("Quand la poudre garde un intérêt", [
          "La poudre bio reste intéressante uniquement si vous préparez des boissons chaudes épicées (lait végétal, cannelle, cardamome) qui masquent l'amertume et que vous recherchez un usage traditionnel culinaire."
      ])],
     ["Les gélules masquent totalement le goût amer et terreux de la racine.",
      "Les gélules d'extrait standardisé assurent un dosage exact en withanolides contrairement à la poudre brute.",
      "Les gélules se conservent mieux à l'abri de l'humidité."],
     [{"question": "Peut-on ouvrir une gélule d'ashwagandha dans un yaourt ?", "answer": "Oui, mais vous sentirez l'amertume naturelle de l'extrait ; avaler la gélule entière avec de l'eau reste plus agréable."}]),

    ("evaluer-qualite-ashwagandha-criteres-achat", "Évaluer la qualité d'une ashwagandha : 5 critères",
     "Grille d'achat objective pour choisir un complément d'ashwagandha fiable en Tunisie : extrait de racine, titrage, traçabilité et prix par jour.",
     "Entre extraits bon marché non titrés et formules standardisées, voici la méthode simple pour reconnaître une ashwagandha de qualité.",
     [("Critère 1 : Racine pure et nom botanique vérifié", [
         "Vérifiez la mention *Withania somnifera* et la partie « racine ». Évitez les produits flous qui ne précisent pas si l'extrait provient de racines ou de feuilles."
     ]),
      ("Critère 2 : Standardisation claire en withanolides", [
          "Un produit fiable affiche son pourcentage de withanolides (généralement 1,5 % à 5 % pour les extraits de racine, ou 10 % pour Sensoril). Consultez [extraits KSM-66, Sensoril et standard](/conseils/ashwagandha-ksm-66-vs-sensoril-vs-standard) pour comparer."
      ]),
      ("Critère 3 : Dose journalière utile dans 1 à 2 gélules", [
          "Vérifiez que la portion quotidienne recommandée délivre 300 à 600 mg d'extrait standardisé (soit 15 à 30 mg de withanolides). Si vous devez prendre 4 gélules pour atteindre 300 mg, le flacon se videra très vite."
      ]),
      ("Critère 4 : Fabricant reconnu et scellé intact", [
          "Privilégiez des marques internationales contrôlées disponibles dans notre rayon [Ashwagandha](/ashwagandha) avec numéro de lot, DDM lisible et certifications de bonnes pratiques de fabrication (GMP)."
      ]),
      ("Critère 5 : Coût réel par mois de cure en TND", [
          "Divisez le prix du flacon par le nombre de jours de cure réelle (ex. 60 gélules à 1/jour = 60 jours). Un flacon à 85–95 DT durant 2 mois revient à environ 1,500 DT par jour."
      ])],
     ["Exigez la mention racine (Withania somnifera) et un % de withanolides affiché.",
      "Vérifiez combien de gélules composent la dose journalière de 300–600 mg.",
      "Calculez le coût par jour de cure en Dinars Tunisiens."],
     [{"question": "Une ashwagandha plus chère est-elle toujours plus forte ?", "answer": "Pas nécessairement : comparez les mg de withanolides par jour et la durée totale du flacon pour juger le vrai rapport qualité/prix."}]),

    # ── MAGNÉSIUM (6) ──
    ("formes-de-magnesium-absorption-tolerance", "Formes de magnésium : absorption et tolérance",
     "Sels inorganiques (oxyde, chlorure), sels organiques (citrate, malate) et chélatés (bisglycinate) : comprendre la biodisponibilité du magnésium.",
     "Toutes les formes de magnésium ne se valent ni sur l'absorption intestinale ni sur le confort digestif. Comprendre ces trois familles simplifie le choix.",
     [("Pourquoi le magnésium est toujours lié à une autre molécule", [
         "À l'état pur, le magnésium est un métal réactif : dans un complément alimentaire, il est donc toujours associé (« lié ») à un autre composé (un sel minéral, un acide organique ou un acide aminé). Ce partenaire détermine sa solubilité dans l'intestin, son taux d'absorption et son effet sur le transit."
     ]),
      ("Famille 1 : Sels inorganiques (oxyde, hydroxyde, carbonate, chlorure)", [
          "L'oxyde et l'hydroxyde de magnésium (souvent présents dans le magnésium marin classique) sont très riches en magnésium élémentaire en poids (~60 %), mais leur solubilité dans l'eau est faible. Une grande partie reste dans le tube digestif, ce qui attire l'eau dans l'intestin et peut provoquer un effet laxatif à dose modérée."
      ]),
      ("Famille 2 : Sels organiques (citrate, malate, lactate, pidolate)", [
          "Le citrate et le malate de magnésium sont nettement plus solubles et mieux absorbés que l'oxyde. Le citrate offre un excellent compromis prix/efficacité, avec un léger effet stimulant sur le transit utile chez les personnes sujettes à la constipation passagère."
      ]),
      ("Famille 3 : Formes chélatées aux acides aminés (bisglycinate)", [
          "Le bisglycinate lie chaque ion de magnésium à deux molécules de glycine. Cette structure neutre utilise les transporteurs d'acides aminés, traverse très bien la barrière intestinale et n'irrite pratiquement pas l'intestin. Pour comparer précisément ces deux vedettes de notre rayon [Magnésium](/magnesium), lisez [magnésium bisglycinate vs citrate](/conseils/magnesium-bisglycinate-vs-citrate-comparatif)."
      ])],
     ["L'oxyde est riche sur le papier mais peu soluble et souvent laxatif.",
      "Le citrate et le malate sont bien absorbés et polyvalents.",
      "Le bisglycinate offre la meilleure tolérance digestive sans effet laxatif."],
     [{"question": "Le chlorure de magnésium en sachet est-il une bonne option ?", "answer": "Il est bien soluble, mais son goût très amer et son effet laxatif fréquent le rendent peu confortable pour une cure de plusieurs semaines."}]),

    ("magnesium-bisglycinate-vs-citrate-comparatif", "Magnésium bisglycinate vs citrate : lequel choisir ?",
     "Comparatif détaillé entre magnésium bisglycinate et citrate : biodisponibilité, tolérance digestive, prise matin ou soir et rapport qualité/prix.",
     "Bisglycinate et citrate sont les deux formes les plus recommandées de magnésium. Voici comment choisir exactement celle qui convient à votre profil.",
     [("Points communs : deux formes organiques bien assimilées", [
         "Contrairement à l'oxyde ou au sulfate, le bisglycinate et le citrate bénéficient tous deux d'une bonne biodisponibilité dans les études humaines. Aucun des deux n'est « mauvais » : la différence se joue sur la tolérance intestinale, l'apport en magnésium élémentaire par gélule et l'objectif du moment."
     ]),
      ("Magnésium bisglycinate : le champion de la douceur digestive", [
          "Lié à deux molécules de glycine (un acide aminé apaisant), le bisglycinate ne provoque pratiquement jamais de selles molles ni de crampes abdominales, même à 250–300 mg par jour. Il est particulièrement adapté le soir chez les personnes stressées, les sportifs ou les intestins sensibles. Seul bémol : la molécule est volumineuse, il faut donc souvent 2 à 3 gélules pour obtenir 200–300 mg de [magnésium élémentaire](/conseils/magnesium-elementaire-vs-poids-compose)."
      ]),
      ("Magnésium citrate : polyvalent et économique", [
          "Le citrate de magnésium contient un peu plus de magnésium élémentaire (~16 % contre ~10–14 % pour le bisglycinate) et coûte souvent un peu moins cher au gramme. Il se prête bien à une prise en poudre ou comprimés en journée. Chez certaines personnes sensibles, au-delà de 250 mg en une prise, il peut accélérer légèrement le transit."
      ]),
      ("Quel choix faire dans notre rayon Magnésium ?", [
          "Choisissez le **bisglycinate** si vous avez un intestin sensible ou prenez votre magnésium le soir pour la détente. Choisissez le **citrate** (ou malate) si vous cherchez le meilleur budget pour une cure quotidienne ou si vous avez un transit plutôt lent. Explorez nos références vérifiées dans [Magnésium](/magnesium)."
      ])],
     ["Bisglycinate : tolérance digestive optimale, zéro effet laxatif, idéal le soir.",
      "Citrate : très bonne absorption, légèrement plus concentré et économique, stimule doucement le transit.",
      "Comparez toujours les mg de magnésium élémentaire, pas le poids total du sel."],
     [{"question": "Peut-on alterner citrate le matin et bisglycinate le soir ?", "answer": "Oui, certaines formules associent d'ailleurs plusieurs sels complémentaires (citrate + bisglycinate + malate) pour cumuler les avantages."}]),

    ("magnesium-elementaire-vs-poids-compose", "Magnésium élémentaire vs poids du composé : lire les mg",
     "Pourquoi 1000 mg de bisglycinate de magnésium n'apportent pas 1000 mg de magnésium pur : apprendre à calculer le magnésium élémentaire.",
     "C'est l'astuce d'étiquette la plus importante pour acheter du magnésium : distinguer le poids total du sel et la quantité de magnésium élémentaire.",
     [("Le piège des « 1000 mg de magnésium » sur la face avant", [
         "Lorsque vous voyez un flacon afficher fièrement « 1000 mg de Magnésium Bisglycinate », votre corps ne reçoit pas 1000 mg de magnésium ! Le bisglycinate, le citrate ou le malate sont des molécules composées : le magnésium pur (dit « élémentaire ») n'en représente qu'une fraction.",
         "Concrètement : le bisglycinate pur contient environ **10 à 14 %** de magnésium élémentaire ; le citrate anhydre environ **15 à 16 %** ; le malate environ **15 %** ; et l'oxyde environ **60 %** (mais très peu absorbé)."
     ]),
      ("Exemple chiffré : combien de magnésium réel dans 1000 mg ?", [
          "1000 mg de poudre de bisglycinate de magnésium pur délivrent en réalité entre **100 mg et 140 mg de magnésium élémentaire**. Si l'étiquette au dos respecte la réglementation, elle doit indiquer par exemple : « Magnésium (issu de 2000 mg de bisglycinate) : 250 mg — 67 % VNR »."
      ]),
      ("Comment vérifier en 10 secondes sur une fiche produit", [
          "Regardez la colonne « % VNR » (Valeurs Nutritionnelles de Référence, fixée à 375 mg pour un adulte). Si 1 gélule affiche 100 mg de magnésium soit 27 % VNR, il s'agit bien de magnésium élémentaire. Si l'étiquette ne donne ni les % VNR ni la mention « dont magnésium élémentaire », méfiez-vous. Comparez des fiches transparentes dans notre rayon [Magnésium](/magnesium)."
      ])],
     ["Le bisglycinate contient ~10–14 % de magnésium élémentaire ; le citrate ~16 %.",
      "Vérifiez toujours le % VNR (375 mg = 100 % VNR) au dos du flacon.",
      "Ne confondez jamais le poids du sel chélaté avec la dose de magnésium pur."],
     [{"question": "Pourquoi les gélules de bisglycinate sont-elles souvent dosées à seulement 100 mg par gélule ?", "answer": "Parce que 100 mg de magnésium élémentaire sous forme bisglycinate pèsent déjà environ 750 à 900 mg : c'est la limite physique d'une gélule standard !"}]),

    ("sources-alimentaires-de-magnesium-menus", "Sources alimentaires de magnésium : aliments clés",
     "Les aliments les plus riches en magnésium faciles à intégrer en Tunisie : amandes, graines de courge, épinards, pois chiches, chocolat noir.",
     "Avant de compter uniquement sur les gélules, voici les aliments du quotidien les plus riches en magnésium et leurs teneurs réelles par portion.",
     [("Combien de magnésium viser chaque jour par l'alimentation ?", [
         "L'EFSA fixe l'apport adéquat (AI) en magnésium à **350 mg par jour pour l'homme adulte** et **300 mg par jour pour la femme adulte**. Une alimentation moderne riche en produits raffinés (pain blanc, pâtisseries, sodas) laisse souvent un déficit de 80 à 150 mg par jour, accentué chez les sportifs par la transpiration."
     ]),
      ("Top des aliments riches en magnésium accessibles en Tunisie", [
          "1. **Graines de courge (pépites décortiquées)** : ~150 mg pour 30 g. 2. **Amandes et noix de cajou** : ~80 mg pour une poignée de 30 g. 3. **Épinards cuits (ou blettes)** : ~75–85 mg pour 100 g. 4. **Chocolat noir ≥ 70 %** : ~60 mg pour 30 g (2-3 carrés). 5. **Pois chiches, lentilles et haricots blancs** : ~70–90 mg par assiette cuite (200 g). 6. **Flocons d'avoine et pain complet** : ~55 mg pour 50 g."
      ]),
      ("Comment structurer une journée riche en magnésium", [
          "Un petit-déjeuner avec 50 g d'avoine et une poignée d'amandes (~135 mg), un déjeuner avec légumineuses ou légumes verts (~90 mg) et une collation de 2 carrés de chocolat noir + quelques graines (~90 mg) atteignent déjà plus de 300 mg !"
      ]),
      ("Quand un complément devient utile en renfort", [
          "En période d'entraînements intenses, de chaleur estivale, de fatigue passagère ou lorsque l'alimentation reste irrégulière, une dose modérée de 150 à 250 mg par jour via notre sélection [Magnésium](/magnesium) vient combler efficacement l'écart (voir [rôles physiologiques du magnésium](/conseils/magnesium-fonctions-physiologiques-normales))."
      ])],
     ["Objectif quotidien EFSA : 300 mg (femme) à 350 mg (homme).",
      "Graines de courge, amandes, légumineuses, légumes verts et chocolat noir >70 % sont les meilleures sources.",
      "Un complément de 150–250 mg/j complète l'alimentation sans remplacer les aliments complets."],
     [{"question": "Les eaux minérales tunisiennes apportent-elles du magnésium ?", "answer": "Oui, certaines eaux minérales contiennent 20 à 50 mg de magnésium par litre : regardez l'étiquette « Mg2+ » sur votre bouteille."}]),

    ("magnesium-fonctions-physiologiques-normales", "Rôles du magnésium : muscles, nerfs et métabolisme",
     "Découvrez les fonctions physiologiques officielles du magnésium validées par l'EFSA et le NIH : énergie ATP, contraction musculaire et système nerveux.",
     "Impliqué dans plus de 300 réactions enzymatiques, le magnésium soutient de nombreuses fonctions vitales reconnues scientifiquement. Tour d'horizon factuel.",
     [("Un cofacteur indispensable à plus de 300 enzymes", [
         "Dans nos cellules, l'énergie circule sous forme d'ATP (adénosine triphosphate). Or l'ATP n'est biologiquement actif que lorsqu'il est lié à un ion magnésium (Mg-ATP). Sans magnésium suffisant, la production énergétique cellulaire et l'utilisation du glucose deviennent moins efficaces."
     ]),
      ("Les allégations officielles validées par l'EFSA", [
          "L'Autorité européenne de sécurité des aliments (EFSA) reconnaît officiellement que le magnésium contribue : à **réduire la fatigue**, au **fonctionnement normal du système nerveux**, à une **fonction musculaire normale**, à la **synthèse protéique normale**, à l'**équilibre électrolytique** et au maintien d'une **ossature et dentition normales**."
      ]),
      ("Pourquoi les sportifs y sont particulièrement attentifs", [
          "Entre la contraction et la relaxation musculaire, les influx nerveux répétés et les pertes sudorales lors d'entraînements sous la chaleur, les sportifs sollicitent fortement leur pool de magnésium. Un apport optimal soutient le confort musculaire (prévention des tensions après l'effort) et la récupération générale."
      ]),
      ("Rester réaliste sur ce que le magnésium ne fait pas", [
          "Un complément de [magnésium](/magnesium) corrige un apport insuffisant et soutient les fonctions physiologiques normales, mais il ne « guérit » pas un trouble médical ni une fatigue liée à une anémie ou à une apnée du sommeil. Consultez nos repères de sécurité dans [magnésium : limite et excès](/conseils/magnesium-exces-effets-secondaires-securite)."
      ])],
     ["Le magnésium active l'ATP cellulaire et intervient dans plus de 300 réactions enzymatiques.",
      "L'EFSA valide son rôle sur la réduction de la fatigue, les muscles, les nerfs et la synthèse protéique.",
      "Il soutient les apports insuffisants mais ne remplace pas un diagnostic médical si la fatigue persiste."],
     [{"question": "Le magnésium aide-t-il en cas de crampes nocturnes ?", "answer": "S'il existe un déficit en magnésium, rétablir un apport optimal peut aider la relaxation musculaire, mais d'autres causes (hydratation, sodium, posture) doivent aussi être vérifiées."}]),

    ("lire-etiquette-complement-magnesium", "Lire une étiquette de magnésium : VNR, forme et B6",
     "Décryptez un flacon de magnésium en 4 étapes : forme du sel, dose élémentaire, % VNR, nombre de gélules par prise et cofacteurs (B6, taurine).",
     "Une étiquette de magnésium peut facilement induire en erreur entre poids du sel, nombre de gélules et % VNR. Voici comment la lire correctement.",
     [("1. Identifier la forme chimique exacte dans les ingrédients", [
         "Ne vous contentez pas du mot « Magnésium » sur la face avant. Retournez le flacon et lisez la ligne exacte : s'agit-il de bisglycinate de magnésium, de citrate, de malate ou d'oxyde de magnésium (parfois caché sous le terme « magnésium marin ») ? Pour connaître les écarts d'absorption, lisez [formes de magnésium](/conseils/formes-de-magnesium-absorption-tolerance)."
     ]),
      ("2. Vérifier la portion de référence (1 gélule vs 2 ou 3 comprimés)", [
          "De nombreux tableaux nutritionnels indiquent « Pour 3 gélules : 300 mg de magnésium (80 % VNR) ». Cela signifie qu'une seule gélule n'apporte que 100 mg ! Calculez la durée réelle du flacon en divisant le nombre total de gélules par la portion journalière."
      ]),
      ("3. Comprendre le % VNR (Valeur Nutritionnelle de Référence)", [
          "En Europe et sur la plupart des produits vendus en Tunisie, 100 % VNR de magnésium correspond à 375 mg de magnésium élémentaire. Si votre produit affiche 250 mg = 67 % VNR, vous savez immédiatement que vous lisez bien la dose réelle de [magnésium élémentaire](/conseils/magnesium-elementaire-vs-poids-compose)."
      ]),
      ("4. Repérer les cofacteurs associés (Vitamine B6, Taurine)", [
          "La vitamine B6 (idéalement sous forme P-5-P ou pyridoxine modérée à 1,4–2 mg) accompagne souvent le magnésium dans notre rayon [Magnésium](/magnesium). Attention toutefois à ne pas cumuler 10 mg+ de B6 si vous prenez déjà un multivitamine ou du ZMA (voir [éviter le cumul de compléments](/conseils/eviter-surdosage-cumul-plusieurs-complements))."
      ])],
     ["Vérifiez toujours le nom exact du sel chimique dans la liste des ingrédients.",
      "Regardez combien de gélules ou comprimés composent la dose journalière du tableau.",
      "100 % VNR correspond à 375 mg de magnésium élémentaire."],
     [{"question": "Que faire si un flacon indique seulement « Magnésium marin » sans préciser le sel ?", "answer": "Le magnésium marin non précisé est généralement un mélange à forte proportion d'oxyde et d'hydroxyde de magnésium issu de l'eau de mer."}]),
]

batch4 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B4_SPECS]
with open("scripts/batches/batch_04.json", "w", encoding="utf-8") as f:
    json.dump(batch4, f, ensure_ascii=False, indent=2)
print(f"Created batch_04.json ({len(batch4)} articles).")
