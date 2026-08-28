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
 * Fires the Google Ads Purchase conversion event only after an order is confirmed by backend.
 * Features strict deduplication via:
 * 1. Global window Set (__gads_purchases)
 * 2. Module-level in-memory Set (firedGoogleAdsPurchases)
 * 3. Browser sessionStorage (gads_purchase_<id>)
 */
export function trackGoogleAdsPurchase(data: GoogleAdsPurchaseData): void {
  if (!data?.orderId || typeof data.totalTnd !== "number" || isNaN(data.totalTnd) || data.totalTnd <= 0) {
    return;
  }

  const transactionId = data.orderNumber || data.orderId;
  const orderKey = data.orderId;
  const storageKey = `gads_purchase_${orderKey}`;

  // 1. Check Global Window Guard (survives any module re-evaluations or React Strict Mode)
  if (typeof window !== "undefined") {
    (window as any).__gads_purchases = (window as any).__gads_purchases || new Set<string>();
    if (
      (window as any).__gads_purchases.has(orderKey) ||
      (window as any).__gads_purchases.has(transactionId)
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ [Google Ads] Duplicate purchase conversion blocked by window guard:", transactionId);
      }
      return;
    }
  }

  // 2. Check Module-level in-memory Set
  if (firedGoogleAdsPurchases.has(orderKey) || firedGoogleAdsPurchases.has(transactionId)) {
    return;
  }

  // 3. Persistent sessionStorage check (prevents duplicate conversions if page is refreshed or reopened)
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      if (sessionStorage.getItem(storageKey) || sessionStorage.getItem(`gads_tx_${transactionId}`)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("⚠️ [Google Ads] Duplicate purchase conversion blocked by sessionStorage:", transactionId);
        }
        return;
      }
      sessionStorage.setItem(storageKey, "1");
      sessionStorage.setItem(`gads_tx_${transactionId}`, "1");
    }
  } catch {
    // Ignore storage quota/security errors in private browsing
  }

  // Register in guards immediately before dispatch
  firedGoogleAdsPurchases.add(orderKey);
  firedGoogleAdsPurchases.add(transactionId);
  if (typeof window !== "undefined") {
    (window as any).__gads_purchases.add(orderKey);
    (window as any).__gads_purchases.add(transactionId);
  }

  const sendTo = getGoogleAdsPurchaseSendTo();
  const value = Number(data.totalTnd.toFixed(3));
  const currency = "TND";

  const eventPayload = {
    send_to: sendTo,
    value: value,
    currency: currency,
    transaction_id: transactionId,
  };

  // Dispatch EXACTLY ONCE via window.gtag or fallback to window.dataLayer
  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", eventPayload);
    } else if (Array.isArray(window.dataLayer)) {
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
    console.log("🎯 [Google Ads] Purchase conversion fired (EXACTLY ONCE):", {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      send_to: sendTo,
    });
  }
}
