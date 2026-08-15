// Lightweight cross-component invalidation for order counts/totals — no state
// management library, per CLAUDE.md §16 ("no global state library until a
// concrete cross-cutting need appears"). Fired after any order create/status
// change/delete; the sidebar badge, dashboard, and Rentabilité page each listen
// and refetch their own counts so nothing requires a manual page reload.
const ORDERS_CHANGED_EVENT = "paratunisie:orders-changed";

export function notifyOrdersChanged() {
  window.dispatchEvent(new Event(ORDERS_CHANGED_EVENT));
}

export function onOrdersChanged(handler: () => void) {
  window.addEventListener(ORDERS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(ORDERS_CHANGED_EVENT, handler);
}
