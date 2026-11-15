import { draftCategorySeo, planCategory, CategoryFacts } from "./category-seo-draft";
import { derivedCategoryEvidence, calculateChecklist } from "./seo-checklist";

const facts = (over: Partial<CategoryFacts> = {}): CategoryFacts => ({
  id: "c1", slug: "magnesium", name: "Magnésium", status: "ACTIVE", image: "https://paratunisie.com/paratunisie-media/categories/m.webp",
  brands: ["Thorne", "Muscle Care", "Swanson Vitamins"],
  seoTitle: null, seoDescription: null, seoH1: null, seoIntro: null, seoKeywords: "[]", canonicalUrl: null, ogTitle: null, ogDescription: null, ogImage: null, imageAlt: null,
  ...over,
});

describe("category gap filling", () => {
  it("builds accurate, length-compliant fields from catalogue facts", () => {
    const d = draftCategorySeo(facts());
    expect(d.seoTitle).toBe("Magnésium en Tunisie | ParaTunisie");
    expect(d.seoDescription.length).toBeGreaterThanOrEqual(90);
    expect(d.seoDescription.length).toBeLessThanOrEqual(160);
    expect(d.seoDescription).toContain("Thorne, Muscle Care et Swanson Vitamins");
    expect(d.canonicalUrl).toBe("https://paratunisie.com/magnesium");
  });
  it("fills only gaps and never replaces existing text", () => {
    const p = planCategory(facts({ seoTitle: "Magnésium : le guide d'achat complet | ParaTunisie", seoDescription: "x".repeat(120), seoH1: "Magnésium en Tunisie" }));
    expect(p.changes.seoTitle).toBeUndefined();
    expect(p.changes.seoDescription).toBeUndefined();
    expect(p.changes.seoH1).toBeUndefined();
    expect(p.changes.canonicalUrl).toBeDefined();
  });
  it("skips inactive categories and complete ones", () => {
    expect(planCategory(facts({ status: "INACTIVE" })).action).toBe("skip");
    const d = draftCategorySeo(facts());
    expect(planCategory(facts({ ...d })).action).toBe("skip");
  });
  it("does not write an editorial guide (that content must be written per category)", () => {
    expect(Object.keys(draftCategorySeo(facts()))).not.toContain("seoContent");
  });
});

describe("derived category evidence (scores no longer capped at 55)", () => {
  const row = { id: "c1", slug: "magnesium", name: "Magnésium", status: "ACTIVE", indexable: true, followLinks: true, canonicalUrl: "https://paratunisie.com/magnesium", seoTitle: "Magnésium en Tunisie | ParaTunisie", seoDescription: "d".repeat(120), seoH1: "Magnésium", ogImage: "https://paratunisie.com/paratunisie-media/categories/m.webp", seoContent: "[a](/creatine) [b](/zinc)" };
  it("derives the public-page checks from the stored data", () => {
    const e = derivedCategoryEvidence(row, [{ indexable: true }, { indexable: false }]);
    expect(e).toMatchObject({ http: true, indexable: true, sitemap: true, h1: true, schema: true, offer: true, breadcrumb: true, internalLinks: true, metadata: true });
  });
  it("an empty or noindex category does not get the checks for free", () => {
    expect(derivedCategoryEvidence(row, []).sitemap).toBe(false);
    expect(derivedCategoryEvidence(row, []).schema).toBe(false);
    expect(derivedCategoryEvidence({ ...row, indexable: false }, [{ indexable: true }]).indexable).toBe(false);
    expect(derivedCategoryEvidence({ ...row, canonicalUrl: "https://other.example/x" }, [{ indexable: true }]).sitemap).toBe(false);
  });
  it("the derived evidence lifts a category above the old structural ceiling of 55 only when the data supports it", () => {
    const ctx = { uniqueSlug: true, uniqueTitle: true, uniqueDescription: true, productCount: 5 };
    const withData = calculateChecklist("category", { ...row, seoIntro: "Introduction descriptive de la catégorie magnésium avec assez de mots utiles.", seoKeywords: "[]" }, ctx, derivedCategoryEvidence(row, [{ indexable: true }, { indexable: true }]));
    const without = calculateChecklist("category", row, ctx, undefined);
    expect(withData.score).toBeGreaterThan(without.score);
  });
});
