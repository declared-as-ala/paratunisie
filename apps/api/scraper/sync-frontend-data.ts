import * as fs from "fs";
import * as path from "path";

const scrapedPath = path.join(__dirname, "scraped_protein_catalog.json");
const scrapedProducts = JSON.parse(fs.readFileSync(scrapedPath, "utf8"));

// 1. Generate src/lib/data/products.ts
const productsCode = `export type ProductSize = {
  label: string;
  priceMillimes: number;
};

export type ProductSummary = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  benefit: string;
  size: string;
  priceMillimes: number;
  category: string;
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
};

export const products: ProductSummary[] = ${JSON.stringify(
  scrapedProducts.map((p: any, idx: number) => ({
    id: `p${String(idx + 1).padStart(2, "0")}`,
    slug: p.slug,
    brand: p.brand,
    name: p.normalizedTitle,
    benefit: p.benefit,
    size: p.formatSize || "Standard",
    priceMillimes: p.priceMillimes,
    category: p.category,
    concerns: [p.category],
    skinTypes: ["Tous sportifs"],
    image: p.mainImage,
    description: p.description,
    benefits: [p.benefit, `Produit 100% authentique de la marque ${p.brand}`, `Format pratique de ${p.formatSize || "Standard"}`],
    usage: p.usage,
    sizes: [{ label: p.formatSize || "Standard", priceMillimes: p.priceMillimes }],
    routineTime: (p.category === "Pre-Workout" || p.category === "Créatine" || p.category === "Whey Protéine" || p.category === "BCAA" || p.category === "EAA") ? ["AM", "PM"] : ["AM"],
    inStock: true,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    canonicalUrl: `/produits/${p.slug}`,
    indexable: true,
  })),
  null,
  2
)};

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
`;

fs.writeFileSync(path.join(__dirname, "..", "..", "..", "src", "lib", "data", "products.ts"), productsCode, "utf8");
console.log("Updated src/lib/data/products.ts");

// 2. Generate src/lib/data/categories.ts
const categoryList = [
  {
    slug: "creatine",
    name: "Créatine",
    eyebrow: "Force & Puissance",
    description: "Créatines monohydrates micronisées pures pour augmenter la force et le volume musculaire.",
    seoIntro: "Découvrez notre sélection de créatines monohydrates en poudre et gélules en Tunisie. Idéales pour optimiser vos performances, votre force explosive et accélérer votre développement musculaire.",
  },
  {
    slug: "whey-proteine",
    name: "Whey Protéine",
    eyebrow: "Construction Musculaire",
    description: "Protéines de lactosérum de haute qualité pour la prise de muscle sec et la récupération.",
    seoIntro: "Sélection des meilleures whey protéines en Tunisie : concentrées, isolats et formules anaboliques pour nourrir vos fibres musculaires après l'effort.",
  },
  {
    slug: "gainers-proteines",
    name: "Gainers",
    eyebrow: "Prise de Masse",
    description: "Formules riches en protéines et glucides complexes pour une prise de masse rapide et efficace.",
    seoIntro: "Nos gainers caloriques et protéinés aident les profils ectomorphes et sportifs à prendre du poids et développer leur masse musculaire de manière équilibrée.",
  },
  {
    slug: "pre-workout",
    name: "Pre-Workout",
    eyebrow: "Énergie & Focus",
    description: "Boosters d'entraînement puissants pour l'énergie, la congestion et la concentration.",
    seoIntro: "Boostez vos séances d'entraînement avec notre sélection de pre-workouts puissants contenant caféine, bêta-alanine et précurseurs d'oxyde nitrique.",
  },
  {
    slug: "bcaa",
    name: "BCAA",
    eyebrow: "Acides Aminés",
    description: "Acides aminés branchés (Leucine, Isoleucine, Valine) pour préserver le muscle et récupérer.",
    seoIntro: "Les BCAA sont essentiels pour stopper le catabolisme musculaire et favoriser une récupération rapide pendant et après vos séances de sport.",
  },
  {
    slug: "eaa",
    name: "EAA",
    eyebrow: "Acides Aminés Essentiels",
    description: "Le profil complet des 9 acides aminés essentiels pour la synthèse des protéines.",
    seoIntro: "Les acides aminés essentiels (EAA) soutiennent la synthèse musculaire maximale et l'hydratation cellulaire durant l'effort.",
  },
  {
    slug: "beta-alanine",
    name: "Beta-Alanine",
    eyebrow: "Endurance Musculaire",
    description: "Acide aminé précurseur de la carnosine pour repousser la fatigue musculaire.",
    seoIntro: "La bêta-alanine permet de retarder l'apparition de l'acide lactique et d'améliorer l'endurance musculaire lors d'efforts intenses.",
  },
  {
    slug: "citrulline",
    name: "Citrulline",
    eyebrow: "Vasodilatation & Congestion",
    description: "Précurseur d'oxyde nitrique pour une vascularité et une congestion exceptionnelles.",
    seoIntro: "La citrulline et l'arginine améliorent le flux sanguin, l'oxygénation des muscles et la congestion lors des séances d'entraînement.",
  },
  {
    slug: "vitamines",
    name: "Vitamines",
    eyebrow: "Vitalité & Immunité",
    description: "Vitamines C, D3+K2 et complexes multivitaminés complets pour la vitalité quotidienne.",
    seoIntro: "Découvrez notre gamme de vitamines essentielles pour renforcer votre système immunitaire, combattre la fatigue et soutenir votre métabolisme.",
  },
  {
    slug: "zinc",
    name: "Zinc",
    eyebrow: "Minéraux Essentiels",
    description: "Soutien immunitaire, équilibre hormonal et santé de la peau et des ongles.",
    seoIntro: "Le zinc est un oligo-élément capital participant à plus de 300 réactions enzymatiques, au maintien du taux de testostérone et à l'immunité.",
  },
  {
    slug: "magnesium",
    name: "Magnésium",
    eyebrow: "Équilibre Nerveux & Musculaire",
    description: "Magnésium avec Vitamine B6 pour réduire le stress, les crampes et la fatigue.",
    seoIntro: "Indispensable pour la contraction musculaire et la relaxation du système nerveux, le magnésium combat la fatigue et le surmenage.",
  },
  {
    slug: "omega-3",
    name: "Omega 3",
    eyebrow: "Acides Gras Essentiels",
    description: "Huiles de poisson hautement concentrées en EPA & DHA pour le cœur et les articulations.",
    seoIntro: "Les oméga-3 favorisent la santé cardiovasculaire, réduisent les inflammations articulaires et soutiennent les fonctions cérébrales.",
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    eyebrow: "Plante Adaptogène",
    description: "Extrait naturel pour réguler le cortisol, réduire le stress et booster la vitalité.",
    seoIntro: "L'ashwagandha est une plante adaptogène ancestrale qui aide l'organisme à résister au stress physique et mental et améliore la qualité du sommeil.",
  },
  {
    slug: "boosters-hormonaux",
    name: "Boosters",
    eyebrow: "Vitalité & Tonus",
    description: "Formules avancées à base de plantes et minéraux pour stimuler le tonus masculin.",
    seoIntro: "Nos boosters soutiennent la production naturelle de testostérone, la vigueur et les performances physiques des athlètes.",
  },
  {
    slug: "l-carnitine",
    name: "L-Carnitine",
    eyebrow: "Énergie & Définition",
    description: "Transporteur d'acides gras vers les cellules pour la production d'énergie à l'effort.",
    seoIntro: "La L-Carnitine aide à mobiliser les graisses stockées pour les convertir en énergie disponible pendant vos entraînements cardio et fitness.",
  },
  {
    slug: "bruleurs-de-graisse",
    name: "Brûleurs de Graisse",
    eyebrow: "Sèche & Métabolisme",
    description: "Formules thermogéniques concentrées pour accélérer la combustion des calories.",
    seoIntro: "Nos brûleurs de graisse vous accompagnent dans vos périodes de sèche et de perte de poids en stimulant votre métabolisme de base.",
  },
];

const categoriesCode = `import { products, type ProductSummary } from "@/lib/data/products";

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

export const categories: Category[] = ${JSON.stringify(
  categoryList.map((c) => ({
    slug: c.slug,
    name: c.name,
    eyebrow: c.eyebrow,
    description: c.description,
    seoIntro: c.seoIntro,
    subcategories: [
      { slug: "tous", name: "Tous les produits" },
    ],
    concerns: [
      { slug: c.slug, name: c.name },
    ],
  })),
  null,
  2
)}.map((cat) => ({
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
`;

fs.writeFileSync(path.join(__dirname, "..", "..", "..", "src", "lib", "data", "categories.ts"), categoriesCode, "utf8");
console.log("Updated src/lib/data/categories.ts");

// 3. Generate src/lib/data/brands.ts
const brandNames = [...new Set(scrapedProducts.map((p: any) => p.brand))].sort();
const brandsCode = `import { products } from "@/lib/data/products";

export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  featured?: boolean;
  universe?: string;
  productCount: number;
};

export const brands: Brand[] = ${JSON.stringify(
  brandNames.map((name: any) => ({
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    tagline: "Nutrition sportive & santé authentique",
    description: `Découvrez la gamme officielle des produits ${name} en Tunisie sur ParaTunisie. Produits certifiés 100% authentiques avec livraison rapide à domicile partout en Tunisie.`,
    featured: true,
    universe: "Nutrition & Compléments",
    productCount: scrapedProducts.filter((p: any) => p.brand === name).length,
  })),
  null,
  2
)};

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getAllBrandSlugs(): string[] {
  return brands.map((b) => b.slug);
}
`;

fs.writeFileSync(path.join(__dirname, "..", "..", "..", "src", "lib", "data", "brands.ts"), brandsCode, "utf8");
console.log("Updated src/lib/data/brands.ts");

// 4. Generate src/lib/data/navigation.ts
const navigationCode = `export type NavCategory = {
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
    label: "Omega 3 & Santé",
    href: "/omega-3",
    description: "Omega 3 & Ashwagandha pour la santé globale.",
    featured: [
      { label: "Omega 3", href: "/omega-3" },
      { label: "Ashwagandha", href: "/ashwagandha" },
    ],
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
`;

fs.writeFileSync(path.join(__dirname, "..", "..", "..", "src", "lib", "data", "navigation.ts"), navigationCode, "utf8");
console.log("Updated src/lib/data/navigation.ts");
