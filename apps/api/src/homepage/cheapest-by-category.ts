import { RESTRICTED_SUBSTANCE } from "../catalogue/product-seo-quality";

/**
 * "À LA UNE — Les petits prix par catégorie": picks, for each main category, the cheapest product that can genuinely be
 * bought today. Pure functions (no database access) so every rule is unit-tested.
 *
 * Money is integer millimes; prices are compared as numbers, never as strings. The price returned is the real variant price
 * (the same one the cart and the product page use). The data model has no promotion/discount fields, so there is nothing
 * to subtract: the selling price IS the variant price.
 */

/** Display order and scope of the selectable categories. Slugs that have no eligible product are simply omitted. */
export const HOMEPAGE_CATEGORY_PRIORITY = [
  "whey-proteine",
  "creatine",
  "vitamines",
  "magnesium",
  "omega-3",
  "zinc",
  "bcaa",
  "pre-workout",
  "gainers-proteines",
  "whey-isolate",
] as const;

/** Below this a price is treated as a data error, not a bargain (5 DT). */
export const MIN_PLAUSIBLE_PRICE_MILLIMES = 5000;
/** A candidate priced under this share of its category median (with 3+ candidates) is treated as suspicious. */
export const SUSPICIOUS_LOW_PRICE_RATIO = 0.2;

export type CandidateVariant = { id: string; label: string; priceMillimes: number; stock: number };
export type CandidateProduct = {
  id: string;
  slug: string;
  name: string;
  benefit: string | null;
  image: string | null;
  imageAlt: string | null;
  publishState: string;
  inStock: boolean;
  categoryId: string;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  variants: CandidateVariant[];
};
export type CategoryNode = { id: string; slug: string; name: string; parentId: string | null; status?: string };

export type CheapestEntry = {
  category: { name: string; slug: string };
  /** Number of products that passed every rule in this category (subcategories included). */
  eligibleCount: number;
  /** True only when at least two eligible products were actually compared, so "lowest price" is a proven statement. */
  cheapestProven: boolean;
  product: {
    id: string;
    slug: string;
    name: string;
    benefit: string | null;
    image: string;
    imageAlt: string | null;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
    /** The single purchasable variant that is displayed AND added to the cart. */
    variant: { id: string; label: string; priceMillimes: number; stock: number };
    /** Size label that is safe to show; null when the catalogue label contradicts the product name. */
    displaySize: string | null;
  };
};

const PLACEHOLDER_IMAGE = /(^$|^\/assets\/|placeholder|product-unavailable|product-tube)/i;
const PACK = /(^|-)pack(-|$)/i;
const DOSAGE_FORM = /(\d+\s*(caps|capsules?|gelules?|gélules?|tablets?|tabs|comprim[ée]s?|softgels?|gommes|gummies|sachets?|doses|servings))/i;
const WEIGHT_OR_VOLUME = /^\s*[\d.,]+\s*(l|ml|g|gr|kg|oz|fl\s*oz)\s*$/i;

const squash = (s: string) =>
  s.toLowerCase().replace(/gr\b/g, "g").replace(/,/g, ".").replace(/[\s\-_]+/g, "");

/**
 * A size label is only shown when it does not contradict the product name. Real catalogue examples that must be hidden:
 * "6l" on "Magnesium + B6 – 90 tablets", "2 g" on "Mega Omega-3 – 90 caps", "Format standard".
 */
export function plausibleSizeLabel(label: string, productName: string, slug: string): string | null {
  const clean = (label || "").trim();
  if (!clean || /^(format\s+)?standard$/i.test(clean) || /^default$/i.test(clean)) return null;
  const hay = squash(`${productName} ${slug}`);
  if (hay.includes(squash(clean))) return clean;
  if (DOSAGE_FORM.test(`${productName} ${slug.replace(/-/g, " ")}`) && WEIGHT_OR_VOLUME.test(clean)) return null;
  // Name carries its own size token that the label does not match → contradiction.
  if (/\d+(\.\d+)?(kg|g|ml|l)\b/i.test(productName.toLowerCase().replace(/\s+/g, "")) && WEIGHT_OR_VOLUME.test(clean)) return null;
  return clean;
}

export function isUnverifiedStock(totalStock: number): boolean {
  // 100 (and 500+) are the placeholder quantities found on imported rows; they are not real counts.
  return totalStock === 100 || totalStock >= 500;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** All ids of `rootId` and its descendants. */
export function descendantIds(rootId: string, categories: CategoryNode[]): Set<string> {
  const ids = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
    }
  }
  return ids;
}

/** Returns the cheapest genuinely purchasable variant of a product, or null if the product is not eligible. */
export function eligibleVariant(p: CandidateProduct): CandidateVariant | null {
  if (p.publishState !== "PUBLISHED" || !p.inStock) return null;
  if (RESTRICTED_SUBSTANCE.test(`${p.name} ${p.slug.replace(/-/g, " ")}`)) return null;
  if (PACK.test(p.slug)) return null; // packs mix products and sizes: a "cheapest" comparison would mislead
  if (!p.image || PLACEHOLDER_IMAGE.test(p.image.trim())) return null;
  const totalStock = p.variants.reduce((sum, v) => sum + Math.max(0, v.stock || 0), 0);
  if (totalStock <= 0 || isUnverifiedStock(totalStock)) return null;
  const buyable = p.variants.filter(
    (v) => Number.isInteger(v.priceMillimes) && v.priceMillimes >= MIN_PLAUSIBLE_PRICE_MILLIMES && v.stock > 0,
  );
  if (buyable.length === 0) return null;
  return buyable.reduce((best, v) => (v.priceMillimes < best.priceMillimes || (v.priceMillimes === best.priceMillimes && v.label < best.label) ? v : best));
}

export function selectCheapestByCategory(
  categories: CategoryNode[],
  products: CandidateProduct[],
  priority: readonly string[] = HOMEPAGE_CATEGORY_PRIORITY,
): CheapestEntry[] {
  const bySlug = new Map(categories.filter((c) => (c.status ?? "ACTIVE") === "ACTIVE").map((c) => [c.slug, c]));
  const used = new Set<string>();
  const out: CheapestEntry[] = [];

  for (const slug of priority) {
    const root = bySlug.get(slug);
    if (!root) continue;
    const ids = descendantIds(root.id, categories);
    let candidates = products
      .filter((p) => ids.has(p.categoryId))
      .map((p) => ({ p, v: eligibleVariant(p) }))
      .filter((x): x is { p: CandidateProduct; v: CandidateVariant } => x.v !== null);

    if (candidates.length >= 3) {
      const floor = median(candidates.map((c) => c.v.priceMillimes)) * SUSPICIOUS_LOW_PRICE_RATIO;
      candidates = candidates.filter((c) => c.v.priceMillimes >= floor);
    }
    const free = candidates.filter((c) => !used.has(c.p.id)).sort((a, b) => a.v.priceMillimes - b.v.priceMillimes || a.p.slug.localeCompare(b.p.slug));
    const best = free[0];
    if (!best) continue;
    used.add(best.p.id);
    out.push({
      category: { name: root.name, slug: root.slug },
      eligibleCount: candidates.length,
      cheapestProven: candidates.length >= 2,
      product: {
        id: best.p.id,
        slug: best.p.slug,
        name: best.p.name,
        benefit: best.p.benefit,
        image: best.p.image as string,
        imageAlt: best.p.imageAlt,
        brand: best.p.brand,
        category: best.p.category,
        variant: { id: best.v.id, label: best.v.label, priceMillimes: best.v.priceMillimes, stock: best.v.stock },
        displaySize: plausibleSizeLabel(best.v.label, best.p.name, best.p.slug),
      },
    });
  }
  return out;
}
