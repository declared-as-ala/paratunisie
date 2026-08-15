export type MerchandisingEventName =
  | "homepage_section_view"
  | "homepage_product_click"
  | "homepage_add_to_cart"
  | "homepage_routine_add"
  | "cart_cross_sell_add"
  | "search_autocomplete_click";

export interface MerchandisingEventPayload {
  sectionKey?: string;
  productId?: string;
  productName?: string;
  query?: string;
  itemCount?: number;
  totalPrice?: number;
}

export function logMerchandisingEvent(
  eventName: MerchandisingEventName,
  payload?: MerchandisingEventPayload
) {
  if (typeof window === "undefined") return;

  // In production, this dispatches to analytics endpoint / GTM / Mixpanel
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Telemetry] ${eventName}`, payload ?? {});
  }
}
