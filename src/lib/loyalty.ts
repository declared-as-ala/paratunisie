/**
 * Loyalty System Constants and Calculation Helpers for ParaTunisie
 * 
 * Rules:
 * - 1 TND spent on products = 1 Loyalty Point (POINTS_PER_TND = 1)
 * - 1 Loyalty Point = 0.05 TND discount (20 points = 1 TND discount)
 * - Shipping fees are excluded from loyalty point accrual.
 */

export const POINTS_PER_TND = 1;
export const POINT_VALUE_TND = 0.05; // 1 point = 0.05 TND
export const POINTS_PER_ONE_DT_DISCOUNT = 20; // 20 points = 1 TND

/**
 * Calculates loyalty points earned from a price in millimes.
 * Example: 159,000 millimes (159 DT) => 159 points.
 */
export function calculatePointsEarned(priceMillimes: number): number {
  if (!priceMillimes || priceMillimes <= 0) return 0;
  const priceTnd = priceMillimes / 1000;
  return Math.floor(priceTnd * POINTS_PER_TND);
}

/**
 * Calculates monetary discount value in millimes for a given number of points.
 * Example: 200 points => 10,000 millimes (10 DT).
 */
export function calculatePointsDiscountMillimes(points: number): number {
  if (!points || points <= 0) return 0;
  const discountTnd = points * POINT_VALUE_TND;
  return Math.round(discountTnd * 1000);
}

/**
 * Calculates monetary discount value in TND (formatted) for a given number of points.
 * Example: 1250 points => 62.5
 */
export function calculatePointsValueTnd(points: number): number {
  if (!points || points <= 0) return 0;
  return Number((points * POINT_VALUE_TND).toFixed(3));
}
