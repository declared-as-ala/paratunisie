import { OrderStatus } from "@prisma/client";
import { ProfitabilityService } from "./profitability.service";

// Light service-level tests using a stubbed PrismaService — no real database.
describe("ProfitabilityService — filtering", () => {
  function buildService(groupByResult: { status: OrderStatus; _count: number }[] = []) {
    const findManyMock = jest.fn().mockResolvedValue([]);
    const groupByMock = jest.fn().mockResolvedValue(groupByResult);
    const countMock = jest.fn().mockResolvedValue(0);
    const transactionMock = jest.fn().mockResolvedValue([[], 0]);
    const prisma = {
      order: { findMany: findManyMock, groupBy: groupByMock, count: countMock },
      $transaction: transactionMock,
    } as any;
    const inventory = { getWeightedAverageCost: jest.fn() } as any;
    const service = new ProfitabilityService(prisma, inventory);
    return { service, findManyMock, groupByMock, transactionMock };
  }

  // Test case 2 & 3: default statuses must be CONFIRMEE only — EN_ATTENTE,
  // TENTATIVE_CONTACT, ANNULEE and REFUSEE are excluded unless explicitly requested.
  it("defaults to CONFIRMEE only when no statuses are provided", async () => {
    const { service, findManyMock } = buildService();
    const from = new Date("2026-08-01T00:00:00.000Z");
    const to = new Date("2026-08-13T23:59:59.000Z");

    await service.getOverview(from, to, undefined);

    const callArgs = findManyMock.mock.calls[0][0];
    expect(callArgs.where.status.in).toEqual([OrderStatus.CONFIRMEE]);
    expect(callArgs.where.status.in).not.toContain(OrderStatus.EN_ATTENTE);
    expect(callArgs.where.status.in).not.toContain(OrderStatus.TENTATIVE_CONTACT);
    expect(callArgs.where.status.in).not.toContain(OrderStatus.ANNULEE);
    expect(callArgs.where.status.in).not.toContain(OrderStatus.REFUSEE);
  });

  it("honors an explicit CONFIRMEE + LIVREE status scope", async () => {
    const { service, findManyMock } = buildService();
    await service.getOverview(new Date(), new Date(), [OrderStatus.CONFIRMEE, OrderStatus.LIVREE]);

    const callArgs = findManyMock.mock.calls[0][0];
    expect(callArgs.where.status.in).toEqual([OrderStatus.CONFIRMEE, OrderStatus.LIVREE]);
  });

  // Test case 9: the requested date range is forwarded to the query, not silently
  // widened or narrowed.
  it("passes the requested date range through to the query filter", async () => {
    const { service, findManyMock } = buildService();
    const from = new Date("2026-07-01T00:00:00.000Z");
    const to = new Date("2026-07-31T23:59:59.000Z");

    await service.getOverview(from, to, undefined);

    const callArgs = findManyMock.mock.calls[0][0];
    expect(callArgs.where.createdAt.gte).toBe(from);
    expect(callArgs.where.createdAt.lte).toBe(to);
  });

  // Root-cause regression: total orders in the period must reflect EVERY status
  // present (including ones outside the four named buckets), never silently
  // dropping an unrecognized/less-common status the way the old frontend
  // tentativeCount bug did.
  it("sums orderCounts.total from every status returned by the grouped query, not just the named buckets", async () => {
    const { service } = buildService([
      { status: OrderStatus.CONFIRMEE, _count: 1 },
      { status: OrderStatus.EN_ATTENTE, _count: 1 },
      { status: OrderStatus.TENTATIVE_CONTACT, _count: 1 },
      { status: OrderStatus.ANNULEE, _count: 1 },
      { status: OrderStatus.ECHEC_LIVRAISON, _count: 1 }, // not one of the "named" buckets
    ]);

    const result = await service.getOverview(new Date("2026-08-01"), new Date("2026-08-13"), undefined);

    expect(result.orderCounts.total).toBe(5);
    expect(result.orderCounts.confirmed).toBe(1);
    expect(result.orderCounts.pending).toBe(1);
    expect(result.orderCounts.tentative).toBe(1);
    expect(result.orderCounts.cancelled).toBe(1);
    // ECHEC_LIVRAISON isn't a named bucket in the response shape, but it must
    // still count toward `total` — never silently excluded.
  });

  it("defaults the orders-table endpoint to every real status when none is given ('Toutes les commandes')", async () => {
    const { service, findManyMock } = buildService();
    await service.getOrdersTable(new Date(), new Date(), undefined, 1, 20);

    const callArgs = findManyMock.mock.calls[0][0];
    expect(callArgs.where.status.in.length).toBe(Object.values(OrderStatus).length);
  });
});
