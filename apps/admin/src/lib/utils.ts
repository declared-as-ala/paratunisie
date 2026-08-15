import { type ClassValue, clsx } from "clsx";
import type { MarginInfo } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat("fr-TN", {
      style: "decimal",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount) + " DT"
  );
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000) {
    return (
      new Intl.NumberFormat("fr-TN", {
        style: "decimal",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(amount) + " kDT"
    );
  }
  return formatCurrency(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("fr-TN", {
    style: "decimal",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + " %";
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return formatDateShort(date);
}

/* ─── Margin calculations (REQUIREMENTS.md §B) ─────────────────────────── */

export function calculateMargin(
  costPrice: number,
  sellingPrice: number,
  promoPrice?: number
): MarginInfo {
  const effectivePrice = promoPrice && promoPrice < sellingPrice ? promoPrice : sellingPrice;
  const margeBrute = effectivePrice - costPrice;
  const tauxMarge = costPrice > 0 ? (margeBrute / costPrice) * 100 : 0;
  const tauxMarque = effectivePrice > 0 ? (margeBrute / effectivePrice) * 100 : 0;

  return {
    costPrice,
    sellingPrice,
    promoPrice,
    margeBrute,
    tauxMarge,
    tauxMarque,
  };
}

export function marginWarningClass(margin: MarginInfo): string {
  if (margin.margeBrute <= 0) return "text-danger";
  if (margin.tauxMarque < 15) return "text-warning";
  return "text-success";
}
