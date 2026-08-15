/**
 * Shared utilities for ParaTunisie monorepo.
 * Format helpers, validation, and common constants.
 */

export const FREE_DELIVERY_THRESHOLD = 99_000; // 99 DT in millimes
export const DELIVERY_FEE = 10_000; // 10 DT in millimes

export function formatPrice(millimes: number): string {
  return `${(millimes / 1000).toFixed(3)} DT`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const GOUVERNORATS = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia",
  "Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;
