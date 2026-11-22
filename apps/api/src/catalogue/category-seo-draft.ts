import { BANNED_CLAIM } from "./brand-seo";

/**
 * Safe category SEO optimizer (pure). Same contract as the product optimizer: GAP FILLING ONLY. Empty fields, an out-of-range
 * title/description or a wrong canonical are completed from catalogue facts; existing text is never replaced and no editorial
 * content (guide, FAQ) is generated, because a category guide must be written for that category.
 */
export type CategoryFacts = {
  id: string;
  slug: string;
  name: string;
  status: string;
  image: string | null;
  /** Up to three brands that have the most indexable products in this category. */
  brands: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoH1: string | null;
  seoIntro: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  imageAlt: string | null;
};
export type CategoryFields = { seoTitle: string; seoDescription: string; seoH1: string; seoIntro: string; seoKeywords: string; canonicalUrl: string; ogTitle: string; ogDescription: string; ogImage: string; imageAlt: string };
export type CategoryPlan = { action: "optimize" | "skip" | "blocked"; reason: string; changes: Partial<CategoryFields>; issues: string[] };

const SITE = "https://paratunisie.com";
const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
const pick = (candidates: string[], max: number) => candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1].slice(0, max).replace(/\s+\S*$/, "");
const list = (items: string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`);

export function draftCategorySeo(f: CategoryFacts): CategoryFields {
  const name = clean(f.name).replace(/\s*&.*$/, "").trim();
  const lower = name.toLowerCase();
  const brands = f.brands.slice(0, 3);
  const title = pick([`${name} en Tunisie | ParaTunisie`, `${name} | ParaTunisie`], 60);
  const description = pick(
    [
      brands.length >= 2
        ? `${name} : ${list(brands)} et d'autres marques. Comparez les formats et les compositions, livraison en 24 à 48 h en Tunisie, paiement à la livraison.`
        : `Découvrez la catégorie ${lower} de ParaTunisie : comparez les formats et les compositions. Livraison en 24 à 48 h en Tunisie, paiement à la livraison.`,
      brands.length >= 2 ? `${name} : ${list(brands)}. Comparez les formats et les compositions, livraison en 24 à 48 h, paiement à la livraison.` : "",
      `Découvrez la catégorie ${lower} de ParaTunisie : comparez les formats et les compositions. Livraison en 24 à 48 h, paiement à la livraison.`,
    ].filter(Boolean),
    160,
  );
  const image = clean(f.image);
  return {
    seoTitle: title,
    seoDescription: description,
    seoH1: name,
    seoIntro: `Découvrez la sélection ${lower} de ParaTunisie${brands.length ? ` : ${list(brands)}` : ""}. Chaque fiche indique le format, le prix et l'état de stock.`,
    seoKeywords: JSON.stringify([...new Set([`${lower} Tunisie`, `${lower} prix`, `acheter ${lower}`])]),
    canonicalUrl: `${SITE}/${f.slug}`,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    imageAlt: `Sélection ${lower}`,
  };
}

const KEYS = ["seoTitle", "seoDescription", "seoH1", "seoIntro", "seoKeywords", "canonicalUrl", "ogTitle", "ogDescription", "ogImage", "imageAlt"] as const;

export function planCategory(f: CategoryFacts): CategoryPlan {
  if (f.status !== "ACTIVE") return { action: "skip", reason: "Catégorie inactive.", changes: {}, issues: [] };
  const draft = draftCategorySeo(f);
  const issues = (["seoTitle", "seoDescription", "seoIntro", "imageAlt"] as const).filter((k) => BANNED_CLAIM.test(draft[k])).map((k) => `Formulation non vérifiable dans ${k}.`);
  if (issues.length) return { action: "blocked", reason: "Brouillon invalide.", changes: {}, issues };
  const changes: Partial<CategoryFields> = {};
  for (const key of KEYS) {
    const current = (f as unknown as Record<string, string | null>)[key];
    const value = clean(current);
    const empty = !value || value === "[]";
    const badLength = !empty && ((key === "seoTitle" && (value.length > 70 || value.length < 15)) || (key === "seoDescription" && (value.length > 160 || value.length < 90)));
    const wrongCanonical = key === "canonicalUrl" && !empty && current !== draft.canonicalUrl;
    if ((empty || badLength || wrongCanonical) && clean(draft[key])) (changes as Record<string, string>)[key] = draft[key];
  }
  if (Object.keys(changes).length === 0) return { action: "skip", reason: "Déjà complet : contenu existant conservé.", changes, issues: [] };
  return { action: "optimize", reason: "Champs vides ou hors limites complétés ; le contenu existant est conservé.", changes, issues: [] };
}
