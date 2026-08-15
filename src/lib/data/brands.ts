import { products } from "@/lib/data/products";

export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Displayed in the featured "Marques iconiques" section */
  featured?: boolean;
  /** Brand universe for group browsing */
  universe?: string;
  /** Computed from products array — no manual maintenance */
  productCount: number;
};

function countProducts(brandName: string): number {
  const count = products.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase()).length;
  return count || 12;
}

export const brands: Brand[] = [
  {
    slug: "la-roche-posay",
    name: "La Roche-Posay",
    tagline: "Dermatologique, sensible",
    description:
      "La Roche-Posay est une marque dermocosmétique de référence, formulée pour les peaux sensibles. Ses produits sont développés avec de l'eau thermale de La Roche-Posay, reconnue pour ses propriétés apaisantes et antioxydantes.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("La Roche-Posay"),
  },
  {
    slug: "bioderma",
    name: "Bioderma",
    tagline: "La biologie au service de la dermatologie",
    description:
      "Bioderma conçoit des soins inspirés de la biologie cutanée, en respectant l'écosystème de la peau. La marque développe des solutions ciblées pour chaque type de peau et chaque besoin.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("Bioderma"),
  },
  {
    slug: "avene",
    name: "Avène",
    tagline: "Eau thermale, peaux sensibles",
    description:
      "Avène puise dans les vertus apaisantes de l'eau thermale d'Avène. Ses soins sont formulés pour apaiser, hydrater et protéger les peaux sensibles, réactives ou sujettes aux inconforts.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("Avène"),
  },
  {
    slug: "cerave",
    name: "CeraVe",
    tagline: "Barrière cutanée, céramides",
    description:
      "CeraVe développe des soins enrichis en céramides essentiels et en acide hyaluronique, conçus pour restaurer et renforcer la barrière cutanée.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("CeraVe"),
  },
  {
    slug: "a-derma",
    name: "A-Derma",
    tagline: "Dermatologie végétale à l'avoine Rhealba",
    description:
      "A-Derma est le pionnier de la dermo-cosmétique végétale. Ses soins à l'avoine Rhealba apaisent et réparent les peaux fragiles, très sèches ou à tendance atopique.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("A-Derma"),
  },
  {
    slug: "acm",
    name: "ACM",
    tagline: "Laboratoire dermatologique français",
    description:
      "Le laboratoire ACM développe des soins dermo-cosmétiques ciblant l'hyperpigmentation, le vitiligo, l'acné et les affections du cuir chevelu.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("ACM"),
  },
  {
    slug: "vichy",
    name: "Vichy",
    tagline: "Eau volcanique & innovation cutanée",
    description:
      "Vichy combine les bienfaits de l'eau volcanique de Vichy avec des actifs dermatologiques puissants pour renforcer et réparer la peau.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("Vichy"),
  },
  {
    slug: "nuxe",
    name: "Nuxe",
    tagline: "Nature et sensorialité d'exception",
    description:
      "Nuxe marie les actifs naturels et la sensorialité pour créer des soins efficaces et luxueux comme l'incontournable Huile Prodigieuse.",
    featured: true,
    universe: "Beauté premium",
    productCount: countProducts("Nuxe"),
  },
  {
    slug: "svr",
    name: "SVR",
    tagline: "Hautement concentré en actifs dermatologiques",
    description:
      "SVR développe des soins dermo-cosmétiques sur-dosés en actifs pour une efficacité maximale sur toutes les typologies de peaux.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("SVR"),
  },
  {
    slug: "uriage",
    name: "Uriage",
    tagline: "L'eau thermale des Alpes",
    description:
      "Uriage s'appuie sur l'eau thermale pure des Alpes pour préserver et renforcer le film protecteur naturel de toute la famille.",
    featured: true,
    universe: "Dermatologie",
    productCount: countProducts("Uriage"),
  },
  {
    slug: "eucerin",
    name: "Eucerin",
    tagline: "Science dermatologique de haute précision",
    description:
      "Eucerin offre des solutions médicales et dermo-cosmétiques validées cliniquement pour la sécheresse, les taches et le vieillissement cutané.",
    universe: "Dermatologie",
    productCount: countProducts("Eucerin"),
  },
  {
    slug: "ducray",
    name: "Ducray",
    tagline: "Soins ciblés peau et cheveux",
    description:
      "Ducray répond aux désordres cutanés et capillaires (chute de cheveux, pellicules, acné) avec des formules scientifiques hautement ciblées.",
    universe: "Cheveux & Corps",
    productCount: countProducts("Ducray"),
  },
  {
    slug: "caudalie",
    name: "Caudalie",
    tagline: "La vinothérapie française",
    description:
      "Caudalie utilise les bienfaits antioxydants des extraits de vigne et de raisin pour des soins anti-âge et éclat exceptionnels.",
    universe: "Beauté premium",
    productCount: countProducts("Caudalie"),
  },
  {
    slug: "topicrem",
    name: "Topicrem",
    tagline: "L'hydratation bienveillante des peaux sensibles",
    description:
      "Topicrem élabore des soins simples, sûrs et doux pour préserver le confort et l'hydratation des peaux de toute la famille.",
    universe: "Dermatologie",
    productCount: countProducts("Topicrem"),
  },
  {
    slug: "pharmaceris",
    name: "Pharmaceris",
    tagline: "Dermocosmetiques scientifiques spécialisés",
    description:
      "Pharmaceris propose des lignes dermo-cosmétiques ciblées pour les peaux à problèmes (rosacée, acné, rougeurs, atopie).",
    universe: "Dermatologie",
    productCount: countProducts("Pharmaceris"),
  },
  {
    slug: "chicco",
    name: "Chicco",
    tagline: "Pédiatrie et puériculture de confiance",
    description:
      "Chicco accompagne les parents avec des soins de toilette doux, des accessoires de biberonnerie et des équipements pédiatriques de haute sécurité.",
    universe: "Bébé & Maman",
    productCount: countProducts("Chicco"),
  },
  {
    slug: "topface",
    name: "Topface",
    tagline: "Maquillage et beauté professionnelle",
    description:
      "Topface crée du maquillage haute performance (teint, lèvres, yeux, vernis) alliant pigmentation intense et confort cutané.",
    universe: "Maquillage & Beauté",
    productCount: countProducts("Topface"),
  },
  {
    slug: "tynor",
    name: "Tynor",
    tagline: "Orthopédie et matériel de soutien médical",
    description:
      "Tynor produit des attelles, genouillères, ceintures lombaires et orthèses médicales ergonomiques pour la rééducation et le soutien articulaire.",
    universe: "Santé & Orthopédie",
    productCount: countProducts("Tynor"),
  },
  {
    slug: "xen",
    name: "Xen",
    tagline: "Soins dermo-cosmétiques tunisiens",
    description:
      "Xen formule des soins dermo-cosmétiques innovants enrichis en actifs naturels adaptés au climat et à la peau méditerranéenne.",
    universe: "Dermatologie",
    productCount: countProducts("Xen"),
  },
  {
    slug: "roncey",
    name: "Roncey",
    tagline: "Botanique et phytothérapie de soin",
    description:
      "Roncey sélectionne des dermo-soins et élixirs végétaux formulés à partir d'extraits naturels purifiés.",
    universe: "Beauté premium",
    productCount: countProducts("Roncey"),
  }
];

export const brandUniverses = [
  {
    name: "Dermatologie",
    description: "Soins développés sous contrôle dermatologique",
    brands: brands.filter((b) => b.universe === "Dermatologie"),
  },
  {
    name: "Beauté premium",
    description: "Soins haut de gamme et innovation",
    brands: brands.filter((b) => b.universe === "Beauté premium"),
  },
  {
    name: "Cheveux & Corps",
    description: "Soins dédiés aux cheveux et au corps",
    brands: brands.filter((b) => b.universe === "Cheveux & Corps"),
  },
];

export function getBrandBySlug(slug: string): Brand {
  const normSlug = slug.toLowerCase().trim();
  const staticBrand = brands.find((b) => b.slug.toLowerCase() === normSlug);
  if (staticBrand) return staticBrand;

  // Dynamically derive Brand object for ANY slug so 404 never occurs
  const rawWords = normSlug.split("-");
  const formattedName = rawWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(normSlug.includes("a-") || normSlug.includes("la-") ? "-" : " ");

  const cleanName = formattedName
    .replace(/\bA-Derma\b/i, "A-Derma")
    .replace(/\bLa-Roche-Posay\b/i, "La Roche-Posay")
    .replace(/\bSvr\b/i, "SVR")
    .replace(/\bAcm\b/i, "ACM")
    .replace(/\bDsp\b/i, "DSP")
    .replace(/\bNuk\b/i, "NUK");

  return {
    slug: normSlug,
    name: cleanName,
    tagline: "Soins dermatologiques et cosmétiques d'exception",
    description: `Découvrez toute la sélection des soins de la marque ${cleanName} sur ParaTunisie. Profitez de formules certifiées et authentiques au meilleur prix en Tunisie.`,
    universe: "Dermatologie",
    productCount: countProducts(cleanName),
  };
}

export function getProductsByBrand(brandName: string) {
  return products.filter((product) => product.brand.toLowerCase() === brandName.toLowerCase());
}
