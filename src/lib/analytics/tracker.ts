/**
 * First-Party Analytics Client Tracker for ParaTunisie
 * Lightweight, non-blocking, privacy-conscious tracking.
 */

const VISITOR_COOKIE_NAME = "_pa_vid";
const SESSION_COOKIE_NAME = "_pa_sid";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes sliding session

export interface TrackingEventPayload {
  eventType:
    | "PAGE_VIEW"
    | "PRODUCT_VIEW"
    | "CATEGORY_VIEW"
    | "SEARCH"
    | "ADD_TO_CART"
    | "REMOVE_FROM_CART"
    | "BEGIN_CHECKOUT"
    | "PURCHASE"
    | "CUSTOM";
  pageUrl?: string;
  pagePath?: string;
  pageType?: string;
  pageTitle?: string;
  timeOnPageSeconds?: number;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  orderId?: string;
  searchKeyword?: string;
  searchResultsCount?: number;
  priceMillimes?: number;
  quantity?: number;
  metadata?: Record<string, any>;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getVisitorId(): string {
  let vid = getCookie(VISITOR_COOKIE_NAME);
  if (!vid && typeof localStorage !== "undefined") {
    vid = localStorage.getItem(VISITOR_COOKIE_NAME) || undefined;
  }
  if (!vid) {
    vid = `v_${generateUuid()}`;
  }
  // Store for 1 year (365 days)
  setCookie(VISITOR_COOKIE_NAME, vid, 365 * 24 * 60 * 60);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(VISITOR_COOKIE_NAME, vid);
  }
  return vid;
}

export function getSessionToken(): string {
  let sid = getCookie(SESSION_COOKIE_NAME);
  if (!sid) {
    sid = `s_${generateUuid()}`;
  }
  // Sliding 30-minute expiration
  setCookie(SESSION_COOKIE_NAME, sid, 30 * 60);
  return sid;
}

function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
    const val = params.get(key);
    if (val) utms[key] = val;
  });
  return utms;
}

/**
 * Dispatches an analytics event to the backend asynchronously without blocking user actions.
 */
export function trackEvent(payload: TrackingEventPayload) {
  if (typeof window === "undefined") return;

  try {
    const visitorId = getVisitorId();
    const sessionToken = getSessionToken();
    const utms = getUtmParams();

    const body = JSON.stringify({
      visitorId,
      sessionToken,
      eventType: payload.eventType,
      pageUrl: payload.pageUrl || window.location.href,
      pagePath: payload.pagePath || window.location.pathname,
      pageType: payload.pageType,
      pageTitle: payload.pageTitle || document.title,
      timeOnPageSeconds: payload.timeOnPageSeconds,
      productId: payload.productId,
      categoryId: payload.categoryId,
      brandId: payload.brandId,
      orderId: payload.orderId,
      searchKeyword: payload.searchKeyword,
      searchResultsCount: payload.searchResultsCount,
      priceMillimes: payload.priceMillimes,
      quantity: payload.quantity,
      referrer: document.referrer || undefined,
      utmSource: utms.utm_source,
      utmMedium: utms.utm_medium,
      utmCampaign: utms.utm_campaign,
      utmContent: utms.utm_content,
      utmTerm: utms.utm_term,
      metadata: payload.metadata,
    });

    const endpoint = "/api/v1/analytics/collect";

    // Use sendBeacon when available for reliable background transmission
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Non-blocking: analytics errors never impact storefront experience
      });
    }
  } catch {
    // Fail silently in browser
  }
}

/**
 * Convenient helper functions
 */

export function trackProductView(product: {
  id: string;
  name: string;
  priceMillimes?: number;
  categoryId?: string;
  brandId?: string;
}) {
  trackEvent({
    eventType: "PRODUCT_VIEW",
    pageType: "product",
    productId: product.id,
    pageTitle: product.name,
    priceMillimes: product.priceMillimes,
    categoryId: product.categoryId,
    brandId: product.brandId,
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  priceMillimes?: number;
  quantity?: number;
}) {
  trackEvent({
    eventType: "ADD_TO_CART",
    pageType: "product",
    productId: product.id,
    pageTitle: product.name,
    priceMillimes: product.priceMillimes,
    quantity: product.quantity || 1,
  });
}

export function trackRemoveFromCart(product: {
  id: string;
  name: string;
  priceMillimes?: number;
  quantity?: number;
}) {
  trackEvent({
    eventType: "REMOVE_FROM_CART",
    pageType: "cart",
    productId: product.id,
    pageTitle: product.name,
    priceMillimes: product.priceMillimes,
    quantity: product.quantity || 1,
  });
}

export function trackSearch(keyword: string, resultsCount: number) {
  if (!keyword || !keyword.trim()) return;
  trackEvent({
    eventType: "SEARCH",
    pageType: "search",
    searchKeyword: keyword.trim().toLowerCase(),
    searchResultsCount: resultsCount,
  });
}

export function trackBeginCheckout(itemCount: number, totalTnd: number) {
  trackEvent({
    eventType: "BEGIN_CHECKOUT",
    pageType: "checkout",
    quantity: itemCount,
    priceMillimes: Math.round(totalTnd * 1000),
  });
}

export function trackPurchase(orderId: string, totalTnd: number, itemCount?: number) {
  trackEvent({
    eventType: "PURCHASE",
    pageType: "checkout",
    orderId,
    quantity: itemCount,
    priceMillimes: Math.round(totalTnd * 1000),
  });
}
