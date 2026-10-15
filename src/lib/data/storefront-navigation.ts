/** Shared canonical URLs: desktop and mobile must never diverge. */
export const storefrontNavigation = [
  { label: "Accueil", href: "/" },
  { label: "Créatine & Force", href: "/creatine" },
  { label: "Whey Protéine", href: "/whey-proteine" },
  { label: "Mass Gainer", href: "/mass-gainer" },
  { label: "Énergie & Boosters", href: "/pre-workout" },
  { label: "BCAA & EAA", href: "/acides-amines" },
  { label: "Santé & Vitamines", href: "/vitamines" },
  { label: "Ashwagandha", href: "/ashwagandha" },
  { label: "Accessoires", href: "/accessoires" },
  { label: "Marques", href: "/marques" },
  { label: "Conseils", href: "/conseils" },
] as const;

export const mobileNavigationGroups = [
  { label: "Nutrition sportive", items: storefrontNavigation.slice(1, 6) },
  { label: "Santé & bien-être", items: storefrontNavigation.slice(6, 8) },
  { label: "Découvrir", items: storefrontNavigation.slice(8) },
];
