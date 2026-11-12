// Single source of truth for the Commandes list: summary cards, dropdown counters and the table
// all derive from the same bucket classifier, so a counter can never disagree with its rows.

export type ShipmentLike = {
  hawb?: string | null;
  tracking?: string | null;
  trackingStatus?: string | null;
} | null | undefined;

export type AramexBucket =
  | "NOT_SHIPPED"
  | "CREATED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_ATTEMPT"
  | "EXCEPTION"
  | "RETURNING"
  | "RETURNED"
  | "CANCELLED";

// Cards / dropdown entries that aggregate several buckets.
export const AGGREGATE_FILTERS = {
  PROBLEMS: ["DELIVERY_ATTEMPT", "EXCEPTION"],
  RETURNS: ["RETURNING", "RETURNED"],
} as const satisfies Record<string, readonly AramexBucket[]>;

export type AramexFilter = "ALL" | AramexBucket | keyof typeof AGGREGATE_FILTERS;

/** Each order falls in exactly ONE bucket. */
export function aramexBucket(shipment: ShipmentLike): AramexBucket {
  if (!shipment || (!shipment.hawb && !shipment.tracking)) return "NOT_SHIPPED";
  const s = (shipment.trackingStatus || "").toUpperCase();
  switch (s) {
    case "DELIVERED":
      return "DELIVERED";
    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";
    case "IN_TRANSIT":
    case "PICKED_UP":
    case "PICKUP_REQUESTED":
      return "IN_TRANSIT";
    case "DELIVERY_ATTEMPT":
    case "REFUSED":
      return "DELIVERY_ATTEMPT";
    case "EXCEPTION":
      return "EXCEPTION";
    case "RETURN_REQUESTED":
    case "RETURNING":
      return "RETURNING";
    case "RETURNED":
      return "RETURNED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "CREATED"; // CREATED or any not-yet-mapped carrier status
  }
}

export type AramexCounts = Record<AramexBucket, number> & { problems: number; returns: number; total: number };

export function countAramexBuckets(orders: { shipment?: ShipmentLike }[]): AramexCounts {
  const c: AramexCounts = {
    NOT_SHIPPED: 0, CREATED: 0, IN_TRANSIT: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0,
    DELIVERY_ATTEMPT: 0, EXCEPTION: 0, RETURNING: 0, RETURNED: 0, CANCELLED: 0,
    problems: 0, returns: 0, total: orders.length,
  };
  for (const o of orders) c[aramexBucket(o.shipment)]++;
  c.problems = c.DELIVERY_ATTEMPT + c.EXCEPTION;
  c.returns = c.RETURNING + c.RETURNED;
  return c;
}

export function matchesAramexFilter(shipment: ShipmentLike, filter: AramexFilter): boolean {
  if (filter === "ALL") return true;
  const bucket = aramexBucket(shipment);
  if (filter in AGGREGATE_FILTERS) {
    return (AGGREGATE_FILTERS[filter as keyof typeof AGGREGATE_FILTERS] as readonly AramexBucket[]).includes(bucket);
  }
  return bucket === filter;
}

export type PeriodFilter = "ALL" | "today" | "week" | "month";

export function matchesPeriod(createdAt: string | number | Date | undefined, period: string, now: Date = new Date()): boolean {
  if (period === "ALL" || !period) return true;
  if (!createdAt) return false;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return false;
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "today") return d >= startOfDay;
  if (period === "week") return d >= new Date(startOfDay.getTime() - 6 * 86_400_000);
  if (period === "month") return d >= new Date(now.getFullYear(), now.getMonth(), 1);
  return true;
}
