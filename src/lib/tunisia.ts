/** Tunisian checkout rules shared by landing pages (mirror of apps/api/src/common/tunisia.ts). */

export const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan",
  "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", "Monastir", "Nabeul",
  "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

/** Arabic display names, same order as GOVERNORATES. The API value stays the canonical French spelling. */
export const GOVERNORATE_LABELS_AR: Record<(typeof GOVERNORATES)[number], string> = {
  Ariana: "أريانة", "Béja": "باجة", "Ben Arous": "بن عروس", Bizerte: "بنزرت", "Gabès": "قابس", Gafsa: "قفصة",
  Jendouba: "جندوبة", Kairouan: "القيروان", Kasserine: "القصرين", "Kébili": "قبلي", Kef: "الكاف", Mahdia: "المهدية",
  Manouba: "منوبة", "Médenine": "مدنين", Monastir: "المنستير", Nabeul: "نابل", Sfax: "صفاقس", "Sidi Bouzid": "سيدي بوزيد",
  Siliana: "سليانة", Sousse: "سوسة", Tataouine: "تطاوين", Tozeur: "توزر", Tunis: "تونس", Zaghouan: "زغوان",
};

export const FLAT_DELIVERY_FEE_MILLIMES = 7_000;

/** Documented policy (/livraison): flat 7 DT on every order. The server applies the same rule. */
export function deliveryFeeMillimes(_subtotalMillimes: number): number {
  return FLAT_DELIVERY_FEE_MILLIMES;
}

/** 8-digit national number, or null if the input is not a valid Tunisian number. */
export function normalizeTunisianPhone(input: string): string | null {
  let digits = (input || "").replace(/\D/g, "");
  if (digits.startsWith("00216")) digits = digits.slice(5);
  else if (digits.length === 11 && digits.startsWith("216")) digits = digits.slice(3);
  return /^[2345679]\d{7}$/.test(digits) ? digits : null;
}

export function formatDT(millimes: number): string {
  const dt = millimes / 1000;
  return `${Number.isInteger(dt) ? dt : dt.toFixed(3).replace(/\.?0+$/, "")} DT`;
}
