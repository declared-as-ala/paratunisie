/**
 * First-party Lead Recovery & Abandoned Checkout Tracker
 * Debounces draft saves, guarantees single-record upserts per checkout session,
 * and handles modal closing / page unload events reliably via sendBeacon / keepalive.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://paratunisie.com/api/v1";

export interface CheckoutDraftItem {
  productId?: string;
  name?: string;
  image?: string;
  variantLabel?: string;
  quantity: number;
  priceMillimes: number;
}

export interface CheckoutDraftPayload {
  source: "CHECKOUT_PAGE" | "BUY_NOW_MODAL";
  customerName?: string;
  phone?: string;
  email?: string;
  gouvernorat?: string;
  fullAddress?: string;
  deliveryNote?: string;
  items: CheckoutDraftItem[];
  subtotalMillimes?: number;
  shippingFeeMillimes?: number;
  totalMillimes?: number;
  sourceUrl?: string;
}

// In-memory timers for debounce per source
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Get or create a consistent checkoutSessionId for the current browser session.
 */
export function getCheckoutSessionId(source: "CHECKOUT_PAGE" | "BUY_NOW_MODAL"): string {
  if (typeof window === "undefined") return `chk_${Date.now()}`;
  const key = `_pt_chk_sid_${source}`;
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `chk_${source === "BUY_NOW_MODAL" ? "bn" : "co"}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

/**
 * Reset checkout session after successful order confirmation.
 */
export function resetCheckoutSession(source: "CHECKOUT_PAGE" | "BUY_NOW_MODAL"): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`_pt_chk_sid_${source}`);
}

/**
 * Debounced draft saving (1.5 seconds).
 * Only saves if phone has at least 8 digits.
 */
export function saveCheckoutDraft(payload: CheckoutDraftPayload): void {
  if (typeof window === "undefined") return;

  const cleanPhone = (payload.phone || "").replace(/\D/g, "");
  // Do not record if no valid phone exists
  if (cleanPhone.length < 8) return;

  const source = payload.source;
  if (debounceTimers[source]) {
    clearTimeout(debounceTimers[source]);
  }

  debounceTimers[source] = setTimeout(() => {
    const checkoutSessionId = getCheckoutSessionId(source);
    const body = JSON.stringify({
      checkoutSessionId,
      customerName: payload.customerName?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      gouvernorat: payload.gouvernorat?.trim() || undefined,
      fullAddress: payload.fullAddress?.trim() || undefined,
      deliveryNote: payload.deliveryNote?.trim() || undefined,
      items: payload.items,
      subtotalMillimes: payload.subtotalMillimes,
      shippingFeeMillimes: payload.shippingFeeMillimes,
      totalMillimes: payload.totalMillimes,
      source: payload.source,
      sourceUrl: payload.sourceUrl || window.location.href,
      status: "DRAFT",
    });

    try {
      fetch(`${API_BASE}/abandoned-checkouts/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Non-blocking silently catch network errors
      });
    } catch {}
  }, 1200);
}

/**
 * Mark current checkout draft as ABANDONED (e.g. when modal is closed or user unloads page).
 */
export function markCheckoutAbandoned(source: "CHECKOUT_PAGE" | "BUY_NOW_MODAL"): void {
  if (typeof window === "undefined") return;

  const key = `_pt_chk_sid_${source}`;
  const checkoutSessionId = sessionStorage.getItem(key);
  if (!checkoutSessionId) return;

  const payload = JSON.stringify({ checkoutSessionId });
  const url = `${API_BASE}/abandoned-checkouts/mark-abandoned`;

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(url, blob);
  } else {
    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
}
