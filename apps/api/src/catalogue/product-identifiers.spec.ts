import { isValidGtin, normalizeGtin, normalizeMpn } from "./product-identifiers";

describe("product identifiers", () => {
  it("accepts real GS1 check digits (EAN-13, UPC-A, EAN-8, GTIN-14)", () => {
    expect(isValidGtin("4006381333931")).toBe(true); // EAN-13
    expect(isValidGtin("036000291452")).toBe(true); // UPC-A
    expect(isValidGtin("96385074")).toBe(true); // EAN-8
    expect(isValidGtin("10012345678902")).toBe(true); // GTIN-14
  });
  it("rejects wrong check digits, wrong lengths and non-digits", () => {
    expect(isValidGtin("4006381333932")).toBe(false);
    expect(isValidGtin("123456789")).toBe(false);
    expect(isValidGtin("40063813339ab")).toBe(false);
    expect(isValidGtin("")).toBe(false);
  });
  it("normalizes spaces and dashes, clears empty input, never invents a value", () => {
    expect(normalizeGtin(" 4006381 333931 ")).toEqual({ ok: true, value: "4006381333931" });
    expect(normalizeGtin("")).toEqual({ ok: true, value: null });
    expect(normalizeGtin(null)).toEqual({ ok: true, value: null });
    expect(normalizeGtin("4006381333932").ok).toBe(false);
  });
  it("validates MPN", () => {
    expect(normalizeMpn(" ON-GSW 2.27/KG ")).toEqual({ ok: true, value: "ON-GSW 2.27/KG" });
    expect(normalizeMpn("")).toEqual({ ok: true, value: null });
    expect(normalizeMpn("x".repeat(61)).ok).toBe(false);
    expect(normalizeMpn("<script>").ok).toBe(false);
  });
});
