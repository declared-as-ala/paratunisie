import { BadRequestException, ConflictException } from "@nestjs/common";
import { CatalogueVariant, MAX_LINES, priceOrderLines } from "./order-pricing";

const product = (id: string, name = "Whey Gold Standard", publishState = "PUBLISHED") => ({ id, name, publishState });
const variant = (id: string, productId: string, priceMillimes: number, stock = 10, label = "2.27 kg", p = product(productId)): CatalogueVariant => ({ id, productId, label, priceMillimes, stock, product: p });

const catalogue: CatalogueVariant[] = [
  variant("v1", "p1", 379000),
  variant("v2a", "p2", 99000, 5, "500 g", product("p2", "Créatine")),
  variant("v2b", "p2", 169000, 5, "1 kg", product("p2", "Créatine")),
  variant("v3", "p3", 59000, 0, "200 g", product("p3", "Créatine GSN")),
  variant("v4", "p4", 80000, 9, "x", product("p4", "Brouillon", "DRAFT")),
];

describe("priceOrderLines: the price is decided by the catalogue, never by the browser", () => {
  it("accepts a legitimate line and returns the catalogue price", () => {
    const [line] = priceOrderLines([{ productId: "p1", quantity: 2, priceMillimes: 379000 }], catalogue);
    expect(line).toMatchObject({ productVariantId: "v1", quantity: 2, priceMillimes: 379000 });
  });

  it("rejects a manipulated price (1 millime) with a conflict and the real price", () => {
    expect(() => priceOrderLines([{ productId: "p1", quantity: 1, priceMillimes: 1 }], catalogue)).toThrow(ConflictException);
    expect(() => priceOrderLines([{ productId: "p1", quantity: 1, priceMillimes: 1 }], catalogue)).toThrow(/379 DT/);
  });

  it("rejects a price that is only slightly lower, a missing price and a negative price", () => {
    for (const priceMillimes of [378999, 0, -379000, undefined, 379000.5]) {
      expect(() => priceOrderLines([{ productId: "p1", quantity: 1, priceMillimes: priceMillimes as number }], catalogue)).toThrow();
    }
  });

  it("rejects a variant id from another product and an unknown variant id", () => {
    expect(() => priceOrderLines([{ productId: "p1", productVariantId: "v2a", quantity: 1, priceMillimes: 99000 }], catalogue)).toThrow(BadRequestException);
    expect(() => priceOrderLines([{ productVariantId: "nope", quantity: 1, priceMillimes: 1000 }], catalogue)).toThrow(BadRequestException);
  });

  it("picks the right size of a multi-variant product by its real price, and refuses an unmatched price", () => {
    const [big] = priceOrderLines([{ productId: "p2", quantity: 1, priceMillimes: 169000 }], catalogue);
    expect(big.productVariantId).toBe("v2b");
    const [small] = priceOrderLines([{ productId: "p2", quantity: 1, priceMillimes: 99000 }], catalogue);
    expect(small.productVariantId).toBe("v2a");
    expect(() => priceOrderLines([{ productId: "p2", quantity: 1, priceMillimes: 1 }], catalogue)).toThrow(ConflictException);
  });

  it("refuses out-of-stock, insufficient stock, unpublished products and an unknown product", () => {
    expect(() => priceOrderLines([{ productId: "p3", quantity: 1, priceMillimes: 59000 }], catalogue)).toThrow(/Stock insuffisant/);
    expect(() => priceOrderLines([{ productId: "p1", quantity: 11, priceMillimes: 379000 }], catalogue)).toThrow(/Stock insuffisant/);
    expect(() => priceOrderLines([{ productId: "p4", quantity: 1, priceMillimes: 80000 }], catalogue)).toThrow(/n'est plus disponible/);
    expect(() => priceOrderLines([{ productId: "ghost", quantity: 1, priceMillimes: 1000 }], catalogue)).toThrow(BadRequestException);
  });

  it("validates quantities and line counts", () => {
    for (const quantity of [0, -1, 1.5, 51, NaN]) {
      expect(() => priceOrderLines([{ productId: "p1", quantity, priceMillimes: 379000 }], catalogue)).toThrow(BadRequestException);
    }
    expect(() => priceOrderLines([], catalogue)).toThrow(BadRequestException);
    expect(() => priceOrderLines(Array.from({ length: MAX_LINES + 1 }, () => ({ productId: "p1", quantity: 1, priceMillimes: 379000 })), catalogue)).toThrow(BadRequestException);
  });

  it("merges duplicate lines and checks stock on the merged quantity", () => {
    const merged = priceOrderLines([{ productId: "p1", quantity: 4, priceMillimes: 379000 }, { productId: "p1", quantity: 5, priceMillimes: 379000 }], catalogue);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(9);
    expect(() => priceOrderLines([{ productId: "p1", quantity: 6, priceMillimes: 379000 }, { productId: "p1", quantity: 5, priceMillimes: 379000 }], catalogue)).toThrow(/Stock insuffisant/);
  });

  it("a line with neither product nor variant is refused", () => {
    expect(() => priceOrderLines([{ quantity: 1, priceMillimes: 1000 }], catalogue)).toThrow(/produit réel/);
  });
});
