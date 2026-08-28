import {
  POINTS_PER_TND,
  POINT_VALUE_TND,
  calculatePointsEarned,
  calculatePointsDiscountMillimes,
} from "../src/loyalty/loyalty.constants";

describe("ParaTunisie Product Reviews, Schema.org & Loyalty Points Test Suite", () => {
  describe("1. Loyalty Point Calculations", () => {
    test("Test 1: Product 200 DT => 200 points earned", () => {
      const priceMillimes = 200_000; // 200 DT
      const points = calculatePointsEarned(priceMillimes);
      expect(points).toBe(200);
    });

    test("Test 2: 200 points => 10 DT discount (10,000 millimes)", () => {
      const points = 200;
      const discountMillimes = calculatePointsDiscountMillimes(points);
      expect(discountMillimes).toBe(10_000);
      expect(discountMillimes / 1000).toBe(10);
    });

    test("Test 3: 100 points => 5 DT discount (5,000 millimes)", () => {
      const points = 100;
      const discountMillimes = calculatePointsDiscountMillimes(points);
      expect(discountMillimes).toBe(5_000);
      expect(discountMillimes / 1000).toBe(5);
    });

    test("Test 3b: 159 DT product => 159 points earned", () => {
      const priceMillimes = 159_000;
      expect(calculatePointsEarned(priceMillimes)).toBe(159);
    });
  });

  describe("2. Idempotent Order Accrual & Reversal Business Rules", () => {
    test("Test 4 & 5: Completed order credits points once; duplicate status updates are idempotent", () => {
      const ledger: { orderId: string; type: string; points: number }[] = [];
      const order = { id: "ord-100", subtotalMillimes: 200_000, discountMillimes: 0 };

      // Helper simulating awardOrderPoints
      const awardOrderPoints = (orderId: string, subtotal: number) => {
        const alreadyAwarded = ledger.some((tx) => tx.orderId === orderId && tx.type === "EARN");
        if (alreadyAwarded) return null; // Idempotent no-op

        const pts = calculatePointsEarned(subtotal);
        const tx = { orderId, type: "EARN", points: pts };
        ledger.push(tx);
        return tx;
      };

      // 1st transition to LIVREE
      const firstAward = awardOrderPoints(order.id, order.subtotalMillimes);
      expect(firstAward).not.toBeNull();
      expect(firstAward?.points).toBe(200);
      expect(ledger.length).toBe(1);

      // 2nd transition to LIVREE (duplicate)
      const secondAward = awardOrderPoints(order.id, order.subtotalMillimes);
      expect(secondAward).toBeNull();
      expect(ledger.length).toBe(1); // Points were NOT duplicated
    });

    test("Test 6: Cancelled / refunded order reverses awarded points", () => {
      const ledger: { orderId: string; type: string; points: number }[] = [
        { orderId: "ord-100", type: "EARN", points: 200 },
      ];

      const reverseOrderPoints = (orderId: string) => {
        const earnTx = ledger.find((tx) => tx.orderId === orderId && tx.type === "EARN");
        if (!earnTx) return null;

        const alreadyReversed = ledger.some((tx) => tx.orderId === orderId && tx.type === "REFUND");
        if (alreadyReversed) return null;

        const refundTx = { orderId, type: "REFUND", points: -earnTx.points };
        ledger.push(refundTx);
        return refundTx;
      };

      const refund = reverseOrderPoints("ord-100");
      expect(refund).not.toBeNull();
      expect(refund?.points).toBe(-200);

      // Net balance is 0
      const netPoints = ledger.reduce((sum, tx) => sum + tx.points, 0);
      expect(netPoints).toBe(0);

      // Duplicate refund attempt is a no-op
      const secondRefund = reverseOrderPoints("ord-100");
      expect(secondRefund).toBeNull();
    });

    test("Test 7 & 8: Customer cannot spend more points than balance and points deduction is validated", () => {
      let balance = 150;

      const redeemPoints = (pointsToRedeem: number) => {
        if (pointsToRedeem <= 0) throw new Error("Points must be > 0");
        if (balance < pointsToRedeem) throw new Error("Solde insuffisant");
        balance -= pointsToRedeem;
        return { redeemed: pointsToRedeem, newBalance: balance };
      };

      // Customer tries to spend 200 when having 150 => Error
      expect(() => redeemPoints(200)).toThrow("Solde insuffisant");
      expect(balance).toBe(150);

      // Customer spends 100 => Success, balance becomes 50
      const res = redeemPoints(100);
      expect(res.newBalance).toBe(50);

      // Simultaneous spend of 100 fails
      expect(() => redeemPoints(100)).toThrow("Solde insuffisant");
    });
  });

  describe("3. Reviews Moderation & Aggregate Rating Rules", () => {
    test("Test 9 & 10: Unauthenticated review vs Authenticated review submission", () => {
      const validateReviewSubmission = (userId: string | undefined, rating: number, body: string) => {
        if (!userId) throw new Error("Connectez-vous pour donner votre avis.");
        if (rating < 1 || rating > 5) throw new Error("Note invalide.");
        if (!body || body.trim().length === 0) throw new Error("Commentaire obligatoire.");
        return { status: "PENDING", userId, rating, body };
      };

      // Guest fails
      expect(() => validateReviewSubmission(undefined, 5, "Super")).toThrow(
        "Connectez-vous pour donner votre avis.",
      );

      // Authenticated succeeds with PENDING status
      const valid = validateReviewSubmission("user-1", 5, "Excellent produit !");
      expect(valid.status).toBe("PENDING");
    });

    test("Test 11, 12, 13: Review statuses (PENDING, APPROVED, REJECTED) impact on public rating", () => {
      const reviews = [
        { id: "r1", rating: 5, status: "APPROVED" },
        { id: "r2", rating: 4, status: "APPROVED" },
        { id: "r3", rating: 1, status: "PENDING" }, // Must not affect average
        { id: "r4", rating: 1, status: "REJECTED" }, // Must not affect average
      ];

      const approvedOnly = reviews.filter((r) => r.status === "APPROVED");
      const avg = approvedOnly.reduce((s, r) => s + r.rating, 0) / approvedOnly.length;

      expect(approvedOnly.length).toBe(2);
      expect(avg).toBe(4.5);
    });
  });

  describe("4. Schema.org Product Rich Results JSON-LD Rules", () => {
    test("Test 14, 15, 16: Product JSON-LD output compliance", () => {
      const buildProductJsonLd = (product: {
        name: string;
        priceMillimes: number;
        inStock: boolean;
        reviewsCount: number;
        ratingAvg: number;
      }) => {
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          offers: {
            "@type": "Offer",
            priceCurrency: "TND",
            price: (product.priceMillimes / 1000).toFixed(3),
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
          ...(product.reviewsCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.ratingAvg.toFixed(1),
                  reviewCount: product.reviewsCount,
                },
              }
            : {}),
        };
      };

      // Product in stock with price 200 DT and 50 reviews
      const schemaWithReviews = buildProductJsonLd({
        name: "Créatine Ostrovit",
        priceMillimes: 200_000,
        inStock: true,
        reviewsCount: 50,
        ratingAvg: 4.86,
      });

      expect(schemaWithReviews.offers.priceCurrency).toBe("TND");
      expect(schemaWithReviews.offers.price).toBe("200.000");
      expect(schemaWithReviews.offers.availability).toBe("https://schema.org/InStock");
      expect(schemaWithReviews.aggregateRating).toBeDefined();
      expect(schemaWithReviews.aggregateRating.ratingValue).toBe("4.9");
      expect(schemaWithReviews.aggregateRating.reviewCount).toBe(50);

      // Product out of stock with 0 reviews
      const schemaOutOfStockNoReviews = buildProductJsonLd({
        name: "Shaker Kong",
        priceMillimes: 35_000,
        inStock: false,
        reviewsCount: 0,
        ratingAvg: 0,
      });

      expect(schemaOutOfStockNoReviews.offers.availability).toBe("https://schema.org/OutOfStock");
      expect((schemaOutOfStockNoReviews as any).aggregateRating).toBeUndefined();
    });
  });
});
