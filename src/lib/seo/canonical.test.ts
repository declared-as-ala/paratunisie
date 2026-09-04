import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCanonicalUrl, CANONICAL_ORIGIN } from "./canonical";

describe("Canonical URL Builder", () => {
  it("returns root canonical origin for empty or root path", () => {
    assert.equal(buildCanonicalUrl(""), CANONICAL_ORIGIN);
    assert.equal(buildCanonicalUrl("/"), CANONICAL_ORIGIN);
  });

  it("ensures apex origin https://paratunisie.com and removes www", () => {
    assert.equal(buildCanonicalUrl("https://www.paratunisie.com/shop"), "https://paratunisie.com/shop");
    assert.equal(buildCanonicalUrl("http://www.paratunisie.com/marques"), "https://paratunisie.com/marques");
    assert.equal(buildCanonicalUrl("http://paratunisie.com/creatine"), "https://paratunisie.com/creatine");
  });

  it("normalizes trailing slashes and duplicate slashes", () => {
    assert.equal(buildCanonicalUrl("/produits//test/"), "https://paratunisie.com/produits/test");
    assert.equal(buildCanonicalUrl("creatine/"), "https://paratunisie.com/creatine");
    assert.equal(buildCanonicalUrl("/shop/"), "https://paratunisie.com/shop");
  });

  it("strips embedded tracking query params and hashes by default", () => {
    assert.equal(buildCanonicalUrl("/shop?gclid=12345&utm_source=facebook#section"), "https://paratunisie.com/shop");
    assert.equal(buildCanonicalUrl("/produits/creatine?fbclid=xyz"), "https://paratunisie.com/produits/creatine");
  });

  it("handles pagination when requested", () => {
    assert.equal(buildCanonicalUrl("/shop", { page: 2, allowPagination: true }), "https://paratunisie.com/shop?page=2");
    assert.equal(buildCanonicalUrl("/shop", { page: 1, allowPagination: true }), "https://paratunisie.com/shop");
    assert.equal(buildCanonicalUrl("/shop", { page: 2, allowPagination: false }), "https://paratunisie.com/shop");
  });

  it("handles allowed query params", () => {
    assert.equal(
      buildCanonicalUrl("/search", {
        allowedParams: { q: "creatine" },
      }),
      "https://paratunisie.com/search?q=creatine"
    );
  });
});
