import { products, type ProductSummary } from "@/lib/data/products";

/* ─── Category Types ─────────────────────────────────────────────── */

export type Subcategory = {
  slug: string;
  name: string;
  /** Filter predicate — products matching this subcategory */
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
  /** Short SEO-optimized intro (2-4 sentences) for the category page */
  seoIntro: string;
  subcategories: Subcategory[];
  concerns: Concern[];
  /** Products belonging to this category */
  products: ProductSummary[];
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function inCategory(categoryName: string) {
  return (p: ProductSummary) => p.category === categoryName;
}

function hasConcern(concern: string) {
  return (p: ProductSummary) => p.concerns.includes(concern);
}

function and(...predicates: Array<(p: ProductSummary) => boolean>) {
  return (p: ProductSummary) => predicates.every((fn) => fn(p));
}

/* ─── Categories ─────────────────────────────────────────────────── */

export const categories: Category[] = [
  {
    slug: "visage",
    name: "Soin du Visage",
    eyebrow: "Soins visage",
    description:
      "Nettoyants, sérums, hydratants et soins ciblés pour chaque type de peau. Des formules dermatologiques éprouvées, adaptées aux besoins du quotidien.",
    seoIntro:
      "Découvrez notre sélection de soins visage : nettoyants doux, sérums concentrés, hydratants et protection solaire. Chaque produit est choisi pour son efficacité, sa tolérance et son adaptabilité aux peaux sensibles, grasses, sèches ou mixtes.",
    subcategories: [
      { slug: "nettoyants", name: "Nettoyants", match: and(inCategory("Visage"), hasConcern("Peau sensible")) },
      { slug: "serums", name: "Sérums", match: (p) => p.category === "Visage" && p.name.toLowerCase().includes("sérum") },
      { slug: "hydratants", name: "Hydratants", match: and(inCategory("Visage"), (p) => p.name.toLowerCase().includes("hydrat") || p.name.toLowerCase().includes("crème") || p.name.toLowerCase().includes("gel-crème") || p.name.toLowerCase().includes("fluide")) },
      { slug: "anti-imperfections", name: "Anti-imperfections", match: and(inCategory("Visage"), hasConcern("Imperfections")) },
      { slug: "anti-age", name: "Anti-âge", match: and(inCategory("Visage"), hasConcern("Premiers signes de l'âge")) },
    ],
    concerns: [
      { slug: "imperfections", name: "Acné & imperfections", match: hasConcern("Imperfections") },
      { slug: "taches-eclat", name: "Taches & éclat", match: hasConcern("Taches & éclat") },
      { slug: "peau-sensible", name: "Peau sensible", match: hasConcern("Peau sensible") },
      { slug: "peau-seche", name: "Peau sèche", match: hasConcern("Peau sèche") },
      { slug: "anti-age", name: "Premiers signes de l'âge", match: hasConcern("Premiers signes de l'âge") },
    ],
    products: products.filter(inCategory("Visage")),
  },
  {
    slug: "corps",
    name: "Soin du Corps",
    eyebrow: "Soins corps",
    description:
      "Gels douche, baumes nourrissants et soins corporels pour toute la famille. Des textures pensées pour le confort quotidien de la peau.",
    seoIntro:
      "Explorez nos soins corporels : gels douche surgras, baumes réparateurs, huiles sèches et soins hydratants pour le corps. Des formules douces, adaptées aux peaux sèches, sensibles ou normales, pour un confort visible au quotidien.",
    subcategories: [
      { slug: "gels-douche", name: "Gels douche", match: and(inCategory("Corps"), (p) => p.name.toLowerCase().includes("gel douche")) },
      { slug: "baumes", name: "Baumes & soins", match: and(inCategory("Corps"), (p) => p.name.toLowerCase().includes("baume") || p.name.toLowerCase().includes("huile")) },
    ],
    concerns: [
      { slug: "peau-seche", name: "Peau sèche", match: hasConcern("Peau sèche") },
      { slug: "peau-sensible", name: "Peau sensible", match: hasConcern("Peau sensible") },
    ],
    products: products.filter(inCategory("Corps")),
  },
  {
    slug: "cheveux",
    name: "Soin des Cheveux",
    eyebrow: "Soins capillaires",
    description:
      "Shampooings, soins et traitements pour tous les types de cheveux. Expertise dermocosmétique pour un cuir chevelu sain et des cheveux en pleine santé.",
    seoIntro:
      "Trouvez le shampooing et le soin capillaire adaptés à vos besoins : anti-chute, hydratation, purification du cuir chevelu ou protection des cheveux colorés. Des formules développées avec une approche dermatologique pour des résultats visibles.",
    subcategories: [
      { slug: "anti-chute", name: "Anti-chute", match: and(inCategory("Cheveux"), hasConcern("Chute de cheveux")) },
    ],
    concerns: [
      { slug: "chute-cheveux", name: "Chute de cheveux", match: hasConcern("Chute de cheveux") },
    ],
    products: products.filter(inCategory("Cheveux")),
  },
  {
    slug: "solaire",
    name: "Protection Solaire",
    eyebrow: "Solaires",
    description:
      "Protection solaire haute protection pour le visage et le corps. Formules invisibles, résistantes à l'eau et adaptées à chaque type de peau.",
    seoIntro:
      "Choisissez votre écran solaire parmi notre sélection de protections haute performance : fluide invisible, lait protecteur, stick pour zones sensibles. Des filtres avancés, une tolérance optimale et un fini invisible pour une protection quotidienne sous le soleil tunisien.",
    subcategories: [
      { slug: "visage", name: "Visage", match: and(inCategory("Solaire"), (p) => p.name.toLowerCase().includes("visage") || p.name.toLowerCase().includes("fluide")) },
      { slug: "corps", name: "Corps", match: and(inCategory("Solaire"), (p) => !p.name.toLowerCase().includes("visage") && !p.name.toLowerCase().includes("fluide")) },
    ],
    concerns: [
      { slug: "protection-solaire", name: "Protection solaire", match: hasConcern("Protection solaire") },
      { slug: "anti-age", name: "Anti-photovieillissement", match: hasConcern("Premiers signes de l'âge") },
    ],
    products: products.filter(inCategory("Solaire")),
  },
  {
    slug: "hygiene",
    name: "Hygiène",
    eyebrow: "Hygiène quotidienne",
    description:
      "Gels hydro-alcooliques, déodorants, soins buccaux et produits d'hygiène quotidienne. Des formules douces et efficaces pour toute la famille.",
    seoIntro:
      "Retrouvez nos produits d'hygiène quotidienne : gels nettoyants, déodorants dermatologiques, soins buccaux et accessoires d'hygiène. Des marques de confiance, formulées pour respecter la peau tout en assurant une protection efficace au quotidien.",
    subcategories: [],
    concerns: [],
    products: [],
  },
  {
    slug: "complements",
    name: "Compléments Alimentaires",
    eyebrow: "Compléments",
    description:
      "Vitamines, minéraux, probiotiques et compléments alimentaires pour soutenir votre santé au quotidien. Des formules de qualité, issues de marques reconnues.",
    seoIntro:
      "Découvrez notre sélection de compléments alimentaires : vitamines, oméga-3, probiotiques, fer, magnésium et cure renforçante. Des produits soigneusement choisis pour compléter votre alimentation et soutenir votre bien-être au quotidien.",
    subcategories: [],
    concerns: [],
    products: [],
  },
  {
    slug: "homme",
    name: "Soin Homme",
    eyebrow: "Soins hommes",
    description:
      "Soins visage, anti-âge et hygiène spécialement formulés pour les besoins de la peau masculine. Des textures légères, des formules efficaces.",
    seoIntro:
      "Explorez nos soins homme : hydratants non grasses, après-rasage apaisants, anti-âge ciblés et shampooings spécialisés. La peau masculine a des besoins spécifiques — nos marques dermatologiques y répondent avec des formules adaptées.",
    subcategories: [],
    concerns: [],
    products: [],
  },
  {
    slug: "bebe-maman",
    name: "Bébé & Maman",
    eyebrow: "Bébé & maman",
    description:
      "Soins doux pour bébé et_future maman : crèmes change, bains, huiles et soins du corps. Des formules testées, sans parabènes, adaptées aux peaux les plus délicates.",
    seoIntro:
      "Trouvez les soins essentiels pour bébé et la future maman : crèmes anti-érythème, huiles de bain, laits corporels et soins post-naissance. Des marques de confiance, formulées avec une tolérance maximale pour les peaux les plus sensibles.",
    subcategories: [],
    concerns: [],
    products: [],
  },
];

/* ─── Lookup Helpers ─────────────────────────────────────────────── */

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}

/** All unique concerns across categories */
export function getAllConcerns(): Array<{ slug: string; name: string; categorySlug: string }> {
  return categories.flatMap((c) =>
    c.concerns.map((concern) => ({
      ...concern,
      categorySlug: c.slug,
    })),
  );
}

/** All unique brands for a set of products */
export function getBrandsForProducts(productList: ProductSummary[]): string[] {
  return [...new Set(productList.map((p) => p.brand))].sort();
}

/** All unique concerns for a set of products */
export function getConcernsForProducts(productList: ProductSummary[]): string[] {
  return [...new Set(productList.flatMap((p) => p.concerns))].sort();
}

/** All unique skin types for a set of products */
export function getSkinTypesForProducts(productList: ProductSummary[]): string[] {
  return [...new Set(productList.flatMap((p) => p.skinTypes))].sort();
}
