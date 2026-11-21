# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 9: Remaining 2 Probiotiques + 8 Pré-workout
B9_SPECS = [
    ("probiotiques-precautions-effets-indesirables", "Probiotiques : précautions et effets indésirables",
     "Les probiotiques présentent-ils des risques ? Ballonnements transitoires des premiers jours et contre-indications chez les personnes immunodéprimées.",
     "Bien que sûrs pour la majorité des adultes en bonne santé, les probiotiques ne conviennent pas à tout le monde sans avis médical.",
     [("Adaptation digestive passagère des 3 à 7 premiers jours", [
         "Lorsqu'on introduit plusieurs milliards d'UFC dans l'intestin, il est courant de ressentir pendant quelques jours de légers gaz ou un petit changement de transit. Cette phase d'adaptation transitoire disparaît généralement d'elle-même en moins d'une semaine. Si l'inconfort persiste, prenez la gélule pendant un repas ou réduisez la dose de moitié les premiers jours."
     ]),
      ("Personnes à risque nécessitant un avis médical impératif", [
          "Comme le souligne le NIH Office of Dietary Supplements (ODS), les probiotiques contiennent des micro-organismes vivants. Par conséquent, ils sont **déconseillés sans suivi médical strict** chez les personnes gravement immunodéprimées (chimiothérapie, greffe, immunosuppression lourde), porteurs de cathéters veineux centraux, grands prématurés ou patients en réanimation, en raison d'un risque rare mais réel d'infection opportuniste."
      ]),
      ("Espacement avec les antibiotiques", [
          "Si un médecin vous a prescrit un traitement antibiotique et vous autorise une souche probiotique en parallèle, espacez la prise de bactéries d'au moins **2 à 3 heures** de l'antibiotique (sauf pour la levure *Saccharomyces boulardii* qui n'est pas tuée par les antibiotiques antibactériens). Parcourez notre sélection [Probiotiques & Digestion](/probiotiques)."
      ])],
     ["De légers gaz les 3–7 premiers jours sont fréquents et transitoires.",
      "Contre-indiqués sans avis médical en cas d'immunodépression sévère ou de cathéter central.",
      "Espacez les bactéries probiotiques d'au moins 2 heures d'un antibiotique."],
     [{"question": "Les probiotiques font-ils grossir ou maigrir ?", "answer": "Non, les probiotiques n'apportent aucune calorie significative et ne font ni prendre ni perdre de poids directement."}]),

    ("comparer-produits-probiotiques-criteres-fiables", "Comparer deux probiotiques : 5 critères objectifs",
     "Checklist pour choisir un probiotique fiable : code de souche, UFC garanties à expiration, protection gastrique, blister et coût par jour.",
     "Ne choisissez pas votre probiotique uniquement sur un gros chiffre en milliards. Voici les 5 critères vérifiables qui font la différence.",
     [("Critère 1 : Identification précise des souches", [
         "Chaque souche doit afficher son genre, son espèce et son code (ex. *Bifidobacterium animalis subsp. lactis BB-12*). Consultez [comprendre les souches bactériennes](/conseils/comprendre-souches-bacteriennes-probiotiques)."
     ]),
      ("Critère 2 : Garantie des UFC jusqu'à la date limite (DDM)", [
          "Vérifiez que la mention des milliards d'UFC reste valable jusqu'à expiration, pas seulement en sortie d'usine (voir [étiquetage UFC expliqué](/conseils/etiquetage-ufc-milliards-probiotiques-explication))."
      ]),
      ("Critère 3 : Protection gastrique et conditionnement barrière", [
          "Privilégiez les gélules gastro-résistantes et les flacons opaques avec dessiccant ou blisters individuels qui bloquent l'humidité tunisienne en été."
      ]),
      ("Critère 4 : Absence d'allégations médicales abusives", [
          "Méfiez-vous des boîtes promettant de guérir des pathologies chroniques. Un produit sérieux du rayon [Probiotiques & Digestion](/probiotiques) reste factuel sur sa composition."
      ]),
      ("Critère 5 : Coût par jour de cure en Dinars Tunisiens", [
          "Divisez le prix du flacon par le nombre de jours réels (ex. 30 ou 60 jours) pour comparer objectivement deux références."
      ])],
     ["Exigez des codes de souches complets et une garantie d'UFC à la péremption.",
      "Privilégiez gélules gastro-résistantes et emballages protecteurs contre l'humidité.",
      "Comparez toujours le prix par jour de cure réel."],
     [{"question": "Combien de temps dure une cure de probiotiques ?", "answer": "Les cures courantes durent généralement de 20 à 30 jours, parfois renouvelées sur conseil d'un professionnel de santé."}]),

    # ── PRÉ-WORKOUT & NUTRITION SPORTIVE (8) ──
    ("lire-etiquette-pre-workout-matrice-proprietary", "Lire une étiquette de pre-workout : matrices opaques",
     "Repérer les « proprietary blends » sur les pre-workouts et vérifier les dosages réels de citrulline, bêta-alanine et caféine avant d'acheter.",
     "Les étiquettes de pre-workout affichent parfois des noms impressionnants pour masquer des ingrédients sous-dosés. Voici comment les décrypter.",
     [("Qu'est-ce qu'un « proprietary blend » (matrice exclusive) ?", [
         "Sur certains boosters importés, le tableau nutritionnel regroupe 6 ou 8 ingrédients sous un nom commercial (« Explosive Pump Matrix : 4500 mg ») sans indiquer combien de milligrammes revient à chaque actif. Comme la loi impose l'ordre décroissant, un ingrédient coûteux comme la L-citrulline peut n'être présent qu'à 500 mg derrière de la taurine ou de la créatine bon marché !"
     ]),
      ("Les dosages transparents à vérifier sur une bonne formule", [
          "Dans notre rayon [Pre-Workout & Énergie](/pre-workout), privilégiez les étiquettes transparentes détaillant chaque actif individuellement : **L-citrulline** (4 à 6 g, ou 6 à 8 g de citrulline malate 2:1), **bêta-alanine** (2 à 3,2 g), **caféine** clairement chiffrée (150 à 250 mg selon votre tolérance). Pour l'analyse complète, voyez [choisir un pre-workout selon sa composition](/conseils/choisir-pre-workout-composition-verifiee)."
      ]),
      ("Attention aux portions doubles (« 1 scoop vs 2 scoops »)", [
          "Vérifiez si les dosages affichés sur le pot s'appliquent à 1 dosette ou à 2 dosettes ! Un pot de « 40 servings » tombe à 20 séances si la dose efficace demande 2 scoops."
      ])],
     ["Évitez les « proprietary blends » qui masquent les dosages réels de chaque ingrédient.",
      "Vérifiez les dosages individuels de citrulline, bêta-alanine et caféine.",
      "Contrôlez si le tableau nutritionnel correspond à 1 scoop ou 2 scoops."],
     [{"question": "Un pre-workout sans créatine est-il préférable ?", "answer": "Oui, car vous pouvez doser séparément votre créatine monohydrate à 3-5 g tous les jours sans dépendre de vos jours de booster."}]),

    ("cafeine-dans-les-pre-workout-dosage-tolerance", "Caféine dans les pre-workout : dosage et sommeil",
     "Dosage optimal de caféine avant le sport (3 à 6 mg/kg), accoutumance, demi-vie de 5 à 6 heures et impact sur le sommeil après 17h.",
     "La caféine est l'actif énergisant le plus fiable d'un pre-workout, mais mal dosée ou prise trop tard, elle sabote votre récupération nocturne.",
     [("Quel dosage est validé par l'ISSN pour la performance ?", [
         "Selon l'International Society of Sports Nutrition (ISSN), les effets ergogéniques de la caféine sur la vigilance, l'endurance et l'effort perçu apparaissent généralement entre **3 mg et 6 mg par kg de poids de corps** (soit environ 200 à 400 mg pour un athlète de 70 kg), pris 45 à 60 minutes avant l'effort. Toutefois, 100 à 200 mg suffisent largement pour la majorité des séances en salle sans nervosité excessive."
     ]),
      ("Demi-vie de 5 à 6 heures : l'erreur des séances de fin d'après-midi", [
          "La caféine possède une demi-vie moyenne de **5 à 6 heures** chez l'adulte : si vous avalez un pre-workout dosé à 300 mg à 18 h 30, environ 150 mg circulent encore dans votre cerveau à minuit ! Même si vous réussissez à vous endormir, la caféine fragmente votre sommeil profond, nuisant directement à la récupération musculaire.",
          "Si vous vous entraînez après 17 h, choisissez un pre-workout sans caféine (axé citrulline et électrolytes) dans notre rayon [Pre-Workout & Énergie](/pre-workout)."
      ]),
      ("Gérer la tolérance et la sécurité", [
          "Évitez de cumuler plusieurs expressos dans la journée avec un booster fortement dosé, et faites une semaine sans caféine toutes les 6 à 8 semaines pour restaurer votre sensibilité (voir [sécurité des pre-workout](/conseils/securite-pre-workout-stimulants-coeur))."
      ])],
     ["Dose ergonomique usuelle : 150 à 300 mg (ou 3–6 mg/kg) 45 min avant l'effort.",
      "Demi-vie de 5–6 h : évitez les boosters caféinés moins de 6 heures avant le coucher.",
      "Commencez toujours par une demi-dose pour tester votre tolérance individuelle."],
     [{"question": "Que faire si je m'entraîne à 19 h ou 20 h ?", "answer": "Optez pour un booster sans stimulants (pump à la citrulline) ou une simple collation glucidique + hydratation afin de préserver votre sommeil."}]),

    ("citrulline-l-citrulline-vs-citrulline-malate", "L-Citrulline vs Citrulline Malate : dosages réels",
     "Différence entre L-citrulline pure et citrulline malate (2:1) : calcul de la part réelle de citrulline, oxyde nitrique et comparaison avec l'arginine.",
     "Sur les fiches pre-workout, on trouve tantôt de la L-citrulline, tantôt du malate de citrulline. Voici pourquoi le calcul du dosage change.",
     [("Pourquoi la citrulline surpasse la L-arginine par voie orale", [
         "La citrulline et l'arginine sont liées à la production d'oxyde nitrique (NO), qui favorise la vasodilatation et la congestion musculaire à l'effort. Par voie orale, la L-arginine subit une forte dégradation dans l'intestin et le foie avant d'atteindre la circulation générale. À l'inverse, la L-citrulline échappe à ce premier passage hépatique et élève plus efficacement les taux sanguins d'arginine."
     ]),
      ("L-Citrulline pure vs Citrulline Malate 2:1 : attention au ratio", [
          "La **L-citrulline pure** apporte 100 % de citrulline : 4 à 6 g représentent la dose de référence.",
          "La **Citrulline Malate 2:1** associe 2 parts de L-citrulline à 1 part d'acide malique (environ **66 % de citrulline** et 34 % de malate). Ainsi, 6 g de citrulline malate 2:1 n'apportent réellement que **4 g de L-citrulline** ! Il faut donc viser 6 à 8 g de citrulline malate 2:1 pour égaler 4–5 g de citrulline pure."
      ]),
      ("Ce qu'il faut vérifier dans le rayon Pre-Workout", [
          "Inspectez le dosage exact dans notre catégorie [Pre-Workout & Énergie](/pre-workout) et vérifiez l'absence de mélange opaque (voir [lire une étiquette de pre-workout](/conseils/lire-etiquette-pre-workout-matrice-proprietary))."
      ])],
     ["La L-citrulline élève plus efficacement l'arginine sanguine que la L-arginine orale directe.",
      "6 g de citrulline malate 2:1 apportent environ 4 g de L-citrulline pure.",
      "Dose cible avant séance : 4–6 g de L-citrulline ou 6–8 g de citrulline malate 2:1."],
     [{"question": "La citrulline contient-elle de la caféine ?", "answer": "Non, la citrulline est un acide aminé non stimulant : elle convient parfaitement aux entraînements du soir."}]),

    ("beta-alanine-picotements-paresthesie-endurance", "Bêta-alanine : picotements et action sur l'endurance",
     "Pourquoi la bêta-alanine provoque des picotements (paresthésie) et comment elle agit réellement par élévation de la carnosine musculaire.",
     "Les picotements sur le visage et les mains après un pre-workout surprennent toujours la première fois. Ce n'est pas le signe d'un effet immédiat sur la force.",
     [("D'où viennent les picotements (paresthésie) ?", [
         "Dès que vous avalez plus de 1,6 à 2 g de bêta-alanine d'un coup, cet acide aminé active brièvement certains récepteurs nerveux cutanés (MrgprD), provoquant des fourmillements ou picotements passagers sur le visage, le cou ou les mains pendant 30 à 60 minutes. Cette **paresthésie** est bénigne mais souvent interprétée à tort comme un « effet coup de fouet »."
     ]),
      ("Comment la bêta-alanine agit réellement : la carnosine musculaire", [
          "En réalité, comme la créatine, la bêta-alanine n'agit pas sur une seule prise ponctuelle. Prise quotidiennement (3,2 à 6,4 g/j selon l'ISSN), elle s'associe à l'histidine dans le muscle pour augmenter le stock de **carnosine**, un tampon intracellulaire qui limite l'accumulation d'ions H+ (acidité) durant les efforts intenses de **1 à 4 minutes** (séries longues, cross-training, sprints répétés)."
      ]),
      ("Faut-il privilégier la bêta-alanine seule ou en pre-workout ?", [
          "Si votre [pre-workout](/pre-workout) en contient 2 à 3,2 g et que les picotements vous gênent, divisez votre prise ou choisissez une formule sans bêta-alanine. Pour un réel effet tampon sur l'endurance lactique, la prise régulière sur 4 semaines reste indispensable."
      ])],
     ["Les picotements (paresthésie) sont bénins et disparaissent en 30–60 minutes.",
      "La bêta-alanine agit par accumulation chronique de carnosine sur plusieurs semaines (3,2–6,4 g/j).",
      "Elle cible surtout les efforts intenses soutenus durant 1 à 4 minutes."],
     [{"question": "Peut-on réduire les picotements de la bêta-alanine ?", "answer": "Oui : prenez le produit pendant ou après un petit repas ou fractionnez en deux prises de 1,6 g."}]),

    ("electrolytes-sodium-potassium-sport-chaleur", "Électrolytes (sodium, potassium) : sport et chaleur",
     "Quand utiliser des électrolytes à l'entraînement : pertes sudorales sous la chaleur tunisienne, rôle du sodium, potassium et magnésium.",
     "En été ou lors de séances intenses, l'eau plate ne suffit plus toujours à compenser les pertes minérales de la sueur. Voici quand les électrolytes deviennent utiles.",
     [("Ce que vous perdez réellement dans la sueur", [
         "La transpiration refroidit le corps, mais elle entraîne aussi des minéraux essentiels appelés **électrolytes** : principalement du **sodium et du chlore** (environ 800 à 1200 mg de sodium par litre de sueur en moyenne, avec de fortes variations individuelles), ainsi que de plus petites quantités de potassium, magnésium et calcium."
     ]),
      ("Quand l'eau seule suffit, et quand ajouter des électrolytes", [
          "Pour une séance de musculation classique de 60 minutes en salle climatisée, de l'eau fraîche et une alimentation normalement salée suffisent largement.",
          "En revanche, dès que l'effort dépasse 60–90 minutes par **forte chaleur estivale (> 30 °C)** en Tunisie (running, football, vélo, tennis, cross-training en salle non climatisée), boire uniquement de grandes quantités d'eau pure sans sodium dilue les électrolytes sanguins et favorise fatigue et crampes. Ajouter une boisson d'effort contenant sodium (400–700 mg/L), potassium et glucides légers dans votre gourde devient alors très pertinent (voir [hydratation à l'entraînement](/conseils/hydratation-avant-pendant-apres-entrainement))."
      ]),
      ("Recette maison simple vs formules prêtes", [
          "Les poudres et comprimés effervescents du rayon [Pre-Workout & Énergie](/pre-workout) offrent un ratio équilibré et un goût agréable. En dépannage simple : 500 ml d'eau + une petite pincée de sel de table (~1 g de sel = ~400 mg de sodium) + un trait de jus de citron."
      ])],
     ["Le sodium est le principal électrolyte perdu dans la sueur (~800–1200 mg/L).",
      "Utile surtout pour les efforts > 60–90 min ou sous forte chaleur estivale.",
      "Pour 45 min de musculation en salle climatisée, l'eau plate suffit généralement."],
     [{"question": "Boire de l'eau riche en sodium est-il mauvais pour la tension ?", "answer": "Chez un sportif sain qui transpire abondamment pendant l'effort, compenser le sodium perdu aide l'hydratation ; en cas d'hypertension suivie médicalement, demandez l'avis de votre médecin."}]),

    ("hydratation-avant-pendant-apres-entrainement", "Hydratation à l'entraînement : avant, pendant, après",
     "Protocole chiffré d'hydratation sportive selon l'ACSM : apports pré-séance, pendant l'effort et réhydratation post-entraînement en été.",
     "Une baisse d'hydratation de seulement 2 % du poids de corps réduit déjà la force et la concentration. Voici les repères chiffrés pour chaque phase.",
     [("L'impact réel de 2 % de déshydratation sur la séance", [
         "Selon les recommandations de l'American College of Sports Medicine (ACSM), une perte hydrique équivalente à **2 % du poids corporel** (soit seulement 1,5 kg pour un sportif de 75 kg) suffit à augmenter la fréquence cardiaque à l'effort, altérer la perception de la difficulté et diminuer l'endurance ainsi que la précision technique."
     ]),
      ("Protocole simple en 3 temps", [
          "**Avant la séance (2 h avant)** : buvez tranquillement 400 à 500 ml d'eau pour arriver hydraté (urines jaune pâle, pas transparentes à l'excès).",
          "**Pendant l'effort** : buvez par petites gorgées régulières (150 à 200 ml toutes les 15–20 minutes, soit ~500 à 800 ml par heure selon la chaleur). Évitez de boire 1 litre d'un coup pour ne pas alourdir l'estomac.",
          "**Après l'entraînement** : réhydratez-vous progressivement au cours des 2 heures suivantes avec votre shaker de récupération ou un repas accompagné de 500 à 750 ml d'eau. Si vous utilisez de la créatine ou un [pre-workout](/pre-workout), ces prises hydriques s'intègrent naturellement."
      ])],
     ["2 % de perte hydrique réduit déjà l'endurance et la concentration.",
      "Buvez 400–500 ml 2 h avant, puis de petites gorgées régulières pendant la séance.",
      "Observez la couleur des urines (jaune paille clair) comme indicateur simple au quotidien."],
     [{"question": "L'eau glacée pendant le sport est-elle déconseillée ?", "answer": "Une eau fraîche (10–15 °C) est très bien tolérée et agréable en été ; évitez simplement l'eau glacée avalée trop vite en grosses gorgées."}]),

    ("securite-pre-workout-stimulants-coeur", "Sécurité des pre-workout : stimulants et précautions",
     "Précautions cardiovasculaires avec les pre-workout caféinés, risque de cumul café + booster, tension artérielle et règles d'or d'utilisation.",
     "Un booster trop dosé en stimulants peut provoquer palpitations, nervosité ou insomnie. Voici les règles de sécurité indispensables avant d'en utiliser.",
     [("Attention au cumul caché de stimulants", [
         "Un expresso serré le matin (~80 mg de caféine), un café l'après-midi (~80 mg) et un pre-workout à 300 mg de caféine portent déjà votre total à 460 mg — au-dessus du repère de sécurité de l'EFSA de **400 mg par jour** chez l'adulte sain !",
         "Vérifiez aussi la présence d'autres stimulants ou extraits (synéphrine, yohimbine, théobromine) sur la liste des ingrédients. Choisissez des formules simples et transparentes dans notre rayon [Pre-Workout & Énergie](/pre-workout)."
      ]),
      ("Contre-indications et signaux d'alerte à l'effort", [
          "Les pre-workout stimulants sont **déconseillés** chez les personnes souffrant d'hypertension artérielle non contrôlée, de troubles du rythme cardiaque, d'anxiété sévère, chez les femmes enceintes ou allaitantes et chez les mineurs. Si vous ressentez palpitations, vertiges ou malaise pendant une séance, arrêtez immédiatement l'exercice et consultez un médecin."
      ]),
      ("La règle de la demi-dose pour tout nouveau pot", [
          "Testez toujours votre tolérance avec **½ scoop** les 2 ou 3 premières séances, et privilégiez les formules sans caféine (citrulline + électrolytes) les jours de séance tardive."
      ])],
     ["Ne dépassez pas ~400 mg de caféine au total sur la journée (café + booster inclus).",
      "Déconseillés en cas d'hypertension, troubles cardiaques, grossesse ou chez les mineurs.",
      "Commencez toujours tout nouveau pre-workout par une demi-dose."],
     [{"question": "Est-il dangereux de prendre un pre-workout tous les jours ?", "answer": "Les stimulants quotidiens créent rapidement une accoutumance et fatiguent le sommeil s'ils sont pris tard : réservez les boosters caféinés aux grosses séances matinales."}]),

    ("choisir-pre-workout-composition-verifiee", "Choisir un pre-workout selon sa composition vérifiée",
     "Matrice pratique pour choisir votre pre-workout : matin vs soir, force vs cardio, formule avec caféine vs sans stimulants (pump).",
     "Plutôt que de choisir au hasard une boîte fluo, sélectionnez votre pre-workout selon votre horaire d'entraînement et sa composition exacte.",
     [("Étape 1 : À quelle heure vous entraînez-vous ?", [
         "**Entraînement le matin ou avant 16 h** : une formule classique contenant 150–250 mg de caféine + L-citrulline + bêta-alanine convient si vous tolérez bien le café.",
         "**Entraînement après 17 h–18 h** : optez pour un booster **sans caféine (« stim-free »)** axé sur la citrulline et les électrolytes pour ne pas perturber l'endormissement (voir [caféine et sommeil](/conseils/cafeine-dans-les-pre-workout-dosage-tolerance))."
     ]),
      ("Étape 2 : Force/musculation vs endurance/chaleur", [
          "En musculation, la priorité va à la citrulline (4–6 g) pour la congestion et à une énergie maîtrisée. En sports d'endurance ou sous la chaleur estivale tunisienne, misez plutôt sur l'hydratation et les [électrolytes](/conseils/electrolytes-sodium-potassium-sport-chaleur)."
      ]),
      ("Étape 3 : Vérifier la transparence dans notre rayon Pre-Workout", [
          "Inspectez chaque ingrédient ligne par ligne dans [Pre-Workout & Énergie](/pre-workout) en appliquant les critères de [lire une étiquette de pre-workout](/conseils/lire-etiquette-pre-workout-matrice-proprietary)."
      ])],
     ["Séances après 17 h -> privilégiez un pre-workout sans caféine.",
      "Vérifiez les dosages exacts : 4–6 g de L-citrulline (ou 6–8 g malate 2:1) et caféine affichée.",
      "Réservez les formules stimulantes aux séances intenses où vous en avez réellement besoin."],
     [{"question": "Un café noir + une banane avant le sport peut-il remplacer un pre-workout ?", "answer": "Oui ! Pour beaucoup de pratiquants, un expresso et une collation glucidique 45 min avant la séance donnent un excellent résultat à moindre coût."}]),
]

batch9 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B9_SPECS]
with open("scripts/batches/batch_09.json", "w", encoding="utf-8") as f:
    json.dump(batch9, f, ensure_ascii=False, indent=2)
print(f"Created batch_09.json ({len(batch9)} articles).")
