/**
 * Meta Pixel Standard Ecommerce Tracking Helper
 * Provides client-safe, deduplicated tracking for Meta Pixel (Facebook Pixel).
 * Configured for Meta Conversions API (CAPI) deduplication via shared eventID.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

// In-memory set to prevent duplicate event dispatches during React re-renders/Strict Mode
const firedEvents = new Set<string>();

export function getMetaCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function isFbqAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function debugLog(eventName: string, data: Record<string, unknown>, eventId?: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Meta Pixel] ${eventName} sent:`, { ...data, eventID: eventId });
  }
}

/**
 * Non-blocking relay of standard browser events to Server CAPI endpoint for complete dual tracking.
 */
function relayServerEvent(eventName: string, eventId: string, customData?: Record<string, any>) {
  if (typeof window === "undefined") return;

  const fbp = getMetaCookie("_fbp");
  const fbc = getMetaCookie("_fbc");

  fetch("/api/v1/tracking/meta-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      customData,
      userData: { fbp, fbc },
    }),
  }).catch(() => {
    // Non-blocking: Server CAPI failure will never impact browser experience
  });
}

export interface MetaProductPayload {
  id: string;
  name: string;
  priceMillimes: number;
  category?: string;
  brand?: string;
}

export interface MetaCartItemPayload {
  productId: string;
  name: string;
  quantity: number;
  priceMillimes: number;
  category?: string;
  brand?: string;
}

export interface MetaCheckoutPayload {
  items: Array<{
    productId: string;
    name?: string;
    quantity: number;
    priceMillimes?: number;
    priceTnd?: number;
  }>;
  totalTnd: number;
}

export interface MetaPurchasePayload {
  orderId: string;
  orderNumber?: string;
  totalTnd: number;
  items: Array<{
    productId: string;
    name?: string;
    quantity: number;
    priceMillimes?: number;
    priceTnd?: number;
  }>;
}

/**
 * Track ViewContent event when a customer views a product detail page.
 */
export function trackViewContent(product: MetaProductPayload, customEventId?: string): void {
  if (!isFbqAvailable() || !product?.id) return;

  const eventId = customEventId || `vc_${product.id}`;
  if (firedEvents.has(eventId)) {
    return;
  }
  firedEvents.add(eventId);

  const priceTnd = Number((product.priceMillimes / 1000).toFixed(3));
  const payload = {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    content_category: product.category || undefined,
    value: priceTnd,
    currency: "TND",
  };

  try {
    window.fbq!("track", "ViewContent", payload, { eventID: eventId });
    debugLog("ViewContent", payload, eventId);
    relayServerEvent("ViewContent", eventId, payload);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Meta Pixel] ViewContent error:", err);
    }
  }
}

/**
 * Track AddToCart event when a product is added to the cart.
 */
export function trackAddToCart(item: MetaCartItemPayload, customEventId?: string): void {
  if (!isFbqAvailable() || !item?.productId) return;

  const unitPriceTnd = Number((item.priceMillimes / 1000).toFixed(3));
  const totalPriceTnd = Number(((item.priceMillimes * item.quantity) / 1000).toFixed(3));
  const eventId = customEventId || `atc_${item.productId}_${Date.now()}`;

  const payload = {
    content_ids: [String(item.productId)],
    content_name: item.name,
    content_type: "product",
    content_category: item.category || undefined,
    value: totalPriceTnd,
    currency: "TND",
    contents: [
      {
        id: String(item.productId),
        quantity: item.quantity,
        item_price: unitPriceTnd,
      },
    ],
  };

  try {
    window.fbq!("track", "AddToCart", payload, { eventID: eventId });
    debugLog("AddToCart", payload, eventId);
    relayServerEvent("AddToCart", eventId, payload);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Meta Pixel] AddToCart error:", err);
    }
  }
}

/**
 * Track InitiateCheckout event when the customer proceeds to checkout.
 */
export function trackInitiateCheckout(data: MetaCheckoutPayload, customEventId?: string): void {
  if (!isFbqAvailable() || !data?.items?.length) return;

  const eventId = customEventId || `ic_${data.items.map((i) => i.productId).sort().join("-")}`;
  if (firedEvents.has(eventId)) {
    return;
  }
  firedEvents.add(eventId);

  const numItems = data.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const contents = data.items.map((i) => {
    const unitPrice =
      i.priceTnd !== undefined
        ? Number(i.priceTnd.toFixed(3))
        : Number(((i.priceMillimes || 0) / 1000).toFixed(3));
    return {
      id: String(i.productId),
      quantity: i.quantity || 1,
      item_price: unitPrice,
    };
  });

  const payload = {
    content_ids: data.items.map((i) => String(i.productId)),
    contents,
    num_items: numItems,
    value: Number(data.totalTnd.toFixed(3)),
    currency: "TND",
  };

  try {
    window.fbq!("track", "InitiateCheckout", payload, { eventID: eventId });
    debugLog("InitiateCheckout", payload, eventId);
    relayServerEvent("InitiateCheckout", eventId, payload);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Meta Pixel] InitiateCheckout error:", err);
    }
  }
}

/**
 * Track Purchase event ONLY after an order has been successfully created/confirmed.
 * Features strict deduplication using in-memory Set & sessionStorage.
 */
export function trackPurchase(data: MetaPurchasePayload, customEventId?: string): void {
  if (!isFbqAvailable() || !data?.orderId) return;

  const eventId = customEventId || `purchase_${data.orderId}`;
  const storageKey = `meta_pixel_purchase_${data.orderId}`;

  // Check in-memory guard
  if (firedEvents.has(eventId)) {
    return;
  }

  // Check persistent session storage guard against page refresh / duplicate order mounts
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    }
  } catch {}

  firedEvents.add(eventId);

  const numItems = data.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const contents = data.items.map((i) => {
    const unitPrice =
      i.priceTnd !== undefined
        ? Number(i.priceTnd.toFixed(3))
        : Number(((i.priceMillimes || 0) / 1000).toFixed(3));
    return {
      id: String(i.productId),
      quantity: i.quantity || 1,
      item_price: unitPrice,
    };
  });

  const payload = {
    content_ids: data.items.map((i) => String(i.productId)),
    contents,
    num_items: numItems,
    value: Number(data.totalTnd.toFixed(3)),
    currency: "TND",
    order_id: data.orderNumber || data.orderId,
  };

  try {
    window.fbq!("track", "Purchase", payload, { eventID: eventId });
    debugLog("Purchase", payload, eventId);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Meta Pixel] Purchase error:", err);
    }
  }
}
