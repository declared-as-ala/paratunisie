import { calculateChecklist, usefulText, PageEvidence } from "./seo-checklist";

const evidence: PageEvidence = { checkedAt: new Date().toISOString(), http: true, indexable: true, sitemap: true, schema: true, offer: true, breadcrumb: true, internalLinks: true, image: true, h1: true, metadata: true };
const description = "Cette référence présente les informations du fabricant avec son format et ses caractéristiques. La fiche permet de comparer la composition déclarée, les ingrédients disponibles, les précautions indiquées, le conditionnement et les différents usages documentés. Consultez les valeurs figurant sur l’emballage avant votre commande. Les détails de préparation propres au produit restent ceux de la notice. Retrouvez également les autres formats proposés dans cette catégorie pour choisir selon votre budget.";
const row = { id: "1", slug: "creatine-500g", name: "Créatine 500g", seoTitle: "Créatine 500g Tunisie | ParaTunisie", seoDescription: "Créatine 500g en Tunisie : comparez les informations de cette référence et son prix sur ParaTunisie. Consultez le format avant de commander.", seoH1: "Créatine 500g", description, seoIntro: description, seoKeywords: '["créatine tunisie", "prix créatine", "acheter créatine"]', canonicalUrl: "https://paratunisie.com/produits/creatine-500g", image: "/uploads/creatine.webp", imageAlt: "Pot de créatine 500g", images: [{ alt: "Pot de créatine 500g" }], brand: { name: "Marque vérifiée" }, category: { slug: "creatine" }, ogTitle: "Créatine 500g", ogDescription: description, ogImage: "/uploads/creatine.webp", indexable: true, followLinks: true, publishState: "PUBLISHED" };
const context = { uniqueSlug: true, uniqueTitle: true, uniqueDescription: true, productCount: 1 };

describe("deterministic SEO checklist", () => {
  it("totals exactly 100 when actual evidence and meaningful fields pass", () => {
    const result = calculateChecklist("product", row, context, evidence);
    expect(result.checks.reduce((sum, check) => sum + check.points, 0)).toBe(100);
    expect(result.checks.filter(check => !check.passed)).toEqual([]);
    expect(result.score).toBe(100);
  });
  it("never awards rendered-page points before a public verification", () => {
    const result = calculateChecklist("product", row, context);
    expect(result.score).toBeLessThan(70);
    expect(result.verifiedAt).toBeNull();
    expect(result.checks.find(c => c.id === "schema")?.passed).toBe(false);
  });
  it("deducts for unknown manufacturer, duplicate copy and a placeholder", () => {
    const result = calculateChecklist("product", { ...row, brand: { name: "Marque non renseignée" }, image: "/assets/product-unavailable.svg" }, { ...context, uniqueDescription: false }, evidence);
    expect(result.score).toBe(85);
  });
  it("rejects keyword stuffing instead of rewarding text length", () => {
    expect(usefulText("product ".repeat(80), 60)).toBe(false);
    expect(calculateChecklist("product", { ...row, seoDescription: "product ".repeat(20) }, context, evidence).score).toBe(95);
  });
  it("deducts actual stock/schema/indexability verification failures", () => {
    expect(calculateChecklist("product", row, context, { ...evidence, offer: false, schema: false, indexable: false }).score).toBe(85);
  });
});
