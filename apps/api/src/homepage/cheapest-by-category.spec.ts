import {
  CandidateProduct,
  CategoryNode,
  eligibleVariant,
  plausibleSizeLabel,
  selectCheapestByCategory,
} from "./cheapest-by-category";

const cats: CategoryNode[] = [
  { id: "root", slug: "nutrition-sportive", name: "Nutrition Sportive", parentId: null },
  { id: "c-whey", slug: "whey-proteine", name: "Whey Protéine", parentId: "root" },
  { id: "c-whey-sub", slug: "whey-sub", name: "Whey sub", parentId: "c-whey" },
  { id: "c-creatine", slug: "creatine", name: "Créatine", parentId: "root" },
  { id: "c-bcaa", slug: "bcaa", name: "BCAA", parentId: "root" },
];

let n = 0;
function product(over: Partial<CandidateProduct> & { price?: number; stock?: number; label?: string }): CandidateProduct {
  n += 1;
  const { price = 100000, stock = 7, label = "1 kg", ...rest } = over;
  return {
    id: `p${n}`,
    slug: `produit-${n}`,
    name: `Produit ${n}`,
    benefit: null,
    image: "https://paratunisie.com/paratunisie-media/products/x.webp",
    imageAlt: null,
    publishState: "PUBLISHED",
    inStock: true,
    categoryId: "c-whey",
    brand: { name: "Marque", slug: "marque" },
    category: { name: "Whey Protéine", slug: "whey-proteine" },
    variants: [{ id: `v${n}`, label, priceMillimes: price, stock }],
    ...rest,
  };
}

describe("selectCheapestByCategory", () => {
  it("compares prices numerically (99 DT is cheaper than 100 DT, 1,000 DT is not cheaper than 999 DT)", () => {
    const a = product({ price: 99000 });
    const b = product({ price: 100000 });
    const c = product({ price: 1000000 });
    const out = selectCheapestByCategory(cats, [c, b, a]);
    expect(out[0].product.id).toBe(a.id);
    expect(out[0].product.variant.priceMillimes).toBe(99000);
  });

  it("includes products of subcategories", () => {
    const sub = product({ categoryId: "c-whey-sub", price: 50000 });
    const direct = product({ price: 90000 });
    const out = selectCheapestByCategory(cats, [direct, sub]);
    expect(out[0].product.id).toBe(sub.id);
    expect(out[0].eligibleCount).toBe(2);
  });

  it("uses the cheapest PURCHASABLE variant and ignores cheaper out-of-stock variants", () => {
    const p = product({});
    p.variants = [
      { id: "v-small", label: "500 g", priceMillimes: 60000, stock: 0 },
      { id: "v-mid", label: "1 kg", priceMillimes: 90000, stock: 3 },
      { id: "v-big", label: "2 kg", priceMillimes: 150000, stock: 9 },
    ];
    const out = selectCheapestByCategory(cats, [p]);
    expect(out[0].product.variant).toMatchObject({ id: "v-mid", priceMillimes: 90000, label: "1 kg" });
  });

  it("excludes unpublished, out-of-stock, image-less, placeholder-image and zero-price products", () => {
    const bad = [
      product({ publishState: "DRAFT" }),
      product({ inStock: false }),
      product({ stock: 0 }),
      product({ image: "" }),
      product({ image: "/assets/product-tube.webp" }),
      product({ price: 0 }),
      product({ price: 2500 }), // under the 5 DT plausibility floor
    ];
    expect(selectCheapestByCategory(cats, bad)).toEqual([]);
  });

  it("excludes restricted substances, packs and unverified stock counts (100 / 500+)", () => {
    const bad = [
      product({ name: "MK-677 60 capsules", slug: "mk-677-60-capsules" }),
      product({ slug: "pack-prise-de-masse", name: "Pack prise de masse" }),
      product({ stock: 100 }),
      product({ stock: 500 }),
    ];
    expect(selectCheapestByCategory(cats, bad)).toEqual([]);
  });

  it("skips a suspiciously low price (under 20% of the category median) instead of advertising it", () => {
    const real = [product({ price: 120000 }), product({ price: 130000 }), product({ price: 140000 })];
    const bogus = product({ price: 6000 });
    const out = selectCheapestByCategory(cats, [...real, bogus]);
    expect(out[0].product.variant.priceMillimes).toBe(120000);
  });

  it("omits categories without an eligible product and never duplicates a product across categories", () => {
    const w = product({ categoryId: "c-whey" });
    const cr = product({ categoryId: "c-creatine", category: { name: "Créatine", slug: "creatine" } });
    const out = selectCheapestByCategory(cats, [w, cr]);
    expect(out.map((e) => e.category.slug)).toEqual(["whey-proteine", "creatine"]);
    expect(new Set(out.map((e) => e.product.id)).size).toBe(out.length);
  });

  it("only claims 'cheapest' when at least two eligible products were compared", () => {
    const only = product({ categoryId: "c-bcaa", category: { name: "BCAA", slug: "bcaa" } });
    expect(selectCheapestByCategory(cats, [only])[0].cheapestProven).toBe(false);
    const two = [product({ price: 90000 }), product({ price: 95000 })];
    expect(selectCheapestByCategory(cats, two)[0].cheapestProven).toBe(true);
  });

  it("is deterministic on equal prices", () => {
    const a = product({ slug: "b-produit", price: 90000 });
    const b = product({ slug: "a-produit", price: 90000 });
    expect(selectCheapestByCategory(cats, [a, b])[0].product.slug).toBe("a-produit");
  });

  it("ignores inactive categories", () => {
    const inactive = cats.map((c) => (c.slug === "whey-proteine" ? { ...c, status: "INACTIVE" } : c));
    expect(selectCheapestByCategory(inactive, [product({})])).toEqual([]);
  });
});

describe("eligibleVariant", () => {
  it("returns null for a product whose only variant is not purchasable", () => {
    expect(eligibleVariant(product({ stock: 0 }))).toBeNull();
  });
});

describe("plausibleSizeLabel", () => {
  it.each([
    ["3 KG", "Rapide Mass 3kg Advanced Naturals", "rapide-mass-3kg-advanced-naturals", "3 KG"],
    ["907G", "Prostar 100% Whey Protein 907g", "prostar-100-whey-protein-907g", "907G"],
    ["150 g", "CREATINE MONOHYDRATE 150GR - REAL PHARM", "creatine-monohydrate-150gr-real-pharm", "150 g"],
    ["6l", "MAGNESIUM + VITAMIN B6 - 90 TABLETS", "magnesium-vitamin-b6-90-tablets", null],
    ["2 g", "MEGA OMEGA-3 - 90 CAPS", "mega-omega-3-90-caps-biotech", null],
    ["Format standard", "Multi Vita 120 caps", "multi-vita-120-caps", null],
    ["1.81 KG", "Pre-workout Born Rage Original", "pre-workout-born-rage-original-eric-favre", "1.81 KG"],
  ])("%s on %s", (label, name, slug, expected) => {
    expect(plausibleSizeLabel(label, name, slug)).toBe(expected);
  });
});
