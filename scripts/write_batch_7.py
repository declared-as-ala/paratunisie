# -*- coding: utf-8 -*-
import json
from rich_section_helpers import expand_article_record

# Batch 7: Remaining 4 Collagène + first 6 Vitamines & Minéraux
B7_SPECS = [
    ("proteines-alimentaires-et-synthese-collagene", "Protéines, vitamine C et synthèse du collagène",
     "Comment l'organisme fabrique son propre collagène grâce aux protéines alimentaires, à la glycine, à la proline et à la vitamine C.",
     "Avant d'acheter des peptides, il est utile de comprendre comment votre corps synthétise naturellement son collagène à partir de l'alimentation.",
     [("Les matières premières de la synthèse interne", [
         "Le collagène est une protéine fibreuse riche en trois acides aminés spécifiques : la **glycine** (environ un tiers des acides aminés), la **proline** et l'hydroxyproline. Lorsque votre alimentation globale est trop pauvre en protéines (moins de 0,8 g/kg/j), la fabrication et le renouvellement de tous les tissus conjonctifs ralentissent."
     ]),
      ("Le rôle indispensable de la vitamine C comme cofacteur", [
          "Sans vitamine C (acide ascorbique), les enzymes chargées de convertir la proline et la lysine en hydroxyproline et hydroxylysine ne peuvent pas fonctionner correctement : la triple hélice de collagène devient instable. C'est pourquoi l'EFSA reconnaît officiellement que la vitamine C contribue à la formation normale de collagène pour assurer la fonction normale de la peau, des os et des cartilages."
      ]),
      ("Comment combiner assiette et supplémentation", [
          "Assurez d'abord un apport suffisant en protéines (œufs, poissons, volaille, légumineuses) et en vitamine C (agrumes, poivrons, kiwi, persil). Si vous utilisez un complément de [Collagène](/collagene), choisissez une formule contenant déjà de la vitamine C ou prenez-le avec un repas riche en fruits frais (voir [peptides de collagène : dosage](/conseils/peptides-de-collagene-utilisation-dosage))."
      ])],
     ["Un apport suffisant en protéines alimentaires est la base de toute synthèse de collagène.",
      "La vitamine C est un cofacteur enzymatique obligatoire pour stabiliser les fibres de collagène.",
      "Associer collagène hydrolysé et vitamine C optimise la logique nutritionnelle."],
     [{"question": "Faut-il prendre de la vitamine C en même temps que le collagène ?", "answer": "Oui, beaucoup de formules en contiennent déjà 40 à 80 mg par dose, sinon un fruit riche en vitamine C au cours du même repas convient parfaitement."}]),

    ("lire-etiquette-complement-collagene", "Lire une étiquette de collagène : dose et co-actifs",
     "Comment comparer poudre et gélules de collagène sur l'étiquette : grammage réel par prise, vitamine C, acide hyaluronique et zinc.",
     "Entre 10 000 mg en poudre et 1200 mg en comprimés, les étiquettes de collagène cachent de grands écarts de dose. Voici comment les décrypter.",
     [("Poudre vs gélules/comprimés : l'écart de grammage", [
         "Un comprimé ou une gélule de collagène ne peut contenir physiquement qu'environ 500 à 1000 mg de poudre. Ainsi, une dose de 2 gélules n'apporte souvent que **1 à 1,5 g de collagène** — bien en dessous des 5 à 10 g utilisés dans la plupart des études ! À l'inverse, une seule cuillère doseuse de poudre dans notre rayon [Collagène](/collagene) fournit directement **5 à 10 g de peptides hydrolysés**."
     ]),
      ("Décoder les co-actifs fréquents (Vitamine C, Acide Hyaluronique, Zinc)", [
          "Les formules « beauté » ajoutent souvent de la vitamine C (très utile), de la biotine, du zinc ou de l'acide hyaluronique (souvent 50 à 150 mg). Vérifiez simplement que ces ajouts ne réduisent pas la quantité réelle de peptides de collagène sous les 2,5 g par dose, et ne créent pas de doublon avec votre multivitamine."
      ]),
      ("Origine et pureté (sans sucres ajoutés)", [
          "Sur une poudre nature pure, les ingrédients doivent se limiter à « Peptides de collagène hydrolysé (marin ou bovin) ». Les formules aromatisées aux fruits rouges sont plus agréables dans l'eau mais vérifiez la teneur en sucres ou édulcorants (voir [comparer qualité et prix du collagène](/conseils/comparer-qualite-prix-collagene-tnd))."
      ])],
     ["Une poudre apporte facilement 5–10 g par prise contre seulement 1–2 g pour 2 à 3 gélules.",
      "Vérifiez la quantité nette de peptides par portion recommandée.",
      "Contrôlez l'origine (marin vs bovin) et les cofacteurs associés."],
     [{"question": "Les shots liquides de collagène sont-ils meilleurs que la poudre ?", "answer": "Ils sont pratiques à emporter, mais contiennent souvent des conservateurs, des arômes et coûtent beaucoup plus cher par gramme de collagène que la poudre."}]),

    ("collagene-allergenes-poisson-boeuf-securite", "Collagène : allergènes, régimes et sécurité",
     "Allergies au poisson et crustacés, origine bovine ou marine, grossesse et tolérance digestive : toutes les précautions autour du collagène.",
     "Le collagène est une protéine généralement bien tolérée, mais son origine animale implique des vérifications d'allergènes et de régimes alimentaires.",
     [("Allergie au poisson, mollusques et crustacés", [
         "Le collagène marin étant fabriqué à partir de peaux, d'arêtes ou d'écailles de poissons (et parfois transformé sur des lignes manipulant des crustacés), il est **contre-indiqué chez les personnes allergiques aux produits de la mer**. Lisez toujours l'encadré allergènes de la fiche produit dans notre catégorie [Collagène](/collagene) et optez pour du collagène bovin si vous n'êtes allergique qu'au poisson."
     ]),
      ("Origine bovine, traçabilité et régimes alimentaires", [
          "En Tunisie, de nombreux consommateurs souhaitent s'assurer de l'origine bovine ou marine certifiée et de l'absence de dérivés porcins. Vérifiez attentivement la mention exacte de la source sur l'étiquette (« hydrolysate de collagène bovin » ou « marin ») : si l'étiquette mentionne uniquement « collagène animal » sans précision, abstenez-vous."
      ]),
      ("Tolérance digestive et précautions particulières", [
          "Aux doses habituelles (2,5 à 10 g/j), les rares effets rapportés sont une légère sensation de satiété ou un ballonnement passager. En cas d'insuffisance rénale sévère nécessitant une restriction protéique stricte, consultez votre médecin avant d'ajouter tout complément protéiné."
      ])],
     ["Collagène marin = contre-indiqué en cas d'allergie au poisson ou fruits de mer.",
      "Vérifiez toujours l'espèce d'origine exacte (marin vs bovin) sur l'étiquette.",
      "Demandez un avis médical en cas de régime hypoprotidique strict (pathologie rénale)."],
     [{"question": "Le collagène fait-il prendre du poids ?", "answer": "Non : 10 g de peptides purs apportent environ 36 à 40 kcal, soit l'équivalent d'un petit fruit."}]),

    ("comparer-qualite-prix-collagene-tnd", "Comparer qualité et prix du collagène en TND",
     "Méthode chiffrée en Dinars Tunisiens pour calculer le vrai coût d'une dose de 5 g ou 10 g de collagène entre poudre, comprimés et formules mixtes.",
     "Un flacon de collagène à 55 DT peut coûter deux fois plus cher à la cure qu'un pot à 110 DT. Voici comment faire le calcul en Dinars Tunisiens.",
     [("Le piège de comparer les prix par boîte sans compter les grammes", [
         "Prenons un exemple réel : une boîte de 90 comprimés dosés à 1000 mg contient 90 g de collagène au total. À 60 DT la boîte, cela représente **667 millimes par gramme** — soit **3,33 DT pour une dose de 5 g** (et il faudrait avaler 5 comprimés par jour, donc la boîte dure 18 jours !).",
         "Un pot de 300 g de peptides de collagène en poudre à 105 DT revient à **350 millimes par gramme** — soit **1,75 DT pour 5 g** et **60 jours complets de cure** ! Le pot en poudre coûte presque moitié moins cher à quantité active égale."
     ]),
      ("Comment évaluer le rapport qualité/prix dans notre rayon Collagène", [
          "1. Calculez le poids net total de collagène dans le pot (grammes × nombre de doses). 2. Divisez le prix en TND par ce poids total pour obtenir le coût pour 5 g ou 10 g. 3. Vérifiez l'origine (marin vs bovin) et l'hydrolyse dans notre sélection [Collagène](/collagene) (voir aussi [lire une étiquette de collagène](/conseils/lire-etiquette-complement-collagene))."
      ])],
     ["Comparez toujours le prix rapporté à 5 g ou 10 g de collagène pur en TND.",
      "La poudre hydrolysée est généralement 2 fois plus économique que les gélules/comprimés.",
      "Vérifiez la durée réelle de la cure à la dose cible (30 à 60 jours)."],
     [{"question": "Une cure de collagène coûte combien par mois en Tunisie ?", "answer": "En poudre hydrolysée à 5 g par jour, une cure revient généralement entre 45 et 75 DT par mois selon la marque et l'origine marine ou bovine."}]),

    # ── VITAMINES & MINÉRAUX (6) ──
    ("vitamine-d-soleil-carence-dosage-hiver", "Vitamine D : pourquoi les déficits persistent au soleil",
     "Pourquoi la carence en vitamine D est fréquente même en Tunisie : mode de vie en intérieur, angle UV hivernal, phototypes et bilan sanguin 25(OH)D.",
     "Malgré plus de 300 jours d'ensoleillement par an, les déficits en vitamine D restent très courants en Afrique du Nord. Voici les raisons physiologiques.",
     [("Pourquoi le soleil tunisien ne garantit pas un taux optimal", [
         "On pourrait croire que vivre en Tunisie protège automatiquement du manque de vitamine D. Pourtant, plusieurs études épidémiologiques menées dans le bassin méditerranéen montrent une forte prévalence d'insuffisance en vitamine D, y compris chez les jeunes adultes et les sportifs.",
         "Quatre facteurs l'expliquent : le travail en bureau aux heures d'ensoleillement (11 h–15 h), le port de vêtements couvrants ou l'usage légitime de protection solaire, la baisse des rayons UVB efficaces entre novembre et mars, et la pigmentation cutanée (les peaux plus mates nécessitent une exposition un peu plus longue pour synthétiser la même quantité de cholécalciférol)."
     ]),
      ("Pourquoi préférer la D3 (cholécalciférol) et doser avant de surdoser", [
          "Les suppléments du rayon [Vitamines](/vitamines) privilégient la **vitamine D3 (cholécalciférol)**, plus efficace que la D2 pour élever et maintenir le taux sanguin de 25(OH)D. L'EFSA fixe la limite supérieure de sécurité quotidienne chez l'adulte à 4000 UI (100 µg/j), tandis que les doses d'entretien courantes se situent souvent entre 1000 et 2000 UI/j (selon avis médical ou bilan sanguin). Comme la vitamine D est liposoluble, prenez-la avec un repas contenant des graisses."
      ]),
      ("L'importance d'un dosage sanguin 25(OH)D en cas de doute", [
          "Plutôt que de prendre des méga-doses à l'aveugle, un simple dosage sanguin de la 25-hydroxy-vitamine D prescrit par votre médecin permet d'ajuster précisément la dose et d'éviter tout excès. Consultez aussi [comprendre UI, µg et % VNR](/conseils/comprendre-vnr-et-unites-ui-mcg-etiquettes)."
      ])],
     ["Travail en intérieur, hiver et phototypes expliquent les déficits fréquents même en climat ensoleillé.",
      "La vitamine D3 (cholécalciférol) se prend avec un repas contenant des lipides.",
      "La limite de sécurité EFSA pour l'adulte est de 4000 UI (100 µg)/jour ; faites doser la 25(OH)D si besoin."],
     [{"question": "Vaut-il mieux prendre de la vitamine D3 tous les jours ou une ampoule tous les 3 mois ?", "answer": "Les données récentes montrent qu'un apport quotidien modéré (ex. 1000–2000 UI/j) maintient des taux sanguins plus stables qu'une très grosse ampoule espacée."}]),

    ("vitamine-c-formes-acide-ascorbique-liposomale", "Vitamine C : acide ascorbique ou liposomale ?",
     "Comparaison entre acide ascorbique standard, ascorbates tamponnés (calcium/sodium) et vitamine C liposomale : absorption et confort gastrique.",
     "La vitamine C liposomale est vendue beaucoup plus cher que l'acide ascorbique classique. Cet écart de prix est-il justifié ?",
     [("Comment le corps absorbe la vitamine C (saturation des transporteurs)", [
         "À faible dose (30 à 200 mg), l'intestin absorbe presque 90 % de l'acide ascorbique via des transporteurs actifs (SVCT1). Au-delà de 500 mg en une seule prise, ces transporteurs saturent et une fraction croissante reste dans l'intestin pour être éliminée, ce qui peut accélérer le transit au-delà de 1–2 g."
     ]),
      ("Acide ascorbique classique vs ascorbates tamponnés vs liposomale", [
          "1. **Acide ascorbique standard** : la forme la plus étudiée, économique et efficace à 100–500 mg/j. Légèrement acide pour les estomacs très sensibles à jeun. 2. **Ascorbates tamponnés (ascorbate de calcium ou de sodium)** : pH neutre, beaucoup plus doux pour l'estomac. 3. **Vitamine C liposomale** : encapsulée dans des phospholipides ; certaines petites études montrent une concentration plasmatique un peu plus élevée à forte dose (1 g+), mais pour des apports quotidiens de 200 à 500 mg dans notre rayon [Vitamines](/vitamines), l'acide ascorbique standard suffit largement."
      ]),
      ("Rôles reconnus et synergies utiles", [
          "La vitamine C soutient le fonctionnement normal du système immunitaire, la réduction de la fatigue, la protection cellulaire contre le stress oxydatif, la formation du collagène et améliore l'absorption du fer non héminique (voir [interactions entre vitamines et minéraux](/conseils/interactions-entre-vitamines-et-mineraux))."
      ])],
     ["À 200–500 mg/j, l'acide ascorbique classique est déjà très bien absorbé et très économique.",
      "Les formes tamponnées (ascorbate de calcium) conviennent mieux aux estomacs sensibles à l'acidité.",
      "Fractionner les prises de vitamine C évite la saturation intestinale."],
     [{"question": "La vitamine C prise le soir empêche-t-elle de dormir ?", "answer": "C'est une idée reçue : aux doses nutritionnelles courantes (100–500 mg), aucune étude ne montre d'insomnie induite par la vitamine C."}]),

    ("vitamine-b12-formes-methylcobalamine-cyanocobalamine", "Vitamine B12 : méthylcobalamine vs cyanocobalamine",
     "Différences entre cyanocobalamine et méthylcobalamine : stabilité, conversion métabolique, régimes végétariens et posologies d'entretien.",
     "Cyanocobalamine ou méthylcobalamine : les deux formes corrigent les apports insuffisants en vitamine B12, mais diffèrent par leur stabilité et leur prix.",
     [("Pourquoi la vitamine B12 mérite une attention particulière", [
         "La vitamine B12 (cobalamine) est indispensable à la formation des globules rouges, au métabolisme énergétique et au fonctionnement normal du système nerveux. Elle est présente presque uniquement dans les produits animaux (viande, poisson, œufs, laitages). Les personnes végétariennes ou véganes, ainsi que certains seniors ou utilisateurs de traitements gastriques au long cours (IPP, metformine), doivent surveiller leur statut."
     ]),
      ("Cyanocobalamine vs Méthylcobalamine", [
          "La **cyanocobalamine** est une forme synthétique très stable à la chaleur et à la lumière, peu coûteuse et largement utilisée dans les études et compléments du rayon [Vitamines](/vitamines). Une fois absorbée, l'organisme retire le minuscule groupe cyano (en quantité infime, inférieure à celle d'une amande ou d'une pomme) pour la convertir en formes actives.",
          "La **méthylcobalamine** est directement l'une des deux formes coenzymatiques actives dans le corps (avec l'adénosylcobalamine). Elle est un peu plus sensible à la lumière et coûte souvent plus cher, mais plaît aux personnes préférant une forme déjà méthylée."
      ]),
      ("Voie d'absorption et dosages pratiques", [
          "L'absorption active par le facteur intrinsèque sature autour de 1,5 à 2 µg par prise, mais environ 1 % d'une dose élevée diffuse passivement. C'est pourquoi les apports d'entretien sont souvent de 50 à 250 µg/j ou 1000 µg deux fois par semaine selon les besoins (voir [comprendre les unités µg et % VNR](/conseils/comprendre-vnr-et-unites-ui-mcg-etiquettes))."
      ])],
     ["Cyanocobalamine : très stable à la chaleur, économique et éprouvée.",
      "Méthylcobalamine : forme coenzymatique déjà active, à conserver à l'abri de la lumière.",
      "Indispensable en supplémentation régulière pour les régimes végétaliens."],
     [{"question": "Un excès de vitamine B12 est-il dangereux ?", "answer": "La B12 est hydrosoluble et l'EFSA n'a pas fixé de limite toxique stricte, mais évitez les prises injectables ou fortes doses inutiles sans bilan."}]),

    ("zinc-formes-picolinate-bisglycinate-citrate", "Zinc : picolinate, bisglycinate ou citrate ?",
     "Comparaison des formes de zinc (picolinate, bisglycinate, citrate, oxyde), dose journalière optimale, plafond EFSA et équilibre avec le cuivre.",
     "Le zinc joue un rôle clé dans l'immunité et la synthèse protéique, mais sa forme et son dosage déterminent tolérance gastrique et sécurité.",
     [("Formes bien absorbées vs formes moins digestes", [
         "Comme pour le magnésium, les formes de zinc chélatées ou organiques — **bisglycinate de zinc**, **picolinate de zinc** et **citrate de zinc** — montrent une bonne absorption et un meilleur confort gastrique que le sulfate ou l'oxyde de zinc. Prendre le zinc au milieu d'un repas (jamais à jeun le matin) évite presque toujours les nausées passagères."
     ]),
      ("Ne pas dépasser la limite supérieure de sécurité (EFSA : 25 mg/j)", [
          "L'apport recommandé chez l'adulte est d'environ 8 à 11 mg/j. De nombreux compléments du commerce affichent 25 mg voire 50 mg par comprimé ! Or l'Autorité européenne de sécurité des aliments (EFSA) fixe la limite supérieure tolérable à **25 mg de zinc par jour** (40 mg pour le NIH américain).",
          "Prendre 40 à 50 mg de zinc tous les jours pendant des mois risque d'induire une **carence en cuivre** (car le zinc et le cuivre partagent les mêmes transporteurs intestinaux). Choisissez des dosages raisonnables de 10 à 15 mg/j dans notre rayon [Minéraux](/mineraux) (ou coupez un comprimé sécable de 25 mg si besoin)."
      ]),
      ("Interactions avec le fer, le calcium et les phytates", [
          "Pour optimiser l'assimilation, évitez de prendre un supplément de zinc en même temps qu'une forte dose de fer ou de calcium (voir [interactions entre vitamines et minéraux](/conseils/interactions-entre-vitamines-et-mineraux))."
      ])],
     ["Privilégiez bisglycinate, picolinate ou citrate de zinc, toujours au milieu d'un repas.",
      "Respectez le plafond EFSA de 25 mg/jour pour éviter de bloquer l'absorption du cuivre.",
      "Un apport de 10 à 15 mg/jour suffit largement pour un entretien régulier."],
     [{"question": "Pourquoi le zinc donne-t-il parfois mal au cœur le matin ?", "answer": "Pris à jeun, le zinc irrite facilement la muqueuse gastrique : prenez-le toujours au cours du déjeuner ou du dîner."}]),

    ("fer-quand-se-supplementer-bilan-ferritine", "Fer en complément : pourquoi doser la ferritine ?",
     "Pourquoi ne jamais prendre de fer sans bilan biologique (ferritine + NFS), comment choisir le bisglycinate doux et éviter les inhibiteurs (thé, café).",
     "Contrairement à la vitamine C dont l'excès s'élimine dans les urines, le fer s'accumule dans l'organisme. Un bilan sanguin préalable est indispensable.",
     [("Pourquoi le fer ne s'achète jamais « par précaution »", [
         "Le corps humain ne possède pas de mécanisme actif d'élimination du fer excédentaire. Prendre du fer sans carence avérée risque d'entraîner une surcharge progressive (hémochromatose ou stress oxydatif tissulaire), sans compter les troubles digestifs fréquents (constipation, selles noires, nausées)."
     ]),
      ("Les analyses indispensables : ferritine et numération (NFS)", [
          "Avant d'acheter un complément de fer dans notre rayon [Minéraux](/mineraux), consultez votre médecin pour réaliser un dosage de la **ferritine sérique** (qui reflète les réserves en fer) et une numération formule sanguine (hémoglobine). Si un déficit est confirmé, votre médecin fixera la dose et la durée exactes (généralement 3 mois avec contrôle biologique)."
      ]),
      ("Choisir une forme douce et éviter le thé/café", [
          "Les sels classiques (sulfate ferreux) irritent souvent l'intestin. Le **fer bisglycinate** offre généralement une meilleure tolérance digestive. Pour maximiser l'absorption : prenez le fer avec un peu de vitamine C, et **espacez d'au moins 2 heures** du thé, du café, des produits laitiers ou d'un supplément de calcium (voir [interactions vitamines et minéraux](/conseils/interactions-entre-vitamines-et-mineraux))."
      ])],
     ["Ne prenez jamais de fer sans bilan sanguin préalable (ferritine + hémoglobine).",
      "Le fer bisglycinate est généralement mieux toléré sur le plan digestif que le sulfate.",
      "Espacez toujours la prise de fer d'au moins 2 heures du thé, du café et du calcium."],
     [{"question": "Les sportifs d'endurance manquent-ils plus souvent de fer ?", "answer": "Oui, notamment les coureuses et sportives réglées : un contrôle médical annuel de la ferritine est pertinent en cas de fatigue persistante."}]),

    ("calcium-apports-alimentaires-formes-citrate-carbonate", "Calcium : alimentation vs citrate ou carbonate",
     "Couvrir ses besoins en calcium (950–1000 mg/j) via l'alimentation, et choisir entre citrate de calcium et carbonate de calcium si un complément est indiqué.",
     "La majorité des adultes peuvent couvrir leurs besoins en calcium par l'alimentation. Si un supplément est nécessaire, voici comment choisir la forme.",
     [("Priorité absolue aux sources alimentaires", [
         "L'EFSA recommande environ **950 à 1000 mg de calcium par jour** chez l'adulte. Yaourts, lait, fromages, sardines avec arêtes, amandes, graines de sésame (tahini), brocolis et eaux minérales calciques permettent dans la plupart des cas d'atteindre cet objectif sans gélules."
     ]),
      ("Citrate de calcium vs Carbonate de calcium", [
          "Lorsqu'un apport complémentaire est conseillé par votre médecin (par exemple en cas d'exclusion totale des produits laitiers) : le **carbonate de calcium** est très concentré (40 % de calcium élémentaire) et économique, mais nécessite l'acidité gastrique d'un **repas** pour être bien absorbé.",
          "Le **citrate de calcium** (21 % de calcium élémentaire) est un peu plus volumineux, mais s'absorbe bien avec ou sans repas, y compris chez les seniors ou les personnes prenant des antiacides (IPP)."
      ]),
      ("Plafond de 500 mg par prise et rôle de la vitamine D3", [
          "L'intestin absorbe mal plus de **500 mg de calcium en une seule fois** : fractionnez les doses si besoin. Enfin, sans [vitamine D3](/conseils/vitamine-d-soleil-carence-dosage-hiver), l'absorption intestinale du calcium reste très faible. Parcourez nos formules dans [Minéraux](/mineraux)."
      ])],
     ["Visez d'abord 950–1000 mg/j via les laitages, sardines, sésame, amandes et légumes verts.",
      "Carbonate : à prendre impérativement pendant un repas ; Citrate : indépendant de l'acidité gastrique.",
      "Ne dépassez pas 500 mg de calcium par prise unitaire et associez un bon statut en vitamine D."],
     [{"question": "Prendre trop de calcium en supplément comporte-t-il des risques ?", "answer": "Oui, des apports excessifs en suppléments sans besoin réel peuvent favoriser les calculs rénaux et gêner l'absorption du fer et du zinc."}]),
]

batch7 = [expand_article_record(s, st, md, ex, sc, tk, fq) for s, st, md, ex, sc, tk, fq in B7_SPECS]
with open("scripts/batches/batch_07.json", "w", encoding="utf-8") as f:
    json.dump(batch7, f, ensure_ascii=False, indent=2)
print(f"Created batch_07.json ({len(batch7)} articles).")
