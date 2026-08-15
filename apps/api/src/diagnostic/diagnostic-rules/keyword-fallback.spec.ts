import { rankCandidatesForNeed, scoreKeywords } from "./keyword-fallback";
import { ProductFact } from "../ai/diagnostic-recommendation.provider";

function fact(overrides: Partial<ProductFact>): ProductFact {
  return {
    id: "id",
    slug: "slug",
    name: "",
    brand: "Brand",
    category: "",
    priceMillimes: 10000,
    sizeLabel: "50 ml",
    image: "",
    stock: 5,
    description: "",
    benefit: "",
    ...overrides,
  };
}

describe("rankCandidatesForNeed (AI-unavailable fallback ranker)", () => {
  it("only returns candidates whose real category/name/description match the need's keywords", () => {
    const candidates = [
      fact({ id: "1", category: "Nettoyant & Démaquillant", name: "Gel Nettoyant" }),
      fact({ id: "2", category: "Parfum corps", name: "Eau de senteur" }),
    ];
    const ranked = rankCandidatesForNeed("nettoyage", candidates);
    expect(ranked.map((c) => c.id)).toEqual(["1"]);
  });

  it("ranks in-stock candidates above out-of-stock ones on a keyword tie", () => {
    const candidates = [
      fact({ id: "out", category: "Soin anti-âge", stock: 0 }),
      fact({ id: "in", category: "Soin anti-âge", stock: 20 }),
    ];
    const ranked = rankCandidatesForNeed("age", candidates);
    expect(ranked[0].id).toBe("in");
  });

  it("returns an empty array for an unknown need rather than matching everything", () => {
    const candidates = [fact({ id: "1", category: "Visage" })];
    expect(rankCandidatesForNeed("unknown-need-xyz", candidates)).toEqual([]);
  });
});

describe("scoreKeywords (name/category vs incidental description mentions)", () => {
  it("scores a name/category match higher than a description-only match — a hair dye whose usage instructions mention 'shampooing' must not outrank a real shampoo", () => {
    const realShampoo = fact({ id: "shampoo", category: "Shampoing", name: "Kerium Shampooing Doux" });
    const dyeThatMentionsRinsing = fact({
      id: "dye",
      category: "Coloration",
      name: "Coloration châtain doré",
      description: "Après application, rincez au shampooing.",
    });
    const keywords = ["shampoo", "shampooing"];
    expect(scoreKeywords(keywords, realShampoo)).toBeGreaterThan(scoreKeywords(keywords, dyeThatMentionsRinsing));
  });
});
