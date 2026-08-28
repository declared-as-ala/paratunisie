/**
 * Google Ads Conversion Tracking (gtag.js)
 * Supports dynamic ecommerce values, currency TND, transaction_id deduplication,
 * and robust guards against React StrictMode / page refreshes.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GOOGLE_ADS_ID = "AW-18415809993";
export const DEFAULT_PURCHASE_CONVERSION_SEND_TO = "AW-18415809993/ht1fCMLgzOkcEMnrq81E";

export function getGoogleAdsPurchaseSendTo(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_ID ||
    DEFAULT_PURCHASE_CONVERSION_SEND_TO
  );
}

// In-memory guard against React Strict Mode and rapid component re-renders
const firedGoogleAdsPurchases = new Set<string>();

export interface GoogleAdsPurchaseData {
  orderId: string;
  totalTnd: number;
  orderNumber?: string;
  items?: Array<{
    productId?: string;
    name?: string;
    quantity?: number;
    priceMillimes?: number;
  }>;
}

/**
 * Check if gtag or dataLayer is available in browser context.
 */
function isGtagReady(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.gtag === "function" || Array.isArray(window.dataLayer);
}

/**
 * Fires the Google Ads Purchase conversion event only after an order is confirmed by backend.
 * Features strict deduplication via in-memory Set and sessionStorage.
 */
export function trackGoogleAdsPurchase(data: GoogleAdsPurchaseData): void {
  if (!data?.orderId || typeof data.totalTnd !== "number" || isNaN(data.totalTnd)) {
    return;
  }

  const transactionId = data.orderNumber || data.orderId;
  const storageKey = `gads_purchase_${data.orderId}`;

  // 1. In-memory deduplication check (prevents double-firing in React Strict Mode & re-renders)
  if (firedGoogleAdsPurchases.has(data.orderId)) {
    return;
  }

  // 2. Persistent sessionStorage check (prevents duplicate conversions if page is refreshed)
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    }
  } catch {
    // Ignore storage quota/security errors in private browsing
  }

  firedGoogleAdsPurchases.add(data.orderId);

  const sendTo = getGoogleAdsPurchaseSendTo();
  const value = Number(data.totalTnd.toFixed(3));
  const currency = "TND";

  const eventPayload = {
    send_to: sendTo,
    value: value,
    currency: currency,
    transaction_id: transactionId,
  };

  // Dispatch via window.gtag or fallback to window.dataLayer.push
  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", eventPayload);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(["event", "conversion", eventPayload]);
    }
  }

  // Development-only logging
  if (
    process.env.NODE_ENV !== "production" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"))
  ) {
    console.log("🎯 [Google Ads] Purchase conversion fired:", {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      send_to: sendTo,
    });
  }
}
