import { Injectable } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryService } from "../inventory/inventory.service";
import { DashboardPeriod } from "./dto/dashboard-query.dto";

const CONFIRMED_OR_BEYOND: OrderStatus[] = [
  OrderStatus.CONFIRMEE,
  OrderStatus.PREPARATION,
  OrderStatus.PRETE_EXPEDITION,
  OrderStatus.EXPEDIEE,
  OrderStatus.LIVREE,
  OrderStatus.ECHEC_LIVRAISON,
  OrderStatus.RETOURNEE,
];
const SHIPPED_OR_BEYOND: OrderStatus[] = [
  OrderStatus.EXPEDIEE,
  OrderStatus.LIVREE,
  OrderStatus.ECHEC_LIVRAISON,
  OrderStatus.RETOURNEE,
];
const REVENUE_EXCLUDED: OrderStatus[] = [
  OrderStatus.ANNULEE,
  OrderStatus.REFUSEE,
  OrderStatus.RETOURNEE,
];

function periodStart(period: DashboardPeriod): Date {
  const now = new Date();
  // Tunisia timezone is UTC+1 (Africa/Tunis)
  const tunisNow = new Date(now.getTime() + 60 * 60 * 1000);
  switch (period) {
    case "today": {
      const startTunis = new Date(tunisNow);
      startTunis.setUTCHours(0, 0, 0, 0);
      return new Date(startTunis.getTime() - 60 * 60 * 1000);
    }
    case "7d": {
      const startTunis = new Date(tunisNow);
      startTunis.setUTCHours(0, 0, 0, 0);
      startTunis.setUTCDate(startTunis.getUTCDate() - 6);
      return new Date(startTunis.getTime() - 60 * 60 * 1000);
    }
    case "30d": {
      const startTunis = new Date(tunisNow);
      startTunis.setUTCHours(0, 0, 0, 0);
      startTunis.setUTCDate(startTunis.getUTCDate() - 29);
      return new Date(startTunis.getTime() - 60 * 60 * 1000);
    }
    case "3mo": {
      const startTunis = new Date(tunisNow);
      startTunis.setUTCHours(0, 0, 0, 0);
      startTunis.setUTCDate(startTunis.getUTCDate() - 89);
      return new Date(startTunis.getTime() - 60 * 60 * 1000);
    }
    case "12mo": {
      const startTunis = new Date(tunisNow);
      startTunis.setUTCHours(0, 0, 0, 0);
      startTunis.setUTCDate(startTunis.getUTCDate() - 364);
      return new Date(startTunis.getTime() - 60 * 60 * 1000);
    }
  }
}

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async getDashboardOverview(period: DashboardPeriod = "30d") {
    const since = periodStart(period);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true, user: true },
      orderBy: { createdAt: "asc" },
    });

    const revenueOrders = orders.filter((o) => !REVENUE_EXCLUDED.includes(o.status));
    const ca = revenueOrders.reduce((sum, o) => sum + o.totalMillimes, 0);
    const orderCount = orders.length;
    const panierMoyen = revenueOrders.length > 0 ? Math.round(ca / revenueOrders.length) : 0;

    const statusCounts = this.countByStatus(orders);

    const confirmedCount = orders.filter((o) => CONFIRMED_OR_BEYOND.includes(o.status)).length;
    const shippedCount = orders.filter((o) => SHIPPED_OR_BEYOND.includes(o.status)).length;
    const deliveredCount = statusCounts.LIVREE ?? 0;
    const tauxConfirmation = orderCount > 0 ? (confirmedCount / orderCount) * 100 : 0;
    const tauxLivraison = shippedCount > 0 ? (deliveredCount / shippedCount) * 100 : 0;
    const tauxAnnulation = orderCount > 0 ? (((statusCounts.ANNULEE ?? 0) + (statusCounts.REFUSEE ?? 0)) / orderCount) * 100 : 0;
    const tauxRetour = orderCount > 0 ? (((statusCounts.RETOURNEE ?? 0) + (statusCounts.ECHEC_LIVRAISON ?? 0)) / orderCount) * 100 : 0;

    const { margeBrute, marginCoverageItems, totalItems } = await this.computeMargin(revenueOrders);

    return {
      period,
      since: since.toISOString(),
      kpis: {
        caMillimes: ca,
        orderCount,
        panierMoyenMillimes: panierMoyen,
        margeBruteEstimeeMillimes: margeBrute,
        marginCoverage: totalItems > 0 ? marginCoverageItems / totalItems : null,
        tauxConfirmation: Math.round(tauxConfirmation * 10) / 10,
        tauxLivraison: Math.round(tauxLivraison * 10) / 10,
        tauxAnnulation: Math.round(tauxAnnulation * 10) / 10,
        tauxRetour: Math.round(tauxRetour * 10) / 10,
      },
      statusCounts,
      funnel: this.buildFunnel(orderCount, confirmedCount, shippedCount, deliveredCount),
      salesChart: await this.buildDailySeries(revenueOrders, period, since),
      topProducts: await this.getTopProducts(revenueOrders),
      customerKpis: await this.getCustomerKpis(orders, since),
      alerts: await this.getAlerts(),
      promotionPerformance: { available: false, reason: "Aucun modèle de promotion en base — hors périmètre de ce chantier." },
    };
  }

  private countByStatus(orders: { status: OrderStatus }[]) {
    const counts: Partial<Record<OrderStatus, number>> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }

  private buildFunnel(total: number, confirmed: number, shipped: number, delivered: number) {
    return [
      { label: "Nouvelles commandes", count: total, pct: 100 },
      { label: "Confirmées", count: confirmed, pct: total > 0 ? Math.round((confirmed / total) * 1000) / 10 : 0 },
      { label: "Expédiées", count: shipped, pct: total > 0 ? Math.round((shipped / total) * 1000) / 10 : 0 },
      { label: "Livrées", count: delivered, pct: total > 0 ? Math.round((delivered / total) * 1000) / 10 : 0 },
    ];
  }

  private async computeMargin(orders: { items: { productVariantId: string; quantity: number; priceMillimes: number; unitCostMillimes: number | null }[] }[]) {
    let margeBrute = 0;
    let marginCoverageItems = 0;
    let totalItems = 0;

    const variantCostCache = new Map<string, number | null>();

    for (const order of orders) {
      for (const item of order.items) {
        totalItems += 1;
        let cost = item.unitCostMillimes;

        if (cost === null && item.productVariantId) {
          if (!variantCostCache.has(item.productVariantId)) {
            const fallbackCost = await this.inventoryService.getWeightedAverageCost(item.productVariantId);
            variantCostCache.set(item.productVariantId, fallbackCost);
          }
          cost = variantCostCache.get(item.productVariantId) ?? null;
        }

        if (cost !== null) {
          margeBrute += (item.priceMillimes - cost) * item.quantity;
          marginCoverageItems += 1;
        }
      }
    }
    return { margeBrute, marginCoverageItems, totalItems };
  }

  private async buildDailySeries(
    orders: { createdAt: Date; totalMillimes: number; items: { productVariantId: string; quantity: number; priceMillimes: number; unitCostMillimes: number | null }[] }[],
    period: DashboardPeriod,
    since: Date,
  ) {
    const byDay = new Map<string, { caMillimes: number; margeMillimes: number; orderCount: number }>();
    const variantCostCache = new Map<string, number | null>();

    const now = new Date();
    const curr = new Date(since);
    while (curr <= now || curr.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)) {
      const key = curr.toISOString().slice(0, 10);
      if (!byDay.has(key)) {
        byDay.set(key, { caMillimes: 0, margeMillimes: 0, orderCount: 0 });
      }
      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { caMillimes: 0, margeMillimes: 0, orderCount: 0 };
      entry.caMillimes += order.totalMillimes;
      entry.orderCount += 1;

      for (const item of order.items) {
        let cost = item.unitCostMillimes;
        if (cost === null && item.productVariantId) {
          if (!variantCostCache.has(item.productVariantId)) {
            const fallbackCost = await this.inventoryService.getWeightedAverageCost(item.productVariantId);
            variantCostCache.set(item.productVariantId, fallbackCost);
          }
          cost = variantCostCache.get(item.productVariantId) ?? null;
        }
        if (cost !== null) {
          entry.margeMillimes += (item.priceMillimes - cost) * item.quantity;
        }
      }
      byDay.set(key, entry);
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }

  private async getTopProducts(orders: { items: { productId: string; productVariantId: string; quantity: number; priceMillimes: number; unitCostMillimes: number | null }[] }[]) {
    const byProduct = new Map<string, { units: number; revenueMillimes: number; margeMillimes: number; hasCost: boolean }>();
    const variantCostCache = new Map<string, number | null>();

    for (const order of orders) {
      for (const item of order.items) {
        const entry = byProduct.get(item.productId) ?? { units: 0, revenueMillimes: 0, margeMillimes: 0, hasCost: false };
        entry.units += item.quantity;
        entry.revenueMillimes += item.priceMillimes * item.quantity;

        let cost = item.unitCostMillimes;
        if (cost === null && item.productVariantId) {
          if (!variantCostCache.has(item.productVariantId)) {
            const fallbackCost = await this.inventoryService.getWeightedAverageCost(item.productVariantId);
            variantCostCache.set(item.productVariantId, fallbackCost);
          }
          cost = variantCostCache.get(item.productVariantId) ?? null;
        }

        if (cost !== null) {
          entry.margeMillimes += (item.priceMillimes - cost) * item.quantity;
          entry.hasCost = true;
        }
        byProduct.set(item.productId, entry);
      }
    }

    const ranked = Array.from(byProduct.entries())
      .sort(([, a], [, b]) => b.revenueMillimes - a.revenueMillimes)
      .slice(0, 8);

    const products = await this.prisma.product.findMany({
      where: { id: { in: ranked.map(([id]) => id) } },
      include: { brand: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return ranked.map(([productId, values]) => ({
      productId,
      name: productMap.get(productId)?.name ?? "Produit supprimé",
      brand: productMap.get(productId)?.brand.name ?? "—",
      units: values.units,
      revenueMillimes: values.revenueMillimes,
      margeMillimes: values.hasCost ? values.margeMillimes : null,
    }));
  }

  private async getCustomerKpis(orders: { userId: string }[], since: Date) {
    const uniqueCustomerIds = [...new Set(orders.map((o) => o.userId))];
    if (uniqueCustomerIds.length === 0) {
      return { newCustomers: 0, returningCustomers: 0, repeatRate: 0 };
    }

    const [newCustomerCount, priorOrderCounts] = await Promise.all([
      this.prisma.user.count({ where: { id: { in: uniqueCustomerIds }, createdAt: { gte: since } } }),
      this.prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: uniqueCustomerIds }, createdAt: { lt: since } },
        _count: true,
      }),
    ]);

    const returningCustomers = priorOrderCounts.length;
    const repeatRate = uniqueCustomerIds.length > 0 ? (returningCustomers / uniqueCustomerIds.length) * 100 : 0;

    return {
      newCustomers: newCustomerCount,
      returningCustomers,
      repeatRate: Math.round(repeatRate * 10) / 10,
    };
  }

  private async getAlerts() {
    const [lowStock, expiry, staleOrders] = await Promise.all([
      this.inventoryService.getLowStockAlerts(),
      this.inventoryService.getExpiryAlerts(),
      this.prisma.order.findMany({
        where: {
          status: OrderStatus.EN_ATTENTE,
          createdAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        },
        select: { id: true },
      }),
    ]);

    const outOfStock = lowStock.filter((i) => i.quantityAvailable <= 0);
    const nearExpiry = expiry.filter((b) => b.stage === "30" || b.stage === "60" || b.stage === "90" || b.stage === "EXPIRED");
    const missingSupplierPrice = await this.prisma.productVariant.count({
      where: { purchasePriceHistory: { none: {} } },
    });

    const alerts: { type: "danger" | "warning" | "info"; message: string; link: string }[] = [];
    if (staleOrders.length > 0) {
      alerts.push({ type: "danger", message: `${staleOrders.length} commande(s) en attente depuis plus de 2h`, link: "/admin/commandes?status=EN_ATTENTE" });
    }
    if (outOfStock.length > 0) {
      alerts.push({ type: "danger", message: `${outOfStock.length} produit(s) en rupture de stock`, link: "/admin/stocks" });
    }
    if (lowStock.length > outOfStock.length) {
      alerts.push({ type: "warning", message: `${lowStock.length - outOfStock.length} produit(s) en stock faible`, link: "/admin/stocks" });
    }
    if (nearExpiry.length > 0) {
      alerts.push({ type: "warning", message: `${nearExpiry.length} lot(s) proche(s) de l'expiration`, link: "/admin/stocks" });
    }
    if (missingSupplierPrice > 0) {
      alerts.push({ type: "info", message: `${missingSupplierPrice} produit(s) sans prix fournisseur renseigné`, link: "/admin/fournisseurs" });
    }

    return alerts;
  }
}
