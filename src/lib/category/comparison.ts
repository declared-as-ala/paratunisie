/**
 * Live price comparison for weight-based powders (creatine, whey, gainers...). Pure functions, no I/O.
 * Everything is derived from the real catalogue row: the price is the variant price, the weight is read from the size label or
 * the product name. When no weight can be read the product is still listed, without a per-100 g figure: nothing is guessed.
 */
export type ComparableProduct = {
  slug: string;
  name: string;
  brand: string;
  size?: string | null;
  priceMillimes: number;
  inStock?: boolean;
  /** false = the product page is noindex (e.g. under legal review): such products are never featured in the editorial table. */
  indexable?: boolean;
};

export type ComparisonRow = {
  slug: string;
  name: string;
  brand: string;
  priceMillimes: number;
  grams: number | null;
  /** Price in DT for 100 g of product (not of active ingredient). */
  per100gDt: number | null;
};

const MASS = /(\d{1,4}(?:[.,]\d{1,3})?)\s*(kg|gr|g|oz)(?![\p{L}])/iu;

/** First weight found in the text, in grams ("300 g", "1,5kg", "500GR", "17,85 oz"); null when there is none. */
export function parseWeightGrams(...texts: (string | null | undefined)[]): number | null {
  for (const text of texts) {
    if (!text) continue;
    const m = String(text).match(MASS);
    if (!m) continue;
    const value = parseFloat(m[1].replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) continue;
    const unit = m[2].toLowerCase();
    const grams = unit === "kg" ? value * 1000 : unit === "oz" ? value * 28.3495 : value;
    if (grams >= 20 && grams <= 20000) return Math.round(grams * 10) / 10;
  }
  return null;
}

export function pricePer100gDt(priceMillimes: number, grams: number): number {
  return Math.round(((priceMillimes / 1000 / grams) * 100) * 10) / 10;
}

/** In-stock products only, cheapest per 100 g first; products without a readable weight go last. */
export function buildComparison(products: ComparableProduct[], max = 12): { rows: ComparisonRow[]; bestSlugs: string[] } {
  const rows = products
    // Packs mix products and sizes, and noindex products are under review: neither belongs in a per-100 g comparison.
    .filter((p) => p.inStock !== false && p.indexable !== false && p.priceMillimes > 0 && !/(^|-)pack(-|$)/i.test(p.slug))
    .map<ComparisonRow>((p) => {
      const grams = parseWeightGrams(p.size, p.name);
      return { slug: p.slug, name: p.name, brand: p.brand, priceMillimes: p.priceMillimes, grams, per100gDt: grams ? pricePer100gDt(p.priceMillimes, grams) : null };
    })
    .sort((a, b) => (a.per100gDt ?? Infinity) - (b.per100gDt ?? Infinity) || a.priceMillimes - b.priceMillimes || a.slug.localeCompare(b.slug))
    .slice(0, max);
  const measured = rows.filter((r) => r.per100gDt !== null);
  // "Lowest price per 100 g" is only claimed when at least two products were actually compared, and every product that ties
  // for the lowest value is marked (never a single arbitrary winner among equals).
  const lowest = measured.length >= 2 ? measured[0].per100gDt : null;
  return { rows, bestSlugs: lowest === null ? [] : measured.filter((r) => r.per100gDt === lowest).map((r) => r.slug) };
}
