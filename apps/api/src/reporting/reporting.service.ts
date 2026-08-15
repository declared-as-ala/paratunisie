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
const REVENUE_EXCLUDED: OrderStatus[] = [OrderStatus.ANNULEE, OrderStatus.REFUSEE];

function periodStart(period: DashboardPeriod): Date {
  const now = new Date();
  switch (period) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "7d":
      return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
    case "30d":
      return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);
    case "3mo":
      return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90);
    case "12mo":
      return new Date(now.getTime() - 1000 * 60 * 60 * 24 * 365);
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
    const tauxAnnulation = orderCount > 0 ? ((statusCounts.ANNULEE ?? 0) / orderCount) * 100 : 0;
    const tauxRetour = orderCount > 0 ? ((statusCounts.RETOURNEE ?? 0) / orderCount) * 100 : 0;

    const { margeBrute, marginCoverageItems, totalItems } = this.computeMargin(revenueOrders);

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
      salesChart: this.buildDailySeries(revenueOrders),
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

  private computeMargin(orders: { items: { quantity: number; priceMillimes: number; unitCostMillimes: number | null }[] }[]) {
    let margeBrute = 0;
    let marginCoverageItems = 0;
    let totalItems = 0;
    for (const order of orders) {
      for (const item of order.items) {
        totalItems += 1;
        if (item.unitCostMillimes !== null) {
          margeBrute += (item.priceMillimes - item.unitCostMillimes) * item.quantity;
          marginCoverageItems += 1;
        }
      }
    }
    return { margeBrute, marginCoverageItems, totalItems };
  }

  private buildDailySeries(orders: { createdAt: Date; totalMillimes: number; items: { quantity: number; priceMillimes: number; unitCostMillimes: number | null }[] }[]) {
    const byDay = new Map<string, { caMillimes: number; margeMillimes: number; orderCount: number }>();
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { caMillimes: 0, margeMillimes: 0, orderCount: 0 };
      entry.caMillimes += order.totalMillimes;
      entry.orderCount += 1;
      for (const item of order.items) {
        if (item.unitCostMillimes !== null) {
          entry.margeMillimes += (item.priceMillimes - item.unitCostMillimes) * item.quantity;
        }
      }
      byDay.set(key, entry);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));
  }

  private async getTopProducts(orders: { items: { productId: string; quantity: number; priceMillimes: number; unitCostMillimes: number | null }[] }[]) {
    const byProduct = new Map<string, { units: number; revenueMillimes: number; margeMillimes: number; hasCost: boolean }>();
    for (const order of orders) {
      for (const item of order.items) {
        const entry = byProduct.get(item.productId) ?? { units: 0, revenueMillimes: 0, margeMillimes: 0, hasCost: false };
        entry.units += item.quantity;
        entry.revenueMillimes += item.priceMillimes * item.quantity;
        if (item.unitCostMillimes !== null) {
          entry.margeMillimes += (item.priceMillimes - item.unitCostMillimes) * item.quantity;
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
