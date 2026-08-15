import {
  aggregateProfitability,
  computeItemCostMillimes,
  computeItemGainMillimes,
  computeItemRevenueMillimes,
  computeMarginRate,
  isLowMargin,
  isNegativeMargin,
} from "./profitability-calc";

describe("profitability-calc", () => {
  // Test case 1: sale 50 DT, cost 30 DT, qty 2 → revenue 100, cost 60, gain 40
  it("computes revenue, cost and gain for a simple confirmed item", () => {
    const item = { priceMillimes: 50_000, unitCostMillimes: 30_000, quantity: 2 };
    expect(computeItemRevenueMillimes(item)).toBe(100_000);
    expect(computeItemCostMillimes(item)).toBe(60_000);
    expect(computeItemGainMillimes(item)).toBe(40_000);
  });

  // Test case 5: quantity 3 multiplies correctly
  it("multiplies correctly for quantity 3", () => {
    const item = { priceMillimes: 20_000, unitCostMillimes: 12_000, quantity: 3 };
    expect(computeItemRevenueMillimes(item)).toBe(60_000);
    expect(computeItemCostMillimes(item)).toBe(36_000);
    expect(computeItemGainMillimes(item)).toBe(24_000);
  });

  // Test case 4: discounted item — list 60, paid 50, cost 30 → gain 20, not 30.
  // priceMillimes is already "amount actually paid" (set at order time from
  // checkout, REQUIREMENTS.md §7) — there is no separate list-price re-lookup.
  it("uses the actual amount paid, not a catalog list price", () => {
    const paidItem = { priceMillimes: 50_000, unitCostMillimes: 30_000, quantity: 1 };
    expect(computeItemGainMillimes(paidItem)).toBe(20_000);
  });

  // Test case 8: negative margin detection
  it("detects a negative margin when cost exceeds selling price", () => {
    const item = { priceMillimes: 40_000, unitCostMillimes: 42_000, quantity: 1 };
    const gain = computeItemGainMillimes(item)!;
    expect(gain).toBe(-2_000);
    expect(isNegativeMargin(gain)).toBe(true);
    expect(isNegativeMargin(1)).toBe(false);
  });

  it("flags margin rates at or below the configurable threshold", () => {
    expect(isLowMargin(15, 20)).toBe(true);
    expect(isLowMargin(20, 20)).toBe(true);
    expect(isLowMargin(25, 20)).toBe(false);
  });

  it("computes taux de marque (price-based margin rate)", () => {
    // 40 gain on 100 revenue = 40%
    expect(computeMarginRate(40_000, 100_000)).toBe(40);
    // Zero revenue never divides by zero
    expect(computeMarginRate(0, 0)).toBe(0);
  });

  // Regression test for the exact production bug: a confirmed order whose item
  // has NO cost snapshot (unitCostMillimes: null) must NEVER report gain equal
  // to revenue or a 100% margin. Before the fix, aggregateProfitability computed
  // gain as (all revenue) - (only known cost) = revenue - 0 = revenue, which is
  // exactly the "58.9 / 0 / 58.9 / 100%" bug from the screenshots.
  it("never reports gain=revenue or 100% margin when cost is entirely unknown", () => {
    const items = [{ priceMillimes: 58_900, unitCostMillimes: null, quantity: 1 }];
    const totals = aggregateProfitability(items);
    expect(totals.totalRevenueMillimes).toBe(58_900); // the order is still shown, not hidden
    expect(totals.eligibleRevenueMillimes).toBe(0);
    expect(totals.costMillimes).toBe(0);
    expect(totals.gainMillimes).toBeNull(); // NOT 58_900
    expect(totals.tauxMarge).toBeNull(); // NOT 100
    expect(totals.costCoverage).toBe(0);
  });

  // Present-cost case still computes a real gain and margin.
  it("computes a real gain and margin when cost is known", () => {
    const items = [{ priceMillimes: 58_900, unitCostMillimes: 38_285, quantity: 1 }];
    const totals = aggregateProfitability(items);
    expect(totals.gainMillimes).toBe(20_615);
    expect(totals.tauxMarge).toBeCloseTo((20_615 / 58_900) * 100, 5);
    expect(totals.costCoverage).toBe(1);
  });

  // Mixed known/unknown items: totalRevenue includes everything (orders aren't
  // hidden), but eligibleRevenue/cost/gain are computed only over the item with
  // a known cost — this is the corrected version of the bug above, now split
  // into two distinct revenue figures instead of one that silently mixes them.
  it("splits total revenue from cost-eligible revenue for mixed known/unknown items", () => {
    const items = [
      { priceMillimes: 50_000, unitCostMillimes: 30_000, quantity: 1 }, // known cost
      { priceMillimes: 20_000, unitCostMillimes: null, quantity: 1 }, // unknown cost
    ];
    const totals = aggregateProfitability(items);
    expect(totals.totalRevenueMillimes).toBe(70_000); // both items shown
    expect(totals.eligibleRevenueMillimes).toBe(50_000); // only the known-cost item
    expect(totals.costMillimes).toBe(30_000);
    expect(totals.gainMillimes).toBe(20_000); // 50k - 30k, NOT 70k - 30k (=40k, the old bug)
    expect(totals.costCoverage).toBe(0.5);
    expect(totals.itemsWithCost).toBe(1);
    expect(totals.itemsTotal).toBe(2);
  });

  it("aggregates a full confirmed order matching the requirements example (2 x 50 DT, 30 DT cost)", () => {
    const items = [{ priceMillimes: 50_000, unitCostMillimes: 30_000, quantity: 2 }];
    const totals = aggregateProfitability(items);
    expect(totals.totalRevenueMillimes).toBe(100_000);
    expect(totals.eligibleRevenueMillimes).toBe(100_000);
    expect(totals.costMillimes).toBe(60_000);
    expect(totals.gainMillimes).toBe(40_000);
    expect(totals.costCoverage).toBe(1);
  });

  it("returns zero/null totals for an empty item list rather than NaN", () => {
    const totals = aggregateProfitability([]);
    expect(totals).toEqual({
      totalRevenueMillimes: 0,
      eligibleRevenueMillimes: 0,
      costMillimes: 0,
      gainMillimes: null,
      tauxMarge: null,
      costCoverage: 0,
      itemsWithCost: 0,
      itemsTotal: 0,
    });
  });
});
