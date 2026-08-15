// Pure calculation functions — no Prisma/Nest imports, so these are unit-testable
// without a database. REQUIREMENTS.md §B/§C terminology: "gain" (never "profit"),
// "CA" (never "profit"). OrderItem.priceMillimes is the amount actually charged
// per unit at order time (set from what checkout sent, already reflecting any
// promo/discount) — so revenue below never re-derives a catalog list price.

export interface ProfitabilityItemInput {
  priceMillimes: number;
  quantity: number;
  unitCostMillimes: number | null;
}

export interface ProfitabilityTotals {
  /** Revenue from every item, regardless of whether its cost is known. Orders
   * are never hidden just because their cost is unknown — this is the honest
   * "orders exist" number. */
  totalRevenueMillimes: number;
  /** Revenue from only the items with a known cost snapshot — the sole basis
   * for gain/margin. Equals totalRevenueMillimes when costCoverage is 1. */
  eligibleRevenueMillimes: number;
  costMillimes: number;
  /** null when eligibleRevenueMillimes is 0 — there is nothing to compute a
   * gain from. NEVER coerced to a number in that case: `revenue - 0` would
   * silently present 100% margin on items whose cost is simply unknown. */
  gainMillimes: number | null;
  /** null under the same condition as gainMillimes — never 0% or 100% as a
   * stand-in for "can't be calculated." */
  tauxMarge: number | null;
  /** Fraction (0..1) of items that had a real cost snapshot. */
  costCoverage: number;
  /** Raw counts backing costCoverage — "Articles avec coût renseigné: X / Y". */
  itemsWithCost: number;
  itemsTotal: number;
}

export function computeItemRevenueMillimes(item: Pick<ProfitabilityItemInput, "priceMillimes" | "quantity">): number {
  return item.priceMillimes * item.quantity;
}

export function computeItemCostMillimes(item: Pick<ProfitabilityItemInput, "unitCostMillimes" | "quantity">): number | null {
  if (item.unitCostMillimes === null) return null;
  return item.unitCostMillimes * item.quantity;
}

export function computeItemGainMillimes(item: ProfitabilityItemInput): number | null {
  const cost = computeItemCostMillimes(item);
  if (cost === null) return null;
  return computeItemRevenueMillimes(item) - cost;
}

// "Taux de marque" (price-based margin rate, D-0017) — the admin's default
// margin display: what share of the selling price is gain. Callers must only
// invoke this when revenueMillimes is known-eligible (> 0 and cost-backed);
// this function itself has no way to tell "zero revenue" from "unknown cost,"
// so that distinction is made by aggregateProfitability below, not here.
export function computeMarginRate(gainMillimes: number, revenueMillimes: number): number {
  if (revenueMillimes <= 0) return 0;
  return (gainMillimes / revenueMillimes) * 100;
}

export function aggregateProfitability(items: ProfitabilityItemInput[]): ProfitabilityTotals {
  let totalRevenueMillimes = 0;
  let eligibleRevenueMillimes = 0;
  let costMillimes = 0;
  let itemsWithCost = 0;

  for (const item of items) {
    const revenue = computeItemRevenueMillimes(item);
    totalRevenueMillimes += revenue;
    const cost = computeItemCostMillimes(item);
    if (cost !== null) {
      eligibleRevenueMillimes += revenue;
      costMillimes += cost;
      itemsWithCost += 1;
    }
  }

  const hasEligibleRevenue = eligibleRevenueMillimes > 0;
  const gainMillimes = hasEligibleRevenue ? eligibleRevenueMillimes - costMillimes : null;
  const tauxMarge = gainMillimes !== null ? computeMarginRate(gainMillimes, eligibleRevenueMillimes) : null;

  return {
    totalRevenueMillimes,
    eligibleRevenueMillimes,
    costMillimes,
    gainMillimes,
    tauxMarge,
    costCoverage: items.length > 0 ? itemsWithCost / items.length : 0,
    itemsWithCost,
    itemsTotal: items.length,
  };
}

export function isNegativeMargin(gainMillimes: number): boolean {
  return gainMillimes < 0;
}

export function isLowMargin(marginRatePct: number, thresholdPct: number): boolean {
  return marginRatePct <= thresholdPct;
}
