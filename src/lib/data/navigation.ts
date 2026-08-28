export type NavCategory = {
  label: string;
  href: string;
  description: string;
  featured?: { label: string; href: string }[];
};

export const primaryCategories: NavCategory[] = [
  {
    label: "Créatine",
    href: "/creatine",
    description: "Créatine monohydrate micronisée pour force & puissance.",
  },
  {
    label: "Whey Protéine",
    href: "/whey-proteine",
    description: "Protéines pures pour développement musculaire & récupération.",
  },
  {
    label: "Gainers",
    href: "/gainers-proteines",
    description: "Formules caloriques pour prise de masse rapide.",
  },
  {
    label: "Pre-Workout",
    href: "/pre-workout",
    description: "Boosters d'énergie explosive & congestion.",
  },
  {
    label: "BCAA & EAA",
    href: "/bcaa",
    description: "Acides aminés pour la récupération musculaire.",
    featured: [
      { label: "BCAA", href: "/bcaa" },
      { label: "EAA", href: "/eaa" },
      { label: "Beta-Alanine", href: "/beta-alanine" },
      { label: "Citrulline", href: "/citrulline" },
    ],
  },
  {
    label: "Vitamines",
    href: "/vitamines",
    description: "Vitamines C, D3+K2 & complexes pour l'immunité.",
  },
  {
    label: "Minéraux & Zinc",
    href: "/zinc",
    description: "Zinc & Magnésium pour l'équilibre et la vitalité.",
    featured: [
      { label: "Zinc", href: "/zinc" },
      { label: "Magnésium", href: "/magnesium" },
    ],
  },
  {
    label: "Ashwagandha",
    href: "/ashwagandha",
    description: "Plante adaptogène pour le stress, le sommeil réparateur et la vitalité.",
  },
  {
    label: "Omega 3",
    href: "/omega-3",
    description: "Acides gras essentiels EPA & DHA pour le cœur et les articulations.",
  },
  {
    label: "Minceur & Brûleurs",
    href: "/l-carnitine",
    description: "L-Carnitine & brûleurs de graisse thermogéniques.",
    featured: [
      { label: "L-Carnitine", href: "/l-carnitine" },
      { label: "Brûleurs de Graisse", href: "/bruleurs-de-graisse" },
      { label: "Boosters", href: "/boosters-hormonaux" },
    ],
  },
];

export const concerns: { label: string; href: string }[] = [
  { label: "Prise de muscle", href: "/creatine" },
  { label: "Prise de masse", href: "/gainers-proteines" },
  { label: "Énergie & Focus", href: "/pre-workout" },
  { label: "Récupération", href: "/bcaa" },
  { label: "Immunité & Santé", href: "/vitamines" },
  { label: "Anti-stress & Sommeil", href: "/ashwagandha" },
  { label: "Sèche & Définition", href: "/l-carnitine" },
];

export const featuredBrands: { label: string; href: string }[] = [
  { label: "OstroVit", href: "/marques/ostrovit" },
  { label: "Optimum Nutrition", href: "/marques/optimum-nutrition" },
  { label: "BioTechUSA", href: "/marques/biotechusa" },
  { label: "Real Pharm", href: "/marques/real-pharm" },
  { label: "Quamtrax", href: "/marques/quamtrax" },
  { label: "Eric Favre", href: "/marques/eric-favre" },
  { label: "Challenger Nutrition", href: "/marques/challenger-nutrition" },
  { label: "Zumub", href: "/marques/zumub" },
];

export const secondaryNav: { label: string; href: string }[] = [
  { label: "Boutique", href: "/shop" },
  { label: "Marques", href: "/marques" },
  { label: "Conseils", href: "/conseils" },
];

export const popularSearches: string[] = [
  "Créatine Monohydrate",
  "Whey Protéine",
  "Pre-Workout",
  "Zinc",
  "Omega 3",
  "Optimum Nutrition",
  "OstroVit",
  "Ashwagandha",
];
