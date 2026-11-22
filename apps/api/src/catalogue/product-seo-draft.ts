import { BANNED_CLAIM, readableProductName as baseReadableName } from "./brand-seo";
import { RESTRICTED_SUBSTANCE } from "./product-seo-quality";
import { plausibleSizeLabel } from "../homepage/cheapest-by-category";

/**
 * Safe product SEO optimizer (pure functions).
 *  - Only SEO fields are written (title, description, H1, intro, keywords, social, alt, canonical, quick-facts block).
 *    The product's own description, price, stock and indexability are never touched.
 *  - GAP FILLING ONLY: a field is written when it is empty, breaks a hard length limit (title 15-70, description 90-160) or the
 *    canonical points elsewhere. An existing value is never swapped for another template, so nothing that already works can regress.
 *    Generic leftovers are reported (notes) but left in place.
 *  - Nothing about dosage, benefits, ingredients or health effects is generated: only catalogue facts.
 */

export type ProductFacts = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  publishState: string;
  inStock: boolean;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  variantLabel: string | null;
  image: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoH1: string | null;
  seoIntro: string | null;
  seoContent: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  imageAlt: string | null;
};

export type ProductSeoFields = {
  seoTitle: string; seoDescription: string; seoH1: string; seoIntro: string; seoContent: string; seoKeywords: string;
  canonicalUrl: string; ogTitle: string; ogDescription: string; ogImage: string; imageAlt: string;
};

export type ProductPlan = {
  id: string;
  slug: string;
  name: string;
  action: "optimize" | "skip" | "blocked";
  reason: string;
  changes: Partial<ProductSeoFields>;
  issues: string[];
  /** Generic leftovers that were intentionally left in place. */
  notes: string[];
};

const SITE = "https://paratunisie.com";
/** Readable catalogue name with tidy hyphens: "OSTROVIT- 500GR" and "500G -QUAMTRAX" become "... - ...". */
function readableProductName(name: string): string {
  return baseReadableName(name).replace(/(?<=\S)\s+-\s*(?=\S)|(?<=\S)-\s+(?=\S)/g, " - ").replace(/\s+/g, " ").trim();
}
const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
const norm = (v: unknown) => clean(v).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Copy produced by the previous generators; never written by a person. */
export function isGenericProductText(value: string | null | undefined): boolean {
  const t = norm(value);
  if (!t) return false;
  return (
    /^.{2,90} tunisie \| paratunisie$/.test(t) ||
    /sur paratunisie\. comparez le prix en tunisie et consultez les informations de cette reference/.test(t) ||
    /est disponible sur paratunisie pour completer votre selection de/.test(t) ||
    /decouvrez .* sur paratunisie, dans notre gamme/.test(t) ||
    /^## explorer cette reference/.test(t) ||
    /retrouvez .* dans notre catalogue .*\. consultez les informations produit/.test(t)
  );
}

function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1].slice(0, max).replace(/\s+\S*$/, "");
}

export function draftProductSeo(f: ProductFacts): ProductSeoFields {
  const name = readableProductName(clean(f.name));
  const brand = clean(f.brand?.name);
  const brandInName = brand && norm(name).includes(norm(brand));
  const size = f.variantLabel ? plausibleSizeLabel(f.variantLabel, f.name, f.slug) : null;
  const sizeInName = size ? norm(name).replace(/[\s,]/g, "").includes(norm(size).replace(/[\s,]/g, "")) : true;
  const category = clean(f.category?.name).replace(/&.*$/, "").trim().toLowerCase();

  // New titles follow the convention already used on the site: "<name> en Tunisie | ParaTunisie" (one mention of the country).
  const title = fit(
    [`${name} en Tunisie | ParaTunisie`, `${name} | ParaTunisie`].filter((t) => t.length >= 15),
    60,
  );
  const who = brand && !brandInName ? ` de ${brand}` : "";
  const sizePart = size && !sizeInName ? ` (${size})` : "";
  const description = fit(
    [
      `${name}${sizePart}${who}${category ? ` : ${category}` : ""}. Format, composition et prix sur la fiche, livraison en 24 à 48 h en Tunisie, paiement à la livraison.`,
      `${name}${who}. Format, composition et prix sur la fiche, livraison en 24 à 48 h, paiement à la livraison.`,
      `${name}. Livraison en 24 à 48 h en Tunisie, paiement à la livraison.`,
    ],
    160,
  );

  // The intro is never copied from the marketing description: when it is missing it is a short, neutral statement of facts.
  const intro = `${name}${who} est proposé par ParaTunisie${category ? ` dans la catégorie ${category}` : ""}. La fiche indique le format, le prix et l'état de stock.`;

  // Short factual link block (internal linking): no boilerplate paragraph, so pages never become near-duplicates.
  const content = ["## Voir aussi", "", ...[
    f.category?.slug ? `- [${f.category.name.replace(/&.*$/, "").trim()}](/${f.category.slug}) : toutes les références de la catégorie.` : "",
    f.brand?.slug ? `- [${brand}](/marques/${f.brand.slug}) : les produits de la marque.` : "",
  ].filter(Boolean)].join("\n");

  const image = clean(f.image);
  return {
    seoTitle: title,
    seoDescription: description,
    seoH1: name,
    seoIntro: intro,
    seoContent: content,
    seoKeywords: JSON.stringify([...new Set([name, `${name} Tunisie`, brand && category ? `${brand} ${category}` : ""].filter(Boolean))]),
    canonicalUrl: `${SITE}/produits/${f.slug}`,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    imageAlt: brand && !brandInName ? `${name} – ${brand}` : name,
  };
}

const FIELDS = ["seoTitle", "seoDescription", "seoH1", "seoIntro", "seoContent", "seoKeywords", "canonicalUrl", "ogTitle", "ogDescription", "ogImage", "imageAlt"] as const;

/** Validation of generated text only (the product's own description is never generated). */
export function validateDraft(d: ProductSeoFields): string[] {
  const issues: string[] = [];
  if (d.seoTitle.length < 15 || d.seoTitle.length > 60) issues.push(`Titre de ${d.seoTitle.length} caractères (15–60).`);
  if (d.seoDescription.length < 90 || d.seoDescription.length > 160) issues.push(`Méta description de ${d.seoDescription.length} caractères (90–160).`);
  for (const key of ["seoTitle", "seoDescription", "seoH1", "seoIntro", "seoContent", "imageAlt"] as const) {
    if (BANNED_CLAIM.test(d[key])) issues.push(`Formulation non vérifiable dans ${key}.`);
  }
  for (const key of ["seoTitle", "seoH1", "imageAlt"] as const) {
    if ((d[key].match(/\btunisie\b/gi)?.length ?? 0) > 1) {
      issues.push("« Tunisie » répété dans titre/H1/alt.");
      break;
    }
  }
  return issues;
}

export function planProduct(f: ProductFacts): ProductPlan {
  const base = { id: f.id, slug: f.slug, name: f.name, changes: {} as Partial<ProductSeoFields>, issues: [] as string[], notes: [] as string[] };
  if (f.publishState !== "PUBLISHED") return { ...base, action: "skip", reason: "Produit non publié." };
  if (RESTRICTED_SUBSTANCE.test(`${f.name} ${f.slug.replace(/-/g, " ")}`)) {
    return { ...base, action: "blocked", reason: "Composé restreint : examen légal requis avant toute optimisation." };
  }
  if (!f.brand || !f.category) return { ...base, action: "blocked", reason: "Marque ou catégorie manquante." };
  const draft = draftProductSeo(f);
  const issues = validateDraft(draft);
  if (issues.length) return { ...base, action: "blocked", reason: "Brouillon invalide.", issues };

  const changes: Partial<ProductSeoFields> = {};
  const notes: string[] = [];
  for (const key of FIELDS) {
    const current = (f as unknown as Record<string, string | null>)[key];
    const value = clean(current);
    const empty = !value || value === "[]";
    const badLength =
      !empty &&
      ((key === "seoTitle" && (value.length > 70 || value.length < 15)) || (key === "seoDescription" && (value.length > 160 || value.length < 90)));
    const wrongCanonical = key === "canonicalUrl" && !empty && current !== draft.canonicalUrl;
    if ((empty || badLength || wrongCanonical) && clean(draft[key])) (changes as Record<string, string>)[key] = draft[key];
    else if (!empty && isGenericProductText(current)) notes.push(`${key}: texte générique conservé`);
  }
  if (Object.keys(changes).length === 0) return { ...base, action: "skip", reason: "Déjà complet : contenu existant conservé.", notes };
  return { ...base, action: "optimize", reason: "Champs vides ou hors limites complétés ; le contenu existant est conservé.", changes, notes };
}
