/** Shared navigation definitions: desktop and mobile must never diverge. Every href is a live route. */
export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/shop" },
  { label: "Packs", href: "/pack-anti-stress" },
  { label: "Marques", href: "/marques" },
  { label: "Blog", href: "/conseils" },
  { label: "Contact", href: "/contact" },
  { label: "Qui sommes nous", href: "/a-propos" },
];

/**
 * The six shop departments of the mega menu. Only the grouping lives here:
 * names, counts and products of each category slug come from the catalogue.
 */
export const SHOP_DEPARTMENTS: { key: string; label: string; href: string; slugs: string[] }[] = [
  {
    key: "proteines",
    label: "Protéines en poudre",
    href: "/whey-proteine",
    slugs: ["whey-proteine", "whey-isolate", "caseine", "proteines-multi-sources", "proteine-de-boeuf", "whey-hydrolysee", "proteines-vegetales", "barres-proteinees"],
  },
  { key: "prise-de-masse", label: "Prise de masse", href: "/gainers-proteines", slugs: ["gainers-proteines", "glucides", "glucides-energie"] },
  {
    key: "performance",
    label: "Performance",
    href: "/nutrition-sportive",
    slugs: ["creatine", "pre-workout", "intra-workout", "post-workout", "acides-amines", "bcaa", "eaa", "citrulline", "l-arginine", "beta-alanine"],
  },
  { key: "perte-de-poids", label: "Perte de poids", href: "/bruleurs-de-graisse", slugs: ["bruleurs-de-graisse", "l-carnitine", "cla"] },
  {
    key: "sante",
    label: "Santé et vitalité",
    href: "/complements-alimentaires",
    slugs: [
      "vitamines", "mineraux", "magnesium", "zinc", "omega-3", "immunite", "antioxydants", "articulations", "collagene", "probiotiques", "digestion",
      "plantes-et-herbes", "sommeil-stress", "ashwagandha", "tribulus", "zma", "glutamine", "hmb", "boosters-hormonaux", "beaute-cheveux", "enfants",
    ],
  },
  { key: "equipement", label: "Équipement de sport", href: "/accessoires", slugs: ["accessoires", "vetements", "materiel-de-musculation", "cardio-fitness"] },
];
