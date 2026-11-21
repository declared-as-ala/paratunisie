# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 8: Remaining 4 Vitamines & Minéraux + first 6 Probiotiques & Digestion
B8_SPECS = [
    ("multivitamines-quand-sont-elles-pertinentes", "Multivitamines : comment évaluer leur utilité ?",
     "Comment analyser un complexe multivitamines : repérer les formes actives (B9 méthylée, D3, bisglycinates), éviter les méga-doses inutiles et ajuster au besoin.",
     "Toutes les formules multivitamines ne se valent pas. Apprenez à distinguer une formule équilibrée d'un mélange surdosé ou mal biodisponible.",
     [("Quand un multivitamine peut-il avoir un intérêt pratique ?", [
         "Une formule multivitaminée n'est pas obligatoire si votre alimentation est riche en fruits, légumes, protéines et céréales complètes. En revanche, lors d'une phase de déficit calorique prolongé (sèche), d'une alimentation monotone en déplacement ou d'entraînements très fréquents, un complexe bien dosé dans notre rayon [Vitamines](/vitamines) peut jouer le rôle de filet de sécurité modéré."
     ]),
      ("Les 4 signes d'une formule multivitaminée de qualité", [
          "1. **Des dosages raisonnables (50 à 200 % VNR)** plutôt que des méga-doses à 3000 % de vitamines B inutiles. 2. **Des formes bien assimilées** : vitamine D3 (plutôt que D2), vitamines B actives (méthylcobalamine, B9 méthylée), minéraux chélatés (bisglycinate/citrate de zinc) plutôt que de simples oxydes.",
          "3. **Absence de fer et de cuivre par défaut** (sauf formule spécifique sur besoin avéré), afin d'éviter une surcharge en fer inutile chez l'homme ou la femme ménopausée. 4. **Vitamine A sous forme bêta-carotène** plutôt que rétinol pur à forte dose."
      ]),
      ("Pourquoi le magnésium et le calcium sont toujours sous-dosés dans un multivitamine", [
          "Une gélule unique ne peut physiquement pas contenir 300 mg de magnésium ni 800 mg de calcium en plus des vitamines. Si vous manquez de magnésium, complétez séparément (voir [interactions entre vitamines et minéraux](/conseils/interactions-entre-vitamines-et-mineraux))."
      ])],
     ["Un multivitamine utile vise 50–200 % VNR avec des formes chélatées, pas des méga-doses excessives.",
      "Chez l'adulte sans carence avérée en fer, préférez un multivitamine sans fer ajouté.",
      "Les multivitamines ne couvrent jamais un besoin élevé en magnésium ou en oméga-3."],
     [{"question": "Faut-il prendre son multivitamine à jeun ou au petit-déjeuner ?", "answer": "Toujours au cours d'un repas (petit-déjeuner ou déjeuner) contenant un peu de lipides afin d'absorber les vitamines A, D, E et K et d'éviter les nausées liées au zinc."}]),

    ("interactions-entre-vitamines-et-mineraux", "Interactions entre nutriments : fer, calcium, zinc",
     "Quels nutriments entrent en compétition (fer/calcium, zinc/cuivre, thé/fer) et quelles synergies améliorent l'absorption (vitamine C/fer, D3/calcium) ?",
     "Prendre tous ses compléments en même temps peut réduire leur efficacité. Voici les principales compétitions et synergies d'absorption à connaître.",
     [("Les compétitions d'absorption à espacer d'au moins 2 heures", [
         "1. **Fer et Calcium** : le calcium freine l'absorption intestinale du fer (héminique et non héminique) lorsqu'ils sont pris ensemble. Espacez votre laitage ou calcium d'au moins 2 heures de votre supplément de fer.",
         "2. **Zinc et Cuivre** : une forte dose de zinc (> 25–30 mg/j) stimule la synthèse de métallothionéine intestinale qui bloque le passage du cuivre.",
         "3. **Thé, café et fer / zinc** : les polyphénols et tanins du thé vert, du thé noir et du café réduisent fortement l'absorption du fer végétal ou en gélule. Prenez votre fer à distance du thé."
     ]),
      ("Les synergies positives à favoriser", [
          "À l'inverse, certaines associations sont bénéfiques : la **vitamine C** transforme le fer ferrique en fer ferreux mieux absorbé ; la **vitamine D3** stimule la synthèse des transporteurs du calcium ; et le **magnésium** active les enzymes du métabolisme de la vitamine D."
      ]),
      ("Organiser simplement sa journée", [
          "Si vous utilisez plusieurs compléments de nos rayons [Vitamines](/vitamines) et [Minéraux](/mineraux) : placez vitamines / oméga-3 au déjeuner, et magnésium au dîner. Si un médecin vous a prescrit du fer, prenez-le à distance du café et des laitages."
      ])],
     ["Espacez le fer du calcium, du thé et du café d'au moins 2 heures.",
      "Ne dépassez pas 25 mg/j de zinc sur la durée pour protéger votre statut en cuivre.",
      "La vitamine C améliore l'absorption du fer ; la vitamine D soutient celle du calcium."],
     [{"question": "Puis-je prendre magnésium et zinc ensemble le soir ?", "answer": "Aux doses nutritionnelles modérées (ex. 150–200 mg magnésium + 10–15 mg zinc), l'association est courante (type ZMA) et bien tolérée au dîner."}]),

    ("comprendre-vnr-et-unites-ui-mcg-etiquettes", "Comprendre % VNR, UI, µg et mg sur les étiquettes",
     "Convertir les UI en microgrammes (µg) pour la vitamine D et E, comprendre les % VNR et vérifier les portions de référence des compléments.",
     "UI, µg, mg et % VNR peuvent vite dérouter devant un tableau nutritionnel. Voici le guide de conversion clair pour comparer n'importe quel flacon.",
     [("mg vs µg (mcg) : attention au facteur 1000", [
         "1 milligramme (mg) vaut 1000 microgrammes (µg, parfois noté mcg sur les étiquettes anglophones). Les minéraux majeurs (magnésium, calcium) et la vitamine C s'expriment en **mg**. La vitamine B12, l'acide folique (B9), la biotine (B8), le sélénium et la vitamine D s'expriment en **µg** (ou UI)."
     ]),
      ("Convertir les UI (Unités Internationales) en µg", [
          "Pour la **vitamine D3** : la règle exacte est **1 µg = 40 UI** (et 1000 UI = 25 µg ; 2000 UI = 50 µg ; 4000 UI = 100 µg). Ainsi, un flacon indiquant 2000 UI apporte 50 µg de vitamine D3, soit 1000 % de la VNR officielle de 5 µg !"
      ]),
      ("Que signifie le % VNR (Valeurs Nutritionnelles de Référence) ?", [
          "Les VNR sont des repères réglementaires européens destinés à l'étiquetage pour comparer facilement les produits (par exemple : Vitamine C = 80 mg, Magnésium = 375 mg, Zinc = 10 mg, Vitamine D = 5 µg). Un produit affichant 100 % VNR couvre le repère réglementaire standard — même si certains besoins individuels (comme la vitamine D en hiver) peuvent être ajustés avec un professionnel de santé. Explorez nos fiches transparentes dans [Vitamines](/vitamines)."
      ])],
     ["1 mg = 1000 µg (mcg) ; pour la vitamine D3, divisez les UI par 40 pour obtenir les µg.",
      "1000 UI de vitamine D3 = 25 µg ; 2000 UI = 50 µg.",
      "Les % VNR servent de repère standardisé pour comparer deux étiquettes."],
     [{"question": "Pourquoi un flacon de vitamine B12 affiche-t-il 4000 % VNR ?", "answer": "Parce que la VNR réglementaire de B12 est de 2,5 µg, tandis que l'absorption active sature vite : les compléments utilisent 100 µg ou plus pour assurer l'absorption passive sans toxicité."}]),

    ("supplementation-vitamines-fondee-sur-preuves", "Supplémentation en vitamines : preuves vs marketing",
     "Approche rationnelle des vitamines selon le NIH : quand un apport ciblé est justifié (D3, B12, folates) vs quand le marketing exagère.",
     "Faut-il prendre des vitamines toute l'année ? Voici une approche nuancée et fondée sur les preuves pour n'acheter que ce qui est utile.",
     [("Ce que disent les grandes revues scientifiques (NIH ODS)", [
         "Pour la population générale ayant accès à une alimentation variée, les grandes études cliniques montrent rarement un bénéfice majeur à avaler des dizaines de vitamines à forte dose sans déficit préalable. L'alimentation reste le vecteur optimal car elle apporte aussi fibres, polyphénols et matrices alimentaires complexes."
     ]),
      ("Les situations où un apport ciblé est réellement documenté", [
          "Certains déficits restent toutefois très fréquents et documentés : la **vitamine D3** en automne/hiver ou chez les travailleurs en intérieur ; la **vitamine B12** chez les végétaliens ; l'**acide folique (B9)** en préconception sur avis médical ; et le **fer** uniquement sur bilan de ferritine bas."
      ]),
      ("Attention aux vitamines liposolubles (A, D, E, K)", [
          "Contrairement aux vitamines hydrosolubles (C et groupe B) dont l'excès modéré part dans les urines, les vitamines A, D, E et K s'accumulent dans les tissus graisseux et le foie. Respectez toujours les limites de sécurité et privilégiez des apports ciblés dans notre rayon [Vitamines](/vitamines) (voir [comprendre les étiquettes](/conseils/comprendre-vnr-et-unites-ui-mcg-etiquettes))."
      ])],
     ["Ciblez les besoins réels (ex. D3 en hiver, B12 en régime végétalien) plutôt que l'accumulation.",
      "Les vitamines liposolubles (A, D, E, K) s'accumulent : ne dépassez pas les doses recommandées.",
      "En cas de fatigue durable, un bilan sanguin médical prime sur l'automédication."],
     [{"question": "Les vitamines donnent-elles un coup de fouet immédiat comme le café ?", "answer": "Non : les vitamines soutiennent le métabolisme énergétique normal sur le moyen terme mais ne sont pas des excitants nerveux."}]),

    # ── PROBIOTIQUES & DIGESTION (6) ──
    ("probiotiques-vs-prebiotiques-differences-roles", "Probiotiques vs prébiotiques : rôles complémentaires",
     "Différence claire entre probiotiques (micro-organismes vivants), prébiotiques (fibres fermentescibles FOS, inuline) et symbiotiques pour le microbiote.",
     "On confond souvent probiotiques et prébiotiques. L'un apporte des bactéries vivantes sélectionnées, l'autre nourrit votre propre flore intestinale.",
     [("Probiotiques : des micro-organismes vivants ciblés", [
         "Selon la définition consensuelle de l'OMS et de l'ISAPP, les **probiotiques** sont des « micro-organismes vivants qui, lorsqu'ils sont administrés en quantités adéquates, confèrent un bénéfice pour la santé de l'hôte ». Il s'agit principalement de bactéries lactiques (*Lactobacillus*, *Bifidobacterium*) ou de levures (*Saccharomyces boulardii*)."
     ]),
      ("Prébiotiques : le carburant sélectif de vos bonnes bactéries", [
          "Les **prébiotiques** ne sont pas des bactéries : ce sont des substrats alimentaires non digestibles (généralement des fibres solubles comme l'inuline, les fructo-oligosaccharides FOS ou les galacto-oligosaccharides GOS) qui arrivent intacts dans le côlon pour nourrir sélectivement les bactéries bénéfiques déjà présentes. Lorsque les deux sont réunis dans une gélule de notre rayon [Probiotiques & Digestion](/probiotiques), on parle de **symbiotique**."
      ]),
      ("Précaution importante en cas d'intestin très irritable", [
          "Si vous êtes sujet aux ballonnements faciles ou au syndrome de l'intestin irritable (sensibilité aux FODMAP), l'ajout brutal de fortes doses de prébiotiques (inuline, FOS) peut augmenter les gaz au début. Commencez progressivement par l'alimentation ou choisissez une formule probiotique sans excès de FOS."
      ])],
     ["Probiotiques = micro-organismes vivants ; Prébiotiques = fibres qui nourrissent la flore.",
      "Un produit combinant les deux s'appelle un symbiotique.",
      "Introduisez les prébiotiques (inuline/FOS) progressivement si votre intestin est sensible."],
     [{"question": "Faut-il obligatoirement un prébiotique avec son probiotique ?", "answer": "Non, une alimentation riche en légumes, légumineuses, avoine et fruits apporte déjà naturellement des fibres prébiotiques variées."}]),

    ("comprendre-souches-bacteriennes-probiotiques", "Souches de probiotiques : genre, espèce et code",
     "Pourquoi le code de souche (ex. Lacticaseibacillus rhamnosus GG) compte plus que le seul nom d'espèce pour évaluer un complément probiotique.",
     "Afficher simplement « Lactobacillus acidophilus » sur une boîte ne suffit pas : les propriétés étudiées dépendent du code précis de la souche.",
     [("Comprendre la carte d'identité à 3 niveaux d'un probiotique", [
         "Prenons l'exemple célèbre *Lacticaseibacillus rhamnosus GG* : **1. Genre** (*Lacticaseibacillus*, anciennement *Lactobacillus*), **2. Espèce** (*rhamnosus*), **3. Souche** (*GG* ou *ATCC 53103*).",
         "Deux souches appartenant exactement à la même espèce *rhamnosus* peuvent avoir une résistance différente à l'acidité gastrique et des propriétés biologiques distinctes dans les essais cliniques. C'est pourquoi les consensus scientifiques (ISAPP, NIH) insistent sur l'identification jusqu'au **code de souche**."
     ]),
      ("Multi-souches vs mono-souche documentée", [
          "Une formule à 1 ou 2 souches précisément nommées et étudiées dans la littérature scientifique vaut souvent mieux qu'un mélange générique de 15 souches sans code indiqué ni garantie de viabilité. Par exemple, *Saccharomyces boulardii CNCM I-745*, *Lacticaseibacillus rhamnosus GG* ou *Bifidobacterium lactis BB-12* disposent de centaines de publications cliniques précises. Inspectez attentivement la liste des souches dans notre sélection [Probiotiques & Digestion](/probiotiques) et voyez [étiquetage UFC expliqué](/conseils/etiquetage-ufc-milliards-probiotiques-explication)."
      ])],
     ["Un probiotique sérieux indique Genre + Espèce + Code de souche (ex. BB-12, GG, 299v).",
      "Les effets observés dans la littérature scientifique sont spécifiques à chaque souche.",
      "La qualité et la documentation d'une souche priment sur le simple nombre d'espèces mélangées."],
     [{"question": "Pourquoi certains noms de Lactobacillus ont-ils changé récemment (Lacticaseibacillus, Lactiplantibacillus) ?", "answer": "En 2020, la taxonomie scientifique a reclassé l'ancien grand genre Lactobacillus en plusieurs genres plus précis ; les deux appellations coexistent encore sur certains flacons."}]),

    ("etiquetage-ufc-milliards-probiotiques-explication", "Étiquetage UFC (CFU) des probiotiques expliqué",
     "Que signifient les milliards d'UFC (Unités Formant Colonie) ? Différence entre UFC à la fabrication et UFC garanties à la date de péremption.",
     "5 milliards, 20 milliards ou 50 milliards d'UFC : le chiffre le plus élevé n'est pas toujours le plus fiable si la garantie s'arrête à la sortie d'usine.",
     [("Qu'est-ce qu'une UFC (Unité Formant Colonie) ?", [
         "L'UFC (ou CFU en anglais, *Colony Forming Unit*) mesure le nombre de micro-organismes vivants capables de se multiplier pour former une colonie. Contrairement aux vitamines mesurées en milligrammes, les probiotiques se comptent en millions ou en milliards de cellules vivantes."
     ]),
      ("Le piège majeur : « à la fabrication » vs « à la péremption »", [
          "Les bactéries vivantes perdent naturellement une partie de leur viabilité au fil des mois, surtout sous l'effet de la chaleur ou de l'humidité. Certains fabricants affichent « 30 milliards à la fabrication », mais au moment où vous achetez le flacon 8 mois plus tard, il n'en reste parfois qu'une fraction.",
          "À l'inverse, les formules sérieuses de notre rayon [Probiotiques & Digestion](/probiotiques) garantissent le nombre d'UFC **jusqu'à la date limite d'utilisation (DDM)**, ou utilisent un surdosage initial calculé pour assurer la dose promise jusqu'à expiration."
      ]),
      ("Plus de milliards est-il toujours préférable ?", [
          "Non : les doses étudiées dans la littérature vont couramment de **1 milliard à 20 milliards d'UFC par jour** selon la souche. Une souche robuste comme *Saccharomyces boulardii* ou *Lactobacillus rhamnosus GG* s'utilise souvent entre 5 et 10 milliards d'UFC."
      ])],
     ["UFC (CFU) mesure les micro-organismes vivants et viables, pas le poids de poudre.",
      "Privilégiez toujours la mention d'UFC garanties jusqu'à la date d'expiration (DDM).",
      "1 à 20 milliards d'UFC bien protégées suffisent dans la majorité des usages courants."],
     [{"question": "50 milliards d'UFC sont-ils dangereux ?", "answer": "Chez l'adulte sain, ce n'est généralement pas dangereux, mais des doses très élevées peuvent provoquer des gaz passagers sans apporter plus de bénéfice qu'une souche bien ciblée à 10 milliards."}]),

    ("conservation-probiotiques-temperature-ambiante-frigo", "Conserver ses probiotiques : frigo ou température ambiante ?",
     "Comment préserver la viabilité des probiotiques sous le climat chaud tunisien : souches lyophilisées stabilisées, blisters aluminium et réfrigérateur.",
     "Les bactéries vivantes craignent la chaleur et l'humidité. Voici comment savoir si votre boîte doit aller au réfrigérateur ou rester au placard.",
     [("Souches nécessitant le froid vs souches stabilisées", [
         "Historiquement, les probiotiques devaient impérativement être conservés à 4 °C. Aujourd'hui, grâce aux progrès de la lyophilisation à faible activité en eau et du conditionnement protecteur (flacons avec dessiccant ou **blisters aluminium hermétiques**), de nombreuses formules de notre rayon [Probiotiques & Digestion](/probiotiques) restent stables à température ambiante (< 22–25 °C)."
     ]),
      ("Le réflexe indispensable pendant l'été en Tunisie", [
          "En Tunisie, la température intérieure dépasse fréquemment 28 à 35 °C de juin à septembre. Même pour un probiotique dit « stable à température ambiante » (sauf mention contraire explicite du fabricant interdisant le froid), placer le flacon bien refermé dans la porte ou le bac du **réfrigérateur** en été aide à limiter la mortalité bactérienne. Évitez toujours la salle de bain humide et le congélateur."
      ]),
      ("Comment les prendre au moment du repas ?", [
          "Avalez la gélule avec de l'eau fraîche ou tempérée (jamais avec un café ou un thé brûlant qui tuerait une partie des souches au contact). Pour le choix du format protecteur, lisez [gélules gastro-résistantes vs sachets](/conseils/formats-probiotiques-gelules-sachets-gouttes)."
      ])],
     ["Suivez d'abord l'instruction de stockage exacte imprimée sur l'emballage.",
      "En été (> 25 °C), le réfrigérateur protège la viabilité bactérienne si le flacon est bien hermétique.",
      "Ne prenez jamais vos probiotiques avec une boisson chaude (> 40 °C)."],
     [{"question": "Mes probiotiques sont-ils morts après 48 heures de livraison ?", "answer": "Les marques modernes formulent avec un surdosage de sécurité conçu pour résister plusieurs jours aux températures de transport normales."}]),

    ("aliments-fermentes-yaourt-kefir-microbiote", "Aliments fermentés : yaourt, lben, kéfir et microbiote",
     "Place des aliments fermentés traditionnels (yaourt nature, lben, kéfir, légumes lactofermentés) par rapport aux compléments probiotiques.",
     "Avant même les gélules, l'alimentation quotidienne offre des aliments fermentés précieux pour la diversité alimentaire. Comparons leurs apports.",
     [("Les aliments fermentés courants en Tunisie", [
         "Le **yaourt nature** (fermenté par *Lactobacillus bulgaricus* et *Streptococcus thermophilus*), le **lben / lait fermenté traditionnel**, le **kéfir** (laitier ou de fruits) et les **légumes lactofermentés non pasteurisés** (olives fermentées artisanalement, choucroute crue, variantes en saumure non vinaigrée) apportent des ferments vivants et des métabolites issus de la fermentation."
     ]),
      ("Différence entre aliment fermenté et complément probiotique", [
          "Attention à une nuance importante soulignée par l'ISAPP : tous les aliments fermentés ne sont pas formellement des « probiotiques » au sens strict, car les quantités exactes et les codes de souches survivantes ne sont pas toujours standardisés comme dans un complément de notre rayon [Probiotiques & Digestion](/probiotiques). En revanche, leur consommation régulière soutient la diversité du microbiome dans les études observationnelles et d'intervention alimentaire."
      ]),
      ("Comment les associer intelligemment", [
          "Intégrez 1 portion d'aliment fermenté par jour (ex. un yaourt nature ou un verre de kéfir non sucré) avec des fibres variées (légumes, légumineuses, céréales complètes). Gardez les gélules ciblées pour les périodes spécifiques (après une perturbation digestive, voyage, ou avis médical)."
      ])],
     ["Yaourt nature, lben et kéfir soutiennent au quotidien la diversité alimentaire.",
      "Les aliments fermentés pasteurisés (ou conserves au vinaigre stérilisées) ne contiennent plus de bactéries vivantes.",
      "Les gélules apportent des souches nommées à dose standardisée quand un apport ciblé est souhaité."],
     [{"question": "Le yaourt aromatisé très sucré a-t-il le même intérêt ?", "answer": "Privilégiez le yaourt nature sans sucres ajoutés ni édulcorants, et vérifiez la présence de ferments actifs."}]),

    ("formats-probiotiques-gelules-sachets-gouttes", "Formats probiotiques : gélules, sachets ou gouttes ?",
     "Comparaison des formats galéniques de probiotiques : gélules gastro-résistantes (DRcaps), sachets orodispersibles et gouttes huileuses.",
     "Pour atteindre l'intestin vivantes, les bactéries doivent traverser l'acidité de l'estomac. Le choix du format galénique joue un rôle décisif.",
     [("1. Les gélules gastro-résistantes (à libération retardée)", [
         "L'estomac à jeun affiche un pH très acide (1,5 à 2,5) capable de détruire de nombreuses bactéries sensibles en quelques minutes. Les **gélules gastro-résistantes** (comme les capsules végétales à libération retardée) résistent au suc gastrique et s'ouvrent plus loin dans l'intestin grêle, maximisant le taux de survie jusqu'au côlon."
     ]),
      ("2. Les sachets de poudre et comprimés à croquer", [
          "Pratiques pour les personnes qui ont du mal à avaler des gélules, les sachets utilisent souvent des souches micro-encapsulées ou naturellement acido-résistantes (ou la levure *Saccharomyces boulardii*). Dissolvez toujours le sachet dans de l'eau ou un laitage froid/tiède et buvez immédiatement."
      ]),
      ("3. Les gouttes en suspension huileuse", [
          "Très utilisées chez les nourrissons et jeunes enfants (souvent à base d'huile végétale protégeant *Lactobacillus reuteri* ou *Bifidobacterium*), les gouttes permettent un dosage précis à la goutte près. Parcourez nos formats dans [Probiotiques & Digestion](/probiotiques) et vérifiez les critères dans [comparer deux probiotiques](/conseils/comparer-produits-probiotiques-criteres-fiables)."
      ])],
     ["Les gélules gastro-résistantes protègent efficacement les bactéries de l'acidité de l'estomac.",
      "Les sachets conviennent aux personnes ne pouvant pas avaler de gélules (à boire dans un liquide frais).",
      "Prenez vos gélules juste avant ou au début d'un repas (lorsque le pH gastrique est tamponné)."],
     [{"question": "Faut-il ouvrir une gélule gastro-résistante ?", "answer": "Non ! Si vous ouvrez une gélule conçue pour être gastro-résistante, vous privez les bactéries de leur protection contre l'acide de l'estomac."}]),
]

batch8 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B8_SPECS]
with open("scripts/batches/batch_08.json", "w", encoding="utf-8") as f:
    json.dump(batch8, f, ensure_ascii=False, indent=2)
print(f"Created batch_08.json ({len(batch8)} articles).")
