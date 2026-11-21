# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 10: 10 Guides d'achat des compléments en Tunisie
B10_SPECS = [
    ("verifier-authenticite-complements-tunisie-checklist", "Vérifier l'authenticité d'un complément : 7 points",
     "Checklist en 7 points pour vérifier l'authenticité d'un complément alimentaire en Tunisie : scellé thermique, opercule, numéro de lot et facture.",
     "Protégez votre santé et votre budget : voici les 7 vérifications simples à faire dès la réception de votre colis en Tunisie.",
     [("1. Scellé thermique extérieur et opercule intérieur intact", [
         "Tout pot ou flacon neuf doit posséder une bague de sécurité ou un film plastique rétractable autour du bouchon, ainsi qu'un opercule en carton ou aluminium collé sur le goulot sous le couvercle. Ne consommez jamais un produit dont l'opercule est percé ou décollé à la livraison."
     ]),
      ("2. Numéro de lot et date (DDM) imprimés au jet d'encre", [
          "Les véritables fabricants impriment le numéro de lot (Batch / Lot) et la date de péremption directement sur le plastique au jet d'encre laser ou thermique. Un autocollant papier grossier collé par-dessus une date effacée est un signal d'alerte."
      ]),
      ("3. Qualité d'impression de l'étiquette et orthographe", [
          "Les contrefaçons trahissent souvent des fautes d'orthographe grossières en anglais ou français, des couleurs délavées ou un tableau nutritionnel incohérent (ex. calories qui ne correspondent pas aux grammes de protéines/glucides/lipides)."
      ]),
      ("4. QR code / hologramme officiel et circuit de distribution", [
          "Plusieurs marques internationales intègrent un code de vérification sur leur site officiel. Enfin, achetez uniquement auprès d'une enseigne transparente proposant un suivi client joignable et une traçabilité claire comme notre catalogue [Compléments Alimentaires](/complements-alimentaires) (voir aussi [vérifier les informations du fabricant](/conseils/verifier-informations-fabricant-origine-tracabilite))."
      ])],
     ["Vérifiez toujours la bague de sécurité extérieure et l'opercule interne à la réception.",
      "Contrôlez l'impression nette du numéro de lot et de la DDM.",
      "Fuyez les prix anormalement bas sans traçabilité ni facture."],
     [{"question": "Que faire si la poudre a une couleur légèrement différente d'un pot précédent ?", "answer": "Les variations légères de teinte naturelle entre deux lots peuvent exister sur les extraits végétaux, mais une odeur suspecte ou un défaut d'opercule doivent faire contacter le service client."}]),

    ("lire-liste-ingredients-additifs-complements", "Lire une liste d'ingrédients : actifs et excipients",
     "Comment décoder la liste des ingrédients d'un complément alimentaire : ordre décroissant, excipients (cellulose, stéarate de magnésium) et édulcorants.",
     "Au-delà du principe actif principal, les gélules et poudres contiennent des excipients. Voici comment distinguer les additifs normaux des ajouts superflus.",
     [("La règle universelle : l'ordre pondéral décroissant", [
         "Sur tout complément conforme, les ingrédients sont classés du plus lourd au plus léger. Si vous achetez un complexe de magnésium ou de collagène et que la « maltodextrine » ou le « dextrose » apparaît avant l'actif principal, vous achetez surtout du sucre de remplissage !"
     ]),
      ("Comprendre les excipients techniques courants", [
          "En fabrication pharmaceutique et nutritionnelle, certains excipients en très faible quantité assurent la stabilité et la précision de dosage des gélules : la **cellulose microcristalline** (fibre végétale neutre servant de charge inerte), le **stéarate de magnésium** ou les sels de magnésium d'acides gras (lubrifiant permettant à la poudre de ne pas coller aux machines d'encapsulation), et le **dioxyde de silicium** (antiagglomérant contre l'humidité).",
          "Ces excipients techniques sont autorisés et sans danger aux doses réglementaires d'un complément sérieux du rayon [Compléments Alimentaires](/complements-alimentaires)."
      ]),
      ("Édulcorants, arômes et colorants dans les poudres", [
          "Les poudres aromatisées utilisent fréquemment du sucralose ou de la stévia (glycosides de stéviol) pour sucrer sans calories. Si vous préférez limiter les additifs esthétiques, privilégiez les gélules transparentes sans colorants (éviter le dioxyde de titane E171, interdit dans l'UE) et les poudres nature."
      ])],
     ["Les ingrédients sont toujours listés par poids décroissant.",
      "Cellulose et stéarate de magnésium sont des excipients techniques courants en micro-quantités.",
      "Privilégiez les formules sans colorants superflus ni sucres de remplissage."],
     [{"question": "Le stéarate de magnésium bloque-t-il l'absorption des vitamines ?", "answer": "Non : aux minuscules quantités présentes dans une gélule (< 1–2 %), aucune étude humaine sérieuse ne montre de blocage de l'absorption."}]),

    ("calculer-cout-par-portion-tnd-complements", "Comparer les compléments en TND : coût par dose",
     "Comment calculer le coût réel par jour ou par portion en Dinars Tunisiens sur la créatine, le magnésium, les oméga-3 et les protéines.",
     "Deux flacons au même prix en Dinars peuvent durer 20 jours ou 60 jours. Voici la méthode simple pour toujours payer le juste prix à la dose.",
     [("Le piège du « prix du flacon » sans la durée de cure", [
         "Sur le marché tunisien, les acheteurs comparent souvent deux produits uniquement sur le prix affiché (par exemple 70 DT vs 85 DT). C'est une erreur fréquente : le flacon à 70 DT peut ne contenir que 30 gélules nécessitant 2 gélules par jour (soit **15 jours de cure** = 4,660 DT/jour), tandis que le flacon à 85 DT contient 90 comprimés à 1 par jour (soit **90 jours de cure** = 0,944 DT/jour) !"
     ]),
      ("Exemples concrets sur 3 familles du rayon Compléments Alimentaires", [
          "**Créatine** : divisez le prix du pot par (grammes nets / 3 g). Un pot de 300 g à 75 DT revient à 0,750 DT/jour.",
          "**Magnésium** : calculez le prix pour **200 mg de magnésium élémentaire** par jour, pas le prix de la boîte.",
          "**Oméga-3** : calculez le prix pour **500 mg d'EPA+DHA** combinés par jour.",
          "En appliquant ce réflexe dans notre catégorie [Compléments Alimentaires](/complements-alimentaires), vous identifiez instantanément les formats les plus rentables (voir aussi [construire une routine sans gaspillage](/conseils/construire-routine-complements-sans-gaspillage))."
      ])],
     ["Ramenez toujours le prix en TND à une journée de cure à la dose efficace.",
      "Vérifiez le nombre de gélules par portion (1 vs 2 ou 3 gélules).",
      "Les grands formats en poudre (whey, créatine, collagène) abaissent nettement le coût journalier."],
     [{"question": "Pourquoi les grands pots sont-ils presque toujours plus rentables ?", "answer": "Parce que les coûts fixes de flaconnage, d'étiquetage et de transport pèsent proportionnellement moins sur un format de 60 à 100 doses."}]),

    ("stocker-complements-climat-chaud-tunisie", "Stocker ses compléments sous le climat tunisien",
     "Protéger ses compléments alimentaires de la chaleur et de l'humidité estivales en Tunisie : whey, créatine, oméga-3, probiotiques et salle de bain.",
     "De juin à septembre en Tunisie, la chaleur et l'humidité côtière dégradent vite certains compléments mal rangés. Voici les règles de stockage.",
     [("Les 3 pires endroits où ranger vos pots", [
         "1. **La salle de bain** : chaque douche chaude crée un pic d'humidité qui fait durcir la créatine, les poudres de pré-workout et les comprimés.",
         "2. **Le dessus du réfrigérateur ou près du four** : la chaleur dégagée en continu accélère l'oxydation des huiles (Oméga-3) et fragilise les vitamines.",
         "3. **Le coffre d'une voiture en été** : en plein soleil, la température dépasse 50 °C en moins d'une heure."
     ]),
      ("Les règles adaptées à chaque famille de produits", [
          "**Poudres (Whey, Créatine, Collagène, Pre-workout)** : placard sec et ombragé (< 25 °C), couvercle vissé à fond, sachet de silice déshydratant laissé à l'intérieur. Ne jamais y plonger une cuillère mouillée !",
          "**Huiles (Oméga-3) et Probiotiques** : au réfrigérateur (4–8 °C, bouchon hermétique) dès que la température ambiante dépasse 25 °C en été (voir [conserver ses Oméga-3](/conseils/conserver-omega-3-chaleur-lumiere-frigo)).",
          "Découvrez tous nos produits conservés en entrepôt tempéré dans [Compléments Alimentaires](/complements-alimentaires)."
      ])],
     ["Évitez salle de bain, dessus du frigo, rebord de fenêtre et voiture en été.",
      "Laissez toujours le sachet absorbeur d'humidité dans vos pots de poudre.",
      "Placez Oméga-3 et probiotiques au réfrigérateur durant les mois chauds."],
     [{"question": "Que faire si mon pre-workout ou ma créatine a légèrement durci ?", "answer": "C'est généralement dû à l'humidité ambiante : si la DDM est bonne et l'odeur normale, émiettez à la cuillère sèche et refermez hermétiquement."}]),

    ("comparer-formats-poudre-gelules-comprimes-liquide", "Poudre, gélules, comprimés ou liquide : choisir",
     "Comparaison objective des formes galéniques : quand privilégier la poudre (whey, créatine, collagène) vs les gélules/comprimés ou ampoules.",
     "Le format d'un complément influence directement la dose maximale possible, le goût, le coût et la stabilité. Voici comment choisir le bon format.",
     [("1. La poudre : incontournable dès que la dose dépasse 2 à 3 grammes", [
         "Dès qu'un nutriment nécessite plusieurs grammes par jour — **whey protéine (25–30 g)**, **collagène (5–10 g)**, **citrulline (4–6 g)**, **créatine (3–5 g)** — la poudre est imbattable. Elle évite d'avaler 6 à 10 grosses gélules et divise le prix par deux ou trois."
     ]),
      ("2. Gélules et comprimés : rois de la précision sous 1 gramme", [
          "Pour les plantes titrées (**ashwagandha** 300–600 mg), les minéraux (**magnésium bisglycinate**, **zinc**) ou les **vitamines**, la gélule protège de l'amertume et garantit une dose exacte sans balance ni cuillère. Les gélules molles (softgels) sont quant à elles indispensables pour les actifs huileux comme les **Oméga-3** et la **vitamine D3**."
      ]),
      ("3. Formes liquides et gouttes", [
          "Utiles pour les enfants, les personnes ayant des difficultés à avaler, ou la vitamine D3 en gouttes, mais souvent plus chères et moins stables après ouverture. Parcourez tous les formats dans notre sélection [Compléments Alimentaires](/complements-alimentaires)."
      ])],
     ["Dose > 2 g/jour (whey, collagène, créatine, citrulline) -> choisissez la poudre.",
      "Dose < 1 g/jour (ashwagandha, zinc, vitamines, magnésium) -> les gélules sont plus pratiques.",
      "Actifs huileux (Oméga-3, D3) -> capsules molles (softgels) ou gouttes huileuses."],
     [{"question": "Les comprimés s'absorbent-ils moins bien que les gélules ?", "answer": "Les comprimés de qualité se délitent dans l'estomac en 15–30 minutes tout comme les gélules ; l'enveloppe gélatine/végétale des gélules contient simplement moins de liants."}]),

    ("verifier-informations-fabricant-origine-tracabilite", "Vérifier le fabricant : origine, normes et traçabilité",
     "Comment identifier un fabricant sérieux sur un flacon de complément alimentaire : mentions légales, normes GMP, HACCP, ISO 22000 et pays d'origine.",
     "Une étiquette sérieuse permet toujours de remonter jusqu'au fabricant responsable. Voici les mentions réglementaires et certifications à vérifier.",
     [("Les mentions obligatoires d'un fabricant transparent", [
         "Un emballage conforme doit afficher : la raison sociale et l'adresse postale complète du fabricant ou du distributeur responsable (en Union européenne, aux États-Unis, au Royaume-Uni ou localement), le pays d'origine, la liste complète des ingrédients, les allergènes en gras, les précautions d'emploi et le numéro de lot."
     ]),
      ("Décrypter les normes qualité : GMP, HACCP et ISO 22000", [
          "**GMP (Good Manufacturing Practices / BPF)** garantit des procédures strictes de contrôle des matières premières, d'hygiène et de dosage entre les lots. **HACCP** et **ISO 22000** attestent d'une maîtrise des risques sanitaires alimentaires tout au long de la chaîne de production.",
          "Sur notre rayon [Compléments Alimentaires](/complements-alimentaires), nous privilégions les marques internationales et laboratoires établis respectant ces standards, en complément de la checklist [vérifier l'authenticité en Tunisie](/conseils/verifier-authenticite-complements-tunisie-checklist)."
      ])],
     ["Exigez le nom et l'adresse complète du fabricant/responsable sur l'étiquette.",
      "Les certifications GMP, HACCP et ISO 22000 attestent de contrôles qualité industriels.",
      "Méfiez-vous des produits anonymes sans numéro de lot ni mention d'allergènes."],
     [{"question": "« Fabriqué en UE » garantit-il la qualité ?", "answer": "La fabrication européenne soumet le produit aux normes EFSA et aux contrôles sanitaires européens stricts, ce qui offre un excellent socle de sécurité."}]),

    ("comprendre-numero-lot-date-peremption-ddm", "Numéro de lot et DDM / DLC : comprendre les dates",
     "Différence entre DDM (à consommer de préférence avant) et DLC sur les compléments : stabilité des poudres sèches vs huiles et probiotiques.",
     "Votre pot arrive près de sa date limite ? Comprendre la différence entre DDM et DLC permet d'éviter le gaspillage sans prendre de risque.",
     [("DDM (« À consommer de préférence avant fin... ») vs DLC", [
         "La quasi-totalité des compléments alimentaires (whey, créatine, gélules de vitamines, minéraux) porte une **DDM (Date de Durabilité Minimale)** et non une DLC (Date Limite de Consommation réservée aux produits frais périssables).",
         "Une DDM dépassée de quelques semaines sur un pot sec resté fermé et bien stocké signifie qu'une légère baisse de goût ou de teneur vitaminique est possible, sans danger microbiologique immédiat — à condition qu'il n'y ait ni humidité ni odeur anormale."
     ]),
      ("Les exceptions sensibles où la date compte vraiment", [
          "Pour les **Oméga-3**, une huile proche ou au-delà de sa DDM risque davantage l'oxydation (rancissement). Pour les **probiotiques**, la DDM correspond au moment jusqu'auquel les milliards d'UFC vivantes sont garanties. Vérifiez toujours ces dates et nos conseils de [stockage sous climat chaud](/conseils/stocker-complements-climat-chaud-tunisie) avant d'acheter dans [Compléments Alimentaires](/complements-alimentaires)."
      ])],
     ["La majorité des compléments secs portent une DDM (qualité optimale), pas une DLC périssable.",
      "Pour Oméga-3 et probiotiques, respectez strictement la DDM pour la fraîcheur et la viabilité.",
      "Le numéro de lot permet la traçabilité complète auprès du fabricant."],
     [{"question": "Que signifie la mention « EXP 11/2027 » sur un pot américain ?", "answer": "Le produit conserve ses spécifications optimales jusqu'à la fin du mois indiqué (novembre 2027)."}]),

    ("eviter-surdosage-cumul-plusieurs-complements", "Cumuler plusieurs compléments : éviter le surdosage",
     "Comment additionner les apports en vitamine B6, zinc, vitamine D et caféine quand on prend plusieurs compléments pour éviter le cumul excessif.",
     "Prendre 3 ou 4 flacons en parallèle crée souvent des doublons cachés (vitamine B6, zinc, caféine). Voici la méthode pour vérifier votre routine.",
     [("Les 4 doublons les plus fréquents chez les sportifs", [
         "1. **Vitamine B6** : présente à la fois dans le multivitamine, le magnésium B6, le ZMA et parfois le pré-workout ! Cumulée à très haute dose (> 25–50 mg/j sur plusieurs mois), elle peut devenir neurotoxique (plafond EFSA récent abaissé à 12 mg/j).",
         "2. **Zinc** : souvent présent dans le multivitamine + le ZMA + un complément immunité, risquant de dépasser le plafond de 25 mg/j.",
         "3. **Caféine** : cumulée entre café, pre-workout et brûleur de graisse.",
         "4. **Vitamine D3** : présente dans l'huile de foie de morue, le multivitamine et une gélule de D3."
     ]),
      ("La règle des 5 minutes : l'inventaire sur papier", [
          "Posez tous vos flacons sur la table et additionnez les colonnes **B6, Zinc, D3, Magnésium et Caféine** sur la dose journalière totale. Supprimez les redondances et privilégiez les actifs unitaires ciblés dans notre rayon [Compléments Alimentaires](/complements-alimentaires)."
      ])],
     ["Additionnez toujours B6, Zinc, Vitamine D3 et Caféine sur l'ensemble de vos flacons.",
      "Évitez de cumuler multivitamines + ZMA + booster très dosé en B6/zinc.",
      "Les actifs unitaires ciblés limitent les doublons."],
     [{"question": "Est-il risqué de prendre créatine + whey + magnésium ensemble ?", "answer": "Non, ces trois références n'ont aucun ingrédient redondant entre elles ; la vigilance porte surtout sur les complexes multi-ingrédients."}]),

    ("evaluer-promesses-marketing-complements-alimentaires", "Décrypter le marketing des compléments alimentaires",
     "Comment repérer les promesses exagérées et allégations illégales sur les compléments : signaux d'alerte, avant/après trompeurs et vérifications.",
     "Le marketing de la nutrition regorge de promesses spectaculaires. Voici comment garder un esprit critique et repérer les produits sérieux.",
     [("Les 4 signaux d'alerte d'un marketing trompeur", [
         "1. **Promesses médicales miraculeuses** : aucun complément alimentaire légal ne « guérit » une maladie, ne « fait fondre 10 kg en 15 jours » ni ne « double la testostérone ».",
         "2. **Tableaux nutritionnels absents ou opaques** : impossible de vérifier les milligrammes exacts (voir [matrices propriétaires](/conseils/lire-etiquette-pre-workout-matrice-proprietary)).",
         "3. **Absence de référence à l'alimentation ou à l'effort** : un produit sérieux rappelle qu'il complète une hygiène de vie.",
         "4. **Faux avis ou photos avant/après irréalistes**."
     ]),
      ("Comment distinguer une information fiable sur ParaTunisie", [
          "Appuyez-vous sur les allégations nutritionnelles et de santé scientifiquement évaluées (EFSA, NIH), comparez les fiches techniques complètes dans [Compléments Alimentaires](/complements-alimentaires) en vérifiant les milligrammes exacts par portion, et demandez toujours conseil à un professionnel de santé en cas de symptôme médical persistant. Prenez également l'habitude de vérifier les sources scientifiques citées en bas d'article."
      ])],
     ["Fuyez tout produit promettant de guérir une maladie ou une perte de poids sans effort.",
      "Exigez un tableau nutritionnel complet avec les dosages exacts en mg ou g.",
      "Fiez-vous aux sources indépendantes (NIH, EFSA, PubMed) plutôt qu'aux slogans."],
     [{"question": "Pourquoi les fiches produits sérieuses restent-elles mesurées dans leurs descriptions ?", "answer": "Parce que la réglementation et l'éthique scientifique interdisent d'attribuer des propriétés médicales ou des résultats irréalistes à un complément alimentaire."}]),

    ("construire-routine-complements-sans-gaspillage", "Construire une routine de compléments sans gaspillage",
     "Comment hiérarchiser ses achats de compléments en Tunisie selon son budget et ses besoins avérés, sans multiplier les pots inutiles.",
     "Inutile de dépenser 400 DT par mois en 8 pots différents. Voici la pyramide rationnelle pour ne garder que l'essentiel utile.",
     [("Niveau 0 : Les fondations gratuites (85 % des résultats)", [
         "Aucun pot ne compense 5 heures de sommeil, un manque d'eau ou une assiette déséquilibrée. Avant tout achat, stabilisez vos repas, votre hydratation et votre régularité à l'entraînement."
     ]),
      ("Niveau 1 : Les 1 à 3 compléments réellement ciblés", [
          "**Si vous faites de la musculation / force** : une [créatine monohydrate](/creatine) (3–5 g/j) et, uniquement si vos apports alimentaires en protéines sont insuffisants, une [whey protéine](/whey-proteine).",
          "**Pour l'équilibre général / bien-être** : un [magnésium bisglycinate](/magnesium) ou des [oméga-3](/omega-3) si vous mangez peu de poissons gras, plus de la [vitamine D3](/vitamines) en hiver sur avis/bilan.",
          "Tout le reste (boosters sophistiqués, acides aminés isolés si vous mangez déjà assez de protéines, multiples complexes redondants) reste purement optionnel. Parcourez nos essentiels dans [Compléments Alimentaires](/complements-alimentaires)."
      ])],
     ["Commencez toujours par l'alimentation, le sommeil et la régularité sportive.",
      "Limitez votre routine à 1 à 3 références ciblées répondant à un besoin précis.",
      "Évaluez chaque cure après 4 à 8 semaines avant de renouveler ou d'ajouter un autre produit."],
     [{"question": "Quel budget mensuel réaliste prévoir pour une routine simple en Tunisie ?", "answer": "Une routine ciblée (par exemple créatine + magnésium ou oméga-3) revient généralement autour de 50 à 95 DT par mois selon les formats."}]),
]

batch10 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B10_SPECS]
with open("scripts/batches/batch_10.json", "w", encoding="utf-8") as f:
    json.dump(batch10, f, ensure_ascii=False, indent=2)
print(f"Created batch_10.json ({len(batch10)} articles).")
