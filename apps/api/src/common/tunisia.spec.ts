import {
  FLAT_DELIVERY_FEE_MILLIMES,
  GOVERNORATES,
  classifyTrafficSource,
  computeDeliveryFeeMillimes,
  isGovernorate,
  normalizeTunisianLocalPhone,
} from "./tunisia";

describe("normalizeTunisianLocalPhone", () => {
  it.each([
    ["98123456", "98123456"],
    ["98 123 456", "98123456"],
    ["+216 98 123 456", "98123456"],
    ["21698123456", "98123456"],
    ["0021698123456", "98123456"],
    ["(+216) 22-123-456", "22123456"],
  ])("accepts %s", (input, expected) => expect(normalizeTunisianLocalPhone(input)).toBe(expected));

  it.each(["", "123", "12345678", "0612345678", "9812345", "+33 6 12 34 56 78", "abcdefgh", null, undefined])(
    "rejects %p",
    (input) => expect(normalizeTunisianLocalPhone(input as any)).toBeNull(),
  );
});

describe("delivery policy", () => {
  it("is 7 DT under 99 DT and free from 99 DT", () => {
    expect(computeDeliveryFeeMillimes(0)).toBe(FLAT_DELIVERY_FEE_MILLIMES);
    expect(computeDeliveryFeeMillimes(98_999)).toBe(7_000);
    expect(computeDeliveryFeeMillimes(99_000)).toBe(0);
    expect(computeDeliveryFeeMillimes(259_000)).toBe(0);
  });
});

describe("governorates", () => {
  it("lists the 24 governorates", () => {
    expect(GOVERNORATES).toHaveLength(24);
    expect(new Set(GOVERNORATES).size).toBe(24);
    expect(isGovernorate("Tunis")).toBe(true);
    expect(isGovernorate("Paris")).toBe(false);
  });
});

describe("classifyTrafficSource", () => {
  it("detects Meta Ads from fbclid or utm_source", () => {
    expect(classifyTrafficSource({ fbclid: "abc" })).toBe("Meta Ads");
    expect(classifyTrafficSource({ utmSource: "Facebook" })).toBe("Meta Ads");
    expect(classifyTrafficSource({ utmSource: "ig" })).toBe("Meta Ads");
  });
  it("falls back to other / organic / direct", () => {
    expect(classifyTrafficSource({ utmSource: "newsletter" })).toBe("Autre");
    expect(classifyTrafficSource({ referrerHost: "www.google.com" })).toBe("Organic");
    expect(classifyTrafficSource({})).toBe("Direct");
  });
});
