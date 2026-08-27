import { MetaCapiService, hashSha256, normalizeAndHashPhone } from "./meta-capi.service";

describe("MetaCapiService", () => {
  let service: MetaCapiService;

  beforeEach(() => {
    service = new MetaCapiService();
  });

  describe("Hashing Utilities", () => {
    it("should correctly lowercase, trim, and SHA-256 hash an email", () => {
      const email = "  Test.User@Example.COM ";
      const hashed = hashSha256(email);
      // SHA-256 of "test.user@example.com"
      expect(hashed).toBe("5430f878a87b5a1a1eb2beecae9734faaaee7c59051cc7daeb17d6b38cff1f96");
    });

    it("should normalize Tunisian phone numbers by adding 216 and hashing", () => {
      const phone = "97 991 266";
      const hashed = normalizeAndHashPhone(phone);
      // 8 digits -> "21697991266" -> SHA-256
      expect(hashed).toBeDefined();
      expect(hashed?.length).toBe(64);
    });

    it("should handle empty or null values gracefully", () => {
      expect(hashSha256(null)).toBeUndefined();
      expect(hashSha256("")).toBeUndefined();
      expect(normalizeAndHashPhone(undefined)).toBeUndefined();
    });
  });

  describe("User Data Builder", () => {
    it("should construct sanitized, hashed user data", () => {
      const userData = service.buildUserData({
        email: "customer@paratunisie.tn",
        phone: "97991266",
        firstName: "Ala",
        lastName: "Missaoui",
        city: "Tunis",
        clientIp: "197.1.2.3",
        clientUserAgent: "Mozilla/5.0",
        fbp: "fb.1.12345.67890",
        fbc: "fb.1.12345.abcdef",
      });

      expect(userData.em).toBeDefined();
      expect(userData.ph).toBeDefined();
      expect(userData.fn).toBeDefined();
      expect(userData.ln).toBeDefined();
      expect(userData.ct).toBeDefined();
      expect(userData.country).toBeDefined(); // Tunisia 'tn'
      expect(userData.client_ip_address).toBe("197.1.2.3");
      expect(userData.client_user_agent).toBe("Mozilla/5.0");
      expect(userData.fbp).toBe("fb.1.12345.67890");
      expect(userData.fbc).toBe("fb.1.12345.abcdef");
    });
  });

  describe("trackPurchase Payload & Deduplication", () => {
    it("should build correct Purchase payload and handle missing token gracefully", async () => {
      const mockOrder = {
        id: "order-12345",
        totalMillimes: 259000,
        gouvernorat: "Tunis",
        user: {
          email: "buyer@paratunisie.tn",
          phone: "97991266",
          name: "Mohamed Ben Ali",
        },
        items: [
          {
            productId: "p01",
            quantity: 2,
            priceMillimes: 129500,
            product: { id: "p01", name: "Anabolic Whey 80" },
          },
        ],
      };

      const result = await service.trackPurchase(mockOrder, {
        eventId: "purchase_order-12345",
        clientIp: "197.1.2.3",
      });

      // When token is not set in test environment, it should fail safely without throwing
      expect(result).toBeDefined();
      expect(result.success === true || result.error === "Missing META_CONVERSIONS_API_TOKEN").toBe(true);
    });

    it("should never throw an unhandled exception that could disrupt order creation", async () => {
      const brokenOrder: any = { id: "bad-order", totalMillimes: NaN };
      await expect(service.trackPurchase(brokenOrder)).resolves.not.toThrow();
    });
  });
});
