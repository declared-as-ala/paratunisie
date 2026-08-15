import { LocalSeoProvider } from "../provider/local-seo.provider";

describe("Production SEO Quality & Safety Unit Tests", () => {
  let provider: LocalSeoProvider;

  beforeEach(() => {
    provider = new LocalSeoProvider();
  });

  describe("Brand & Title Normalization", () => {
    it("eliminates duplicated brand prefix and normalizes volume formatting", () => {
      const normalized = provider.normalizeTitle("AVENE Avène cicalfate + crème réparatrice 40ml", "AVENE");
      expect(normalized).toBe("Avène cicalfate + crème réparatrice 40 ml");
      expect(normalized).not.toContain("AVENE Avène");
    });

    it("eliminates repeated duplicate words", () => {
      const normalized = provider.normalizeTitle("Soin soin hydratant crème crème 50ml", "Bio");
      expect(normalized).toBe("Bio Soin hydratant crème 50 ml");
      expect(normalized).not.toContain("Soin soin");
      expect(normalized).not.toContain("crème crème");
    });
  });

  describe("Unsupported Medical Claim Sanitization", () => {
    it("neutralizes or removes overpromising claims without introducing fake claims", () => {
      const rawText = "Ce produit guérit l'acné, garanti 100% sans danger pour femme enceinte et cliniquement prouvé.";
      const sanitized = provider.sanitizeUnsupportedClaims(rawText);

      expect(sanitized).not.toContain("guérit");
      expect(sanitized).not.toContain("garanti 100%");
      expect(sanitized).not.toContain("sans danger pour femme enceinte");
      expect(sanitized).not.toContain("cliniquement prouvé");

      // Verify it did NOT inject fake dermatological claims
      expect(sanitized).not.toContain("formulé sous contrôle dermatologique");
    });
  });

  describe("Zero Competitor Price Leakage Policy", () => {
    it("NEVER leaks selling price or competitor price when no selling price is explicitly passed", () => {
      const facts = {
        name: "Daylong Extreme SPF50+ 100ml",
        brand: "Daylong",
        category: "Solaire",
        volumeSize: "100 ml",
        // Note: sellingPriceMillimes is undefined!
      };

      const result = provider.generate(facts);

      expect(result.metaDescription).not.toContain("DT");
      expect(result.metaDescription).not.toContain("prix");
      expect(result.shortDescription).not.toContain("DT");
      expect(result.longDescription).not.toContain("DT");

      // FAQ should not contain price questions when price is omitted
      const priceFaq = result.faq.find((f) => f.question.includes("prix"));
      expect(priceFaq).toBeUndefined();
    });

    it("includes selling price ONLY when sellingPriceMillimes is explicitly supplied", () => {
      const facts = {
        name: "Phytéal Déodorant Anti-Transpirant",
        brand: "Phytéal",
        category: "Hygiène",
        sellingPriceMillimes: 23890,
      };

      const result = provider.generate(facts);

      expect(result.metaDescription).toContain("23.890 DT");
      const priceFaq = result.faq.find((f) => f.question.includes("prix"));
      expect(priceFaq).toBeDefined();
      expect(priceFaq?.answer).toContain("23.890 DT");
    });
  });
});
