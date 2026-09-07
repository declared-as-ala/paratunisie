import { products, type ProductSummary } from "@/lib/data/products";

export type Subcategory = {
  slug: string;
  name: string;
  match: (product: ProductSummary) => boolean;
};

export type Concern = {
  slug: string;
  name: string;
  icon?: string;
  match: (product: ProductSummary) => boolean;
};

export type Category = {
  slug: string;
  name: string;
  eyebrow?: string;
  description: string;
  seoIntro: string;
  seoTitle?: string;
  seoH1?: string;
  seoDescription?: string;
  subcategories: Subcategory[];
  concerns: Concern[];
  products: ProductSummary[];
};

export const categories: Category[] = [
  {
    slug: "nutrition-sportive",
    name: "Nutrition Sportive",
    eyebrow: "Performance & Musculation",
    seoH1: "Nutrition Sportive en Tunisie",
    seoTitle: "Nutrition Sportive Tunisie : Compléments & Protéines | ParaTunisie",
    seoDescription: "Boutique de nutrition sportive en Tunisie : whey, créatine, gainers, pre-workout, BCAA et compléments musculation authentiques avec livraison rapide 24-48h.",
    description: "Gamme complète de nutrition sportive pour athlètes et pratiquants de musculation en Tunisie.",
    seoIntro: "Retrouvez tout l'univers de la nutrition sportive en Tunisie : protéines whey, créatine monohydrate, boosters pre-workout, acides aminés et gainers pour soutenir vos objectifs physiques.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "nutrition-sportive", name: "Nutrition Sportive" }],
  },
  {
    slug: "complements-alimentaires",
    name: "Compléments Alimentaires",
    eyebrow: "Santé & Vitalité",
    seoH1: "Compléments Alimentaires en Tunisie",
    seoTitle: "Compléments Alimentaires Tunisie : Santé, Vitalité & Sport | ParaTunisie",
    seoDescription: "Large choix de compléments alimentaires en Tunisie : vitamines, oméga 3, magnésium, ashwagandha, zinc et minéraux. Produits 100% authentiques livrés en 24-48h.",
    description: "Compléments alimentaires de qualité pour la santé, l'immunité, la vitalité et les performances.",
    seoIntro: "Découvrez notre gamme complète de compléments alimentaires en Tunisie : vitamines, minéraux, oméga 3, magnésium chélaté et extraits de plantes adaptogènes pour soutenir votre forme et votre bien-être au quotidien.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "complements-alimentaires", name: "Compléments Alimentaires" }],
  },
  {
    slug: "creatine",
    name: "Créatine",
    eyebrow: "Force & Puissance",
    seoH1: "Créatine Monohydrate en Tunisie",
    seoTitle: "Créatine Monohydrate Tunisie : Prix & Produits | ParaTunisie",
    seoDescription: "Achetez votre créatine monohydrate en Tunisie au meilleur prix chez ParaTunisie. Poudres micronisées 100% pures et gélules certifiées avec livraison 24-48h.",
    description: "Créatines monohydrates micronisées pures pour augmenter la force et le volume musculaire.",
    seoIntro: "Découvrez notre sélection de créatines monohydrates en poudre et gélules en Tunisie. Idéales pour optimiser vos performances, votre force explosive et accélérer votre développement musculaire.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "creatine", name: "Créatine" }],
  },
  {
    slug: "whey-proteine",
    name: "Whey Protéine",
    eyebrow: "Construction Musculaire",
    seoH1: "Whey Protein en Tunisie",
    seoTitle: "Whey Protein Tunisie : Prix & Sélection | ParaTunisie",
    seoDescription: "Découvrez notre sélection de whey protein en Tunisie aux meilleurs prix. Whey concentrée, whey isolate et hydrolysat 100% authentiques avec livraison 24-48h.",
    description: "Protéines de lactosérum de haute qualité pour la prise de muscle sec et la récupération.",
    seoIntro: "Sélection des whey protéines en Tunisie : concentrées, isolats et formules pour nourrir vos fibres musculaires et optimiser votre récupération après l'effort.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "whey-proteine", name: "Whey Protéine" }],
  },
  {
    slug: "gainers-proteines",
    name: "Gainers",
    eyebrow: "Prise de Masse",
    seoH1: "Gainer & Prise de Masse en Tunisie",
    seoTitle: "Gainer Prise de Masse Tunisie : Prix & Produits | ParaTunisie",
    seoDescription: "Achetez votre mass gainer en Tunisie chez ParaTunisie. Formules hypercaloriques et riches en protéines pour une prise de masse rapide. Livraison 24-48h.",
    description: "Formules riches en protéines et glucides complexes pour une prise de masse rapide et efficace.",
    seoIntro: "Nos gainers caloriques et protéinés aident les profils ectomorphes et sportifs à prendre du poids et développer leur masse musculaire de manière équilibrée.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "gainers-proteines", name: "Gainers" }],
  },
  {
    slug: "pre-workout",
    name: "Pre-Workout",
    eyebrow: "Énergie & Focus",
    seoH1: "Pre-Workout en Tunisie",
    seoTitle: "Pre Workout Tunisie : Prix & Produits | ParaTunisie",
    seoDescription: "Achetez votre pre-workout en Tunisie au meilleur prix chez ParaTunisie. Boosters d'énergie, congestion et concentration avec ou sans caféine. Livraison rapide 24-48h.",
    description: "Boosters d'entraînement pour l'énergie, la congestion et la concentration.",
    seoIntro: "Achetez vos boosters pre-workout en Tunisie au meilleur prix. Découvrez notre sélection de formules authentiques (avec ou sans caféine, citrulline, bêta-alanine) adaptées à vos entraînements intenses, avec disponibilité en stock et livraison rapide 24-48h.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "pre-workout", name: "Pre-Workout" }],
  },
  {
    slug: "bcaa",
    name: "BCAA",
    eyebrow: "Acides Aminés Branchés",
    seoH1: "BCAA en Tunisie",
    seoTitle: "BCAA Tunisie : Acides Aminés & Récupération | ParaTunisie",
    seoDescription: "Achetez vos BCAA 2:1:1 et 4:1:1 en Tunisie au meilleur prix chez ParaTunisie. Poudres et gélules pour la récupération musculaire. Livraison rapide 24-48h.",
    description: "Acides aminés branchés (Leucine, Isoleucine, Valine) pour préserver le muscle et récupérer.",
    seoIntro: "Les BCAA sont essentiels pour stopper le catabolisme musculaire et favoriser une récupération rapide pendant et après vos séances de sport.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "bcaa", name: "BCAA" }],
  },
  {
    slug: "eaa",
    name: "EAA",
    eyebrow: "Acides Aminés Essentiels",
    seoH1: "EAA en Tunisie",
    seoTitle: "EAA Tunisie : Acides Aminés Essentiels | ParaTunisie",
    seoDescription: "Découvrez notre gamme d'EAA (acides aminés essentiels) en Tunisie. Formules complètes pour la synthèse protéique et l'anabolisme. Livraison 24-48h.",
    description: "Le profil complet des 9 acides aminés essentiels pour la synthèse des protéines.",
    seoIntro: "Les acides aminés essentiels (EAA) soutiennent la synthèse musculaire maximale et l'hydratation cellulaire durant l'effort.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "eaa", name: "EAA" }],
  },
  {
    slug: "beta-alanine",
    name: "Beta-Alanine",
    eyebrow: "Endurance Musculaire",
    seoH1: "Beta-Alanine en Tunisie",
    seoTitle: "Beta-Alanine Tunisie : Endurance & Performance | ParaTunisie",
    seoDescription: "Achetez votre bêta-alanine pure en Tunisie chez ParaTunisie. Retardez la fatigue musculaire et augmentez vos répétitions. Livraison 24-48h.",
    description: "Acide aminé précurseur de la carnosine pour repousser la fatigue musculaire.",
    seoIntro: "La bêta-alanine permet de retarder l'apparition de l'acide lactique et d'améliorer l'endurance musculaire lors d'efforts intenses.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "beta-alanine", name: "Beta-Alanine" }],
  },
  {
    slug: "citrulline",
    name: "Citrulline",
    eyebrow: "Vasodilatation & Congestion",
    seoH1: "Citrulline en Tunisie",
    seoTitle: "Citrulline Malate Tunisie : Congestion & Oxyde Nitrique | ParaTunisie",
    seoDescription: "Commandez votre L-Citrulline et Citrulline Malate en Tunisie au meilleur prix. Congestion musculaire et vascularité accrues. Livraison 24-48h.",
    description: "Précurseur d'oxyde nitrique pour une vascularité et une congestion exceptionnelles.",
    seoIntro: "La citrulline et l'arginine améliorent le flux sanguin, l'oxygénation des muscles et la congestion lors des séances d'entraînement.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "citrulline", name: "Citrulline" }],
  },
  {
    slug: "vitamines",
    name: "Vitamines",
    eyebrow: "Vitalité & Immunité",
    seoH1: "Vitamines & Multivitamines en Tunisie",
    seoTitle: "Vitamines Tunisie : Vitamine C, D3+K2 & Complexes | ParaTunisie",
    seoDescription: "Large choix de vitamines en Tunisie chez ParaTunisie : Vitamine C, D3+K2 et multivitamines pour renforcer l'immunité et la vitalité. Livraison 24-48h.",
    description: "Vitamines C, D3+K2 et complexes multivitaminés complets pour la vitalité quotidienne.",
    seoIntro: "Découvrez notre gamme de vitamines essentielles pour renforcer votre système immunitaire, combattre la fatigue et soutenir votre métabolisme.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "vitamines", name: "Vitamines" }],
  },
  {
    slug: "zinc",
    name: "Zinc",
    eyebrow: "Minéraux Essentiels",
    seoH1: "Zinc en Tunisie",
    seoTitle: "Zinc Tunisie : Bisglycinate & Gluconate | ParaTunisie",
    seoDescription: "Achetez votre complément de zinc en Tunisie au meilleur prix. Zinc chélaté hautement assimilable pour l'immunité et la vitalité. Livraison rapide 24-48h.",
    description: "Soutien immunitaire, équilibre hormonal et santé de la peau et des ongles.",
    seoIntro: "Le zinc est un oligo-élément capital participant à plus de 300 réactions enzymatiques, au maintien du taux de testostérone et à l'immunité.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "zinc", name: "Zinc" }],
  },
  {
    slug: "magnesium",
    name: "Magnésium",
    eyebrow: "Équilibre Nerveux & Musculaire",
    seoH1: "Magnésium en Tunisie",
    seoTitle: "Magnésium Tunisie : Bisglycinate & B6 | ParaTunisie",
    seoDescription: "Commandez votre magnésium avec Vitamine B6 en Tunisie chez ParaTunisie. Réduction de la fatigue, relaxation musculaire et anti-stress. Livraison 24-48h.",
    description: "Magnésium avec Vitamine B6 pour réduire le stress, les crampes et la fatigue.",
    seoIntro: "Indispensable pour la contraction musculaire et la relaxation du système nerveux, le magnésium combat la fatigue et le surmenage.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "magnesium", name: "Magnésium" }],
  },
  {
    slug: "omega-3",
    name: "Omega 3",
    eyebrow: "Acides Gras Essentiels",
    seoH1: "Omega 3 en Tunisie",
    seoTitle: "Omega 3 Tunisie : Huile de Poisson EPA & DHA | ParaTunisie",
    seoDescription: "Achetez vos Omega 3 purs en Tunisie chez ParaTunisie. Huiles de poisson hautement concentrées en EPA & DHA pour le cœur et les articulations. Livraison 24-48h.",
    description: "Huiles de poisson hautement concentrées en EPA & DHA pour le cœur et les articulations.",
    seoIntro: "Les oméga-3 favorisent la santé cardiovasculaire, réduisent les inflammations articulaires et soutiennent les fonctions cérébrales.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "omega-3", name: "Omega 3" }],
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    eyebrow: "Plante Adaptogène",
    seoH1: "Ashwagandha en Tunisie",
    seoTitle: "Ashwagandha Tunisie : KSM-66 & Extrait Pur | ParaTunisie",
    seoDescription: "Achetez votre Ashwagandha KSM-66 en Tunisie chez ParaTunisie. Plante adaptogène pure pour réduire le stress, réguler le cortisol et améliorer le sommeil.",
    description: "Achetez vos compléments d'Ashwagandha en Tunisie sur ParaTunisie avec livraison rapide 24-48h.",
    seoIntro: "Découvrez notre sélection de compléments alimentaires à base d'Ashwagandha (Withania Somnifera) en Tunisie. Plante adaptogène pure pour réguler le cortisol, réduire le stress et soutenir le sommeil réparateur.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "ashwagandha", name: "Ashwagandha" }],
  },
  {
    slug: "boosters-hormonaux",
    name: "Boosters",
    eyebrow: "Vitalité & Tonus",
    seoH1: "Boosters & Tribulus en Tunisie",
    seoTitle: "Boosters Musculation Tunisie : Tribulus & Tonus | ParaTunisie",
    seoDescription: "Retrouvez nos formules boosters de vitalité et tribulus en Tunisie. Soutien naturel du tonus et des performances physiques. Livraison 24-48h.",
    description: "Formules avancées à base de plantes et minéraux pour stimuler le tonus masculin.",
    seoIntro: "Nos boosters soutiennent la vitalité naturelle, la vigueur et les performances physiques des athlètes.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "boosters-hormonaux", name: "Boosters" }],
  },
  {
    slug: "l-carnitine",
    name: "L-Carnitine",
    eyebrow: "Énergie & Définition",
    seoH1: "L-Carnitine en Tunisie",
    seoTitle: "L-Carnitine Tunisie : Liquide & Gélules | ParaTunisie",
    seoDescription: "Achetez votre L-Carnitine liquide ou en gélules en Tunisie chez ParaTunisie. Transporteur d'acides gras pour l'énergie et la sèche. Livraison 24-48h.",
    description: "Transporteur d'acides gras vers les cellules pour la production d'énergie à l'effort.",
    seoIntro: "La L-Carnitine aide à mobiliser les graisses pour les convertir en énergie disponible pendant vos entraînements cardio et fitness.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "l-carnitine", name: "L-Carnitine" }],
  },
  {
    slug: "bruleurs-de-graisse",
    name: "Brûleurs de Graisse",
    eyebrow: "Sèche & Métabolisme",
    seoH1: "Brûleurs de Graisse en Tunisie",
    seoTitle: "Brûleur de Graisse Tunisie : Thermogéniques & Sèche | ParaTunisie",
    seoDescription: "Sélection de brûleurs de graisse thermogéniques en Tunisie chez ParaTunisie. Accélérez votre métabolisme pendant les périodes de sèche. Livraison 24-48h.",
    description: "Formules thermogéniques concentrées pour accélérer la combustion des calories.",
    seoIntro: "Nos brûleurs de graisse vous accompagnent dans vos périodes de sèche et de perte de poids en stimulant votre métabolisme de base.",
    subcategories: [{ slug: "tous", name: "Tous les produits" }],
    concerns: [{ slug: "bruleurs-de-graisse", name: "Brûleurs de Graisse" }],
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    eyebrow: "Équipement & Matériel",
    seoH1: "Accessoires de Musculation en Tunisie",
    seoTitle: "Accessoires Musculation Tunisie : Shakers & Ceintures | ParaTunisie",
    seoDescription: "Achetez vos accessoires de musculation en Tunisie : shakers sans BPA, ceintures lombaires, sangles de tirage et gants haute résistance. Livraison 24-48h.",
    description: "Shakers, gants de musculation, ceintures lombaires et sangles de tirage pour optimiser vos performances à la salle.",
    seoIntro: "Notre gamme d'accessoires de musculation inclut des shakers sans BPA, gants haute résistance, ceintures lombaires professionnelles, sangles de tirage et tout l'équipement nécessaire pour performer à la salle. Livraison rapide 24-48h partout en Tunisie.",
    subcategories: [
      { slug: "tous", name: "Tous les produits" },
      { slug: "shakers", name: "Shakers & Bouteilles" },
      { slug: "protection", name: "Gants & Protection" },
      { slug: "ceintures", name: "Ceintures & Soutien" },
      { slug: "sangles", name: "Sangles & Straps" },
    ],
    concerns: [{ slug: "accessoires", name: "Accessoires Musculation" }],
  },
].map((cat) => ({
  ...cat,
  subcategories: cat.subcategories.map((s) => ({
    ...s,
    match: () => true,
  })),
  concerns: [
    {
      slug: cat.slug,
      name: cat.name,
      match: (p: ProductSummary) =>
        p.category.toLowerCase() === cat.name.toLowerCase() ||
        p.categorySlug === cat.slug,
    },
  ],
  products: products.filter(
    (p) =>
      p.category.toLowerCase() === cat.name.toLowerCase() ||
      p.categorySlug === cat.slug
  ),
}));

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}

export function getBrandsForProducts(productList: ProductSummary[]): string[] {
  return Array.from(new Set(productList.map((p) => p.brand))).sort();
}

export function getSkinTypesForProducts(productList: ProductSummary[]): string[] {
  return Array.from(new Set(productList.flatMap((p) => p.skinTypes))).sort();
}
