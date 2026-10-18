import test from "node:test";
import assert from "node:assert/strict";
import { aramexBucket, countAramexBuckets, matchesAramexFilter, matchesPeriod, type AramexFilter } from "../src/lib/order-filters.ts";

const ship = (trackingStatus: string | null) => ({ hawb: "H1", tracking: "T1", trackingStatus });
const FILTERS: AramexFilter[] = ["NOT_SHIPPED", "CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_ATTEMPT", "EXCEPTION", "RETURNING", "RETURNED", "CANCELLED", "PROBLEMS", "RETURNS"];

// Regression: the "Retours" card showed 6 (1 returning + 5 returned) but its filter only matched RETURNING → 1 row.
test("Retours card count equals the rows its filter returns (1 returning + 5 returned = 6)", () => {
  const orders = [
    { shipment: ship("RETURNING") },
    ...Array.from({ length: 5 }, () => ({ shipment: ship("RETURNED") })),
    { shipment: ship("DELIVERED") },
    { shipment: null },
  ];
  const counts = countAramexBuckets(orders);
  assert.equal(counts.returns, 6);
  assert.equal(orders.filter((o) => matchesAramexFilter(o.shipment, "RETURNS")).length, 6);
  assert.equal(orders.filter((o) => matchesAramexFilter(o.shipment, "RETURNING")).length, 1);
  assert.equal(orders.filter((o) => matchesAramexFilter(o.shipment, "RETURNED")).length, 5);
});

test("every counter equals the number of rows its filter shows, for every status", () => {
  const statuses = [null, "CREATED", "PICKED_UP", "PICKUP_REQUESTED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_ATTEMPT", "REFUSED", "EXCEPTION", "RETURN_REQUESTED", "RETURNING", "RETURNED", "CANCELLED", "SOMETHING_NEW"];
  const orders = [{ shipment: null }, ...statuses.map((s) => ({ shipment: ship(s) })), ...statuses.map((s) => ({ shipment: ship(s) }))];
  const c = countAramexBuckets(orders);
  const asCount = (f: AramexFilter) => (f === "PROBLEMS" ? c.problems : f === "RETURNS" ? c.returns : c[f as keyof typeof c]);
  for (const f of FILTERS) assert.equal(orders.filter((o) => matchesAramexFilter(o.shipment, f)).length, asCount(f), f);
});

test("buckets are mutually exclusive and cover every order", () => {
  const orders = ["DELIVERED", "RETURNED", "EXCEPTION", "WEIRD", null].map((s) => ({ shipment: ship(s) }));
  const c = countAramexBuckets(orders);
  const sum = c.NOT_SHIPPED + c.CREATED + c.IN_TRANSIT + c.OUT_FOR_DELIVERY + c.DELIVERED + c.DELIVERY_ATTEMPT + c.EXCEPTION + c.RETURNING + c.RETURNED + c.CANCELLED;
  assert.equal(sum, orders.length);
});

test("an order without HAWB/tracking is NOT_SHIPPED whatever the stale status", () => {
  assert.equal(aramexBucket({ hawb: null, tracking: null, trackingStatus: "DELIVERED" }), "NOT_SHIPPED");
});

test("period filter is actually applied", () => {
  const now = new Date("2026-10-18T12:00:00");
  assert.equal(matchesPeriod("2026-10-18T08:00:00", "today", now), true);
  assert.equal(matchesPeriod("2026-10-17T23:00:00", "today", now), false);
  assert.equal(matchesPeriod("2026-10-12T10:00:00", "week", now), true);
  assert.equal(matchesPeriod("2026-10-11T10:00:00", "week", now), false);
  assert.equal(matchesPeriod("2026-10-01T00:00:00", "month", now), true);
  assert.equal(matchesPeriod("2026-09-30T23:00:00", "month", now), false);
  assert.equal(matchesPeriod(undefined, "ALL", now), true);
});
