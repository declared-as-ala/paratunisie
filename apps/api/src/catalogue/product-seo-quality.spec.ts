import { evaluateProductSeoQuality, type ProductSeoQualityInput } from "./product-seo-quality";

const validProduct: ProductSeoQualityInput = {
  name: "Créatine Monohydrate 500 g",
  slug: "creatine-monohydrate-500-g",
  description: "Créatine monohydrate en poudre. Composition : créatine monohydrate. Le format et les conseils d’utilisation sont indiqués clairement sur la fiche et sur l’emballage du produit.",
  usage: "Respecter les conseils indiqués sur l’étiquette.",
  image: "/uploads/products/creatine.webp",
  publishState: "PUBLISHED",
  inStock: true,
  brand: { id: "brand-1", name: "Example", slug: "example" },
  category: { id: "category-1", name: "Créatine", slug: "creatine" },
  variants: [{ priceMillimes: 99_000, stock: 4, sku: "CRE-500" }],
};

describe("evaluateProductSeoQuality", () => {
  it("approves a complete, internally hosted product", () => {
    const result = evaluateProductSeoQuality(validProduct);
    expect(result.eligible).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issues).toEqual([]);
  });

  it("does not noindex a useful on-order product solely because stock is zero", () => {
    const result = evaluateProductSeoQuality({
      ...validProduct,
      inStock: false,
      variants: [{ priceMillimes: 99_000, stock: 0 }],
    });
    expect(result.eligible).toBe(true);
  });

  it("blocks the bulk-generated placeholder description fingerprint", () => {
    const result = evaluateProductSeoQuality({
      ...validProduct,
      description: "Découvrez **Example Product** de la marque **Example** sur ParaTunisie.\n\n### Points Forts\n- Produit 100% original et authentique avec livraison.",
    });
    expect(result.eligible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("GENERIC_GENERATED_DESCRIPTION");
  });

  it("blocks an externally hotlinked product until its image is migrated", () => {
    const result = evaluateProductSeoQuality({
      ...validProduct,
      image: "https://images.example.com/product.webp",
    });
    expect(result.eligible).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "EXTERNAL_HOTLINKED_IMAGE", severity: "BLOCKER" }),
    ]));
  });

  it("blocks inconsistent aggregate and variant stock", () => {
    const result = evaluateProductSeoQuality({
      ...validProduct,
      inStock: true,
      variants: [{ priceMillimes: 99_000, stock: 0 }],
    });
    expect(result.eligible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("INCONSISTENT_AVAILABILITY");
  });

  it("blocks duplicate normalized titles", () => {
    const result = evaluateProductSeoQuality({ ...validProduct, duplicateTitle: true });
    expect(result.eligible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("DUPLICATE_TITLE");
  });
});
