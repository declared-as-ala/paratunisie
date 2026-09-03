export type ProductSize = {
  label: string;
  priceMillimes: number;
};

export type ProductSummary = {
  id: string;
  sku?: string;
  slug: string;
  brand: string;
  name: string;
  benefit: string;
  size: string;
  priceMillimes: number;
  category: string;
  categorySlug?: string;
  concerns: string[];
  skinTypes: string[];
  image: string;
  description: string;
  benefits: string[];
  usage: string;
  sizes: ProductSize[];
  routineTime: ("AM" | "PM")[];
  inStock?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  indexable?: boolean;
  followLinks?: boolean;
  seoH1?: string | null;
  seoIntro?: string | null;
  seoContent?: string | null;
  seoKeywords?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  imageAlt?: string | null;
};

export const products: ProductSummary[] = [
  {
    "id": "p01",
    "slug": "creatine-monohydrate-ostrovit-500gr",
    "brand": "OstroVit",
    "name": "Creatine Monohydrate Ostrovit- 500gr",
    "benefit": "Amélioration de la force, puissance & volume musculaire",
    "size": "500g",
    "priceMillimes": 149000,
    "category": "Créatine",
    "concerns": [
      "Créatine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp",
    "description": "Creatine Monohydrate Ostrovit- 500gr de la marque OstroVit est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 500g, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Amélioration de la force, puissance & volume musculaire",
      "Produit 100% authentique de la marque OstroVit",
      "Format pratique de 500g"
    ],
    "usage": "Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.",
    "sizes": [
      {
        "label": "500g",
        "priceMillimes": 149000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Creatine Monohydrate Ostrovit- 500gr en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Creatine Monohydrate Ostrovit- 500gr (500g) de OstroVit au meilleur prix en Tunisie (149 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/creatine-monohydrate-ostrovit-500gr",
    "indexable": true
  },
  {
    "id": "p02",
    "slug": "micronised-creatine-optimum-nutrition-317g",
    "brand": "Optimum Nutrition",
    "name": "Micronised Creatine Optimum Nutrition - 317g",
    "benefit": "Amélioration de la force, puissance & volume musculaire",
    "size": "317G",
    "priceMillimes": 179000,
    "category": "Créatine",
    "concerns": [
      "Créatine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/micronised-creatine-optimum-nutrition-317g-b84738f3.webp",
    "description": "Micronised Creatine Optimum Nutrition - 317g de la marque Optimum Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 317G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Amélioration de la force, puissance & volume musculaire",
      "Produit 100% authentique de la marque Optimum Nutrition",
      "Format pratique de 317G"
    ],
    "usage": "Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.",
    "sizes": [
      {
        "label": "317G",
        "priceMillimes": 179000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Micronised Creatine Optimum Nutrition - 317g en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Micronised Creatine Optimum Nutrition - 317g (317G) de Optimum Nutrition au meilleur prix en Tunisie (179 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/micronised-creatine-optimum-nutrition-317g",
    "indexable": true
  },
  {
    "id": "p03",
    "slug": "creatine-monohydrate-500g-quamtrax",
    "brand": "Quamtrax",
    "name": "Creatine Monohydrate - 500g -quamtrax",
    "benefit": "Amélioration de la force, puissance & volume musculaire",
    "size": "500G",
    "priceMillimes": 149000,
    "category": "Créatine",
    "concerns": [
      "Créatine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/creatine-monohydrate-500g-quamtrax-fc4afe10.webp",
    "description": "Creatine Monohydrate - 500g -quamtrax de la marque Quamtrax est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 500G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Amélioration de la force, puissance & volume musculaire",
      "Produit 100% authentique de la marque Quamtrax",
      "Format pratique de 500G"
    ],
    "usage": "Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.",
    "sizes": [
      {
        "label": "500G",
        "priceMillimes": 149000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Creatine Monohydrate - 500g -quamtrax en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Creatine Monohydrate - 500g -quamtrax (500G) de Quamtrax au meilleur prix en Tunisie (149 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/creatine-monohydrate-500g-quamtrax",
    "indexable": true
  },
  {
    "id": "p04",
    "slug": "creatine-real-pharm-300g",
    "brand": "Real Pharm",
    "name": "Creatine Real Pharm - 300g",
    "benefit": "Amélioration de la force, puissance & volume musculaire",
    "size": "300G",
    "priceMillimes": 99000,
    "category": "Créatine",
    "concerns": [
      "Créatine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/creatine-real-pharm-300g-f2ec3b61.webp",
    "description": "Creatine Real Pharm - 300g de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 300G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Amélioration de la force, puissance & volume musculaire",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 300G"
    ],
    "usage": "Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.",
    "sizes": [
      {
        "label": "300G",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Creatine Real Pharm - 300g en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Creatine Real Pharm - 300g (300G) de Real Pharm au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/creatine-real-pharm-300g",
    "indexable": true
  },
  {
    "id": "p05",
    "slug": "creatine-monohydrate-500gr-real-pharm",
    "brand": "Real Pharm",
    "name": "Creatine Monohydrate 500gr - Real Pharm",
    "benefit": "Amélioration de la force, puissance & volume musculaire",
    "size": "500g",
    "priceMillimes": 149000,
    "category": "Créatine",
    "concerns": [
      "Créatine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/creatine-monohydrate-500gr-real-pharm-1db03dd7.webp",
    "description": "Creatine Monohydrate 500gr - Real Pharm de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 500g, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Amélioration de la force, puissance & volume musculaire",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 500g"
    ],
    "usage": "Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.",
    "sizes": [
      {
        "label": "500g",
        "priceMillimes": 149000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Creatine Monohydrate 500gr - Real Pharm en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Creatine Monohydrate 500gr - Real Pharm (500g) de Real Pharm au meilleur prix en Tunisie (149 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/creatine-monohydrate-500gr-real-pharm",
    "indexable": true
  },
  {
    "id": "p06",
    "slug": "100-creatine-monohydrate-300g-biotech-usa",
    "brand": "BioTechUSA",
    "name": "100% Creatine Monohydrate 300g - Biotech Usa",
    "benefit": "Amélioration de la force, puissance & volume musculaire",
    "size": "300G",
    "priceMillimes": 149000,
    "category": "Créatine",
    "concerns": [
      "Créatine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/100-creatine-monohydrate-300g-biotech-usa-eca8075b.webp",
    "description": "100% Creatine Monohydrate 300g - Biotech Usa de la marque BioTechUSA est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 300G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Amélioration de la force, puissance & volume musculaire",
      "Produit 100% authentique de la marque BioTechUSA",
      "Format pratique de 300G"
    ],
    "usage": "Mélanger une dose de 3 g à 5 g dans 200 à 250 ml d'eau ou de jus, de préférence après votre entraînement ou le matin les jours de repos.",
    "sizes": [
      {
        "label": "300G",
        "priceMillimes": 149000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "100% Creatine Monohydrate 300g - Biotech Usa en Tunisie | ParaTunisie",
    "seoDescription": "Achetez 100% Creatine Monohydrate 300g - Biotech Usa (300G) de BioTechUSA au meilleur prix en Tunisie (149 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/100-creatine-monohydrate-300g-biotech-usa",
    "indexable": true
  },
  {
    "id": "p07",
    "slug": "victor-martinez-break-out-pre-workout",
    "brand": "Victor Martinez",
    "name": "Victor Martinez Break-out™ Pre-workout",
    "benefit": "Énergie explosive, focus & congestion intense à l'entraînement",
    "size": "1.81 KG",
    "priceMillimes": 139000,
    "category": "Pre-Workout",
    "concerns": [
      "Pre-Workout"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/victor-martinez-break-out-pre-workout-e54cafd2.webp",
    "description": "Victor Martinez Break-out™ Pre-workout de la marque Victor Martinez est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 1.81 KG, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Énergie explosive, focus & congestion intense à l'entraînement",
      "Produit 100% authentique de la marque Victor Martinez",
      "Format pratique de 1.81 KG"
    ],
    "usage": "Prendre 1 dose diluée dans 200-300 ml d'eau fraîche 20 à 30 minutes avant votre séance d'entraînement. Ne pas dépasser la dose recommandée.",
    "sizes": [
      {
        "label": "1.81 KG",
        "priceMillimes": 139000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Victor Martinez Break-out™ Pre-workout en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Victor Martinez Break-out™ Pre-workout (1.81 KG) de Victor Martinez au meilleur prix en Tunisie (139 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/victor-martinez-break-out-pre-workout",
    "indexable": true
  },
  {
    "id": "p08",
    "slug": "pre-workout-born-rage-original-eric-favre",
    "brand": "Eric Favre",
    "name": "Pre Workout Born Rage Original - Eric Favre",
    "benefit": "Énergie explosive, focus & congestion intense à l'entraînement",
    "size": "1.81 KG",
    "priceMillimes": 119000,
    "category": "Pre-Workout",
    "concerns": [
      "Pre-Workout"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/pre-workout-born-rage-original-eric-favre-2b562692.webp",
    "description": "Pre Workout Born Rage Original - Eric Favre de la marque Eric Favre est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 1.81 KG, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Énergie explosive, focus & congestion intense à l'entraînement",
      "Produit 100% authentique de la marque Eric Favre",
      "Format pratique de 1.81 KG"
    ],
    "usage": "Prendre 1 dose diluée dans 200-300 ml d'eau fraîche 20 à 30 minutes avant votre séance d'entraînement. Ne pas dépasser la dose recommandée.",
    "sizes": [
      {
        "label": "1.81 KG",
        "priceMillimes": 119000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Pre Workout Born Rage Original - Eric Favre en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Pre Workout Born Rage Original - Eric Favre (1.81 KG) de Eric Favre au meilleur prix en Tunisie (119 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/pre-workout-born-rage-original-eric-favre",
    "indexable": true
  },
  {
    "id": "p09",
    "slug": "pump-extreme-pre-workout-challenger-nutrition-30-servings",
    "brand": "Challenger Nutrition",
    "name": "Pump Extreme Pre-Workout - Challenger Nutrition | 30 Servings",
    "benefit": "Énergie explosive, focus & congestion intense à l'entraînement",
    "size": "1.81 KG",
    "priceMillimes": 139000,
    "category": "Pre-Workout",
    "concerns": [
      "Pre-Workout"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/pump-extreme-pre-workout-challenger-nutrition-30-servings-9c744c18.webp",
    "description": "Pump Extreme Pre-Workout - Challenger Nutrition | 30 Servings de la marque Challenger Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 1.81 KG, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Énergie explosive, focus & congestion intense à l'entraînement",
      "Produit 100% authentique de la marque Challenger Nutrition",
      "Format pratique de 1.81 KG"
    ],
    "usage": "Prendre 1 dose diluée dans 200-300 ml d'eau fraîche 20 à 30 minutes avant votre séance d'entraînement. Ne pas dépasser la dose recommandée.",
    "sizes": [
      {
        "label": "1.81 KG",
        "priceMillimes": 139000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Pump Extreme Pre-Workout - Challenger Nutrition | 30 Servings en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Pump Extreme Pre-Workout - Challenger Nutrition | 30 Servings (1.81 KG) de Challenger Nutrition au meilleur prix en Tunisie (139 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/pump-extreme-pre-workout-challenger-nutrition-30-servings",
    "indexable": true
  },
  {
    "id": "p10",
    "slug": "psychotic-pre-workout",
    "brand": "Insane Labz",
    "name": "Psychotic Pre-workout",
    "benefit": "Énergie explosive, focus & congestion intense à l'entraînement",
    "size": "1.81 KG",
    "priceMillimes": 139000,
    "category": "Pre-Workout",
    "concerns": [
      "Pre-Workout"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/psychotic-pre-workout-c7dabc0f.webp",
    "description": "Psychotic Pre-workout de la marque Insane Labz est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 1.81 KG, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Énergie explosive, focus & congestion intense à l'entraînement",
      "Produit 100% authentique de la marque Insane Labz",
      "Format pratique de 1.81 KG"
    ],
    "usage": "Prendre 1 dose diluée dans 200-300 ml d'eau fraîche 20 à 30 minutes avant votre séance d'entraînement. Ne pas dépasser la dose recommandée.",
    "sizes": [
      {
        "label": "1.81 KG",
        "priceMillimes": 139000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Psychotic Pre-workout en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Psychotic Pre-workout (1.81 KG) de Insane Labz au meilleur prix en Tunisie (139 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/psychotic-pre-workout",
    "indexable": true
  },
  {
    "id": "p11",
    "slug": "zumub-zinc-100-comprimes",
    "brand": "Zumub",
    "name": "Zumub Zinc – 100 comprimés",
    "benefit": "Soutien immunitaire, synthèse protéique & vitalité",
    "size": "6l",
    "priceMillimes": 89000,
    "category": "Zinc",
    "concerns": [
      "Zinc"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/zumub-zinc-100-comprimes-9ae319b1.webp",
    "description": "Zumub Zinc – 100 comprimés de la marque Zumub est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 6l, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Soutien immunitaire, synthèse protéique & vitalité",
      "Produit 100% authentique de la marque Zumub",
      "Format pratique de 6l"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "6l",
        "priceMillimes": 89000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Zumub Zinc – 100 comprimés en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Zumub Zinc – 100 comprimés (6l) de Zumub au meilleur prix en Tunisie (89 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/zumub-zinc-100-comprimes",
    "indexable": true
  },
  {
    "id": "p12",
    "slug": "zinc-duo-biotech-usa-60-capsules",
    "brand": "BioTechUSA",
    "name": "Zinc Duo Biotech Usa - 60 Capsules",
    "benefit": "Soutien immunitaire, synthèse protéique & vitalité",
    "size": "6l",
    "priceMillimes": 89000,
    "category": "Zinc",
    "concerns": [
      "Zinc"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/zinc-duo-biotech-usa-60-capsules-73f31972.webp",
    "description": "Zinc Duo Biotech Usa - 60 Capsules de la marque BioTechUSA est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 6l, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Soutien immunitaire, synthèse protéique & vitalité",
      "Produit 100% authentique de la marque BioTechUSA",
      "Format pratique de 6l"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "6l",
        "priceMillimes": 89000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Zinc Duo Biotech Usa - 60 Capsules en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Zinc Duo Biotech Usa - 60 Capsules (6l) de BioTechUSA au meilleur prix en Tunisie (89 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/zinc-duo-biotech-usa-60-capsules",
    "indexable": true
  },
  {
    "id": "p13",
    "slug": "zinc-90-tab-real-pharm",
    "brand": "Real Pharm",
    "name": "Zinc – 90 Tab – Real Pharm",
    "benefit": "Soutien immunitaire, synthèse protéique & vitalité",
    "size": "6l",
    "priceMillimes": 95000,
    "category": "Zinc",
    "concerns": [
      "Zinc"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/zinc-90-tab-real-pharm-a5dee538.webp",
    "description": "Zinc – 90 Tab – Real Pharm de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 6l, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Soutien immunitaire, synthèse protéique & vitalité",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 6l"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "6l",
        "priceMillimes": 95000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Zinc – 90 Tab – Real Pharm en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Zinc – 90 Tab – Real Pharm (6l) de Real Pharm au meilleur prix en Tunisie (95 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/zinc-90-tab-real-pharm",
    "indexable": true
  },
  {
    "id": "p14",
    "slug": "zumub-omega-3-90-caps",
    "brand": "Zumub",
    "name": "Zumub OMEGA 3 90 caps",
    "benefit": "Santé cardiovasculaire, articulations & fonction cognitive",
    "size": "450ML",
    "priceMillimes": 99000,
    "category": "Omega 3",
    "concerns": [
      "Omega 3"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/zumub-omega-3-90-caps-36ace772.webp",
    "description": "Zumub OMEGA 3 90 caps de la marque Zumub est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Santé cardiovasculaire, articulations & fonction cognitive",
      "Produit 100% authentique de la marque Zumub",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Zumub OMEGA 3 90 caps en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Zumub OMEGA 3 90 caps (450ML) de Zumub au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/zumub-omega-3-90-caps",
    "indexable": true
  },
  {
    "id": "p15",
    "slug": "mega-omega-3-90-caps-biotech",
    "brand": "BioTechUSA",
    "name": "Mega Omega 3 90 Caps - Biotech",
    "benefit": "Santé cardiovasculaire, articulations & fonction cognitive",
    "size": "2 g",
    "priceMillimes": 99000,
    "category": "Omega 3",
    "concerns": [
      "Omega 3"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/mega-omega-3-90-caps-biotech-eb475797.webp",
    "description": "Mega Omega 3 90 Caps - Biotech de la marque BioTechUSA est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 2 g, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Santé cardiovasculaire, articulations & fonction cognitive",
      "Produit 100% authentique de la marque BioTechUSA",
      "Format pratique de 2 g"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "2 g",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Mega Omega 3 90 Caps - Biotech en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Mega Omega 3 90 Caps - Biotech (2 g) de BioTechUSA au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/mega-omega-3-90-caps-biotech",
    "indexable": true
  },
  {
    "id": "p16",
    "slug": "magnesium-vitamin-b6-90-tablets",
    "brand": "MusclePharm",
    "name": "Magnesium + Vitamin B6 90 Tablets",
    "benefit": "Réduction de la fatigue musculaire & équilibre nerveux",
    "size": "6l",
    "priceMillimes": 89000,
    "category": "Magnésium",
    "concerns": [
      "Magnésium"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/magnesium-vitamin-b6-90-tablets-4a8b69cd.webp",
    "description": "Magnesium + Vitamin B6 90 Tablets de la marque MusclePharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 6l, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Réduction de la fatigue musculaire & équilibre nerveux",
      "Produit 100% authentique de la marque MusclePharm",
      "Format pratique de 6l"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "6l",
        "priceMillimes": 89000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Magnesium + Vitamin B6 90 Tablets en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Magnesium + Vitamin B6 90 Tablets (6l) de MusclePharm au meilleur prix en Tunisie (89 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/magnesium-vitamin-b6-90-tablets",
    "indexable": true
  },
  {
    "id": "p17",
    "slug": "magnesium-calcium-vitamin-b6-90-tablet-muscle-care",
    "brand": "Muscle Care",
    "name": "Magnesium+Calcium +Vitamin B6 90 tablet - Muscle Care",
    "benefit": "Réduction de la fatigue musculaire & équilibre nerveux",
    "size": "6l",
    "priceMillimes": 99000,
    "category": "Magnésium",
    "concerns": [
      "Magnésium"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/magnesium-calcium-vitamin-b6-90-tablet-muscle-care-82781382.webp",
    "description": "Magnesium+Calcium +Vitamin B6 90 tablet - Muscle Care de la marque Muscle Care est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 6l, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Réduction de la fatigue musculaire & équilibre nerveux",
      "Produit 100% authentique de la marque Muscle Care",
      "Format pratique de 6l"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "6l",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Magnesium+Calcium +Vitamin B6 90 tablet - Muscle Care en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Magnesium+Calcium +Vitamin B6 90 tablet - Muscle Care (6l) de Muscle Care au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/magnesium-calcium-vitamin-b6-90-tablet-muscle-care",
    "indexable": true
  },
  {
    "id": "p18",
    "slug": "vitamin-c-110-tabs-ostrovit",
    "brand": "OstroVit",
    "name": "Vitamin C 110 tabs-OstroVit",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 95000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/vitamin-c-110-tabs-ostrovit-eff32ea5.webp",
    "description": "Vitamin C 110 tabs-OstroVit de la marque OstroVit est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque OstroVit",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 95000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Vitamin C 110 tabs-OstroVit en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Vitamin C 110 tabs-OstroVit (450ML) de OstroVit au meilleur prix en Tunisie (95 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/vitamin-c-110-tabs-ostrovit",
    "indexable": true
  },
  {
    "id": "p19",
    "slug": "pro-vitamin-90-tabletas-muscle-care",
    "brand": "Muscle Care",
    "name": "Pro Vitamin 90 Tabletas - Muscle Care",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 99000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/pro-vitamin-90-tabletas-muscle-care-e89f35b2.webp",
    "description": "Pro Vitamin 90 Tabletas - Muscle Care de la marque Muscle Care est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque Muscle Care",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Pro Vitamin 90 Tabletas - Muscle Care en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Pro Vitamin 90 Tabletas - Muscle Care (450ML) de Muscle Care au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/pro-vitamin-90-tabletas-muscle-care",
    "indexable": true
  },
  {
    "id": "p20",
    "slug": "vegan-vitamin-d3-k2-365-tablets-weightworld",
    "brand": "WeightWorld",
    "name": "vegan vitamin D3 + K2 365 tablets - WeightWorld",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 159000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/vegan-vitamin-d3-k2-365-tablets-weightworld-f4276b19.webp",
    "description": "vegan vitamin D3 + K2 365 tablets - WeightWorld de la marque WeightWorld est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque WeightWorld",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 159000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "vegan vitamin D3 + K2 365 tablets - WeightWorld en Tunisie | ParaTunisie",
    "seoDescription": "Achetez vegan vitamin D3 + K2 365 tablets - WeightWorld (450ML) de WeightWorld au meilleur prix en Tunisie (159 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/vegan-vitamin-d3-k2-365-tablets-weightworld",
    "indexable": true
  },
  {
    "id": "p21",
    "slug": "vitamin-complex-sport-120-tablets-sfd-nutrition",
    "brand": "Real Pharm",
    "name": "VitaMin Complex Sport+ 120 TABLETS - SFD NUTRITION",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 99000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/vitamin-complex-sport-120-tablets-sfd-nutrition-6360af6e.webp",
    "description": "VitaMin Complex Sport+ 120 TABLETS - SFD NUTRITION de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "VitaMin Complex Sport+ 120 TABLETS - SFD NUTRITION en Tunisie | ParaTunisie",
    "seoDescription": "Achetez VitaMin Complex Sport+ 120 TABLETS - SFD NUTRITION (450ML) de Real Pharm au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/vitamin-complex-sport-120-tablets-sfd-nutrition",
    "indexable": true
  },
  {
    "id": "p22",
    "slug": "vitamin-d3-k2-90-tabs-real-pharm",
    "brand": "Real Pharm",
    "name": "Vitamin D3 + K2 90 Tabs - Real Pharm",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 99000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/vitamin-d3-k2-90-tabs-real-pharm-558207b1.webp",
    "description": "Vitamin D3 + K2 90 Tabs - Real Pharm de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Vitamin D3 + K2 90 Tabs - Real Pharm en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Vitamin D3 + K2 90 Tabs - Real Pharm (450ML) de Real Pharm au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/vitamin-d3-k2-90-tabs-real-pharm",
    "indexable": true
  },
  {
    "id": "p23",
    "slug": "one-a-day-biotech-usa",
    "brand": "BioTechUSA",
    "name": "One - A - Day - BIOTECH USA",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 109000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/one-a-day-biotech-usa-635bcef6.webp",
    "description": "One - A - Day - BIOTECH USA de la marque BioTechUSA est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque BioTechUSA",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 109000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "One - A - Day - BIOTECH USA en Tunisie | ParaTunisie",
    "seoDescription": "Achetez One - A - Day - BIOTECH USA (450ML) de BioTechUSA au meilleur prix en Tunisie (109 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/one-a-day-biotech-usa",
    "indexable": true
  },
  {
    "id": "p24",
    "slug": "opti-men-90tabs",
    "brand": "Optimum Nutrition",
    "name": "Opti-men - 90tabs",
    "benefit": "Vitalité quotidienne, immunité & forme optimale",
    "size": "450ML",
    "priceMillimes": 149000,
    "category": "Vitamines",
    "concerns": [
      "Vitamines"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/opti-men-90tabs-fd2286e0.webp",
    "description": "Opti-men - 90tabs de la marque Optimum Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Vitalité quotidienne, immunité & forme optimale",
      "Produit 100% authentique de la marque Optimum Nutrition",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 149000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Opti-men - 90tabs en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Opti-men - 90tabs (450ML) de Optimum Nutrition au meilleur prix en Tunisie (149 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/opti-men-90tabs",
    "indexable": true
  },
  {
    "id": "p25",
    "slug": "ashwagandha-60-gelules-biotech-usa",
    "brand": "BioTechUSA",
    "name": "Ashwagandha - 60 Gélules | Biotech Usa",
    "benefit": "Gestion du stress, vitalité & récupération globale",
    "size": "60 G",
    "priceMillimes": 95000,
    "category": "Ashwagandha",
    "concerns": [
      "Ashwagandha"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp",
    "description": "Ashwagandha - 60 Gélules | Biotech Usa de la marque BioTechUSA est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 60 G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Gestion du stress, vitalité & récupération globale",
      "Produit 100% authentique de la marque BioTechUSA",
      "Format pratique de 60 G"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "60 G",
        "priceMillimes": 95000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Ashwagandha - 60 Gélules | Biotech Usa en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Ashwagandha - 60 Gélules | Biotech Usa (60 G) de BioTechUSA au meilleur prix en Tunisie (95 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/ashwagandha-60-gelules-biotech-usa",
    "indexable": true
  },
  {
    "id": "p26",
    "slug": "ashwagandha-100-natural-90tabs",
    "brand": "Real Pharm",
    "name": "Ashwagandha 100% Natural 90tabs",
    "benefit": "Gestion du stress, vitalité & récupération globale",
    "size": "450ML",
    "priceMillimes": 89000,
    "category": "Ashwagandha",
    "concerns": [
      "Ashwagandha"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/ashwagandha-100-natural-90tabs-8d2183dc.webp",
    "description": "Ashwagandha 100% Natural 90tabs de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Gestion du stress, vitalité & récupération globale",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre avec un grand verre d'eau, de préférence au cours d'un repas (matin ou midi).",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 89000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Ashwagandha 100% Natural 90tabs en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Ashwagandha 100% Natural 90tabs (450ML) de Real Pharm au meilleur prix en Tunisie (89 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/ashwagandha-100-natural-90tabs",
    "indexable": true
  },
  {
    "id": "p27",
    "slug": "t-9-testo-booster-120-caps",
    "brand": "Scenit Nutrition",
    "name": "T 9 Testo Booster 120 Caps",
    "benefit": "Formule avancée de vitalité & tonus masculin",
    "size": "2 g",
    "priceMillimes": 119000,
    "category": "Boosters",
    "concerns": [
      "Boosters"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/t-9-testo-booster-120-caps-559dd0aa.webp",
    "description": "T 9 Testo Booster 120 Caps de la marque Scenit Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 2 g, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Formule avancée de vitalité & tonus masculin",
      "Produit 100% authentique de la marque Scenit Nutrition",
      "Format pratique de 2 g"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "2 g",
        "priceMillimes": 119000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "T 9 Testo Booster 120 Caps en Tunisie | ParaTunisie",
    "seoDescription": "Achetez T 9 Testo Booster 120 Caps (2 g) de Scenit Nutrition au meilleur prix en Tunisie (119 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/t-9-testo-booster-120-caps",
    "indexable": true
  },
  {
    "id": "p28",
    "slug": "anabolic-whey-80-2-25kg-proactive",
    "brand": "ProActive",
    "name": "ANABOLIC WHEY 80 2.25kg - ProActive",
    "benefit": "Développement musculaire sec & récupération optimale",
    "size": "2.25kg",
    "priceMillimes": 259000,
    "category": "Whey Protéine",
    "concerns": [
      "Whey Protéine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/anabolic-whey-80-2-25kg-proactive-d1e70098.webp",
    "description": "ANABOLIC WHEY 80 2.25kg - ProActive de la marque ProActive est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 2.25kg, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Développement musculaire sec & récupération optimale",
      "Produit 100% authentique de la marque ProActive",
      "Format pratique de 2.25kg"
    ],
    "usage": "Mélanger 1 portion dans 250-350 ml d'eau ou de lait écrémé après l'entraînement ou en collation entre les repas.",
    "sizes": [
      {
        "label": "2.25kg",
        "priceMillimes": 259000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "ANABOLIC WHEY 80 2.25kg - ProActive en Tunisie | ParaTunisie",
    "seoDescription": "Achetez ANABOLIC WHEY 80 2.25kg - ProActive (2.25kg) de ProActive au meilleur prix en Tunisie (259 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/anabolic-whey-80-2-25kg-proactive",
    "indexable": true
  },
  {
    "id": "p29",
    "slug": "thunder-gainer-5-4kg-challenger-nutrition",
    "brand": "Challenger Nutrition",
    "name": "Thunder Gainer 5.4kg - Challenger Nutrition",
    "benefit": "Prise de masse musculaire & apport calorique de qualité",
    "size": "5.4KG",
    "priceMillimes": 279000,
    "category": "Gainers",
    "concerns": [
      "Gainers"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/thunder-gainer-5-4kg-challenger-nutrition-20b49293.webp",
    "description": "Thunder Gainer 5.4kg - Challenger Nutrition de la marque Challenger Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 5.4KG, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Prise de masse musculaire & apport calorique de qualité",
      "Produit 100% authentique de la marque Challenger Nutrition",
      "Format pratique de 5.4KG"
    ],
    "usage": "Mélanger 1 portion dans 250-350 ml d'eau ou de lait écrémé après l'entraînement ou en collation entre les repas.",
    "sizes": [
      {
        "label": "5.4KG",
        "priceMillimes": 279000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Thunder Gainer 5.4kg - Challenger Nutrition en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Thunder Gainer 5.4kg - Challenger Nutrition (5.4KG) de Challenger Nutrition au meilleur prix en Tunisie (279 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/thunder-gainer-5-4kg-challenger-nutrition",
    "indexable": true
  },
  {
    "id": "p30",
    "slug": "beta-alanine-300g-real-pharm",
    "brand": "Real Pharm",
    "name": "Beta Alanine 300g - Real Pharm",
    "benefit": "Endurance musculaire accrue & réduction de la fatigue",
    "size": "300G",
    "priceMillimes": 99000,
    "category": "Beta-Alanine",
    "concerns": [
      "Beta-Alanine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/beta-alanine-300g-real-pharm-d3fee3c1.webp",
    "description": "Beta Alanine 300g - Real Pharm de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 300G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Endurance musculaire accrue & réduction de la fatigue",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 300G"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "300G",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Beta Alanine 300g - Real Pharm en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Beta Alanine 300g - Real Pharm (300G) de Real Pharm au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/beta-alanine-300g-real-pharm",
    "indexable": true
  },
  {
    "id": "p31",
    "slug": "xtend-bcaa-420g",
    "brand": "Xtend",
    "name": "Xtend Bcaa 420g",
    "benefit": "Soutien anti-catabolique & récupération musculaire rapide",
    "size": "420G",
    "priceMillimes": 139000,
    "category": "BCAA",
    "concerns": [
      "BCAA"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/xtend-bcaa-420g-f3c29f70.webp",
    "description": "Xtend Bcaa 420g de la marque Xtend est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 420G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Soutien anti-catabolique & récupération musculaire rapide",
      "Produit 100% authentique de la marque Xtend",
      "Format pratique de 420G"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "420G",
        "priceMillimes": 139000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "Xtend Bcaa 420g en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Xtend Bcaa 420g (420G) de Xtend au meilleur prix en Tunisie (139 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/xtend-bcaa-420g",
    "indexable": true
  },
  {
    "id": "p32",
    "slug": "citruargin-300-g-real-pharm",
    "brand": "Real Pharm",
    "name": "CitruArgin - 300 G REAL PHARM",
    "benefit": "Congestion musculaire maximale & vasodilatation",
    "size": "300 G",
    "priceMillimes": 119000,
    "category": "Citrulline",
    "concerns": [
      "Citrulline"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/citruargin-300-g-real-pharm-09093d9c.webp",
    "description": "CitruArgin - 300 G REAL PHARM de la marque Real Pharm est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 300 G, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Congestion musculaire maximale & vasodilatation",
      "Produit 100% authentique de la marque Real Pharm",
      "Format pratique de 300 G"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "300 G",
        "priceMillimes": 119000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "CitruArgin - 300 G REAL PHARM en Tunisie | ParaTunisie",
    "seoDescription": "Achetez CitruArgin - 300 G REAL PHARM (300 G) de Real Pharm au meilleur prix en Tunisie (119 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/citruargin-300-g-real-pharm",
    "indexable": true
  },
  {
    "id": "p33",
    "slug": "eaa-master-amino-390g-scenit-nutrition",
    "brand": "Scenit Nutrition",
    "name": "EAA Master Amino 390g - Scenit Nutrition",
    "benefit": "Soutien anti-catabolique & récupération musculaire rapide",
    "size": "390g",
    "priceMillimes": 139000,
    "category": "EAA",
    "concerns": [
      "EAA"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/eaa-master-amino-390g-scenit-nutrition-21d315c0.webp",
    "description": "EAA Master Amino 390g - Scenit Nutrition de la marque Scenit Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 390g, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Soutien anti-catabolique & récupération musculaire rapide",
      "Produit 100% authentique de la marque Scenit Nutrition",
      "Format pratique de 390g"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "390g",
        "priceMillimes": 139000
      }
    ],
    "routineTime": [
      "AM",
      "PM"
    ],
    "inStock": true,
    "seoTitle": "EAA Master Amino 390g - Scenit Nutrition en Tunisie | ParaTunisie",
    "seoDescription": "Achetez EAA Master Amino 390g - Scenit Nutrition (390g) de Scenit Nutrition au meilleur prix en Tunisie (139 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/eaa-master-amino-390g-scenit-nutrition",
    "indexable": true
  },
  {
    "id": "p34",
    "slug": "gold-l-carnitine-3000-500ml",
    "brand": "FA Engineered Nutrition",
    "name": "Gold L-carnitine 3000 500ml",
    "benefit": "Déstockage des graisses, métabolisme & définition",
    "size": "500ML",
    "priceMillimes": 99000,
    "category": "L-Carnitine",
    "concerns": [
      "L-Carnitine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/gold-l-carnitine-3000-500ml-f9c4c91a.webp",
    "description": "Gold L-carnitine 3000 500ml de la marque FA Engineered Nutrition est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 500ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Déstockage des graisses, métabolisme & définition",
      "Produit 100% authentique de la marque FA Engineered Nutrition",
      "Format pratique de 500ML"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "500ML",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Gold L-carnitine 3000 500ml en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Gold L-carnitine 3000 500ml (500ML) de FA Engineered Nutrition au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/gold-l-carnitine-3000-500ml",
    "indexable": true
  },
  {
    "id": "p35",
    "slug": "l-carnitina-1250-60-capsule-ostrovit",
    "brand": "OstroVit",
    "name": "L-Carnitina 1250 60 capsule- OstroVit",
    "benefit": "Déstockage des graisses, métabolisme & définition",
    "size": "450ML",
    "priceMillimes": 99000,
    "category": "L-Carnitine",
    "concerns": [
      "L-Carnitine"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/l-carnitina-1250-60-capsule-ostrovit-66034248.webp",
    "description": "L-Carnitina 1250 60 capsule- OstroVit de la marque OstroVit est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Déstockage des graisses, métabolisme & définition",
      "Produit 100% authentique de la marque OstroVit",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 99000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "L-Carnitina 1250 60 capsule- OstroVit en Tunisie | ParaTunisie",
    "seoDescription": "Achetez L-Carnitina 1250 60 capsule- OstroVit (450ML) de OstroVit au meilleur prix en Tunisie (99 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/l-carnitina-1250-60-capsule-ostrovit",
    "indexable": true
  },
  {
    "id": "p36",
    "slug": "lipo-6-black-ultra-concentrate-60caps",
    "brand": "Nutrex Research",
    "name": "Lipo 6 Black Ultra Concentrate – 60caps",
    "benefit": "Déstockage des graisses, métabolisme & définition",
    "size": "450ML",
    "priceMillimes": 140000,
    "category": "Brûleurs de Graisse",
    "concerns": [
      "Brûleurs de Graisse"
    ],
    "skinTypes": [
      "Tous sportifs"
    ],
    "image": "/uploads/products/lipo-6-black-ultra-concentrate-60caps-7abcdedc.webp",
    "description": "Lipo 6 Black Ultra Concentrate – 60caps de la marque Nutrex Research est un complément alimentaire de premier choix conçu pour accompagner vos entraînements et votre bien-être au quotidien. Avec son format pratique de 450ML, il apporte une concentration optimale d'ingrédients actifs sélectionnés selon des normes de qualité strictes. Disponible en Tunisie sur ParaTunisie avec garantie de produit 100% authentique et livraison rapide à domicile.",
    "benefits": [
      "Déstockage des graisses, métabolisme & définition",
      "Produit 100% authentique de la marque Nutrex Research",
      "Format pratique de 450ML"
    ],
    "usage": "Prendre une dose quotidienne selon les indications figurant sur l'emballage, de préférence avec de l'eau.",
    "sizes": [
      {
        "label": "450ML",
        "priceMillimes": 140000
      }
    ],
    "routineTime": [
      "AM"
    ],
    "inStock": true,
    "seoTitle": "Lipo 6 Black Ultra Concentrate – 60caps en Tunisie | ParaTunisie",
    "seoDescription": "Achetez Lipo 6 Black Ultra Concentrate – 60caps (450ML) de Nutrex Research au meilleur prix en Tunisie (140 DT). Livraison rapide partout en Tunisie sur ParaTunisie.",
    "canonicalUrl": "/produits/lipo-6-black-ultra-concentrate-60caps",
    "indexable": true
  }
];

export function getProductBySlug(slug: string): ProductSummary | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categoryName: string): ProductSummary[] {
  return products.filter((p) => p.category.toLowerCase() === categoryName.toLowerCase());
}

export function getProductsByBrand(brandName: string): ProductSummary[] {
  return products.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase());
}

export function getSimilarProducts(product: ProductSummary, limit = 4, pool?: ProductSummary[]): ProductSummary[] {
  const list = pool || products;
  return list.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

export function getRoutineCompletionProducts(product: ProductSummary, limit = 4, pool?: ProductSummary[]): ProductSummary[] {
  const list = pool || products;
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}

export function formatPrice(priceMillimes: number): string {
  return `${(priceMillimes / 1000).toFixed(3)} DT`;
}

export const productCategories = Array.from(new Set(products.map((p) => p.category)));
export const allConcerns = Array.from(new Set(products.flatMap((p) => p.concerns)));
export const allSkinTypes = Array.from(new Set(products.flatMap((p) => p.skinTypes)));
