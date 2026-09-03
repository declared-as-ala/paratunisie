export type SeoQualitySeverity = "BLOCKER" | "WARNING";

export type ProductSeoQualityIssue = {
  code: string;
  severity: SeoQualitySeverity;
  deduction: number;
  message: string;
};

export type ProductSeoQualityInput = {
  name: string;
  slug: string;
  description: string;
  usage?: string | null;
  image: string;
  publishState: string;
  inStock: boolean;
  brand?: { id?: string; name?: string; slug?: string } | null;
  category?: { id?: string; name?: string; slug?: string } | null;
  variants?: { priceMillimes: number; stock: number; sku?: string | null }[];
  duplicateTitle?: boolean;
};

export type ProductSeoQualityResult = {
  score: number;
  eligible: boolean;
  issues: ProductSeoQualityIssue[];
};

const PLACEHOLDER_IMAGES = new Set([
  "",
  "/assets/product-tube.webp",
  "/assets/placeholder.webp",
  "/placeholder.svg",
]);

function normalized(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function evaluateProductSeoQuality(product: ProductSeoQualityInput): ProductSeoQualityResult {
  const issues: ProductSeoQualityIssue[] = [];
  const add = (code: string, severity: SeoQualitySeverity, deduction: number, message: string) => {
    issues.push({ code, severity, deduction, message });
  };

  const name = normalized(product.name);
  const slug = normalized(product.slug);
  const description = normalized(product.description);
  const image = normalized(product.image);
  const variants = product.variants || [];
  const totalVariantStock = variants.reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0);

  if (product.publishState !== "PUBLISHED") {
    add("NOT_PUBLISHED", "BLOCKER", 100, "Product is not published.");
  }
  if (name.length < 4 || /^(product|produit|sans nom|unknown)$/i.test(name)) {
    add("INVALID_NAME", "BLOCKER", 100, "Product name is missing or placeholder-like.");
  }
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    add("INVALID_SLUG", "BLOCKER", 40, "Slug is missing or not canonical-safe.");
  }
  if (!product.brand?.id || normalized(product.brand.name).length < 2) {
    add("MISSING_BRAND", "BLOCKER", 100, "A valid brand is required.");
  }
  if (!product.category?.id || normalized(product.category.name).length < 2) {
    add("MISSING_CATEGORY", "BLOCKER", 100, "A valid category is required.");
  }
  if (description.length < 160) {
    add("THIN_DESCRIPTION", "BLOCKER", 45, "Description contains fewer than 160 useful characters.");
  }
  if (
    /^Découvrez \*\*/i.test(description) &&
    /### Points Forts/i.test(description) &&
    /Produit 100% original/i.test(description)
  ) {
    add(
      "GENERIC_GENERATED_DESCRIPTION",
      "BLOCKER",
      55,
      "Description matches the bulk-generated placeholder template and requires editorial review.",
    );
  }
  if (!image || PLACEHOLDER_IMAGES.has(image.toLowerCase())) {
    add("MISSING_OR_PLACEHOLDER_IMAGE", "BLOCKER", 45, "A real product image is required.");
  } else if (/^https?:\/\//i.test(image)) {
    add("EXTERNAL_HOTLINKED_IMAGE", "BLOCKER", 45, "Image must be migrated to controlled storage before indexing.");
  }
  if (variants.length === 0 || !variants.some((variant) => Number.isInteger(variant.priceMillimes) && variant.priceMillimes > 0)) {
    add("MISSING_VALID_PRICE", "BLOCKER", 100, "At least one variant must have a valid positive price.");
  }
  if (product.inStock !== (totalVariantStock > 0)) {
    add("INCONSISTENT_AVAILABILITY", "BLOCKER", 35, "Product and variant availability disagree.");
  }
  if (product.duplicateTitle) {
    add("DUPLICATE_TITLE", "BLOCKER", 40, "Normalized product title is duplicated.");
  }
  if (/###\s|\*\*[^*]+\*\*/.test(product.description || "")) {
    add("RAW_MARKDOWN_CONTENT", "WARNING", 5, "Description contains Markdown that requires safe rendering.");
  }
  if (!/(composition|ingr[ée]dients?|valeurs? nutritionnelles?|actifs?)/i.test(`${description} ${product.usage || ""}`)) {
    add("MISSING_COMPOSITION_SIGNAL", "WARNING", 5, "No composition or ingredient information was detected.");
  }

  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + issue.deduction, 0));
  return {
    score,
    eligible: !issues.some((issue) => issue.severity === "BLOCKER"),
    issues,
  };
}
