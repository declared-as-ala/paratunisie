import { draftProductSeo, isGenericProductText, planProduct, ProductFacts, validateDraft } from "./product-seo-draft";

function facts(over: Partial<ProductFacts> = {}): ProductFacts {
  return {
    id: "p1",
    slug: "micronised-creatine-optimum-nutrition-317g",
    name: "MICRONISED CREATINE 317G - OPTIMUM NUTRITION",
    description: "Créatine monohydrate micronisée en poudre, sans arôme. Utilisez la dose indiquée par le fabricant. Conservez au sec et à l'abri de la lumière.",
    publishState: "PUBLISHED",
    inStock: true,
    brand: { name: "Optimum Nutrition", slug: "optimum-nutrition" },
    category: { name: "Créatine", slug: "creatine" },
    variantLabel: "317 g",
    image: "https://paratunisie.com/paratunisie-media/products/x.webp",
    seoTitle: null, seoDescription: null, seoH1: null, seoIntro: null, seoContent: null, seoKeywords: "[]",
    canonicalUrl: null, ogTitle: null, ogDescription: null, ogImage: null, imageAlt: null,
    ...over,
  };
}

describe("draftProductSeo", () => {
  const d = draftProductSeo(facts());
  it("builds branded, length-compliant, claim-free fields from catalogue facts", () => {
    expect(d.seoTitle.length).toBeGreaterThanOrEqual(15);
    expect(d.seoTitle.length).toBeLessThanOrEqual(60);
    expect(d.seoDescription.length).toBeGreaterThanOrEqual(90);
    expect(d.seoDescription.length).toBeLessThanOrEqual(160);
    expect(d.canonicalUrl).toBe("https://paratunisie.com/produits/micronised-creatine-optimum-nutrition-317g");
    expect(validateDraft(d)).toEqual([]);
  });
  it("makes a shouting catalogue name readable and tidies hyphens", () => {
    expect(d.seoH1).toBe("Micronised Creatine 317g - Optimum Nutrition");
    expect(draftProductSeo(facts({ name: "CREATINE MONOHYDRATE OSTROVIT- 500GR" })).seoH1).toBe("Creatine Monohydrate Ostrovit - 500gr");
    expect(draftProductSeo(facts({ name: "CREATINE MONOHYDRATE - 500G -QUAMTRAX" })).seoH1).toBe("Creatine Monohydrate - 500g - Quamtrax");
  });
  it("uses the site's title convention (one mention of the country) and falls back when too long", () => {
    const short = draftProductSeo(facts({ name: "CREATINE 300G - REAL PHARM" }));
    expect(short.seoTitle).toBe("Creatine 300g - Real Pharm en Tunisie | ParaTunisie");
    expect(d.seoTitle).toBe("Micronised Creatine 317g - Optimum Nutrition | ParaTunisie"); // 70 characters would not fit
    expect((`${short.seoTitle} ${short.seoH1} ${short.imageAlt}`.match(/tunisie/gi) ?? []).length).toBeLessThanOrEqual(1);
  });
  it("writes a neutral factual intro, never a copy of the marketing description", () => {
    expect(d.seoIntro).not.toContain("monohydrate micronisée en poudre");
    expect(d.seoIntro).toMatch(/est proposé par ParaTunisie/);
  });
  it("never states dosage or benefits", () => {
    expect(`${d.seoDescription} ${d.seoContent} ${d.seoIntro}`).not.toMatch(/\d+\s?(g|mg)\s?(par|\/)\s?jour|améliore|booste|brûle|guéri/i);
  });
  it("adds only a short link block to the real category and brand pages", () => {
    expect(d.seoContent).toContain("](/creatine)");
    expect(d.seoContent).toContain("](/marques/optimum-nutrition)");
    expect(d.seoContent.split(/\s+/).length).toBeLessThan(40);
  });
});

describe("planProduct (gap filling only)", () => {
  it("fills empty fields and leaves the product description and indexability alone", () => {
    const p = planProduct(facts());
    expect(p.action).toBe("optimize");
    expect(Object.keys(p.changes)).toEqual(expect.arrayContaining(["seoTitle", "seoDescription", "seoH1", "canonicalUrl", "imageAlt"]));
    expect(Object.keys(p.changes)).not.toContain("description");
    expect(Object.keys(p.changes)).not.toContain("indexable");
  });
  it("never swaps an existing working value: a good title and description stay untouched", () => {
    const p = planProduct(facts({
      seoTitle: "Créatine Monohydrate OstroVit 500 g en Tunisie | ParaTunisie",
      seoDescription: "Découvrez Créatine Monohydrate OstroVit 500 g de OstroVit sur ParaTunisie, dans notre gamme créatine et nutrition sportive. Disponible en Tunisie.",
      seoIntro: "X par Y est disponible sur ParaTunisie pour compléter votre sélection de créatine.",
      seoContent: "## Explorer cette référence\n\nRetrouvez X dans [Créatine](/creatine).",
    }));
    expect(p.changes.seoTitle).toBeUndefined();
    expect(p.changes.seoDescription).toBeUndefined();
    expect(p.changes.seoIntro).toBeUndefined();
    expect(p.changes.seoContent).toBeUndefined();
    expect(p.notes.join(" ")).toMatch(/seoTitle: texte générique conservé/);
  });
  it("fixes hard defects: over-long and too short title, short description, wrong canonical", () => {
    const p = planProduct(facts({ seoTitle: "T".repeat(80), seoDescription: "court", canonicalUrl: "https://other.example/x" }));
    expect(p.changes.seoTitle).toBeDefined();
    expect(p.changes.seoDescription).toBeDefined();
    expect(p.changes.canonicalUrl).toBe("https://paratunisie.com/produits/micronised-creatine-optimum-nutrition-317g");
    expect(planProduct(facts({ seoTitle: "Titre" })).changes.seoTitle).toBeDefined();
    // 62 characters is tolerated (search engines truncate by width): an accented, working title is never swapped.
    expect(planProduct(facts({ seoTitle: "Créatine Monohydrate Real Pharm 500 g en Tunisie | ParaTunisie" })).changes.seoTitle).toBeUndefined();
  });
  it("blocks restricted products and skips drafts / complete records", () => {
    expect(planProduct(facts({ name: "MK-677 60 capsules", slug: "mk-677-60-capsules" })).action).toBe("blocked");
    expect(planProduct(facts({ publishState: "DRAFT" })).action).toBe("skip");
    const done = draftProductSeo(facts());
    expect(planProduct(facts({ ...done, seoKeywords: done.seoKeywords })).action).toBe("skip");
  });
  it("blocks when brand or category is missing", () => {
    expect(planProduct(facts({ brand: null })).action).toBe("blocked");
  });
});

describe("isGenericProductText", () => {
  it.each([
    ["Whey Gold Standard Tunisie | ParaTunisie", true],
    ["## Explorer cette référence\n\nRetrouvez", true],
    ["Créatine monohydrate micronisée 317 g | ParaTunisie", false],
  ])("%s", (text, expected) => expect(isGenericProductText(text)).toBe(expected));
});
