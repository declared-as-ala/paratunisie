/**
 * First-party Lead Recovery & Abandoned Checkout Tracker
 * Debounces draft saves, guarantees single-record upserts per checkout session,
 * and handles modal closing / page unload events reliably via sendBeacon / keepalive.
 */

function getApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://paratunisie.com/api/v1";
}

export interface CheckoutDraftItem {
  productId?: string;
  name?: string;
  image?: string;
  variantLabel?: string;
  quantity: number;
  priceMillimes: number;
}

export type CheckoutSource = "CHECKOUT_PAGE" | "BUY_NOW_MODAL" | "PACK_ANTI_STRESS" | "LANDING_PAGE";

export interface CheckoutDraftPayload {
  source: CheckoutSource;
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
export function getCheckoutSessionId(source: CheckoutSource): string {
  if (typeof window === "undefined") return `chk_${Date.now()}`;
  const key = `_pt_chk_sid_${source}`;
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    const prefix = source === "BUY_NOW_MODAL" ? "bn" : source === "PACK_ANTI_STRESS" ? "pas" : "co";
    sid = `chk_${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

/**
 * Reset checkout session after successful order confirmation.
 */
export function resetCheckoutSession(source: CheckoutSource): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`_pt_chk_sid_${source}`);
}

function hasAnyUsefulLeadInfo(payload: CheckoutDraftPayload): boolean {
  const cleanPhone = (payload.phone || "").replace(/\D/g, "");
  const hasPhone = cleanPhone.length >= 6;
  const hasName = Boolean(payload.customerName && payload.customerName.trim().length >= 2);
  const hasEmail = Boolean(payload.email && payload.email.trim().length >= 4);
  const hasAddress = Boolean(payload.fullAddress && payload.fullAddress.trim().length >= 3);
  const hasGouv = Boolean(payload.gouvernorat && payload.gouvernorat.trim().length >= 2);
  return hasPhone || hasName || hasEmail || hasAddress || hasGouv;
}

function sendDraftPayload(payload: CheckoutDraftPayload, status: "DRAFT" | "ABANDONED" = "DRAFT") {
  const checkoutSessionId = getCheckoutSessionId(payload.source);
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
    sourceUrl: payload.sourceUrl || (typeof window !== "undefined" ? window.location.href : undefined),
    status,
  });

  const url = `${getApiBase()}/abandoned-checkouts/draft`;

  try {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

/**
 * Immediate draft saving without debounce (e.g. on blur, close, or submit start).
 */
export function saveCheckoutDraftImmediate(payload: CheckoutDraftPayload, status: "DRAFT" | "ABANDONED" = "DRAFT"): void {
  if (typeof window === "undefined") return;
  if (!hasAnyUsefulLeadInfo(payload)) return;

  const source = payload.source;
  if (debounceTimers[source]) {
    clearTimeout(debounceTimers[source]);
    delete debounceTimers[source];
  }

  sendDraftPayload(payload, status);
}

/**
 * Debounced draft saving (300ms).
 */
export function saveCheckoutDraft(payload: CheckoutDraftPayload): void {
  if (typeof window === "undefined") return;
  if (!hasAnyUsefulLeadInfo(payload)) return;

  const source = payload.source;
  if (debounceTimers[source]) {
    clearTimeout(debounceTimers[source]);
  }

  debounceTimers[source] = setTimeout(() => {
    delete debounceTimers[source];
    sendDraftPayload(payload, "DRAFT");
  }, 300);
}

/**
 * Mark current checkout draft as ABANDONED (e.g. when modal is closed or user unloads page).
 */
export function markCheckoutAbandoned(source: CheckoutSource): void {
  if (typeof window === "undefined") return;

  const key = `_pt_chk_sid_${source}`;
  const checkoutSessionId = sessionStorage.getItem(key);
  if (!checkoutSessionId) return;

  const payload = JSON.stringify({ checkoutSessionId });
  const url = `${getApiBase()}/abandoned-checkouts/mark-abandoned`;

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
