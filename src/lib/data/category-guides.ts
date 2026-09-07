export interface CategoryGuideSection {
  heading: string;
  type?: "text" | "points" | "dynamic-price";
  content?: string;
  points?: string[];
}

export interface CategoryGuide {
  title: string;
  intro: string;
  relatedGuide?: {
    title: string;
    slug: string;
    label: string;
  };
  sections?: CategoryGuideSection[];
  howToChoose?: {
    heading: string;
    points: string[];
  };
  usageGuide?: {
    heading: string;
    content: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  "nutrition-sportive": {
    title: "Guide d'Achat : Nutrition Sportive & Compléments en Tunisie",
    intro: "La nutrition sportive regroupe les protéines, créatines, acides aminés et boosters formulés pour soutenir l'effort, le développement musculaire et la récupération des sportifs et athlètes en Tunisie.",
    relatedGuide: {
      title: "Les Meilleurs Compléments pour Débuter la Musculation en Tunisie",
      slug: "complements-musculation-debutant",
      label: "Consulter notre guide des compléments pour débuter la musculation",
    },
    sections: [
      {
        heading: "Comment choisir ses compléments de nutrition sportive ?",
        type: "points",
        points: [
          "Identifiez votre objectif prioritaire : prise de muscle sec (whey, isolat), force et explosivité (créatine), prise de masse (gainer) ou énergie (pre-workout).",
          "Vérifiez l'étiquetage, l'aminogramme et la conformité des marques internationales distribuées officiellement.",
          "Privilégiez la régularité des prises et complétez toujours une alimentation équilibrée et une hydratation abondante.",
        ],
      },
      {
        heading: "Prix de la nutrition sportive en Tunisie",
        type: "dynamic-price",
        content: "Sur ParaTunisie, accédez à une gamme complète de nutrition sportive de qualité certifiée {dynamicPriceText} avec livraison rapide 24-48h et paiement sécurisé à la livraison.",
      },
      {
        heading: "Marques et gammes disponibles",
        type: "text",
        content: "Nous sélectionnons rigoureusement des marques reconnues à l'échelle internationale (Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, Eric Favre, Quamtrax), garantissant des matières premières pures et traçables.",
      },
      {
        heading: "Conseils et synergies",
        type: "text",
        content: "Pour une supplémentation efficace, le duo Whey Protéine (après l'entraînement) et Créatine Monohydrate (3g à 5g par jour) constitue la base scientifiquement reconnue la plus solide pour progresser en toute sécurité.",
      },
    ],
    faqs: [
      {
        question: "Par quel complément commencer en musculation ?",
        answer: "La whey protéine (pour atteindre son quota de protéines) et la créatine monohydrate (pour la force) sont les deux compléments les plus étudiés et les plus recommandés pour débuter.",
      },
      {
        question: "Les compléments remplacent-ils les repas solides ?",
        answer: "Non, les compléments alimentaires viennent compléter une alimentation équilibrée et ne doivent jamais se substituer à des repas complets.",
      },
      {
        question: "Comment conserver ses compléments en climat chaud ?",
        answer: "Conservez vos pots hermétiquement fermés, à l'abri de l'humidité, de la chaleur excessive et de la lumière directe du soleil.",
      },
    ],
  },
  "complements-alimentaires": {
    title: "Guide d'Achat : Compléments Alimentaires en Tunisie",
    intro: "Les compléments alimentaires regroupent les vitamines, minéraux, acides gras essentiels et plantes adaptogènes formulés pour optimiser la santé, renforcer l'immunité et combler les carences nutritionnelles du quotidien en Tunisie.",
    relatedGuide: {
      title: "Les Vitamines Essentielles pour les Sportifs : Quels Compléments Privilégier ?",
      slug: "vitamines-pour-sportifs-guide",
      label: "Consulter notre guide des vitamines et minéraux",
    },
    sections: [
      {
        heading: "Comment choisir ses compléments alimentaires ?",
        type: "points",
        points: [
          "Identifiez vos besoins ciblés : immunité et vitalité (vitamines D3+K2, C, complexes), gestion du stress (magnésium bisglycinate, ashwagandha), santé cardiovasculaire (oméga 3).",
          "Privilégiez des formes hautement biodisponibles (minéraux chélatés au bisglycinate, extraits titrés KSM-66).",
          "Vérifiez l'authenticité et la traçabilité des marques certifiées sans métaux lourds ni additifs controversés.",
        ],
      },
      {
        heading: "Prix des compléments alimentaires en Tunisie",
        type: "dynamic-price",
        content: "Sur ParaTunisie, accédez à une sélection de compléments alimentaires purs et certifiés {dynamicPriceText} avec livraison rapide 24-48h partout en Tunisie.",
      },
      {
        heading: "Garantie d'authenticité et sécurité",
        type: "text",
        content: "Tous nos compléments proviennent directement de circuits de distribution officiels et répondent aux normes internationales de sécurité alimentaire (HACCP, GMP, ISO).",
      },
    ],
    faqs: [
      {
        question: "Quand prendre ses compléments alimentaires ?",
        answer: "Les vitamines liposolubles (D3, E, K2) et les oméga 3 se prennent idéalement au cours d'un repas contenant des graisses. Les minéraux comme le magnésium peuvent être pris le soir pour favoriser la détente.",
      },
      {
        question: "Peut-on combiner plusieurs compléments ?",
        answer: "Oui, certaines associations sont très bénéfiques (ex: Vitamine D3 + K2, ou Magnésium + Zinc). Veillez toutefois à respecter les doses journalières recommandées.",
      },
    ],
  },
  "whey-proteine": {
    title: "Guide d'Achat : Whey Protein en Tunisie",
    intro: "La whey protein (protéine de lactosérum) est la référence incontournable en Tunisie pour soutenir la construction musculaire, combler vos besoins quotidiens en protéines et optimiser votre récupération après l'effort.",
    relatedGuide: {
      title: "Whey Protéine en Tunisie : Guide Complet & Meilleures Marques",
      slug: "whey-protein-tunisie-guide",
      label: "Consulter notre guide complet sur la whey protéine en Tunisie",
    },
    sections: [
      {
        heading: "Comment choisir sa whey ?",
        type: "points",
        points: [
          "Définissez votre objectif : prise de muscle sec ou maintien (whey concentrée), sèche stricte ou intolérance digestive (whey isolate).",
          "Vérifiez le pourcentage de protéines pour 100g : entre 70% et 80% pour un bon concentré, plus de 85% à 90% pour un isolat.",
          "Contrôlez l'aminogramme : assurez-vous d'un apport naturel d'au moins 5g de BCAA et 2.5g de leucine par portion de 30g.",
          "Exigez des marques reconnues aux normes de fabrication strictes (Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, ProActive, Eric Favre).",
        ],
      },
      {
        heading: "Prix de la whey protein en Tunisie",
        type: "dynamic-price",
        content: "Le prix de la whey protein en Tunisie varie selon le procédé de filtration (concentrée ou isolate), le format (pots de 900g, 2kg ou sacs de 2.25kg) et la marque. Sur ParaTunisie, retrouvez une sélection de whey protéines 100% authentiques {dynamicPriceText} avec livraison rapide dans les 24 gouvernorats.",
      },
      {
        heading: "Whey concentrée ou whey isolate ?",
        type: "text",
        content: "La whey concentrée (WPC) conserve une faible teneur en glucides et lipides du lait, offrant une texture onctueuse et le meilleur rapport quantité/prix pour la plupart des pratiquants. La whey isolate (WPI) bénéficie d'une microfiltration avancée à flux croisé (CFM) qui élimine la quasi-totalité du lactose et des matières grasses, offrant une teneur protéique supérieure à 85-90% : idéale en période de sèche ou pour les estomacs sensibles.",
      },
      {
        heading: "Marques disponibles",
        type: "text",
        content: "Notre catalogue propose des références majeures du marché international telles qu'Optimum Nutrition (Gold Standard), BioTechUSA (Iso Whey Zero, 100% Pure Whey), OstroVit, Real Pharm et ProActive, toutes certifiées conformes et scellées d'origine.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Mélangez 1 dosette (25 à 30g) dans 200 à 250ml d'eau fraîche ou de boisson végétale. Consommez votre shake dans les 30 à 45 minutes suivant votre séance d'entraînement, ou en collation entre les repas pour atteindre votre quota protéique quotidien (1.6g à 2.2g de protéines par kilo de poids de corps).",
      },
    ],
    faqs: [
      {
        question: "Quelle est la différence entre whey concentrée et whey isolate ?",
        answer: "L'isolat de whey subit une microfiltration supplémentaire qui retire la quasi-totalité des sucres (lactose) et des graisses pour atteindre plus de 85% de protéines pures, tandis que le concentré titre entre 70% et 80%.",
      },
      {
        question: "Quand faut-il prendre sa whey protein ?",
        answer: "Le moment clé est immédiatement après la séance de musculation pour nourrir les fibres musculaires, ou au petit-déjeuner / en collation pour combler vos besoins journaliers.",
      },
      {
        question: "Peut-on consommer de la whey les jours de repos ?",
        answer: "Oui. Les fibres musculaires se réparent et s'hypertrophient durant les jours de repos. La régularité de l'apport protéique quotidien est essentielle.",
      },
      {
        question: "La whey protein fait-elle grossir ?",
        answer: "Non. Une portion de whey apporte environ 110 à 130 calories composées presque exclusivement de protéines. La prise de poids globale dépend de votre bilan calorique quotidien.",
      },
    ],
  },
  "creatine": {
    title: "Guide d'Achat : Créatine Monohydrate en Tunisie",
    intro: "La créatine monohydrate est le complément alimentaire le plus rigoureusement validé par la recherche scientifique pour l'amélioration de la force explosive, de la puissance musculaire et la récupération anaérobie.",
    relatedGuide: {
      title: "Meilleure Créatine en Tunisie 2026 : Comparatif & Guide Complet",
      slug: "meilleure-creatine-tunisie",
      label: "Lire notre comparatif complet des meilleures créatines en Tunisie",
    },
    sections: [
      {
        heading: "Comment choisir sa créatine monohydrate ?",
        type: "points",
        points: [
          "Privilégiez la créatine monohydrate micronisée (Mesh 200) pour une solubilité limpide sans dépôt et un confort digestif optimal.",
          "Optez pour une formule 100% pure (sans arômes, sans sucres ajoutés ni additifs) pour un dosage précis.",
          "Exigez des marques européennes et américaines garantissant la traçabilité des lots (Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, Quamtrax).",
        ],
      },
      {
        heading: "Prix de la créatine en Tunisie",
        type: "dynamic-price",
        content: "Le prix de la créatine monohydrate en Tunisie dépend principalement du format (pots de 300g, 500g ou gélules) et de la marque. Le format 500g offre généralement le meilleur coût par dose pour une utilisation de 3 à 5 mois. Sur ParaTunisie, découvrez nos créatines pures {dynamicPriceText} avec livraison rapide.",
      },
      {
        heading: "Formats et marques disponibles",
        type: "text",
        content: "Nous mettons à votre disposition des poudres micronisées neutres (faciles à mélanger dans un verre d'eau ou un shake de whey) et des gélules pratiques issues de laboratoires reconnus comme OstroVit (500g pur), Optimum Nutrition Micronised, BioTechUSA 100% Creatine et Real Pharm.",
      },
      {
        heading: "Comment utiliser la créatine ?",
        type: "text",
        content: "La dose quotidienne recommandée est de 3g à 5g par jour en prise unique continue. Prenez votre dose avec un grand verre d'eau, de préférence après votre entraînement ou au cours d'un repas. La phase de charge à 20g/jour n'est pas obligatoire : une prise constante sature les réserves musculaires en 3 à 4 semaines.",
      },
    ],
    faqs: [
      {
        question: "Faut-il faire une phase de charge avec la créatine ?",
        answer: "Non. Prendre 3g à 5g par jour de façon constante permet de saturer totalement les réserves intramusculaires de phosphocréatine en 3 à 4 semaines, sans aucun trouble digestif.",
      },
      {
        question: "Quand prendre la créatine : avant ou après l'entraînement ?",
        answer: "La créatine agissant par accumulation chronique, la régularité quotidienne est le point clé. La prise après l'effort ou lors d'un repas contenant des glucides/protéines facilite toutefois son transport vers les muscles.",
      },
      {
        question: "La créatine provoque-t-elle de la rétention d'eau sous-cutanée ?",
        answer: "Non. La créatine induit une rétention d'eau intracellulaire (dans les cellules musculaires), ce qui favorise le volume cellulaire et la synthèse protéique sans aspect gonflé sous la peau.",
      },
      {
        question: "Doit-on faire des cycles ou des pauses avec la créatine ?",
        answer: "Les études scientifiques démontrent qu'une supplémentation quotidienne continue de 3 à 5g est sûre pour les personnes en bonne santé et maintient le niveau optimal de saturation.",
      },
    ],
  },
  "gainers-proteines": {
    title: "Guide d'Achat : Gainer & Prise de Masse en Tunisie",
    intro: "Les gainers (mass gainers) sont des formules riches en calories, glucides complexes et protéines, conçues pour faciliter le surplus calorique chez les personnes ayant un métabolisme rapide ou des difficultés à prendre du poids.",
    relatedGuide: {
      title: "Prise de Masse en Tunisie : Guide Ultime Nutrition & Compléments",
      slug: "prise-de-masse-tunisie-guide",
      label: "Consulter notre guide complet de la prise de masse en Tunisie",
    },
    sections: [
      {
        heading: "Comment choisir son gainer ?",
        type: "points",
        points: [
          "Lean Gainer (ratio 1:1 à 1:2 protéines/glucides) : pour un gain de muscle propre avec un stockage adipeux minimal.",
          "Hard Gainer (ratio 1:3 à 1:5) : idéal pour les profils très minces (ectomorphes) nécessitant un apport massif de 600 à 1000+ kcal.",
          "Vérifiez les sources de glucides (avoine, maltodextrine) pour une libération d'énergie stable sans coup de fatigue.",
          "Contrôlez la qualité des protéines (concentré de whey, caséine) et l'absence de sucres simples excessifs.",
        ],
      },
      {
        heading: "Prix des gainers en Tunisie",
        type: "dynamic-price",
        content: "Le prix d'un gainer en Tunisie dépend de la contenance (seaux de 3kg à 5.4kg XXL) et du profil nutritionnel. Sur ParaTunisie, retrouvez nos mass gainers authentiques {dynamicPriceText} avec expédition soignée.",
      },
      {
        heading: "Formats et marques disponibles",
        type: "text",
        content: "Nous proposons des gainers réputés en formats économiques de 3kg à 5.4kg tels que Challenger Nutrition (Thunder Gainer), BioTechUSA (Hyper Mass, Muscle Mass) et Real Pharm.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Consommez 1/2 à 1 portion en collation entre les repas principaux ou immédiatement après l'entraînement, diluée dans 400 à 500ml d'eau ou de lait pour maximiser l'apport calorique journalier.",
      },
    ],
    faqs: [
      {
        question: "Quelle est la différence entre whey et gainer ?",
        answer: "La whey apporte quasi exclusivement des protéines pures (120 kcal/dose) pour le muscle sec, tandis que le gainer combine protéines et glucides (400 à 1000 kcal/dose) pour créer le surplus calorique indispensable à la prise de poids.",
      },
      {
        question: "Combien de poids peut-on prendre par mois avec un gainer ?",
        answer: "Une prise de masse propre et durable se situe entre 1 et 1,5 kg par mois, combinée à des entraînements de musculation réguliers.",
      },
      {
        question: "Peut-on mélanger son gainer avec du lait ?",
        answer: "Oui, utiliser du lait demi-écrémé ou entier permet d'augmenter significativement le total calorique et la texture crémeuse du shaker.",
      },
    ],
  },
  "pre-workout": {
    title: "Guide d'Achat : Pre-Workout & Boosters en Tunisie",
    intro: "Retrouvez les meilleurs boosters pre-workout en Tunisie pour maximiser votre énergie, votre congestion et votre concentration lors de chaque séance d'entraînement.",
    relatedGuide: {
      title: "Quel Pre-Workout Choisir ? Guide & Comparatif Tunisie",
      slug: "meilleur-pre-workout-tunisie",
      label: "Consulter notre guide comparatif complet pour choisir son pre-workout",
    },
    sections: [
      {
        heading: "Formats et formules de pre-workout disponibles",
        type: "points",
        points: [
          "Boosters avec caféine : idéals pour un coup de fouet immédiat, une vigilance accrue et un focus mental maximal lors des séances intenses.",
          "Boosters sans caféine (Pump) : axés sur la congestion musculaire et la vasodilatation, parfaits pour les entraînements en soirée sans impacter le sommeil.",
          "Complexes avec Bêta-Alanine et Citrulline : pour retarder la fatigue musculaire et soutenir l'endurance d'effort.",
          "Formats pratiques en poudre : dosages personnalisables de 30 à 60 portions par pot selon vos besoins.",
        ],
      },
      {
        heading: "Prix des pre-workouts en Tunisie",
        type: "dynamic-price",
        content: "Chez ParaTunisie, nos boosters pre-workout 100% authentiques sont disponibles {dynamicPriceText} avec expédition express en 24-48h dans toute la Tunisie.",
      },
      {
        heading: "Conseils d'utilisation et tolérance",
        type: "text",
        content: "Diluez 1 dose dans 200 à 250ml d'eau fraîche 20 à 30 minutes avant votre séance. Commencez toujours par une demi-dose lors de la première prise pour tester votre tolérance individuelle. Évitez toute prise dans les 5 à 6 heures précédant le coucher.",
      },
      {
        heading: "Authenticité et livraison en Tunisie",
        type: "text",
        content: "Tous nos compléments alimentaires sont certifiés d'origine authentique auprès des plus grandes marques internationales (Insane Labz, Challenger Nutrition, Eric Favre, Victor Martinez). Commandez en ligne avec paiement sécurisé à la livraison partout en Tunisie.",
      },
    ],
    faqs: [
      {
        question: "Quand prendre son pre-workout avant l'entraînement ?",
        answer: "Consommez votre dose de pre-workout diluée dans un verre d'eau 20 à 30 minutes avant de débuter votre séance.",
      },
      {
        question: "Pourquoi ressent-on des picotements avec le pre-workout ?",
        answer: "Ces picotements inoffensifs et passagers (paresthésies) sont déclenchés par la bêta-alanine et disparaissent rapidement pendant l'effort physique.",
      },
      {
        question: "Peut-on combiner pre-workout et créatine ?",
        answer: "Oui. Le pre-workout se consomme 20 à 30 minutes avant la séance pour un coup de fouet immédiat, alors que la créatine se prend après la séance ou au cours d'un repas pour une action à long terme.",
      },
    ],
  },
  "bcaa": {
    title: "Guide d'Achat : BCAA & Acides Aminés Branchés en Tunisie",
    intro: "Les BCAA (Leucine, Isoleucine, Valine) sont 3 acides aminés essentiels représentant environ 35% des protéines musculaires. Directement assimilés sans digestion hépatique, ils fournissent de l'énergie et limitent la dégradation musculaire pendant l'effort.",
    relatedGuide: {
      title: "BCAA ou EAA : Lequel Choisir pour la Récupération ?",
      slug: "bcaa-ou-eaa",
      label: "Consulter notre comparatif BCAA vs EAA",
    },
    sections: [
      {
        heading: "Comment choisir ses BCAA ?",
        type: "points",
        points: [
          "Privilégiez un ratio classique 2:1:1 ou 4:1:1 (Leucine:Isoleucine:Valine) scientifiquement prouvé pour stimuler la synthèse protéique.",
          "Optez pour des poudres micronisées instantanées pour une dissolution complète dans votre gourde d'entraînement.",
          "Vérifiez l'absence de sucres ajoutés pour une boisson intra-effort hypocalorique adaptée à la sèche.",
        ],
      },
      {
        heading: "Prix des BCAA en Tunisie",
        type: "dynamic-price",
        content: "En Tunisie, les BCAA sont proposés en formats poudre de 300g à 500g ou en gélules pratiques. Sur ParaTunisie, retrouvez nos formules d'acides aminés branchés {dynamicPriceText} avec livraison 24-48h.",
      },
      {
        heading: "Formats et marques disponibles",
        type: "text",
        content: "Retrouvez des marques européennes reconnues comme BioTechUSA (BCAA Flash Zero), OstroVit, Real Pharm et Optimum Nutrition, en saveurs rafraîchissantes ou en version neutre sans arôme.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Mélangez 5g à 10g de BCAA dans 500ml à 750ml d'eau fraîche et buvez par petites gorgées tout au long de votre séance d'entraînement.",
      },
    ],
    faqs: [
      {
        question: "Pourquoi prendre des BCAA si l'on consomme déjà de la whey ?",
        answer: "Pendant l'effort intense ou les séances à jeun, les BCAA libres dans l'eau d'entraînement sont directement assimilables sans digestion et protègent immédiatement les fibres musculaires du catabolisme.",
      },
      {
        question: "Les BCAA contiennent-ils des calories ou du sucre ?",
        answer: "Les BCAA de qualité sont sans sucre ajouté et apportent un niveau calorique négligeable (environ 20-30 kcal par dose), parfait en période de sèche.",
      },
    ],
  },
  "eaa": {
    title: "Guide d'Achat : EAA (Acides Aminés Essentiels) en Tunisie",
    intro: "Les EAA rassemblent les 9 acides aminés essentiels que le corps humain ne peut synthétiser seul. Ils stimulent la synthèse protéique musculaire complète et soutiennent l'anabolisme plus efficacement que les BCAA seuls.",
    relatedGuide: {
      title: "BCAA ou EAA : Lequel Choisir pour la Récupération ?",
      slug: "bcaa-ou-eaa",
      label: "Lire notre dossier BCAA versus EAA",
    },
    sections: [
      {
        heading: "Comment choisir ses EAA ?",
        type: "points",
        points: [
          "Vérifiez la présence des 9 acides aminés essentiels avec un apport élevé en L-Leucine.",
          "Recherchez des formules enrichies en électrolytes (Sodium, Potassium, Magnésium) pour une hydratation cellulaire optimale.",
          "Privilégiez les acides aminés d'origine végétale issus de fermentation pour une pureté maximale.",
        ],
      },
      {
        heading: "Prix des EAA en Tunisie",
        type: "dynamic-price",
        content: "Découvrez notre sélection d'EAA hautement dosés en Tunisie {dynamicPriceText} chez ParaTunisie avec livraison express à domicile.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Diluez 1 portion (10g à 15g) dans votre bouteille d'eau et consommez pendant l'entraînement ou entre les repas pour maintenir la synthèse protéique active.",
      },
    ],
    faqs: [
      {
        question: "Quelle est la différence entre BCAA et EAA ?",
        answer: "Les BCAA ne contiennent que 3 acides aminés branchés, tandis que les EAA apportent l'intégralité des 9 acides aminés indispensables à la construction de nouvelles fibres musculaires.",
      },
    ],
  },
  "beta-alanine": {
    title: "Guide d'Achat : Bêta-Alanine en Tunisie",
    intro: "La bêta-alanine est un acide aminé précurseur direct de la carnosine intramusculaire, dont le rôle principal est de tamponner l'accumulation d'ions hydrogène et d'acide lactique lors d'efforts intenses répétés.",
    relatedGuide: {
      title: "Citrulline, Arginine & Bêta-Alanine : Les Actifs de Congestion",
      slug: "citrulline-arginine-beta-alanine",
      label: "Consulter notre guide sur la bêta-alanine et les actifs de congestion",
    },
    sections: [
      {
        heading: "Comment choisir sa bêta-alanine ?",
        type: "points",
        points: [
          "Optez pour une poudre de bêta-alanine 100% pure et micronisée pour une excellente miscibilité.",
          "Vérifiez le dosage recommandé : 3g à 5g par jour pour saturer les niveaux de carnosine musculaire.",
          "Peut être consommée seule ou intégrée à votre boisson pré-entraînement maison.",
        ],
      },
      {
        heading: "Prix de la bêta-alanine en Tunisie",
        type: "dynamic-price",
        content: "Retrouvez des pots de bêta-alanine pure en Tunisie {dynamicPriceText} sur ParaTunisie avec garantie d'authenticité et expédition rapide.",
      },
      {
        heading: "Conseils d'utilisation et dosage",
        type: "text",
        content: "Prenez 3g à 5g par jour fractionnés en 1 à 2 prises, de préférence 20 à 30 minutes avant votre séance d'entraînement. Une utilisation quotidienne sur 4 à 6 semaines sature progressivement les stocks de carnosine.",
      },
    ],
    faqs: [
      {
        question: "Pourquoi la bêta-alanine provoque-t-elle des picotements ?",
        answer: "La sensation de picotement (paresthésie) est une réaction physiologique normale et inoffensive résultant de la stimulation temporaire des récepteurs nerveux cutanés.",
      },
    ],
  },
  "citrulline": {
    title: "Guide d'Achat : L-Citrulline & Citrulline Malate en Tunisie",
    intro: "La citrulline est un acide aminé précurseur d'oxyde nitrique (NO) très efficace pour améliorer la vasodilatation artérielle, l'afflux sanguin dans les muscles et la congestion à l'entraînement.",
    relatedGuide: {
      title: "Citrulline, Arginine & Bêta-Alanine : Les Actifs de Congestion",
      slug: "citrulline-arginine-beta-alanine",
      label: "Lire notre dossier sur la citrulline et l'oxyde nitrique",
    },
    sections: [
      {
        heading: "Comment choisir sa citrulline ?",
        type: "points",
        points: [
          "Citrulline Malate (ratio 2:1) : forme liée à l'acide malique, idéale pour combiner congestion et recyclage de l'acide lactique.",
          "L-Citrulline pure : forme 100% libre pour un dosage concentré en matière active.",
          "Dosage optimal : 5g à 8g environ 30 minutes avant l'effort.",
        ],
      },
      {
        heading: "Prix de la citrulline en Tunisie",
        type: "dynamic-price",
        content: "Achetez votre citrulline malate pure en Tunisie {dynamicPriceText} chez ParaTunisie avec livraison express dans tous les gouvernorats.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Diluez 5g à 8g de citrulline dans un verre d'eau ou votre boisson pré-workout 30 minutes avant votre séance d'entraînement.",
      },
    ],
    faqs: [
      {
        question: "Quelle différence entre L-Arginine et L-Citrulline ?",
        answer: "La L-Citrulline n'est pas dégradée par le foie lors du premier passage, augmentant plus efficacement le taux d'arginine et d'oxyde nitrique dans le sang que la L-Arginine elle-même.",
      },
    ],
  },
  "vitamines": {
    title: "Guide d'Achat : Vitamines & Multivitamines en Tunisie",
    intro: "Les vitamines soutiennent l'ensemble des réactions métaboliques : production d'énergie cellulaire, maintien de l'immunité, protection antioxydante et régulation hormonale chez les personnes actives et sportives.",
    relatedGuide: {
      title: "Vitamines & Minéraux pour Sportifs en Tunisie : Les Essentiels",
      slug: "vitamines-pour-sportifs-guide",
      label: "Consulter notre guide complet des vitamines pour sportifs",
    },
    sections: [
      {
        heading: "Comment choisir ses vitamines ?",
        type: "points",
        points: [
          "Multivitamines complets : couvrent 100% des VNR en vitamines A, groupe B, C, D3, E et oligo-éléments.",
          "Vitamine D3 + K2 : synergie capitale pour la santé osseuse, l'immunité et la fonction musculaire.",
          "Vitamine C à libération prolongée : renforce les défenses naturelles et combat la fatigue oxydative.",
        ],
      },
      {
        heading: "Prix des vitamines en Tunisie",
        type: "dynamic-price",
        content: "Nos complexes multivitaminés et vitamines ciblées sont disponibles en Tunisie {dynamicPriceText} chez ParaTunisie avec livraison 24-48h.",
      },
      {
        heading: "Conseils de prise",
        type: "text",
        content: "Prenez vos vitamines le matin au cours du petit-déjeuner avec un grand verre d'eau et une source de lipides alimentaires pour optimiser l'assimilation des vitamines liposolubles (A, D, E, K).",
      },
    ],
    faqs: [
      {
        question: "Pourquoi les sportifs ont-ils des besoins accrus en vitamines ?",
        answer: "L'effort physique intense accélère les dépenses énergétiques, la sudation et le renouvellement cellulaire, rendant une supplémentation en micronutriments très utile.",
      },
    ],
  },
  "zinc": {
    title: "Guide d'Achat : Zinc Chélaté & Minéraux en Tunisie",
    intro: "Le zinc est un oligo-élément capital participant à plus de 300 réactions enzymatiques, au maintien d'un taux normal de testostérone, à la synthèse des protéines et au bon fonctionnement immunitaire.",
    relatedGuide: {
      title: "Le Zinc en Musculation : Rôle Hormonal, Immunité & Posologie",
      slug: "zinc-sportif-musculation",
      label: "Lire notre guide complet sur le zinc en musculation",
    },
    sections: [
      {
        heading: "Comment choisir son complément de zinc ?",
        type: "points",
        points: [
          "Privilégiez les formes hautement biodisponibles : Zinc Bisglycinate ou Zinc Gluconate pour une tolérance digestive parfaite.",
          "Vérifiez le dosage quotidien : entre 10mg et 25mg de zinc élémentaire pour respecter les apports de sécurité.",
          "Formules combinées ZMB6 (Zinc + Magnésium + Vitamine B6) pour la récupération nocturne.",
        ],
      },
      {
        heading: "Prix du zinc en Tunisie",
        type: "dynamic-price",
        content: "Retrouvez des compléments de zinc chélaté pur en Tunisie {dynamicPriceText} sur ParaTunisie avec livraison rapide.",
      },
      {
        heading: "Conseils de prise",
        type: "text",
        content: "Prenez 1 gélule le soir au cours du dîner ou avant le coucher avec un verre d'eau, de préférence à distance des produits très riches en calcium ou caféine.",
      },
    ],
    faqs: [
      {
        question: "Pourquoi associer Zinc et Magnésium ?",
        answer: "L'association synergique Zinc + Magnésium + Vitamine B6 favorise la relaxation neuromusculaire et optimise la qualité du sommeil profond réparateur.",
      },
    ],
  },
  "magnesium": {
    title: "Guide d'Achat : Magnésium & Vitamine B6 en Tunisie",
    intro: "Le magnésium participe activement à la contraction musculaire, à la réduction de la fatigue nerveuse et au métabolisme énergétique. Il est indispensable pour prévenir les crampes et l'irritabilité.",
    relatedGuide: {
      title: "Magnésium Bisglycinate : Bienfaits, Stress & Récupération",
      slug: "magnesium-bisglycinate-bienfaits",
      label: "Consulter notre guide sur le magnésium bisglycinate",
    },
    sections: [
      {
        heading: "Comment choisir son magnésium ?",
        type: "points",
        points: [
          "Optez pour le Magnésium Bisglycinate, Citrate ou Malate : formes hautement assimilables sans effet laxatif.",
          "Recherchez la présence de Vitamine B6 pour faciliter l'entrée du magnésium dans les cellules.",
          "Dosage standard : 200mg à 400mg de magnésium élémentaire par jour.",
        ],
      },
      {
        heading: "Prix du magnésium en Tunisie",
        type: "dynamic-price",
        content: "Découvrez notre gamme de magnésium chélaté et B6 en Tunisie {dynamicPriceText} chez ParaTunisie avec livraison 24-48h.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Prenez votre dose de magnésium le soir au cours du repas ou au coucher avec un verre d'eau pour favoriser la détente musculaire et un sommeil profond.",
      },
    ],
    faqs: [
      {
        question: "Quels sont les signes d'un manque de magnésium ?",
        answer: "Les crampes musculaires nocturnes, les paupières qui tressautent, la fatigue matinale et la nervosité sont les signes les plus fréquents d'un apport insuffisant en magnésium.",
      },
    ],
  },
  "omega-3": {
    title: "Guide d'Achat : Oméga 3 EPA & DHA en Tunisie",
    intro: "Les acides gras oméga-3 (EPA et DHA) sont des acides gras essentiels qui soutiennent la fonction cardiovasculaire, la santé cérébrale et aident à moduler l'inflammation articulaire et musculaire liée aux entraînements intenses.",
    relatedGuide: {
      title: "Oméga 3 en Tunisie : Bienfaits EPA & DHA pour le Cœur et le Sport",
      slug: "omega-3-tunisie-guide",
      label: "Consulter notre guide complet sur les oméga 3 en Tunisie",
    },
    sections: [
      {
        heading: "Comment choisir ses oméga 3 ?",
        type: "points",
        points: [
          "Concentration en actifs : privilégiez un apport d'au moins 500mg à 1000mg combiné d'EPA et DHA par portion.",
          "Pureté de l'huile : huiles de petits poissons sauvages purifiées et certifiées sans métaux lourds (mercure, plomb).",
          "Présence de Vitamine E naturelle pour protéger les acides gras contre l'oxydation.",
        ],
      },
      {
        heading: "Prix des oméga 3 en Tunisie",
        type: "dynamic-price",
        content: "Sur ParaTunisie, commandez vos oméga 3 hautement concentrés {dynamicPriceText} avec livraison rapide dans toute la Tunisie.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Prenez 1 à 2 capsules par jour au cours d'un repas principal contenant des graisses alimentaires pour une absorption digestive maximale.",
      },
    ],
    faqs: [
      {
        question: "Les oméga 3 aident-ils à réduire les douleurs articulaires ?",
        answer: "Oui, les métabolites de l'EPA et du DHA régulent les cascades inflammatoires de l'organisme, favorisant le confort et la souplesse des articulations sollicitées par le sport.",
      },
    ],
  },
  "ashwagandha": {
    title: "Guide d'Achat : Ashwagandha en Tunisie",
    intro: "L'Ashwagandha (Withania somnifera) est une plante adaptogène ancestrale réputée pour sa capacité à réguler le cortisol, réduire le stress physique et mental, favoriser un sommeil réparateur et soutenir la vitalité.",
    relatedGuide: {
      title: "Ashwagandha en Tunisie : Bienfaits, Posologie & Où Acheter",
      slug: "ashwagandha-tunisie-guide",
      label: "Lire notre dossier complet sur l'ashwagandha en Tunisie",
    },
    sections: [
      {
        heading: "Comment choisir son Ashwagandha ?",
        type: "points",
        points: [
          "Privilégiez les extraits standardisés en withanolides (5% à 10%) comme l'extrait breveté KSM-66 ou Sensoril.",
          "Optez pour des formules pures en gélules végétales sans excipients superflus.",
          "Contrôlez l'origine et les certifications des laboratoires fabricants (BioTechUSA, OstroVit, Real Pharm).",
        ],
      },
      {
        heading: "Prix de l'Ashwagandha en Tunisie",
        type: "dynamic-price",
        content: "Retrouvez nos extraits standardisés d'Ashwagandha KSM-66 en Tunisie {dynamicPriceText} chez ParaTunisie avec expédition 24-48h.",
      },
      {
        heading: "Conseils de prise & posologie",
        type: "text",
        content: "Prenez 1 gélule (300mg à 600mg d'extrait standardisé) par jour, de préférence le soir au cours du dîner pour favoriser la relaxation et un sommeil réparateur.",
      },
    ],
    faqs: [
      {
        question: "Combien de temps faut-il pour ressentir les bienfaits de l'Ashwagandha ?",
        answer: "Les effets sur la relaxation et la qualité du sommeil apparaissent généralement après 7 à 14 jours de prise quotidienne régulière.",
      },
      {
        question: "L'Ashwagandha convient-il aux sportifs ?",
        answer: "Oui, en contribuant à moduler le cortisol (hormone catabolique) et en soutenant la récupération nocturne, l'Ashwagandha favorise un environnement hormonal sain pour la progression.",
      },
    ],
  },
  "boosters-hormonaux": {
    title: "Guide d'Achat : Boosters & Tribulus en Tunisie",
    intro: "Les boosters de vitalité associent des extraits de plantes traditionnelles (Tribulus Terrestris, Maca, Fenugrec) et des minéraux essentiels (Zinc, Magnésium) pour soutenir le tonus, la vigueur et les performances physiques des athlètes.",
    relatedGuide: {
      title: "Le Zinc en Musculation : Rôle Hormonal, Immunité & Posologie",
      slug: "zinc-sportif-musculation",
      label: "Consulter notre guide sur le zinc et la régulation hormonale",
    },
    sections: [
      {
        heading: "Comment choisir son booster de vitalité ?",
        type: "points",
        points: [
          "Vérifiez la concentration en saponines actives (au moins 80% à 90% pour un extrait de Tribulus de qualité).",
          "Recherchez des formules complètes associant Zinc, Magnésium et Vitamine B6.",
          "Privilégiez des marques certifiées garantissant des ingrédients naturels sans substances dopantes.",
        ],
      },
      {
        heading: "Prix des boosters en Tunisie",
        type: "dynamic-price",
        content: "Nos formules boosters et tribulus authentiques sont disponibles en Tunisie {dynamicPriceText} sur ParaTunisie avec livraison rapide.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Prenez 1 à 2 gélules par jour réparties entre le matin et le soir au cours des repas. Il est conseillé de faire des cures de 6 à 8 semaines suivies d'une pause de 2 semaines.",
      },
    ],
    faqs: [
      {
        question: "Les boosters de testostérone sont-ils naturels ?",
        answer: "Oui, les formules sélectionnées sur ParaTunisie sont composées d'extraits végétaux et de minéraux naturels autorisés qui soutiennent les fonctions physiologiques normales de l'organisme.",
      },
    ],
  },
  "l-carnitine": {
    title: "Guide d'Achat : L-Carnitine en Tunisie",
    intro: "La L-Carnitine est un acide aminé impliqué dans le transport des acides gras à longue chaîne vers les mitochondries cellulaires, où ils sont convertis en énergie (ATP) pendant l'effort physique.",
    relatedGuide: {
      title: "L-Carnitine & Perte de Graisse : Mode d'Emploi & Efficacité",
      slug: "l-carnitine-perte-graisse",
      label: "Consulter notre dossier complet sur la L-Carnitine",
    },
    sections: [
      {
        heading: "Comment choisir sa L-Carnitine ?",
        type: "points",
        points: [
          "Formule liquide : absorption très rapide, idéale à consommer juste avant une séance de cardio ou de musculation.",
          "Gélules concentrées : pratiques à doser et à transporter lors de vos déplacements.",
          "Dosage efficace : 1000mg à 2000mg de L-Carnitine pure par prise.",
        ],
      },
      {
        heading: "Prix de la L-Carnitine en Tunisie",
        type: "dynamic-price",
        content: "Retrouvez nos formules de L-Carnitine liquide et en gélules en Tunisie {dynamicPriceText} chez ParaTunisie avec livraison 24-48h.",
      },
      {
        heading: "Conseils d'utilisation",
        type: "text",
        content: "Consommez 1000mg à 2000mg de L-Carnitine 20 à 30 minutes avant votre séance d'entraînement de cardio ou de musculation avec un verre d'eau.",
      },
    ],
    faqs: [
      {
        question: "La L-Carnitine est-elle efficace sans faire de sport ?",
        answer: "La L-Carnitine optimise l'utilisation des lipides à l'effort ; son efficacité est donc maximale lorsqu'elle est combinée à une activité physique régulière et un déficit calorique modéré.",
      },
    ],
  },
  "bruleurs-de-graisse": {
    title: "Guide d'Achat : Brûleurs de Graisse en Tunisie",
    intro: "Les brûleurs de graisse (fat burners) sont des complexes thermogéniques et lipotropes formulés à base d'extraits de thé vert, caféine, carnitine et piment de Cayenne pour soutenir la dépense énergétique lors des phases de sèche.",
    relatedGuide: {
      title: "Brûleurs de Graisse en Tunisie : Guide & Conseils d'Utilisation",
      slug: "bruleur-de-graisse-tunisie",
      label: "Lire notre guide complet sur les brûleurs de graisse",
    },
    sections: [
      {
        heading: "Comment choisir son brûleur de graisse ?",
        type: "points",
        points: [
          "Thermogénique avec caféine : augmente la dépense calorique de base et la vigilance mentale en journée.",
          "Formule lipotrope sans stimulants : adaptée aux personnes sensibles à la caféine ou aux séances en soirée.",
          "Présence d'extraits titrés (Thé vert EGCG, Café vert, Poivre noir Piperine) pour une efficacité synergique.",
        ],
      },
      {
        heading: "Prix des brûleurs de graisse en Tunisie",
        type: "dynamic-price",
        content: "Découvrez notre sélection de brûleurs de graisse thermogéniques certifiés en Tunisie {dynamicPriceText} chez ParaTunisie avec livraison rapide.",
      },
      {
        heading: "Conseils et précautions",
        type: "text",
        content: "Prenez votre dose le matin ou 30 minutes avant l'entraînement avec un grand verre d'eau. Commencez par une demi-dose pour évaluer votre tolérance et évitez toute prise après 17h.",
      },
    ],
    faqs: [
      {
        question: "Un brûleur de graisse fait-il maigrir sans régime ?",
        answer: "Non. Le brûleur de graisse est un coup de pouce qui accélère les résultats d'un rééquilibrage alimentaire hypocalorique et d'une pratique sportive régulière.",
      },
    ],
  },
  "accessoires": {
    title: "Guide : Équipements & Accessoires de Musculation en Tunisie",
    intro: "Un équipement de musculation adéquat garantit votre sécurité articulaire, améliore votre grip lors des charges lourdes et facilite votre nutrition sportive quotidienne grâce à des shakers étanches et ergonomiques.",
    relatedGuide: {
      title: "Compléments Avant, Pendant et Après l'Entraînement",
      slug: "complements-avant-pendant-apres-entrainement",
      label: "Consulter notre guide sur l'organisation des prises et équipements",
    },
    sections: [
      {
        heading: "Comment choisir ses accessoires de musculation ?",
        type: "points",
        points: [
          "Shakers sans BPA avec grille ou bille mélangeuse pour des shakes protéinés onctueux sans grumeaux.",
          "Sangles de tirage (Lifting Straps) pour sécuriser vos prises lourdes au soulevé de terre et tirage dos.",
          "Ceintures lombaires en cuir pour maintenir la pression intra-abdominale lors des squats et deadlifts lourds.",
          "Gants de musculation renforcés pour protéger les paumes et éviter les callosités.",
        ],
      },
      {
        heading: "Prix des accessoires en Tunisie",
        type: "dynamic-price",
        content: "Sur ParaTunisie, retrouvez des accessoires de musculation robustes et durables {dynamicPriceText} avec livraison 24-48h.",
      },
      {
        heading: "Entretien du matériel",
        type: "text",
        content: "Lavez vos shakers à l'eau tiède immédiatement après chaque utilisation pour éviter tout développement d'odeurs et séchez vos accessoires en tissu à l'air libre.",
      },
    ],
    faqs: [
      {
        question: "Quand faut-il utiliser une ceinture lombaire ?",
        answer: "La ceinture lombaire est recommandée sur les séries de travail lourdes (au-delà de 80% du 1RM) sur les mouvements polyarticulaires axiaux comme le squat et le soulevé de terre.",
      },
      {
        question: "Les shakers sont-ils garantis sans bisphénol A (BPA) ?",
        answer: "Oui, tous les shakers et bouteilles proposés sur ParaTunisie sont certifiés de qualité alimentaire sans BPA ni phtalates.",
      },
    ],
  },
};

export function getCategoryGuide(slug: string): CategoryGuide | null {
  return CATEGORY_GUIDES[slug] || null;
}
