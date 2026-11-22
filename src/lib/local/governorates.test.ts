import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildLocalCopy } from "./content";
import { DELIVERY, GOVERNORATES, INDEXED_PILOT, getGovernorate, isIndexable } from "./governorates";
import { passesQualityGate, type LocalPageData } from "./page-data";

const data: LocalPageData = {
  categories: [{ slug: "creatine", name: "Créatine", inStock: 3, total: 20 }, { slug: "whey-proteine", name: "Whey Protéine", inStock: 4, total: 10 }, { slug: "gainers-proteines", name: "Gainers", inStock: 2, total: 14 }],
  products: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, slug: `p${i}`, name: `P${i}` }) as never),
  inStockTotal: 9,
  brands: ["Optimum Nutrition", "Xtend"],
};

describe("governorate configuration", () => {
  it("has the 24 official governorates with unique slugs and towns", () => {
    assert.equal(GOVERNORATES.length, 24);
    assert.equal(new Set(GOVERNORATES.map((g) => g.slug)).size, 24);
    for (const g of GOVERNORATES) assert.ok(g.towns.length >= 4 && g.towns[0].length > 0, g.slug);
  });
  it("only indexes pilot pages that exist", () => {
    for (const list of Object.values(INDEXED_PILOT)) for (const slug of list) assert.ok(getGovernorate(slug), slug);
    assert.equal(isIndexable("proteine", "sousse"), true);
    assert.equal(isIndexable("proteine", "tataouine"), false);
  });
  it("rejects unknown governorates", () => assert.equal(getGovernorate("atlantis"), null));
});

describe("regional copy", () => {
  it("produces unique titles, descriptions and h1 for every governorate and cluster", () => {
    const seen = new Set<string>();
    for (const cluster of ["parapharmacie", "proteine"] as const) {
      for (const g of GOVERNORATES) {
        const c = buildLocalCopy(cluster, g, data);
        for (const v of [c.title, c.description, c.h1]) { assert.ok(!seen.has(v), `duplicate: ${v}`); seen.add(v); }
        assert.ok(c.title.length <= 70 && c.description.length >= 90 && c.description.length <= 165, `${cluster}/${g.slug} ${c.title.length}/${c.description.length}`);
        assert.ok(c.faqs.length >= 4);
        assert.ok(!/gratuite|offerte|24 ?h(?!.*48)/i.test(JSON.stringify(c)), "no unverified delivery promise");
        assert.ok(JSON.stringify(c).includes(`${DELIVERY.feeDt} DT`));
      }
    }
  });
  it("quality gate requires real catalogue content", () => {
    assert.equal(passesQualityGate(data), true);
    assert.equal(passesQualityGate({ ...data, products: [] }), false);
    assert.equal(passesQualityGate({ ...data, categories: data.categories.slice(0, 2) }), false);
  });
});
