import { OrderStatus } from "@prisma/client";
import { OrdersService } from "./orders.service";

// Regression tests for BUG 1/24 (sidebar "3" vs Commandes header "4"): both
// the sidebar badge and the Commandes page now read this single groupBy-backed
// endpoint, so they can no longer independently drift.
describe("OrdersService — getOrderCounts", () => {
  function buildService(groupByResult: { status: OrderStatus; _count: number }[]) {
    const groupByMock = jest.fn().mockResolvedValue(groupByResult);
    const prisma = { order: { groupBy: groupByMock } } as any;
    const inventory = {} as any;
    const notifications = { processOrderNotifications: jest.fn().mockResolvedValue(undefined) } as any;
    const metaCapi = { trackPurchase: jest.fn().mockResolvedValue({ success: true }) } as any;
    const loyalty = {
      awardOrderPoints: jest.fn().mockResolvedValue({}),
      reverseOrderPoints: jest.fn().mockResolvedValue({}),
      redeemPoints: jest.fn().mockResolvedValue({}),
    } as any;
    const abandonedCheckouts = {
      countAbandoned: jest.fn().mockResolvedValue(0),
      markConverted: jest.fn().mockResolvedValue(null),
    } as any;
    const service = new OrdersService(prisma, inventory, notifications, metaCapi, loyalty, abandonedCheckouts);
    return { service, groupByMock };
  }

  it("sums every real status into total, including one not otherwise called out (Test case: missing/unusual status not silently excluded)", async () => {
    const { service } = buildService([
      { status: OrderStatus.CONFIRMEE, _count: 1 },
      { status: OrderStatus.EN_ATTENTE, _count: 1 },
      { status: OrderStatus.TENTATIVE_CONTACT, _count: 1 },
      { status: OrderStatus.ANNULEE, _count: 1 },
    ]);

    const counts = await service.getOrderCounts();

    expect(counts.total).toBe(4);
    expect(counts.normal).toBe(4);
    expect(counts.byStatus.CONFIRMEE).toBe(1);
    expect(counts.byStatus.EN_ATTENTE).toBe(1);
    expect(counts.byStatus.TENTATIVE_CONTACT).toBe(1);
    expect(counts.byStatus.ANNULEE).toBe(1);
  });

  it("defaults every real OrderStatus to 0 in byStatus, even ones with no orders", async () => {
    const { service } = buildService([{ status: OrderStatus.CONFIRMEE, _count: 2 }]);
    const counts = await service.getOrderCounts();

    expect(counts.byStatus.LIVREE).toBe(0);
    expect(counts.byStatus.REFUSEE).toBe(0);
    expect(Object.keys(counts.byStatus).length).toBe(Object.values(OrderStatus).length);
  });

  it("honestly reports abandoned/deleted as 0 rather than inventing a fake bucket", async () => {
    const { service } = buildService([{ status: OrderStatus.CONFIRMEE, _count: 1 }]);
    const counts = await service.getOrderCounts();

    expect(counts.abandoned).toBe(0);
    expect(counts.deleted).toBe(0);
  });
});

// Cost-snapshot-at-confirmation regression tests (D-0026 / REQUIREMENTS.md §12/§21/§22).
describe("OrdersService — updateOrderStatus cost snapshot", () => {
  function buildService(order: { status: OrderStatus; items: { id: string; productVariantId: string; quantity?: number; unitCostMillimes: number | null }[] }) {
    const orderItemUpdateMock = jest.fn().mockResolvedValue({});
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(order),
        update: jest.fn().mockResolvedValue({}),
      },
      orderStatusHistory: { create: jest.fn().mockResolvedValue({}) },
      orderItem: { update: orderItemUpdateMock },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    } as any;
    const inventory = {
      reserveForOrder: jest.fn().mockResolvedValue(undefined),
      sellForOrder: jest.fn().mockResolvedValue(undefined),
      releaseReservationForOrder: jest.fn().mockResolvedValue(undefined),
      getWeightedAverageCost: jest.fn().mockResolvedValue(30_000),
    } as any;
    const notifications = { processOrderNotifications: jest.fn().mockResolvedValue(undefined) } as any;
    const metaCapi = { trackPurchase: jest.fn().mockResolvedValue({ success: true }) } as any;
    const loyalty = {
      awardOrderPoints: jest.fn().mockResolvedValue({}),
      reverseOrderPoints: jest.fn().mockResolvedValue({}),
      redeemPoints: jest.fn().mockResolvedValue({}),
    } as any;
    const abandonedCheckouts = {
      countAbandoned: jest.fn().mockResolvedValue(0),
      markConverted: jest.fn().mockResolvedValue(null),
    } as any;
    const service = new OrdersService(prisma, inventory, notifications, metaCapi, loyalty, abandonedCheckouts);
    return { service, prisma, inventory, orderItemUpdateMock };
  }

  // Test case 7: new confirmed order → purchase-cost snapshot saved.
  it("snapshots unitCostMillimes from the current weighted-average cost when an order is confirmed", async () => {
    const { service, orderItemUpdateMock, inventory } = buildService({
      status: OrderStatus.EN_ATTENTE,
      items: [{ id: "item-1", productVariantId: "variant-1", quantity: 1, unitCostMillimes: null }],
    });

    await service.updateOrderStatus("order-1", OrderStatus.CONFIRMEE, "staff-1");

    expect(inventory.getWeightedAverageCost).toHaveBeenCalledWith("variant-1");
    expect(orderItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { unitCostMillimes: 30_000, costIsEstimated: false },
    });
  });

  // Test case 6: product's current purchase cost changes after confirmation →
  // the historical snapshot must remain unchanged. Simulated here by an item
  // that already has a snapshot when a (hypothetical) re-confirmation runs —
  // the snapshot step must be a no-op, never overwriting a real value.
  it("never overwrites an existing cost snapshot", async () => {
    const { service, orderItemUpdateMock } = buildService({
      status: OrderStatus.TENTATIVE_CONTACT,
      items: [{ id: "item-1", productVariantId: "variant-1", quantity: 1, unitCostMillimes: 25_000 }],
    });

    await service.updateOrderStatus("order-1", OrderStatus.CONFIRMEE, "staff-1");

    // getWeightedAverageCost may have changed to 30_000 by now, but since the
    // item already has unitCostMillimes: 25_000, the snapshot step must skip it.
    expect(orderItemUpdateMock).not.toHaveBeenCalled();
  });
});
