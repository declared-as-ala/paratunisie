import {
  BrandFacts,
  buildScoreContext,
  classifyBrand,
  draftBrandSeo,
  isTemplateText,
  markDuplicates,
  planBrand,
  readableProductName,
  scoreBrand,
  similarity,
  validateDraft,
} from "./brand-seo";

function facts(over: Partial<BrandFacts> = {}): BrandFacts {
  return {
    id: "b1",
    slug: "optimum-nutrition",
    name: "Optimum Nutrition",
    status: "ACTIVE",
    indexable: false,
    seoIsCustom: false,
    image: "https://paratunisie.com/paratunisie-media/brands/on.webp",
    imageAlt: null,
    origin: null,
    seoTitle: null,
    seoDescription: null,
    seoH1: null,
    seoIntro: null,
    seoContent: null,
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    publishedCount: 53,
    indexableCount: 11,
    inStockCount: 10,
    indexableInStockCount: 7,
    machineCount: 0,
    restrictedCount: 0,
    categories: [
      { slug: "creatine", name: "Créatine", indexable: true, count: 3 },
      { slug: "gainers-proteines", name: "Gainers & Prise de Masse", indexable: true, count: 2 },
      { slug: "whey-proteine", name: "Whey Protéine", indexable: true, count: 1 },
      { slug: "vitamines", name: "Vitamines", indexable: true, count: 1 },
    ],
    topProducts: [
      { slug: "micronised-creatine-optimum-nutrition-317g", name: "MICRONISED CREATINE 317G - OPTIMUM NUTRITION", inStock: true },
      { slug: "serious-mass-5-45-kg-optimum-nutrition", name: "Serious Mass 5,45 kg Optimum Nutrition", inStock: true },
      { slug: "100-whey-gold-standard-2-27kg", name: "100% Whey Gold Standard 2,27kg", inStock: true },
    ],
    ...over,
  };
}

describe("classifyBrand", () => {
  it("tier A: enough indexable products with stock", () => {
    expect(classifyBrand(facts()).tier).toBe("A");
  });
  it("tier B: two indexable products, none in stock", () => {
    expect(classifyBrand(facts({ indexableCount: 2, indexableInStockCount: 0 })).tier).toBe("B");
  });
  it.each([
    ["no published product", { publishedCount: 0, indexableCount: 0 }],
    ["none indexable", { indexableCount: 0 }],
    ["one indexable product", { indexableCount: 1 }],
    ["generic brand name", { name: "Autres marques" }],
    ["inactive", { status: "INACTIVE" }],
    ["restricted product", { restrictedCount: 1 }],
    ["machine brand", { publishedCount: 10, machineCount: 8 }],
  ] as [string, Partial<BrandFacts>][])("tier C: %s", (_label, over) => {
    const c = classifyBrand(facts(over));
    expect(c.tier).toBe("C");
    expect(c.reasons.length).toBeGreaterThan(0);
  });
});

describe("draftBrandSeo", () => {
  const f = facts();
  const d = draftBrandSeo(f, "A");
  it("builds a valid, branded, length-compliant draft from catalogue facts only", () => {
    expect(d.seoTitle.length).toBeLessThanOrEqual(60);
    expect(d.seoDescription.length).toBeGreaterThanOrEqual(90);
    expect(d.seoDescription.length).toBeLessThanOrEqual(160);
    expect(d.seoTitle).toContain("Optimum Nutrition");
    expect(d.canonicalUrl).toBe("https://paratunisie.com/marques/optimum-nutrition");
    expect(validateDraft(d, f).filter((i) => i.severity === "BLOCKER")).toEqual([]);
  });
  it("links only to real catalogue pages and mentions real product families", () => {
    expect(d.seoContent).toContain("](/creatine)");
    expect(d.seoContent).toContain("](/produits/micronised-creatine-optimum-nutrition-317g)");
    expect(d.seoContent).not.toMatch(/fondée|depuis \d{4}|certifi|distributeur officiel/i);
  });
  it("does not repeat « Tunisie » in every field", () => {
    expect((`${d.seoH1} ${d.imageAlt}`.match(/tunisie/gi) ?? []).length).toBeLessThanOrEqual(1);
  });
  it("tier B draft does not use the 'en Tunisie' pattern, so titles differ in shape", () => {
    expect(draftBrandSeo(f, "B").seoTitle).not.toContain("en Tunisie");
  });
  it("shortens long names to stay within 60 characters", () => {
    const long = facts({ name: "California Gold Nutrition International", slug: "cgn" });
    expect(draftBrandSeo(long, "A").seoTitle.length).toBeLessThanOrEqual(60);
  });
  it("skips sensitive categories in the copy", () => {
    const sens = facts({ categories: [{ slug: "boosters-hormonaux", name: "Boosters", indexable: false, count: 5 }, { slug: "creatine", name: "Créatine", indexable: true, count: 1 }] });
    expect(draftBrandSeo(sens, "A").seoContent).not.toMatch(/booster/i);
  });
});

describe("validateDraft", () => {
  it("blocks unverifiable claims", () => {
    const f = facts();
    const d = { ...draftBrandSeo(f, "A"), seoIntro: "Optimum Nutrition, distributeur officiel en Tunisie, depuis 1986." };
    expect(validateDraft(d, f).some((i) => i.code === "UNSUPPORTED_CLAIM")).toBe(true);
  });
  it("blocks thin content and missing links", () => {
    const f = facts();
    const d = { ...draftBrandSeo(f, "A"), seoContent: "Court texte Optimum Nutrition." };
    const codes = validateDraft(d, f).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(["THIN_CONTENT", "FEW_LINKS"]));
  });
});

describe("isTemplateText / readableProductName", () => {
  it("recognises the old generic generator output", () => {
    expect(isTemplateText("Explorez les références Solgar proposées dans notre catalogue. Comparez les formats")).toBe(true);
    expect(isTemplateText("Retrouvez la sélection Solgar disponible en Tunisie sur ParaTunisie.")).toBe(true);
    expect(isTemplateText("Solgar : vitamines et zinc. Comparez les formats et les compositions.")).toBe(false);
  });
  it("makes shouting product names readable, keeps normal ones untouched", () => {
    expect(readableProductName("CREATINE MONOHYDRATE 150GR - REAL PHARM")).toBe("Creatine Monohydrate 150gr - Real Pharm");
    expect(readableProductName("Serious Mass 5,45 kg")).toBe("Serious Mass 5,45 kg");
  });
});

describe("scoreBrand", () => {
  it("does not reward filled-in generic template text", () => {
    const tpl = facts({
      seoTitle: "Solgar Tunisie | Produits Solgar | ParaTunisie",
      seoDescription: "Découvrez les produits Solgar disponibles en Tunisie sur ParaTunisie : parapharmacie et compléments, informations, prix et livraison.",
      seoH1: "Solgar Tunisie",
      seoIntro: "Retrouvez la sélection Solgar disponible en Tunisie sur ParaTunisie.",
      seoContent: "Explorez les références Solgar proposées dans notre catalogue. Comparez les formats, les usages et la disponibilité de chaque produit avant de commander.",
      canonicalUrl: "https://paratunisie.com/marques/solgar",
      name: "Solgar", slug: "solgar", indexable: true, indexableCount: 0,
    });
    const s = scoreBrand(tpl, buildScoreContext([tpl]));
    expect(s.checks.find((c) => c.id === "content")?.passed).toBe(false);
    expect(s.checks.find((c) => c.id === "title")?.passed).toBe(false);
    expect(s.checks.find((c) => c.id === "indexability")?.passed).toBe(false); // indexable but tier C
    expect(s.score).toBeLessThanOrEqual(5);
  });
  it("gives a high score to a validated, complete brand", () => {
    const base = facts();
    const d = draftBrandSeo(base, "A");
    const full: BrandFacts = { ...base, ...d, seoKeywords: undefined as never, indexable: true, ogImage: d.ogImage, imageAlt: d.imageAlt } as BrandFacts;
    const s = scoreBrand(full, buildScoreContext([full]));
    expect(s.tier).toBe("A");
    expect(s.score).toBeGreaterThanOrEqual(9);
  });
  it("penalises duplicated titles", () => {
    const a = facts({ seoTitle: "Marque X : whey | ParaTunisie", slug: "a", name: "Marque X" });
    const b = facts({ seoTitle: "Marque X : whey | ParaTunisie", slug: "b", name: "Marque X" });
    const ctx = buildScoreContext([a, b]);
    expect(scoreBrand(a, ctx).checks.find((c) => c.id === "title")?.passed).toBe(false);
  });
});

describe("planBrand", () => {
  const opts = { regenerate: false, overwriteCustom: false };
  it("keeps tier C brands out of the index without touching their copy", () => {
    const p = planBrand(facts({ indexableCount: 0, indexable: true }), opts);
    expect(p.action).toBe("noindex");
    expect(p.draft).toBeUndefined();
    expect(planBrand(facts({ indexableCount: 0, indexable: false }), opts).action).toBe("unchanged");
  });
  it("completes only empty or generic fields of a preserved brand and never touches original text", () => {
    const original = Array.from({ length: 100 }, (_v, i) => `mot${i}`).join(" ");
    const p = planBrand(facts({ seoIsCustom: true, seoContent: original, seoIntro: "Intro écrite à la main pour Optimum Nutrition avec assez de mots.", seoTitle: "Optimum Nutrition Tunisie | Produits Optimum Nutrition | ParaTunisie", seoDescription: null, canonicalUrl: null }), opts);
    expect(p.action).toBe("preserve");
    expect(p.fill?.seoContent).toBeUndefined();
    expect(p.fill?.seoIntro).toBeUndefined();
    expect(p.fill?.seoTitle).toBeDefined(); // generic template replaced
    expect(p.fill?.seoDescription).toBeDefined(); // empty filled
    expect(p.fill?.canonicalUrl).toBe("https://paratunisie.com/marques/optimum-nutrition");
  });
  it("replaces an over-long title or description on a preserved brand but keeps a valid one", () => {
    const original = Array.from({ length: 100 }, (_v, i) => `mot${i}`).join(" ");
    const long = planBrand(facts({ seoIsCustom: true, seoContent: original, seoTitle: "A".repeat(75), seoDescription: "D".repeat(200) }), opts);
    expect(long.fill?.seoTitle).toBeDefined();
    expect(long.fill?.seoDescription).toBeDefined();
    const ok = planBrand(facts({ seoIsCustom: true, seoContent: original, seoTitle: "Optimum Nutrition : créatine et gainers | ParaTunisie", seoDescription: "Optimum Nutrition sur ParaTunisie : créatine et gainers. Comparez les formats et les compositions, livraison en 24 à 48 h, paiement à la livraison." }), opts);
    expect(ok.fill?.seoTitle).toBeUndefined();
    expect(ok.fill?.seoDescription).toBeUndefined();
  });
  it("does not count 'ParaTunisie' as keyword stuffing", () => {
    const f = facts();
    const d = draftBrandSeo(f, "A");
    expect(validateDraft(d, f).some((i) => i.code === "KEYWORD_STUFFING")).toBe(false);
  });
  it("never auto-noindexes a hand-edited brand, even when it is not eligible (flags it for review instead)", () => {
    const p = planBrand(facts({ seoIsCustom: true, indexable: true, indexableCount: 0 }), opts);
    expect(p.action).toBe("preserve");
    expect(p.indexable).toBe(true);
    expect(p.reason).toMatch(/revue manuelle/);
  });
  it("preserves custom copy unless overwrite is explicitly requested", () => {
    expect(planBrand(facts({ seoIsCustom: true, seoContent: "x" }), opts).action).toBe("preserve");
    expect(planBrand(facts({ seoIsCustom: true, seoContent: "x" }), { ...opts, overwriteCustom: true }).action).toBe("generate");
  });
  it("preserves existing original copy but replaces the generic template", () => {
    const original = Array.from({ length: 100 }, (_v, i) => `mot${i}`).join(" ");
    expect(planBrand(facts({ seoContent: original }), opts).action).toBe("preserve");
    expect(planBrand(facts({ seoContent: original }), { ...opts, regenerate: true }).action).toBe("generate");
    const tpl = planBrand(facts({ seoContent: "Explorez les références Optimum Nutrition proposées dans notre catalogue. Comparez les formats." }), opts);
    expect(tpl.action).toBe("generate");
    expect(tpl.indexable).toBe(true);
  });
  it("blocks a draft that duplicates another brand's metadata", () => {
    const one = planBrand(facts(), opts);
    const two = planBrand(facts({ id: "b2", slug: "other" }), opts);
    two.draft = { ...one.draft! };
    markDuplicates([one, two]);
    expect(two.action).toBe("blocked");
    expect(two.indexable).toBe(false);
    expect(two.duplicateOf).toBe("optimum-nutrition");
  });
});

describe("similarity", () => {
  it("is 1 for identical text and low for different text", () => {
    expect(similarity("créatine monohydrate micronisée format", "créatine monohydrate micronisée format")).toBe(1);
    expect(similarity("créatine monohydrate micronisée", "gainers calories protéines sucres")).toBeLessThan(0.2);
  });
});
