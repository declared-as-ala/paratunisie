/** Single source of truth for Tunisian checkout rules on the API side. */

export const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan",
  "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", "Monastir", "Nabeul",
  "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

/** Documented policy (/livraison, /aide): flat 7 DT under 99 DT, free from 99 DT. */
export const FREE_DELIVERY_THRESHOLD_MILLIMES = 99_000;
export const FLAT_DELIVERY_FEE_MILLIMES = 7_000;

export function computeDeliveryFeeMillimes(netProductSubtotalMillimes: number): number {
  return FLAT_DELIVERY_FEE_MILLIMES;
}

/**
 * Returns the canonical 8-digit national number, or null when the input is not a valid Tunisian number.
 * Accepts "98 123 456", "98123456", "+216 98 123 456", "0021698123456", "216 98123456".
 */
export function normalizeTunisianLocalPhone(input?: string | null): string | null {
  if (!input) return null;
  let digits = String(input).replace(/\D/g, "");
  if (digits.startsWith("00216")) digits = digits.slice(5);
  else if (digits.length === 11 && digits.startsWith("216")) digits = digits.slice(3);
  return /^[2345679]\d{7}$/.test(digits) ? digits : null;
}

export function isGovernorate(value?: string | null): boolean {
  return !!value && (GOVERNORATES as readonly string[]).includes(value);
}

/** Meta Ads / Organic / Direct / Other — derived from stored attribution, never from personal data. */
export function classifyTrafficSource(c: {
  utmSource?: string | null;
  fbclid?: string | null;
  referrerHost?: string | null;
}): "Meta Ads" | "Organic" | "Direct" | "Autre" {
  const utm = (c.utmSource || "").toLowerCase();
  if (c.fbclid || ["facebook", "fb", "instagram", "ig", "meta"].includes(utm)) return "Meta Ads";
  if (utm) return "Autre";
  const ref = (c.referrerHost || "").toLowerCase();
  if (/(google|bing|duckduckgo|yahoo|ecosia)\./.test(ref)) return "Organic";
  return "Direct";
}
