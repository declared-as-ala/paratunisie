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
  subcategories: Subcategory[];
  concerns: Concern[];
  products: ProductSummary[];
};

export const categories: Category[] = [
  {
    "slug": "creatine",
    "name": "Créatine",
    "eyebrow": "Force & Puissance",
    "description": "Créatines monohydrates micronisées pures pour augmenter la force et le volume musculaire.",
    "seoIntro": "Découvrez notre sélection de créatines monohydrates en poudre et gélules en Tunisie. Idéales pour optimiser vos performances, votre force explosive et accélérer votre développement musculaire.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "creatine",
        "name": "Créatine"
      }
    ]
  },
  {
    "slug": "whey-proteine",
    "name": "Whey Protéine",
    "eyebrow": "Construction Musculaire",
    "description": "Protéines de lactosérum de haute qualité pour la prise de muscle sec et la récupération.",
    "seoIntro": "Sélection des meilleures whey protéines en Tunisie : concentrées, isolats et formules anaboliques pour nourrir vos fibres musculaires après l'effort.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "whey-proteine",
        "name": "Whey Protéine"
      }
    ]
  },
  {
    "slug": "gainers-proteines",
    "name": "Gainers",
    "eyebrow": "Prise de Masse",
    "description": "Formules riches en protéines et glucides complexes pour une prise de masse rapide et efficace.",
    "seoIntro": "Nos gainers caloriques et protéinés aident les profils ectomorphes et sportifs à prendre du poids et développer leur masse musculaire de manière équilibrée.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "gainers-proteines",
        "name": "Gainers"
      }
    ]
  },
  {
    "slug": "pre-workout",
    "name": "Pre-Workout",
    "eyebrow": "Énergie & Focus",
    "description": "Boosters d'entraînement puissants pour l'énergie, la congestion et la concentration.",
    "seoIntro": "Boostez vos séances d'entraînement avec notre sélection de pre-workouts puissants contenant caféine, bêta-alanine et précurseurs d'oxyde nitrique.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "pre-workout",
        "name": "Pre-Workout"
      }
    ]
  },
  {
    "slug": "bcaa",
    "name": "BCAA",
    "eyebrow": "Acides Aminés",
    "description": "Acides aminés branchés (Leucine, Isoleucine, Valine) pour préserver le muscle et récupérer.",
    "seoIntro": "Les BCAA sont essentiels pour stopper le catabolisme musculaire et favoriser une récupération rapide pendant et après vos séances de sport.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "bcaa",
        "name": "BCAA"
      }
    ]
  },
  {
    "slug": "eaa",
    "name": "EAA",
    "eyebrow": "Acides Aminés Essentiels",
    "description": "Le profil complet des 9 acides aminés essentiels pour la synthèse des protéines.",
    "seoIntro": "Les acides aminés essentiels (EAA) soutiennent la synthèse musculaire maximale et l'hydratation cellulaire durant l'effort.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "eaa",
        "name": "EAA"
      }
    ]
  },
  {
    "slug": "beta-alanine",
    "name": "Beta-Alanine",
    "eyebrow": "Endurance Musculaire",
    "description": "Acide aminé précurseur de la carnosine pour repousser la fatigue musculaire.",
    "seoIntro": "La bêta-alanine permet de retarder l'apparition de l'acide lactique et d'améliorer l'endurance musculaire lors d'efforts intenses.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "beta-alanine",
        "name": "Beta-Alanine"
      }
    ]
  },
  {
    "slug": "citrulline",
    "name": "Citrulline",
    "eyebrow": "Vasodilatation & Congestion",
    "description": "Précurseur d'oxyde nitrique pour une vascularité et une congestion exceptionnelles.",
    "seoIntro": "La citrulline et l'arginine améliorent le flux sanguin, l'oxygénation des muscles et la congestion lors des séances d'entraînement.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "citrulline",
        "name": "Citrulline"
      }
    ]
  },
  {
    "slug": "vitamines",
    "name": "Vitamines",
    "eyebrow": "Vitalité & Immunité",
    "description": "Vitamines C, D3+K2 et complexes multivitaminés complets pour la vitalité quotidienne.",
    "seoIntro": "Découvrez notre gamme de vitamines essentielles pour renforcer votre système immunitaire, combattre la fatigue et soutenir votre métabolisme.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "vitamines",
        "name": "Vitamines"
      }
    ]
  },
  {
    "slug": "zinc",
    "name": "Zinc",
    "eyebrow": "Minéraux Essentiels",
    "description": "Soutien immunitaire, équilibre hormonal et santé de la peau et des ongles.",
    "seoIntro": "Le zinc est un oligo-élément capital participant à plus de 300 réactions enzymatiques, au maintien du taux de testostérone et à l'immunité.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "zinc",
        "name": "Zinc"
      }
    ]
  },
  {
    "slug": "magnesium",
    "name": "Magnésium",
    "eyebrow": "Équilibre Nerveux & Musculaire",
    "description": "Magnésium avec Vitamine B6 pour réduire le stress, les crampes et la fatigue.",
    "seoIntro": "Indispensable pour la contraction musculaire et la relaxation du système nerveux, le magnésium combat la fatigue et le surmenage.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "magnesium",
        "name": "Magnésium"
      }
    ]
  },
  {
    "slug": "omega-3",
    "name": "Omega 3",
    "eyebrow": "Acides Gras Essentiels",
    "description": "Huiles de poisson hautement concentrées en EPA & DHA pour le cœur et les articulations.",
    "seoIntro": "Les oméga-3 favorisent la santé cardiovasculaire, réduisent les inflammations articulaires et soutiennent les fonctions cérébrales.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "omega-3",
        "name": "Omega 3"
      }
    ]
  },
  {
    "slug": "ashwagandha",
    "name": "Ashwagandha",
    "eyebrow": "Plante Adaptogène",
    "description": "Achetez vos produits Ashwagandha en Tunisie sur ParaTunisie. Découvrez notre sélection de compléments à base d’Ashwagandha, avec livraison en Tunisie.",
    "seoIntro": "Découvrez notre sélection de compléments alimentaires à base d'Ashwagandha (Withania Somnifera) en Tunisie. Plante adaptogène pure pour réguler le cortisol, réduire le stress, optimiser le sommeil réparateur et soutenir la vitalité quotidienne au meilleur prix.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "ashwagandha",
        "name": "Ashwagandha"
      }
    ]
  },
  {
    "slug": "boosters-hormonaux",
    "name": "Boosters",
    "eyebrow": "Vitalité & Tonus",
    "description": "Formules avancées à base de plantes et minéraux pour stimuler le tonus masculin.",
    "seoIntro": "Nos boosters soutiennent la production naturelle de testostérone, la vigueur et les performances physiques des athlètes.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "boosters-hormonaux",
        "name": "Boosters"
      }
    ]
  },
  {
    "slug": "l-carnitine",
    "name": "L-Carnitine",
    "eyebrow": "Énergie & Définition",
    "description": "Transporteur d'acides gras vers les cellules pour la production d'énergie à l'effort.",
    "seoIntro": "La L-Carnitine aide à mobiliser les graisses stockées pour les convertir en énergie disponible pendant vos entraînements cardio et fitness.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "l-carnitine",
        "name": "L-Carnitine"
      }
    ]
  },
  {
    "slug": "bruleurs-de-graisse",
    "name": "Brûleurs de Graisse",
    "eyebrow": "Sèche & Métabolisme",
    "description": "Formules thermogéniques concentrées pour accélérer la combustion des calories.",
    "seoIntro": "Nos brûleurs de graisse vous accompagnent dans vos périodes de sèche et de perte de poids en stimulant votre métabolisme de base.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      }
    ],
    "concerns": [
      {
        "slug": "bruleurs-de-graisse",
        "name": "Brûleurs de Graisse"
      }
    ]
  },
  {
    "slug": "accessoires",
    "name": "Accessoires",
    "eyebrow": "Équipement & Matériel",
    "description": "Shakers, gants de musculation, ceintures lombaires et sangles de tirage pour optimiser vos performances à la salle.",
    "seoIntro": "Notre gamme d'accessoires de musculation inclut des shakers sans BPA, gants haute résistance, ceintures lombaires professionnelles, sangles de tirage et tout l'équipement nécessaire pour performer à la salle. Livraison rapide 24-48h partout en Tunisie. Paiement à la livraison disponible.",
    "subcategories": [
      {
        "slug": "tous",
        "name": "Tous les produits"
      },
      {
        "slug": "shakers",
        "name": "Shakers & Bouteilles"
      },
      {
        "slug": "protection",
        "name": "Gants & Protection"
      },
      {
        "slug": "ceintures",
        "name": "Ceintures & Soutien"
      },
      {
        "slug": "sangles",
        "name": "Sangles & Straps"
      }
    ],
    "concerns": [
      {
        "slug": "accessoires",
        "name": "Accessoires Musculation"
      }
    ]
  }
].map((cat) => ({
  ...cat,
  subcategories: [
    { slug: "tous", name: "Tous les produits", match: () => true },
  ],
  concerns: [
    { slug: cat.slug, name: cat.name, match: (p: ProductSummary) => p.category.toLowerCase() === cat.name.toLowerCase() },
  ],
  products: products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()),
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

