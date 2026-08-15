import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryService } from "../inventory/inventory.service";
import {
  ProfitabilityItemInput,
  aggregateProfitability,
  computeItemCostMillimes,
  computeItemGainMillimes,
  computeItemRevenueMillimes,
} from "./profitability-calc";

const DEFAULT_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMEE];
// Statuses that imply an order was, at some point, confirmed — a missing cost
// snapshot on any of these is safe to backfill from current weighted-average cost.
const CONFIRMED_OR_BEYOND: OrderStatus[] = [
  OrderStatus.CONFIRMEE,
  OrderStatus.PREPARATION,
  OrderStatus.PRETE_EXPEDITION,
  OrderStatus.EXPEDIEE,
  OrderStatus.LIVREE,
  OrderStatus.ECHEC_LIVRAISON,
  OrderStatus.RETOURNEE,
];

// Every real OrderStatus is a valid table filter (REQUIREMENTS.md §6: "the
// detailed table should allow Toutes les commandes") — only the KPI/overview
// statuses default narrower (CONFIRMEE only, D-0024/D-0026's business rule).
const ALL_STATUSES: OrderStatus[] = Object.values(OrderStatus);

// Server-computed reason strings — never guessed client-side (REQUIREMENTS.md
// §6/§27): a row's non-contribution reason is a business-rule fact, not a UI label.
const NON_CONTRIBUTION_REASON: Partial<Record<OrderStatus, string>> = {
  EN_ATTENTE: "En attente — non incluse dans le gain",
  TENTATIVE_CONTACT: "Tentative — non incluse dans le gain",
  PREPARATION: "En préparation — non incluse dans le gain",
  PRETE_EXPEDITION: "Prête à expédier — non incluse dans le gain",
  EXPEDIEE: "Expédiée — non incluse dans le gain",
  ECHEC_LIVRAISON: "Échec de livraison — non incluse dans le gain",
  RETOURNEE: "Retournée — gain retiré",
  ANNULEE: "Annulée — gain retiré",
  REFUSEE: "Refusée — gain retiré",
};

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: { include: { brand: true } } } } };
}>;

@Injectable()
export class ProfitabilityService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  private resolveStatuses(statuses?: OrderStatus[]): OrderStatus[] {
    return statuses && statuses.length > 0 ? statuses : DEFAULT_STATUSES;
  }

  async getOverview(from: Date, to: Date, statuses?: OrderStatus[]) {
    const resolvedStatuses = this.resolveStatuses(statuses);

    // Order-status context (REQUIREMENTS.md §5/§23): total orders in the period
    // regardless of status, alongside the subset actually feeding the KPIs below —
    // orders are never hidden just because they don't contribute to gain.
    const [contributingOrders, allOrdersInPeriod] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: { in: resolvedStatuses }, createdAt: { gte: from, lte: to } },
        include: { items: { include: { product: { include: { brand: true } } } } },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.order.groupBy({ by: ["status"], where: { createdAt: { gte: from, lte: to } }, _count: true }),
    ]);

    const byStatus = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
    for (const row of allOrdersInPeriod) byStatus[row.status] = row._count;
    const totalOrdersInPeriod = allOrdersInPeriod.reduce((sum, row) => sum + row._count, 0);

    const allItems: ProfitabilityItemInput[] = contributingOrders.flatMap((o) => o.items);
    const totals = aggregateProfitability(allItems);
    const contributingCount = contributingOrders.length;
    const panierMoyenMillimes = contributingCount > 0 ? Math.round(totals.totalRevenueMillimes / contributingCount) : 0;

    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      statusesIncluded: resolvedStatuses,
      orderCounts: {
        total: totalOrdersInPeriod,
        contributing: contributingCount,
        confirmed: byStatus.CONFIRMEE,
        pending: byStatus.EN_ATTENTE,
        tentative: byStatus.TENTATIVE_CONTACT,
        cancelled: byStatus.ANNULEE,
        refused: byStatus.REFUSEE,
        livree: byStatus.LIVREE,
        byStatus,
      },
      kpis: {
        caConfirmeeMillimes: totals.totalRevenueMillimes,
        caEligibleMillimes: totals.eligibleRevenueMillimes,
        coutAchatMillimes: totals.costMillimes,
        gainEstimeMillimes: totals.gainMillimes,
        tauxMarge: totals.tauxMarge === null ? null : Math.round(totals.tauxMarge * 10) / 10,
        commandesConfirmees: contributingCount,
        panierMoyenMillimes,
        costCoverage: Math.round(totals.costCoverage * 1000) / 1000,
        itemsWithCost: totals.itemsWithCost,
        itemsTotal: totals.itemsTotal,
      },
      series: this.buildDailySeries(contributingOrders),
      productProfitability: this.buildProductProfitability(contributingOrders),
      productsMissingCost: this.buildProductsMissingCost(contributingOrders),
    };
  }

  async getOrdersTable(
    from: Date,
    to: Date,
    statuses: OrderStatus[] | undefined,
    page = 1,
    pageSize = 20,
    search?: string,
  ) {
    // "ALL" (§6 "Toutes les commandes") uses every real status; a specific scope
    // (e.g. CONFIRMEE, or CONFIRMEE+LIVREE) is otherwise honored as given —
    // this table intentionally isn't restricted to the KPI default the way
    // getOverview is, since its whole purpose is showing orders that don't contribute.
    const resolvedStatuses = statuses && statuses.length > 0 ? statuses : ALL_STATUSES;
    const where: Prisma.OrderWhereInput = {
      status: { in: resolvedStatuses },
      createdAt: { gte: from, lte: to },
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { items: true, user: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    const contributingStatuses = new Set(this.resolveStatuses(undefined).map((s) => s as string)).add(
      OrderStatus.LIVREE,
    ); // overview's own default plus LIVREE, matching the "Confirmées + Livrées" scope option

    const rows = orders.map((order) => {
      const totals = aggregateProfitability(order.items);
      const isEligibleStatus = contributingStatuses.has(order.status);
      return {
        orderId: order.id,
        reference: `#${order.id.slice(-6).toUpperCase()}`,
        customerName: order.user?.name ?? "Client",
        date: order.createdAt.toISOString(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        caMillimes: totals.totalRevenueMillimes,
        coutMillimes: totals.costMillimes,
        gainMillimes: isEligibleStatus ? totals.gainMillimes : null,
        tauxMarge: isEligibleStatus ? totals.tauxMarge : null,
        status: order.status,
        contribution: isEligibleStatus && totals.gainMillimes !== null ? ("eligible" as const) : ("excluded" as const),
        reason: isEligibleStatus
          ? totals.gainMillimes === null
            ? "Coût d'achat inconnu — gain non calculable"
            : null
          : (NON_CONTRIBUTION_REASON[order.status] ?? `${order.status} — non incluse dans le gain`),
      };
    });

    return { rows, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async getOrderDetail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: { include: { brand: true } }, productVariant: true } },
      },
    });
    if (!order) throw new NotFoundException("Commande introuvable");

    const lines = order.items.map((item) => ({
      productName: item.product.name,
      brand: item.product.brand.name,
      variantLabel: item.productVariant.label,
      quantity: item.quantity,
      unitSellingPriceMillimes: item.priceMillimes,
      unitCostMillimes: item.unitCostMillimes,
      revenueMillimes: computeItemRevenueMillimes(item),
      costMillimes: computeItemCostMillimes(item),
      gainMillimes: computeItemGainMillimes(item),
      costIsEstimated: item.costIsEstimated,
      // Diagnostic label (REQUIREMENTS.md §32) — distinguishes a real historical
      // snapshot from a backfilled guess from a genuinely-missing cost.
      costSource: item.unitCostMillimes === null ? "unknown" : item.costIsEstimated ? "backfilled_estimate" : "snapshot",
    }));

    const totals = aggregateProfitability(order.items);

    return {
      orderId: order.id,
      reference: `#${order.id.slice(-6).toUpperCase()}`,
      status: order.status,
      totals: {
        revenueMillimes: totals.totalRevenueMillimes,
        eligibleRevenueMillimes: totals.eligibleRevenueMillimes,
        costMillimes: totals.costMillimes,
        gainMillimes: totals.gainMillimes,
        tauxMarge: totals.tauxMarge === null ? null : Math.round(totals.tauxMarge * 10) / 10,
        costCoverage: totals.costCoverage,
      },
      lines,
    };
  }

  // Production-usable backfill (REQUIREMENTS.md §4): fills unitCostMillimes for
  // items on already-confirmed orders that predate this feature, using CURRENT
  // weighted-average cost as a best-effort estimate — always flagged costIsEstimated.
  // Never overwrites a real snapshot captured live at confirmation time.
  async backfillMissingCosts() {
    const items = await this.prisma.orderItem.findMany({
      where: { unitCostMillimes: null, order: { status: { in: CONFIRMED_OR_BEYOND } } },
    });

    let updated = 0;
    for (const item of items) {
      const cost = await this.inventoryService.getWeightedAverageCost(item.productVariantId);
      if (cost === null) continue;
      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: { unitCostMillimes: cost, costIsEstimated: true },
      });
      updated += 1;
    }
    return { scanned: items.length, updated };
  }

  private buildDailySeries(orders: OrderWithItems[]) {
    const byDay = new Map<
      string,
      { caMillimes: number; coutMillimes: number; gainMillimes: number; hasEligibleData: boolean }
    >();
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { caMillimes: 0, coutMillimes: 0, gainMillimes: 0, hasEligibleData: false };
      const totals = aggregateProfitability(order.items);
      entry.caMillimes += totals.totalRevenueMillimes;
      entry.coutMillimes += totals.costMillimes;
      if (totals.gainMillimes !== null) {
        entry.gainMillimes += totals.gainMillimes;
        entry.hasEligibleData = true;
      }
      byDay.set(key, entry);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }

  private buildProductProfitability(orders: OrderWithItems[]) {
    const byProduct = new Map<
      string,
      { name: string; brand: string; units: number; totalRevenueMillimes: number; eligibleRevenueMillimes: number; costMillimes: number }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const entry = byProduct.get(item.productId) ?? {
          name: item.product.name,
          brand: item.product.brand.name,
          units: 0,
          totalRevenueMillimes: 0,
          eligibleRevenueMillimes: 0,
          costMillimes: 0,
        };
        const revenue = computeItemRevenueMillimes(item);
        entry.units += item.quantity;
        entry.totalRevenueMillimes += revenue;
        const cost = computeItemCostMillimes(item);
        if (cost !== null) {
          entry.eligibleRevenueMillimes += revenue;
          entry.costMillimes += cost;
        }
        byProduct.set(item.productId, entry);
      }
    }

    return Array.from(byProduct.entries())
      .map(([productId, v]) => {
        const hasCost = v.eligibleRevenueMillimes > 0;
        const gainMillimes = hasCost ? v.eligibleRevenueMillimes - v.costMillimes : null;
        return {
          productId,
          name: v.name,
          brand: v.brand,
          units: v.units,
          caMillimes: v.totalRevenueMillimes,
          coutMillimes: hasCost ? v.costMillimes : null,
          gainMillimes,
          tauxMarge: gainMillimes !== null ? Math.round((gainMillimes / v.eligibleRevenueMillimes) * 1000) / 10 : null,
        };
      })
      .sort((a, b) => b.caMillimes - a.caMillimes)
      .slice(0, 50);
  }

  // "Produits sans coût d'achat" (REQUIREMENTS.md §19) — products sold in the
  // period with zero cost coverage, so staff can see exactly what's blocking
  // an accurate gain figure and where the revenue-at-risk is concentrated.
  private buildProductsMissingCost(orders: OrderWithItems[]) {
    const byProduct = new Map<
      string,
      { name: string; sku: string | null; sellingPriceMillimes: number; units: number; revenueMillimes: number }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        if (item.unitCostMillimes !== null) continue;
        const entry = byProduct.get(item.productId) ?? {
          name: item.product.name,
          sku: null,
          sellingPriceMillimes: item.priceMillimes,
          units: 0,
          revenueMillimes: 0,
        };
        entry.units += item.quantity;
        entry.revenueMillimes += computeItemRevenueMillimes(item);
        byProduct.set(item.productId, entry);
      }
    }

    return Array.from(byProduct.entries())
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.revenueMillimes - a.revenueMillimes);
  }
}
