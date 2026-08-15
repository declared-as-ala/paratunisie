import { products, type ProductSummary } from "@/lib/data/products";

/* ─── Concern Types ──────────────────────────────────────────────── */

export type ConcernPage = {
  slug: string;
  name: string;
  eyebrow?: string;
  description: string;
  seoIntro: string;
  /** Related concern slugs for cross-linking */
  relatedConcerns: string[];
  match: (product: ProductSummary) => boolean;
};

/* ─── Concerns ───────────────────────────────────────────────────── */

export const concernPages: ConcernPage[] = [
  {
    slug: "acne-imperfections",
    name: "Acné & Imperfections",
    eyebrow: "Peau à imperfections",
    description:
      "Soin ciblé pour les peaux à tendance grasse ou sujettes aux imperfections. Nettoyants, sérums et fluide matifiant pour un grain de peau affiné.",
    seoIntro:
      "Retrouvez les soins dermatologiques les plus efficaces contre les imperfections : gel nettoyant, sérum purifiant, fluide matifiant et soins ciblés. Des formules adaptées aux peaux grasses et mixtes, développées par des marques de référence en dermocosmétique.",
    relatedConcerns: ["taches-eclat", "peau-sensible"],
    match: (p) => p.concerns.includes("Imperfections"),
  },
  {
    slug: "taches-eclat",
    name: "Taches & Éclat",
    eyebrow: "Teint unifié",
    description:
      "Sérums et soins illuminateurs pour atténuer les taches et redonner de l'éclat au teint. Actifs concentrés pour unifies l complexion.",
    seoIntro:
      "Découvrez nos soins anti-taches et illuminateurs : sérums à la vitamine C, crèmes éclaircissantes et soins unifiants. Des formules ciblées pour atténuer les taches pigmentaires et redonner de la luminosité au teint, adaptées à chaque type de peau.",
    relatedConcerns: ["acne-imperfections", "anti-age"],
    match: (p) => p.concerns.includes("Taches & éclat"),
  },
  {
    slug: "peau-sensible",
    name: "Peau Sensible",
    eyebrow: "Sensibilité",
    description:
      "Soins apaisants et sans irritants pour les peaux réactives. Formules testées sous contrôle dermatologique, sans parfum ni agent agressif.",
    seoIntro:
      "Explorez notre sélection pour peaux sensibles : eaux thermales, crèmes apaisantes, nettoyants doux et baumes protecteurs. Des marques reconnues pour leur tolérance optimale — La Roche-Posay, Avène, Bioderma, Uriage — formulées pour apaiser et renforcer la barrière cutanée.",
    relatedConcerns: ["peau-seche", "acne-imperfections"],
    match: (p) => p.concerns.includes("Peau sensible"),
  },
  {
    slug: "peau-seche",
    name: "Peau Sèche",
    eyebrow: "Hydratation",
    description:
      "Hydratants riches, huiles nourrissantes et baumes protecteurs pour les peaux qui manquent de confort. Restaurez la barrière cutanée au quotidien.",
    seoIntro:
      "Retrouvez les soins essentiels pour peaux sèches : crèmes hydratantes riches, huiles sèches, baumes réparateurs et gels douche surgras. Des formules enrichies en céramides, acide hyaluronique et beurres végétaux pour restaurer le confort et la souplesse de la peau.",
    relatedConcerns: ["peau-sensible", "anti-age"],
    match: (p) => p.concerns.includes("Peau sèche"),
  },
  {
    slug: "premiers-signes-age",
    name: "Premiers Signes de l'Âge",
    eyebrow: "Anti-âge",
    description:
      "Sérums, crèmes et soins ciblés pour accompagner la peau dès les premiers signes de la time. Antioxydants, vitamine C et actifs repulpants.",
    seoIntro:
      "Découvrez nos soins anti-âge préventifs : sérums à la vitamine C, crèmes repulpantes, soins contour des yeux et antioxydants. Des formules développées pour préserver la jeunesse du teint, lisser les premières ridules et redonner de l'éclat à la peau.",
    relatedConcerns: ["taches-eclat", "peau-seche"],
    match: (p) => p.concerns.includes("Premiers signes de l'âge"),
  },
  {
    slug: "chute-cheveux",
    name: "Chute de Cheveux",
    eyebrow: "Capillaire",
    description:
      "Shampooings, lotions et compléments pour accompagner la lutte contre la chute des cheveux. Expertise dermocosmétique pour un cuir chevelu sain.",
    seoIntro:
      "Explorez notre gamme anti-chute : shampooings fortifiants, lotions stimulantes, compléments alimentaires et soins du cuir chevelu. Des marques spécialisées comme Ducray, Vichy et Kérastase pour des formules qui renforcent les cheveux et soutiennent la croissance.",
    relatedConcerns: ["peau-sensible"],
    match: (p) => p.concerns.includes("Chute de cheveux"),
  },
  {
    slug: "protection-solaire",
    name: "Protection Solaire",
    eyebrow: "Solaire",
    description:
      "Écrans solaires haute protection pour le visage et le corps. Formules invisibles, résistantes à l'eau, adaptées à chaque type de peau.",
    seoIntro:
      "Choisissez votre protection solaire parmi nos écrans haute performance : fluide invisible SPF50+, lait protecteur, stick pour zones sensibles et brume corporelle. Des filtres avancés, une tolérance optimale et un fini invisible pour une protection quotidienne sous le soleil tunisien.",
    relatedConcerns: ["taches-eclat", "peau-sensible"],
    match: (p) => p.concerns.includes("Protection solaire"),
  },
  {
    slug: "bebe",
    name: "Bébé & Maman",
    eyebrow: "Bébé",
    description:
      "Soins doux pour bébé et future maman : crèmes change, bains, huiles et soins du corps. Des formules sans parabènes, testées sous contrôle dermatologique.",
    seoIntro:
      "Retrouvez les soins essentiels pour bébé et la future maman : crèmes anti-érythème, huiles de bain, laits corporels et soins post-naissance. Des marques de confiance formulées avec une tolérance maximale pour les peaux les plus sensibles.",
    relatedConcerns: ["peau-sensible", "peau-seche"],
    match: () => false, // No products mapped yet
  },
];

/* ─── Lookup Helpers ─────────────────────────────────────────────── */

export function getConcernBySlug(slug: string): ConcernPage | undefined {
  return concernPages.find((c) => c.slug === slug);
}

export function getAllConcernSlugs(): string[] {
  return concernPages.map((c) => c.slug);
}

/** Get products matching a concern */
export function getProductsForConcern(concern: ConcernPage): ProductSummary[] {
  return products.filter(concern.match);
}

/** Get related concern pages */
export function getRelatedConcerns(concern: ConcernPage): ConcernPage[] {
  return concern.relatedConcerns
    .map((slug) => getConcernBySlug(slug))
    .filter((c): c is ConcernPage => c !== undefined);
}
