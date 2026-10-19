/** Shared canonical URLs: desktop and mobile must never diverge. Every href is a live route. */
export const storefrontNavigation = [
  { label: "Accueil", href: "/" },
  { label: "Créatine & Force", href: "/creatine" },
  { label: "Whey Protéine", href: "/whey-proteine" },
  { label: "Mass Gainer", href: "/gainers-proteines" },
  { label: "Énergie & Boosters", href: "/pre-workout" },
  { label: "BCAA & EAA", href: "/acides-amines" },
  { label: "Santé & Vitamines", href: "/vitamines" },
  { label: "Ashwagandha", href: "/ashwagandha" },
  { label: "Accessoires", href: "/accessoires" },
  { label: "Marques", href: "/marques" },
  { label: "Conseils", href: "/conseils" },
] as const;

export type NavLink = { label: string; href: string };
export type NavGroup = { key: string; label: string; href: string; icon: "dumbbell" | "leaf" | "pill" | "tag" | "book"; links: NavLink[] };

/** Category taxonomy for the mega menu and the mobile drawer (mirrors the catalogue's real categories). */
export const navGroups: NavGroup[] = [
  {
    key: "nutrition",
    label: "Nutrition sportive",
    href: "/nutrition-sportive",
    icon: "dumbbell",
    links: [
      { label: "Whey Protéine", href: "/whey-proteine" },
      { label: "Whey Isolate", href: "/whey-isolate" },
      { label: "Mass Gainer", href: "/gainers-proteines" },
      { label: "Créatine", href: "/creatine" },
      { label: "Pre-Workout & Énergie", href: "/pre-workout" },
      { label: "BCAA & EAA", href: "/acides-amines" },
      { label: "Brûleurs de graisse", href: "/bruleurs-de-graisse" },
      { label: "L-Carnitine", href: "/l-carnitine" },
      { label: "Accessoires", href: "/accessoires" },
    ],
  },
  {
    key: "sante",
    label: "Vitamines & minéraux",
    href: "/vitamines",
    icon: "pill",
    links: [
      { label: "Vitamines", href: "/vitamines" },
      { label: "Minéraux", href: "/mineraux" },
      { label: "Zinc", href: "/zinc" },
      { label: "Magnésium", href: "/magnesium" },
      { label: "Oméga 3", href: "/omega-3" },
      { label: "Immunité", href: "/immunite" },
    ],
  },
  {
    key: "bienetre",
    label: "Compléments",
    href: "/complements-alimentaires",
    icon: "leaf",
    links: [
      { label: "Ashwagandha", href: "/ashwagandha" },
      { label: "Sommeil & stress", href: "/sommeil-stress" },
      { label: "Probiotiques", href: "/probiotiques" },
      { label: "Articulations", href: "/articulations" },
      { label: "Plantes & herbes", href: "/plantes-et-herbes" },
    ],
  },
];

export const navExtras: (NavLink & { icon: NavGroup["icon"] })[] = [
  { label: "Marques", href: "/marques", icon: "tag" },
  { label: "Conseils & guides", href: "/conseils", icon: "book" },
];

export const mobileNavigationGroups = [
  { label: "Nutrition sportive", items: storefrontNavigation.slice(1, 6) },
  { label: "Santé & bien-être", items: storefrontNavigation.slice(6, 8) },
  { label: "Découvrir", items: storefrontNavigation.slice(8) },
];
