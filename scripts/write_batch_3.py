# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 3: 4 Whey & Protéines + 6 Ashwagandha
B3_SPECS = [
    ("timing-proteines-fenetre-anabolique-mythe", "Timing des protéines : fenêtre anabolique mythe ou réalité ?",
     "Faut-il boire son shaker dans les 30 minutes après la séance ? Analyse des études sur la fenêtre anabolique et la répartition sur 24h.",
     "La fameuse « fenêtre anabolique » de 30 minutes est beaucoup plus large qu'on ne le pense. Voici comment répartir vos protéines efficacement.",
     [("D'où vient le mythe des 30 minutes post-séance ?", [
         "Dans les années 2000, plusieurs études réalisées sur des sujets à jeun ont montré une élévation rapide de la synthèse protéique lorsque des acides aminés étaient ingérés juste après l'effort. Le marketing a transformé ce constat en règle absolue : si vous ne buvez pas votre shaker dans le vestiaire, votre entraînement serait perdu.",
         "Les méta-analyses publiées par Schoenfeld, Aragon et l'ISSN ont depuis nuancé ce message : la sensibilité musculaire aux acides aminés reste élevée pendant **24 heures** après un entraînement de résistance, avec un pic durant les premières heures."
     ]),
      ("Ce qui compte vraiment : le total quotidien et la régularité", [
          "Si vous avez pris un repas complet contenant 30 à 40 g de protéines 1 à 2 heures avant votre séance, les acides aminés circulent encore largement dans votre sang à la fin de l'entraînement. Vous n'avez donc aucune urgence vitale à la minute près.",
          "En revanche, si vous vous entraînez à jeun tôt le matin ou plus de 4 heures après le dernier repas, prendre votre shaker de [whey protéine](/whey-proteine) dans l'heure qui suit la séance devient particulièrement pertinent pour stopper le catabolisme."
      ]),
      ("Répartition idéale sur 3 à 4 prises", [
          "Pour optimiser la synthèse protéique musculaire tout au long de la journée, visez 3 à 4 repas ou collations espacés de 3 à 5 heures, chacun apportant environ 25 à 40 g de protéines (ou 0,4 g/kg par prise). Calculez votre total journalier avec notre guide [besoins en protéines par jour](/conseils/besoins-proteines-selon-activite-physique)."
      ]),
      ("Application pratique autour de l'entraînement", [
          "Gardez votre routine simple : un repas solide 2 heures avant le sport, et un shaker de whey ou un vrai repas dans les 1 à 2 heures suivant la fin de la séance. Si vous rentrez tard le soir, une collation mixte ou une [caséine](/conseils/caseine-ou-whey-differences-utilisation) assure une couverture nocturne."
      ])],
     ["La sensibilité musculaire aux protéines dure jusqu'à 24 heures après une séance.",
      "Le total protéique journalier (1,6–2,0 g/kg) prime largement sur l'horaire exact du shaker.",
      "Si vous vous entraînez à jeun, prenez un repas ou shaker dans l'heure suivant l'effort."],
     [{"question": "Boire sa whey avant l'entraînement est-il utile ?", "answer": "Oui, si votre dernier repas remonte à plus de 3 heures, un shaker 45 minutes avant fournit des acides aminés disponibles pendant et après la séance."}]),

    ("profil-acides-amines-leucine-qualite-whey", "Profil en acides aminés et leucine : juger une whey",
     "Pourquoi la L-leucine (2,5 à 3 g par dose) déclenche la synthèse musculaire et comment lire un aminogramme de whey protéine.",
     "Toutes les protéines ne stimulent pas la synthèse musculaire au même degré. Le secret se lit dans l'aminogramme, et en particulier dans le taux de leucine.",
     [("Qu'est-ce que l'aminogramme sur un pot de whey ?", [
         "Les protéines sont constituées de 20 acides aminés, dont 9 dits « essentiels » (EAA) que l'organisme ne sait pas fabriquer seul. L'aminogramme affiche la répartition de chacun pour 100 g de protéines. Sur une [whey protéine](/whey-proteine) de qualité, les acides aminés essentiels représentent près de 45 à 50 % du total."
     ]),
      ("Le rôle déclencheur de la L-leucine (seuil mTOR)", [
          "Parmi les trois BCAA (leucine, isoleucine, valine), la leucine joue le rôle d'interrupteur biologique : lorsqu'une prise alimentaire élève rapidement le taux sanguin de leucine (autour de 2,5 à 3 g par portion), elle active la voie intracellulaire mTORC1 qui lance la construction musculaire.",
          "La whey est naturellement l'une des protéines les plus riches en leucine (10 à 12 g pour 100 g de protéines). Ainsi, un scoop apportant 25 g de protéines de whey délivre automatiquement ~2,6 à 3 g de leucine sans avoir besoin d'ajouter des BCAA isolés."
      ]),
      ("Whey vs protéines végétales sur le plan de l'aminogramme", [
          "Les protéines végétales simples (pois seul ou riz seul) ont parfois un facteur limitant (méthionine pour le pois, lysine pour le riz) et un peu moins de leucine. En combinant pois + riz (ou en visant 30–35 g par portion), on retrouve un profil complet très efficace."
      ]),
      ("Détecter les formules gonflées artificiellement", [
          "Si un aminogramme affiche des taux anormalement bas de leucine (< 8 g / 100 g) accompagnés d'un pic suspect de glycine ou de taurine, c'est un signal d'alerte. Consultez aussi [comment comparer la teneur réelle en protéines](/conseils/calculer-teneur-reelle-proteines-par-dose)."
      ])],
     ["La leucine agit comme déclencheur de la synthèse protéique musculaire autour de 2,5–3 g par prise.",
      "Un scoop de 25 g de whey de qualité fournit naturellement ~2,7 g de leucine.",
      "Vérifiez la présence d'un aminogramme complet sur la fiche ou le pot."],
     [{"question": "Faut-il rajouter des BCAA dans son shaker de whey ?", "answer": "Non, une whey complète contient déjà 5 à 6 g de BCAA par portion ; ajouter des BCAA isolés par-dessus n'apporte généralement aucun gain supplémentaire."}]),

    ("whey-proteine-et-perte-de-poids-satiety", "Whey protéine et perte de poids : satiété et masse maigre",
     "Comment utiliser la whey protéine (ou Whey Isolate) en sèche : effet coupe-faim, thermogenèse et protection de la masse musculaire.",
     "La whey ne fait pas fondre les graisses par magie, mais c'est un allié nutritionnel précieux pour tenir un déficit calorique sans perdre de muscle.",
     [("Pourquoi les protéines facilitent un déficit calorique", [
         "Pour perdre de la masse grasse, la condition indispensable reste le déficit calorique (dépenser plus d'énergie que l'on en consomme). Or, réduire ses calories provoque souvent faim, fatigue et perte musculaire.",
         "Les protéines possèdent le pouvoir rassasiant le plus élevé des trois macronutriments : elles stimulent la sécrétion d'hormones de satiété (PYY, GLP-1) et demandent plus d'énergie à l'organisme pour être digérées (effet thermique d'environ 20 à 30 % contre 5–10 % pour les glucides)."
      ]),
      ("Préserver la masse musculaire pendant la sèche", [
          "Lorsque l'apport calorique baisse, le maintien d'un apport protéique élevé (1,8 à 2,2 g/kg/j) combiné à l'entraînement en résistance protège le tissu musculaire. Une [Whey Isolate](/whey-isolate) ou une [whey protéine](/whey-proteine) pauvre en sucres permet d'obtenir 24 à 25 g de protéines pour seulement 100 à 115 kcal."
      ]),
      ("Idées pratiques en collation sans calories cachées", [
          "Mélangez votre scoop uniquement avec de l'eau fraîche, du café froid ou dans 150 g de yaourt nature 0 % pour obtenir un dessert protéiné très rassasiant à ~190 kcal. Évitez de mixer la whey avec du lait entier, du beurre de cacahuète en excès ou du miel si vous cherchez à maigrir."
      ]),
      ("Concentrée ou Isolate en sèche ?", [
          "La différence calorique entre une bonne concentrée (120 kcal) et une isolate (105 kcal) est modeste (~15 kcal par shaker), mais l'isolate reste idéale si vous cherchez le taux de glucides et de lactose le plus bas possible."
      ])],
     ["La whey aide à la perte de poids via la satiété et la préservation de la masse maigre, pas par « fonte directe ».",
      "Un shaker à l'eau apporte ~24 g de protéines pour ~105–120 kcal.",
      "En sèche, privilégiez une Whey Isolate ou une concentrée sans sucres ajoutés."],
     [{"question": "Peut-on remplacer un repas complet par un shaker de whey ?", "answer": "Ponctuellement en collation oui, mais sur le long terme un shaker manque de fibres, de micronutriments et de bons lipides : gardez de vrais repas solides."}]),

    ("erreurs-achat-whey-proteine-eviter", "Erreurs d'achat whey protéine : 6 pièges à éviter",
     "Les 6 erreurs les plus fréquentes lors de l'achat d'une whey protéine : confondre avec un gainer, négliger le lactose, ignorer le prix aux 100g.",
     "Avant de commander votre premier pot de whey protéine, passez en revue ces 6 erreurs classiques pour investir dans le bon produit.",
     [("1. Confondre un Mass Gainer et une Whey Protéine", [
         "Beaucoup de débutants achètent un sac de 3 kg très abordable en pensant prendre de la whey, alors qu'il s'agit d'un Mass Gainer composé à 70 % de glucides (maltodextrine) et seulement 15 à 20 % de protéines. Vérifiez toujours le tableau nutritionnel pour 100 g : une vraie [whey protéine](/whey-proteine) titre au moins 70 % de protéines."
     ]),
      ("2. Regarder le prix du pot sans vérifier le poids net ni les portions", [
          "Un pot à 110 DT de 900 g revient nettement plus cher au gramme qu'un pot de 2 kg à 195 DT. Appliquez toujours la règle de calcul expliquée dans [prix aux 100 g de protéines pures](/conseils/prix-100g-proteines-pures-comparer-whey)."
      ]),
      ("3. Acheter un concentré malgré une sensibilité au lactose", [
          "Si le lait vous donne des ballonnements, ne forcez pas sur une concentrée bon marché : optez directement pour une [Whey Isolate](/whey-isolate) filtrée (< 1 % de lactose) ou une protéine végétale."
      ]),
      ("4. Se fier aux promesses de « whey 100 % isolate » quand l'isolat est minoritaire", [
          "Certains mélanges affichent « Isolate Blend » alors que le premier ingrédient reste le concentré de lactosérum. Lisez la liste d'ingrédients par ordre décroissant."
      ]),
      ("5. Acheter un très gros pot de 4 kg dans un goût inconnu", [
          "Sous le climat chaud tunisien, un pot ouvert pendant 6 mois dans une cuisine humide risque de s'agglomérer et vous risquez de vous lasser de l'arôme. Commencez par 900 g à 2 kg sur une saveur classique (vanille ou chocolat)."
      ]),
      ("6. Négliger la provenance et le scellé", [
          "Exigez toujours un vendeur transparent, un scellé intact et un numéro de lot clair (voir [vérifier l'authenticité en Tunisie](/conseils/verifier-authenticite-complements-tunisie-checklist))."
      ])],
     ["Vérifiez toujours que le % de protéines pour 100 g dépasse 70 % (sinon c'est souvent un gainer).",
      "Lisez l'ordre exact des ingrédients : l'isolat doit apparaître en premier sur une « Isolate ».",
      "Comparez le coût aux 100 g de protéines pures plutôt que le prix facial."],
     [{"question": "Quelle saveur de whey est la plus facile à boire tous les jours ?", "answer": "Vanille et chocolat au lait restent les plus polyvalentes : elles se mélangent facilement à l'eau, au café ou dans des flocons d'avoine."}]),

    # ── ASHWAGANDHA (6) ──
    ("ashwagandha-quest-ce-que-cest-plante-adaptogene", "Qu'est-ce que l'ashwagandha ? Origine et usages",
     "Découvrez Withania somnifera (ashwagandha) : origine botanique, notion de plante adaptogène, racine vs feuille et état des connaissances scientifiques.",
     "Utilisée depuis des siècles dans la tradition ayurvédique, l'ashwagandha suscite un fort intérêt scientifique. Voici ce que recouvre réellement cette plante.",
     [("Origine botanique : Withania somnifera", [
         "L'ashwagandha (nom botanique *Withania somnifera*) est un petit arbuste de la famille des Solanacées originaire d'Inde, du Moyen-Orient et de certaines régions d'Afrique. On l'appelle parfois « ginseng indien », bien qu'elle n'appartienne pas à la même famille botanique que le *Panax ginseng*.",
         "Dans les compléments alimentaires sérieux du rayon [Ashwagandha](/ashwagandha), la partie utilisée est principalement la **racine séchée**, riche en alcaloïdes et en lactones stéroïdiennes appelées withanolides."
     ]),
      ("Que signifie exactement « plante adaptogène » ?", [
          "Le terme « adaptogène » décrit en phytothérapie des substances végétales censées aider l'organisme à maintenir son équilibre physiologique face à des facteurs de stress physiques ou psychologiques passagers. Il ne s'agit pas d'un médicament ni d'un terme thérapeutique réglementé en médecine conventionnelle.",
          "L'ashwagandha est étudiée pour son interaction potentielle avec l'axe hypothalamo-hypophyso-surrénalien (HPA), impliqué dans la réponse au stress et la régulation du cortisol, ainsi que pour le bien-être général."
      ]),
      ("Racine seule vs feuilles : pourquoi l'origine de la plante compte", [
          "Traditionnellement, la racine est privilégiée pour sa tolérance et son profil standardisé en withanolides. Certaines formules mélangent racines et feuilles pour augmenter artificiellement le taux de withanolides à moindre coût (comme expliqué dans [withanolides et titrage](/conseils/withanolides-ashwagandha-comprendre-titrage)), ce qui modifie aussi le profil de composés comme la withaférine A."
      ]),
      ("Ce que l'ashwagandha n'est pas", [
          "Il est essentiel de rester lucide : l'ashwagandha ne remplace jamais une prise en charge médicale ou psychologique en cas de trouble anxieux sévère, de dépression ou d'insomnie chronique. Consultez [les études scientifiques et leurs limites](/conseils/ashwagandha-etudes-scientifiques-niveau-preuve) pour une vue objective."
      ])],
     ["Withania somnifera est une plante traditionnellement utilisée dont la racine est la partie de référence.",
      "Ses principaux marqueurs actifs étudiés sont les withanolides.",
      "Elle accompagne la gestion du stress passager mais ne constitue pas un traitement médical."],
     [{"question": "L'ashwagandha est-elle une plante excitante comme le café ?", "answer": "Non, elle ne contient pas de caféine ni de stimulants nerveux ; elle est généralement recherchée pour le calme et l'équilibre."}]),

    ("ashwagandha-etudes-scientifiques-niveau-preuve", "Ashwagandha : que montrent les études cliniques ?",
     "Bilan objectif des essais cliniques sur l'ashwagandha (NIH NCCIH, PubMed) : stress perçu, sommeil, limites méthodologiques et incertitudes.",
     "Que disent réellement les synthèses du NIH et les essais cliniques publiés sur l'ashwagandha, sans exagération marketing ?",
     [("Ce que les essais contrôlés suggèrent sur le stress perçu", [
         "Plusieurs essais cliniques randomisés en double aveugle contre placebo (menés généralement sur des durées de 6 à 12 semaines avec 300 à 600 mg/jour d'extrait de racine standardisé) ont rapporté une diminution modérée des scores subjectifs de stress perçu et, dans certains groupes, une baisse des taux de cortisol salivaire ou sérique.",
         "Concernant le sommeil, quelques études récentes notent une amélioration modeste de la latence d'endormissement et de la qualité subjective du repos chez des adultes stressés, sans égaler ni remplacer les approches médicales de l'insomnie pathologique."
     ]),
      ("Les limites méthodologiques soulignées par le NIH (NCCIH)", [
          "Le National Center for Complementary and Integrative Health (NCCIH) rappelle plusieurs limites importantes à garder en tête : la majorité des études portent sur de petits échantillons (souvent 50 à 100 participants), durent rarement plus de 3 mois, et utilisent des extraits différents (KSM-66, Sensoril ou extraits génériques), ce qui rend les comparaisons directes difficiles.",
          "De plus, l'innocuité à très long terme (au-delà de 3 à 6 mois en continu) reste insuffisamment documentée."
      ]),
      ("Pourquoi la prudence reste indispensable face aux promesses commerciales", [
          "Sur les réseaux sociaux, l'ashwagandha est parfois présentée comme un remède universel contre l'anxiété, la dépression, la fatigue ou les déséquilibres hormonaux. Ces affirmations dépassent largement les preuves disponibles. Pour choisir un produit sérieux sans vous laisser abuser, voyez [évaluer la qualité d'une ashwagandha](/conseils/evaluer-qualite-ashwagandha-criteres-achat) et notre rayon [Ashwagandha](/ashwagandha)."
      ])],
     ["Les essais de 6 à 12 semaines suggèrent un soutien modeste face au stress passager.",
      "Le NIH souligne la petite taille des études et l'absence de données à long terme (> 3–6 mois).",
      "L'ashwagandha ne doit jamais remplacer un avis ou traitement médical."],
     [{"question": "Combien de temps dure une cure typique dans les études cliniques ?", "answer": "La plupart des essais cliniques durent entre 6 et 12 semaines, suivies d'une pause ou d'une réévaluation."}]),

    ("ashwagandha-ksm-66-vs-sensoril-vs-standard", "Extraits d'ashwagandha : KSM-66, Sensoril et standard",
     "Comparaison des extraits d'ashwagandha : KSM-66 (racine seule 5 %), Sensoril (racine+feuille 10 %) et poudres non standardisées.",
     "KSM-66, Sensoril ou extrait standardisé : comment fonctionnent ces différents procédés d'extraction et lequel correspond à vos attentes ?",
     [("1. Poudre de racine brute vs extrait standardisé", [
         "La poudre simple de racine séchée contient naturellement environ 0,3 à 0,8 % de withanolides, avec de fortes variations selon la récolte. Un extrait standardisé concentre ces composés actifs afin de garantir un taux constant d'un lot à l'autre — par exemple 1,5 %, 5 % ou 10 % de withanolides."
     ]),
      ("2. KSM-66 : extrait 100 % racine titré à 5 %", [
          "Le KSM-66 est un extrait aqueux/lacté breveté obtenu exclusivement à partir de la racine (sans feuilles), standardisé à 5 % de withanolides. Il est très étudié dans le contexte sportif (récupération, endurance perçue) et du stress diurne, généralement à 300 mg deux fois par jour."
      ]),
      ("3. Sensoril : extrait racine + feuilles titré à 10 %", [
          "Le Sensoril utilise à la fois les racines et les feuilles de la plante pour atteindre 10 % de withanolides. Il s'utilise souvent à dose plus faible (125 à 250 mg) et est fréquemment formulé pour la détente en fin de journée."
      ]),
      ("4. Extraits standardisés génériques (ex. 1,5 % à 5 %)", [
          "De nombreuses marques sérieuses de notre rayon [Ashwagandha](/ashwagandha) utilisent des extraits standardisés non brevetés mais clairement titrés (par exemple 500 mg titrés à 1,5 % ou 5 %). L'essentiel est de vérifier le titrage exact et l'usage de la racine, comme expliqué dans [comprendre les withanolides](/conseils/withanolides-ashwagandha-comprendre-titrage)."
      ])],
     ["Un extrait standardisé garantit une teneur constante en withanolides contrairement à la poudre brute.",
      "KSM-66 utilise uniquement la racine (5 %) ; Sensoril associe racine et feuille (10 %).",
      "Vérifiez la quantité réelle de withanolides en mg par dose journalière."],
     [{"question": "Un extrait non breveté peut-il être efficace ?", "answer": "Oui, s'il provient d'un fabricant traçable qui indique clairement le ratio d'extraction, la partie utilisée (racine) et le pourcentage de withanolides."}]),

    ("withanolides-ashwagandha-comprendre-titrage", "Withanolides dans l'ashwagandha : comprendre le titrage",
     "Pourquoi 500 mg de poudre d'ashwagandha ne valent pas 500 mg d'extrait titré à 5 % de withanolides : calcul exact et lecture d'étiquette.",
     "Le chiffre en mg sur la face avant du flacon ne suffit pas : la clé d'une ashwagandha bien dosée réside dans son pourcentage de withanolides.",
     [("Que sont les withanolides ?", [
         "Les withanolides forment une famille de lactones stéroïdiennes naturelles présentes dans *Withania somnifera*. Ils servent de marqueurs de standardisation pour mesurer la concentration d'un extrait végétal."
     ]),
      ("Le calcul simple : comparer 500 mg bruts vs extrait à 5 %", [
          "Imaginons deux flacons affichant tous deux « 500 mg par gélule ». Le premier contient de la poudre brute de racine (~0,5 % de withanolides) : chaque gélule n'apporte que **2,5 mg de withanolides**. Le second contient un extrait standardisé à 5 % : chaque gélule délivre **25 mg de withanolides**, soit dix fois plus d'actifs standardisés !",
          "Dans la plupart des études cliniques publiées sur l'adulte (voir [études cliniques ashwagandha](/conseils/ashwagandha-etudes-scientifiques-niveau-preuve)), l'apport total se situe entre **15 mg et 35 mg de withanolides par jour** (soit environ 300 à 600 mg d'extrait titré à 5 %, ou 600 à 1000 mg d'extrait à 1,5–2,5 %)."
      ]),
      ("Attention aux taux artificiellement gonflés par les feuilles", [
          "Méfiez-vous des extraits génériques affichant 15 % ou 20 % de withanolides à très bas prix sans mention de la partie de plante : il s'agit parfois de feuilles riches en withaférine A (un composé dont la concentration élevée n'est pas souhaitée dans les extraits traditionnels de racine). Vérifiez les références de notre sélection [Ashwagandha](/ashwagandha)."
      ])],
     ["Calculez : mg d'extrait × % de titrage = mg réels de withanolides par prise.",
      "Les protocoles étudiés apportent généralement 15 à 35 mg de withanolides par jour.",
      "Privilégiez un extrait issu de la racine clairement mentionné sur l'étiquette."],
     [{"question": "Plus le pourcentage de withanolides est élevé, mieux c'est ?", "answer": "Pas forcément au-delà de 5 à 10 %, surtout si cela implique l'utilisation massive de feuilles plutôt que de racine."}]),

    ("lire-etiquette-complement-ashwagandha", "Lire une étiquette d'ashwagandha : racine et dosage",
     "Checklist pour décoder un flacon d'ashwagandha : nom latin, partie de plante, ratio d'extraction, excipients et durée de cure.",
     "Avant d'acheter un flacon d'ashwagandha, apprenez à repérer en 30 secondes les mentions obligatoires qui garantissent la transparence du produit.",
     [("Les 5 mentions à vérifier sur le flacon", [
         "1. **Nom botanique exact** : *Withania somnifera* doit figurer clairement. 2. **Partie utilisée** : « racine » (*root*) est la référence traditionnelle la mieux documentée. 3. **Type de matière** : « extrait sec standardisé » vs simple « poudre de racine ».",
         "4. **Dosage par portion vs par gélule** : vérifiez si la dose affichée (ex. 600 mg) correspond à 1 gélule ou à 2 gélules ! 5. **Titrage en withanolides** : exprimé en % et idéalement en mg."
     ]),
      ("Présence de pipérine (poivre noir) et autres ajouts", [
          "Certains fabricants ajoutent de l'extrait de poivre noir (pipérine) ou de la vitamine B6. Notez que la pipérine peut modifier l'absorption de certains médicaments métabolisés par le foie : si vous suivez un traitement, préférez une formule d'ashwagandha seule sans pipérine dans notre rayon [Ashwagandha](/ashwagandha)."
      ]),
      ("Excipients et enveloppe de la gélule", [
          "Les gélules peuvent être en gélatine bovine ou en HPMC (cellulose végétale, adaptée aux végétariens). Un peu de cellulose microcristalline ou de stéarate de magnésium sert simplement au remplissage industriel des gélules."
      ])],
     ["Vérifiez toujours si le dosage en mg s'applique à 1 gélule ou à 2 gélules.",
      "Recherchez « Withania somnifera (racine) » et le % de withanolides.",
      "Évitez la pipérine ajoutée si vous prenez des médicaments."],
     [{"question": "Combien de gélules par flacon pour une cure d'un mois ?", "answer": "Pour 1 à 2 gélules par jour, un flacon de 60 gélules couvre 1 à 2 mois complets de cure."}]),

    ("ashwagandha-effets-secondaires-securite", "Ashwagandha : effets secondaires et sécurité d'emploi",
     "Quels effets indésirables peuvent survenir avec l'ashwagandha (troubles digestifs, somnolence, rares cas hépatiques) et quand consulter ?",
     "Bien que naturelle, l'ashwagandha est une plante active qui peut provoquer des effets indésirables chez certaines personnes. Faisons le point sans alarmisme.",
     [("Effets indésirables légers les plus fréquemment rapportés", [
         "Dans les essais cliniques de 6 à 12 semaines, la majorité des participants adultes en bonne santé tolèrent bien l'ashwagandha aux doses classiques (300 à 600 mg d'extrait). Toutefois, des effets légers à modérés sont rapportés : inconfort gastrique, nausées passagères ou selles molles lorsque la prise se fait à jeun, ainsi qu'une somnolence diurne si la dose est prise le matin chez les sujets sensibles."
     ]),
      ("Vigilance sur les rares signalements hépatiques et thyroïdiens", [
          "Des rapports de cas médicaux (documentés par le NIH LiverTox et l'agence de sécurité sanitaire) ont décrit de rares atteintes hépatiques réversibles associées à la prise de compléments d'ashwagandha, parfois dans des formules multi-ingrédients. Par ailleurs, la plante peut stimuler les hormones thyroïdiennes chez certaines personnes.",
          "Si vous constatez une fatigue inhabituelle, des démangeaisons, des urines foncées ou un jaunissement des yeux/peau, cessez immédiatement la prise et consultez un médecin."
      ]),
      ("Bonnes pratiques de sécurité au quotidien", [
          "Prenez votre gélule au cours d'un repas (jamais à jeun si vous êtes sensible), respectez la dose indiquée, limitez les cures à 8–12 semaines suivies d'une pause, et consultez toujours les [contre-indications et interactions médicamenteuses](/conseils/ashwagandha-interactions-medicamenteuses) avant de commander dans notre rayon [Ashwagandha](/ashwagandha)."
      ])],
     ["Les troubles digestifs légers et la somnolence sont les effets indésirables les plus courants.",
      "De rares cas d'atteintes hépatiques ou d'élévation thyroïdienne ont été documentés.",
      "Prenez l'ashwagandha au cours d'un repas et faites des pauses après 8–12 semaines."],
     [{"question": "L'ashwagandha donne-t-elle un effet d'accoutumance ?", "answer": "Non, aucune dépendance pharmacologique n'est documentée, mais il reste préférable de faire des pauses régulières."}]),
]

batch3 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B3_SPECS]
with open("scripts/batches/batch_03.json", "w", encoding="utf-8") as f:
    json.dump(batch3, f, ensure_ascii=False, indent=2)
print(f"Created batch_03.json ({len(batch3)} articles).")
