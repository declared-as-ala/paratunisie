export type ProductSize = {
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
  /** PDP-only fields. Kept on the same record rather than a parallel map — one product, one source of truth. */
  description: string;
  benefits: string[];
  usage: string;
  sizes: ProductSize[];
  /**
   * When in a skincare routine this product belongs — read directly off each
   * product's own `usage` text (e.g. "le matin" → AM), not invented. Powers
   * the Sprint 6 routine diagnostic. Hair/body-only products still carry a
   * value for consistency but aren't used to build a face AM/PM routine.
   */
  routineTime: ("AM" | "PM")[];
};

const productImages = {
  micellar: "/assets/product-micellar.webp",
  tube: "/assets/product-tube.webp",
  jar: "/assets/product-jar.webp",
  serum: "/assets/product-serum.webp",
} as const;

/**
 * No fabricated INCI ingredient lists — see DECISIONS.md D-0012. Composition
 * is deferred to the product's real packaging rather than invented per SKU.
 */
export const products: ProductSummary[] = [
  {
    id: "p01", slug: "anthelios-fluide-invisible", brand: "La Roche-Posay", name: "Anthelios Fluide Invisible SPF50+",
    benefit: "Protection élevée, fini invisible", size: "50 ml", priceMillimes: 58900,
    category: "Solaire", concerns: ["Protection solaire"], skinTypes: ["Toutes peaux"], image: productImages.tube,
    description: "Un fluide solaire haute protection à la texture légère, pensé pour un usage quotidien sur le visage sans laisser de trace blanche ni d'effet gras.",
    benefits: ["Protection UVA/UVB élevée", "Fini invisible, non collant", "Convient à un usage quotidien"],
    usage: "Appliquer généreusement le matin sur le visage propre, avant l'exposition au soleil. Renouveler l'application régulièrement en cas d'exposition prolongée.",
    routineTime: ["AM"],
    sizes: [{ label: "50 ml", priceMillimes: 58900 }],
  },
  {
    id: "p02", slug: "sensibio-h2o", brand: "Bioderma", name: "Sensibio H2O",
    benefit: "Nettoie et apaise sans rinçage", size: "250 ml", priceMillimes: 36900,
    category: "Visage", concerns: ["Peau sensible"], skinTypes: ["Peau sensible"], image: productImages.micellar,
    description: "L'eau micellaire de référence pour les peaux sensibles : elle nettoie et démaquille visage et yeux en un geste, sans rinçage et sans sensation de tiraillement.",
    benefits: ["Nettoie et démaquille en un geste", "Sans rinçage", "Adaptée aux yeux sensibles"],
    usage: "Imbiber un coton et passer délicatement sur le visage et les yeux, sans rincer.",
    routineTime: ["AM", "PM"],
    sizes: [
      { label: "100 ml", priceMillimes: 18900 },
      { label: "250 ml", priceMillimes: 36900 },
      { label: "500 ml", priceMillimes: 58900 },
    ],
  },
  {
    id: "p03", slug: "creme-hydratante-visage", brand: "CeraVe", name: "Crème Hydratante Visage",
    benefit: "Hydratation et barrière cutanée", size: "52 ml", priceMillimes: 42500,
    category: "Visage", concerns: ["Peau sèche", "Peau sensible"], skinTypes: ["Peau sèche", "Peau normale"], image: productImages.jar,
    description: "Une crème hydratante quotidienne à la texture riche mais non grasse, formulée pour accompagner le confort de la peau sèche à normale.",
    benefits: ["Hydratation longue durée", "Texture non grasse", "Convient à un usage quotidien"],
    usage: "Appliquer matin et/ou soir sur le visage propre et sec.",
    routineTime: ["AM", "PM"],
    sizes: [
      { label: "52 ml", priceMillimes: 42500 },
      { label: "340 ml", priceMillimes: 89900 },
    ],
  },
  {
    id: "p04", slug: "liftactiv-vitamine-c", brand: "Vichy", name: "Liftactiv Sérum Vitamine C",
    benefit: "Éclat et premiers signes de l'âge", size: "20 ml", priceMillimes: 91000,
    category: "Visage", concerns: ["Taches & éclat", "Premiers signes de l'âge"], skinTypes: ["Toutes peaux"], image: productImages.serum,
    description: "Un sérum concentré en vitamine C, à intégrer dans une routine du matin pour accompagner l'éclat du teint.",
    benefits: ["Concentré en vitamine C", "Texture fluide, absorption rapide", "Se glisse avant la crème de jour"],
    usage: "Appliquer quelques gouttes le matin sur peau propre, avant la crème de jour et la protection solaire.",
    routineTime: ["AM"],
    sizes: [{ label: "20 ml", priceMillimes: 91000 }],
  },
  {
    id: "p05", slug: "cleanance-gel", brand: "Avène", name: "Cleanance Gel Nettoyant",
    benefit: "Nettoyage doux des peaux à imperfections", size: "200 ml", priceMillimes: 39500,
    category: "Visage", concerns: ["Imperfections"], skinTypes: ["Peau grasse", "Peau mixte"], image: productImages.micellar,
    description: "Un gel nettoyant moussant conçu pour les peaux à tendance grasse ou à imperfections, qui nettoie sans agresser.",
    benefits: ["Nettoyage en douceur", "Texture moussante légère", "Pensé pour peaux à imperfections"],
    usage: "Faire mousser sur peau humide, matin et soir, puis rincer à l'eau tiède.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "200 ml", priceMillimes: 39500 }],
  },
  {
    id: "p06", slug: "aquapower-gel-creme", brand: "Uriage", name: "Eau Thermale Gel-Crème",
    benefit: "Hydratation légère et fraîche", size: "40 ml", priceMillimes: 48900,
    category: "Visage", concerns: ["Peau sèche"], skinTypes: ["Peau normale", "Peau mixte"], image: productImages.jar,
    description: "Un gel-crème hydratant à la sensation fraîche, adapté à un usage quotidien sur peau normale à mixte.",
    benefits: ["Sensation de fraîcheur immédiate", "Texture légère non collante", "Hydratation quotidienne"],
    usage: "Appliquer matin et/ou soir sur le visage nettoyé.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "40 ml", priceMillimes: 48900 }],
  },
  {
    id: "p07", slug: "sebiaclear-serum", brand: "SVR", name: "Sebiaclear Sérum",
    benefit: "Lisse le grain de peau", size: "30 ml", priceMillimes: 64900,
    category: "Visage", concerns: ["Imperfections", "Taches & éclat"], skinTypes: ["Peau grasse", "Peau mixte"], image: productImages.serum,
    description: "Un sérum ciblé pour les peaux à imperfections, à intégrer dans une routine pour affiner l'aspect du grain de peau.",
    benefits: ["Texture fluide non grasse", "Pensé pour peaux à imperfections", "Se glisse avant la crème"],
    usage: "Appliquer le soir sur peau propre, avant la crème de nuit.",
    routineTime: ["PM"],
    sizes: [{ label: "30 ml", priceMillimes: 64900 }],
  },
  {
    id: "p08", slug: "huile-prodigieuse", brand: "Nuxe", name: "Huile Prodigieuse",
    benefit: "Nourrit le visage, le corps et les cheveux", size: "100 ml", priceMillimes: 79500,
    category: "Corps", concerns: ["Peau sèche"], skinTypes: ["Toutes peaux"], image: productImages.serum,
    description: "Une huile sèche multi-usage, à utiliser sur le visage, le corps et les pointes de cheveux pour un fini nourri et non gras.",
    benefits: ["Multi-usage : visage, corps, cheveux", "Absorption rapide", "Fini non gras"],
    usage: "Appliquer sur peau sèche ou humide, en massant délicatement.",
    routineTime: ["AM", "PM"],
    sizes: [
      { label: "50 ml", priceMillimes: 49900 },
      { label: "100 ml", priceMillimes: 79500 },
    ],
  },
  {
    id: "p09", slug: "dermopure-fluide", brand: "Eucerin", name: "DermoPure Fluide Matifiant",
    benefit: "Hydrate et aide à limiter la brillance", size: "50 ml", priceMillimes: 55900,
    category: "Visage", concerns: ["Imperfections"], skinTypes: ["Peau grasse", "Peau mixte"], image: productImages.tube,
    description: "Un fluide hydratant au fini matifiant, conçu pour les peaux grasses à mixtes sujettes aux imperfections.",
    benefits: ["Fini matifiant", "Texture légère", "Convient à un usage quotidien"],
    usage: "Appliquer matin et/ou soir sur le visage propre.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "50 ml", priceMillimes: 55900 }],
  },
  {
    id: "p10", slug: "anaphase-shampooing", brand: "Ducray", name: "Anaphase+ Shampooing",
    benefit: "Fortifie les cheveux fragilisés", size: "200 ml", priceMillimes: 46500,
    category: "Cheveux", concerns: ["Chute de cheveux"], skinTypes: ["Toutes peaux"], image: productImages.tube,
    description: "Un shampooing complément anti-chute, à utiliser en alternance avec le shampooing habituel pour accompagner une routine capillaire.",
    benefits: ["Complément anti-chute", "S'utilise en alternance", "Texture moussante douce"],
    usage: "Faire mousser sur cheveux mouillés, laisser poser quelques instants, puis rincer.",
    routineTime: ["AM", "PM"],
    sizes: [
      { label: "200 ml", priceMillimes: 46500 },
      { label: "400 ml", priceMillimes: 79900 },
    ],
  },
  {
    id: "p11", slug: "atoderm-gel-douche", brand: "Bioderma", name: "Atoderm Gel Douche",
    benefit: "Nettoie en douceur et protège du dessèchement", size: "500 ml", priceMillimes: 44900,
    category: "Corps", concerns: ["Peau sèche", "Peau sensible"], skinTypes: ["Peau sèche", "Peau sensible"], image: productImages.micellar,
    description: "Un gel douche surgras pour le corps, pensé pour les peaux sèches à sensibles qui ont besoin d'un nettoyage doux au quotidien.",
    benefits: ["Nettoyage en douceur", "Sans savon", "Convient à un usage quotidien"],
    usage: "Appliquer sur peau humide, faire mousser légèrement puis rincer.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "500 ml", priceMillimes: 44900 }],
  },
  {
    id: "p12", slug: "cicaplast-baume-b5", brand: "La Roche-Posay", name: "Cicaplast Baume B5+",
    benefit: "Apaise et protège les zones fragilisées", size: "40 ml", priceMillimes: 34900,
    category: "Visage", concerns: ["Peau sensible"], skinTypes: ["Toutes peaux"], image: productImages.tube,
    description: "Un baume multi-usage à appliquer sur les zones fragilisées du visage ou du corps, pour un geste de confort au quotidien.",
    benefits: ["Multi-usage visage et corps", "Convient à toute la famille", "Texture riche et enveloppante"],
    usage: "Appliquer une à plusieurs fois par jour sur la zone concernée.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "40 ml", priceMillimes: 34900 }],
  },
  {
    id: "p13", slug: "capital-soleil-uv-age", brand: "Vichy", name: "Capital Soleil UV-Age Daily",
    benefit: "Protection quotidienne anti-photovieillissement", size: "40 ml", priceMillimes: 72500,
    category: "Solaire", concerns: ["Protection solaire", "Premiers signes de l'âge"], skinTypes: ["Toutes peaux"], image: productImages.tube,
    description: "Une protection solaire quotidienne à la texture invisible, pensée pour s'intégrer facilement à une routine du matin.",
    benefits: ["Protection quotidienne", "Fini invisible", "Se porte seule ou sous maquillage"],
    usage: "Appliquer chaque matin sur le visage, en dernière étape de la routine.",
    routineTime: ["AM"],
    sizes: [{ label: "40 ml", priceMillimes: 72500 }],
  },
  {
    id: "p14", slug: "xera-calm-baume", brand: "Avène", name: "XeraCalm A.D Baume",
    benefit: "Confort des peaux très sèches", size: "200 ml", priceMillimes: 68900,
    category: "Corps", concerns: ["Peau sèche", "Peau sensible"], skinTypes: ["Peau sèche", "Peau sensible"], image: productImages.micellar,
    description: "Un baume riche pour le corps, formulé pour apporter du confort aux peaux très sèches sujettes à l'inconfort.",
    benefits: ["Texture riche et enveloppante", "Pensé pour peaux très sèches", "Convient à toute la famille"],
    usage: "Appliquer sur le corps, en massant délicatement jusqu'à absorption.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "200 ml", priceMillimes: 68900 }],
  },
  {
    id: "p15", slug: "mineral-89", brand: "Vichy", name: "Minéral 89 Booster",
    benefit: "Hydrate et fortifie la barrière cutanée", size: "50 ml", priceMillimes: 79900,
    category: "Visage", concerns: ["Peau sèche", "Peau sensible"], skinTypes: ["Toutes peaux"], image: productImages.serum,
    description: "Un booster quotidien à la texture gel-fondante, à utiliser seul ou avant la crème pour renforcer le confort de la peau.",
    benefits: ["Texture gel-fondante", "S'utilise matin et soir", "Se marie avec le reste de la routine"],
    usage: "Appliquer matin et/ou soir sur le visage, seul ou avant la crème.",
    routineTime: ["AM", "PM"],
    sizes: [
      { label: "30 ml", priceMillimes: 54900 },
      { label: "50 ml", priceMillimes: 79900 },
    ],
  },
  {
    id: "p16", slug: "bariederm-cica-creme", brand: "Uriage", name: "Bariéderm Cica-Crème",
    benefit: "Isole, protège et apaise", size: "40 ml", priceMillimes: 32900,
    category: "Visage", concerns: ["Peau sensible"], skinTypes: ["Toutes peaux"], image: productImages.tube,
    description: "Une crème réparatrice à appliquer sur les zones fragilisées, pour un geste de protection au quotidien.",
    benefits: ["Texture protectrice", "Convient à toute la famille", "Geste simple au quotidien"],
    usage: "Appliquer une à plusieurs fois par jour sur la zone concernée.",
    routineTime: ["AM", "PM"],
    sizes: [{ label: "40 ml", priceMillimes: 32900 }],
  },
];

export const productBrands = [...new Set(products.map((product) => product.brand))].sort();
export const productCategories = [...new Set(products.map((product) => product.category))].sort();
export const productConcerns = [...new Set(products.flatMap((product) => product.concerns))].sort();

export function formatPrice(priceMillimes: number) {
  return `${(priceMillimes / 1000).toLocaleString("fr-TN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} DT`;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

/**
 * "Complétez votre routine": a different category, same concern — a real
 * IA relationship, not a fabricated purchase-affinity signal.
 */
export function getRoutineCompletionProducts(product: ProductSummary, limit = 4, allProducts?: ProductSummary[]) {
  const pool = allProducts ?? products;
  return pool
    .filter((candidate) => candidate.id !== product.id && candidate.category !== product.category
      && candidate.concerns.some((concern) => product.concerns.includes(concern)))
    .slice(0, limit);
}

/** "Produits similaires": same category, ideally overlapping concern. */
export function getSimilarProducts(product: ProductSummary, limit = 4, allProducts?: ProductSummary[]) {
  const pool = allProducts ?? products;
  const sameCategory = pool.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  );
  const withSharedConcern = sameCategory.filter((candidate) =>
    candidate.concerns.some((concern) => product.concerns.includes(concern)),
  );
  const rest = sameCategory.filter((candidate) => !withSharedConcern.includes(candidate));
  return [...withSharedConcern, ...rest].slice(0, limit);
}
