import { products } from "@/lib/data/products";

export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  featured?: boolean;
  universe?: string;
  productCount: number;
};

export const brands: Brand[] = [
  {
    "slug": "biotechusa",
    "name": "BioTechUSA",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits BioTechUSA en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 5
  },
  {
    "slug": "challenger-nutrition",
    "name": "Challenger Nutrition",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Challenger Nutrition en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 2
  },
  {
    "slug": "eric-favre",
    "name": "Eric Favre",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Eric Favre en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "fa-engineered-nutrition",
    "name": "FA Engineered Nutrition",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits FA Engineered Nutrition en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "insane-labz",
    "name": "Insane Labz",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Insane Labz en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "muscle-care",
    "name": "Muscle Care",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Muscle Care en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 2
  },
  {
    "slug": "musclepharm",
    "name": "MusclePharm",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits MusclePharm en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "nutrex-research",
    "name": "Nutrex Research",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Nutrex Research en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "optimum-nutrition",
    "name": "Optimum Nutrition",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Optimum Nutrition en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 2
  },
  {
    "slug": "ostrovit",
    "name": "OstroVit",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits OstroVit en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 3
  },
  {
    "slug": "proactive",
    "name": "ProActive",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits ProActive en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "quamtrax",
    "name": "Quamtrax",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Quamtrax en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "real-pharm",
    "name": "Real Pharm",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Real Pharm en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 8
  },
  {
    "slug": "scenit-nutrition",
    "name": "Scenit Nutrition",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Scenit Nutrition en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 2
  },
  {
    "slug": "victor-martinez",
    "name": "Victor Martinez",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Victor Martinez en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "weightworld",
    "name": "WeightWorld",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits WeightWorld en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "xtend",
    "name": "Xtend",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Xtend en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 1
  },
  {
    "slug": "zumub",
    "name": "Zumub",
    "tagline": "Nutrition sportive & santé authentique",
    "description": "Découvrez la gamme officielle des produits Zumub en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.",
    "featured": true,
    "universe": "Nutrition & Compléments",
    "productCount": 2
  }
];

export const brandUniverses = [
  "Tous",
  "Nutrition & Compléments",
  "Sport & Musculation",
  "Santé & Bien-être",
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getAllBrandSlugs(): string[] {
  return brands.map((b) => b.slug);
}

