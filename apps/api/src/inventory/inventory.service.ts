import { BadRequestException, Injectable } from "@nestjs/common";
import { StockMovementType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustStockDto } from "./dto/adjust-stock.dto";

const DEFAULT_WAREHOUSE_NAME = "Entrepôt Principal - Tunis";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getDefaultWarehouse() {
    const existing = await this.prisma.warehouse.findFirst();
    if (existing) return existing;
    return this.prisma.warehouse.create({ data: { name: DEFAULT_WAREHOUSE_NAME } });
  }

  private async getOrCreateInventoryItem(variantId: string, warehouseId?: string) {
    const warehouse = warehouseId
      ? await this.prisma.warehouse.findUniqueOrThrow({ where: { id: warehouseId } })
      : await this.getDefaultWarehouse();

    const existing = await this.prisma.inventoryItem.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId: warehouse.id } },
    });
    if (existing) return existing;
    return this.prisma.inventoryItem.create({ data: { variantId, warehouseId: warehouse.id } });
  }

  private withAvailable<T extends { quantityOnHand: number; quantityReserved: number }>(item: T) {
    return { ...item, quantityAvailable: item.quantityOnHand - item.quantityReserved };
  }

  async listInventory() {
    const items = await this.prisma.inventoryItem.findMany({
      include: {
        variant: { include: { product: { include: { brand: true } } } },
        warehouse: true,
        batches: {
          where: { quantity: { gt: 0 } },
          include: { purchasePriceHistory: { include: { supplier: true } } },
          orderBy: { expirationDate: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return items.map((item) => this.withAvailable(item));
  }

  async listMovements(variantId?: string) {
    return this.prisma.stockMovement.findMany({
      where: variantId ? { inventoryItem: { variantId } } : undefined,
      include: {
        inventoryItem: { include: { variant: { include: { product: true } } } },
        performedByStaff: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  async getLowStockAlerts() {
    const items = await this.prisma.inventoryItem.findMany({
      include: { variant: { include: { product: { include: { brand: true } } } } },
    });
    return items
      .map((item) => this.withAvailable(item))
      .filter((item) => item.quantityAvailable <= item.reorderThreshold);
  }

  async getExpiryAlerts() {
    const now = new Date();
    const horizon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90);
    const batches = await this.prisma.batch.findMany({
      where: { expirationDate: { not: null, lte: horizon }, quantity: { gt: 0 } },
      include: { variant: { include: { product: { include: { brand: true } } } }, warehouse: true },
      orderBy: { expirationDate: "asc" },
    });
    return batches.map((batch) => {
      const daysUntilExpiry = batch.expirationDate
        ? Math.ceil((batch.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const stage =
        daysUntilExpiry === null
          ? null
          : daysUntilExpiry < 0
            ? "EXPIRED"
            : daysUntilExpiry <= 30
              ? "30"
              : daysUntilExpiry <= 60
                ? "60"
                : "90";
      return { ...batch, daysUntilExpiry, stage };
    });
  }

  // Weighted-average cost (D-0017): weighted by remaining quantity across a variant's
  // active batches, each batch valued at the purchase price in effect when it was received.
  async getWeightedAverageCost(variantId: string): Promise<number | null> {
    const batches = await this.prisma.batch.findMany({
      where: { variantId, quantity: { gt: 0 } },
      include: { purchasePriceHistory: true },
    });
    const priced = batches.filter((b) => b.purchasePriceHistory && b.quantity > 0);
    if (priced.length === 0) {
      const latest = await this.prisma.purchasePriceHistory.findFirst({
        where: { variantId },
        orderBy: { effectiveFrom: "desc" },
      });
      return latest?.purchasePriceMillimes ?? null;
    }
    const totalQty = priced.reduce((sum, b) => sum + b.quantity, 0);
    const totalValue = priced.reduce(
      (sum, b) => sum + b.quantity * b.purchasePriceHistory!.purchasePriceMillimes,
      0,
    );
    return totalQty > 0 ? Math.round(totalValue / totalQty) : null;
  }

  async adjustStock(dto: AdjustStockDto, staffId: string) {
    if (dto.quantity === 0) throw new BadRequestException("La quantité ne peut pas être nulle");

    const inventoryItem = await this.getOrCreateInventoryItem(dto.variantId, dto.warehouseId);
    const newQuantityOnHand = inventoryItem.quantityOnHand + dto.quantity;
    if (newQuantityOnHand < 0) {
      throw new BadRequestException("Le stock disponible ne peut pas devenir négatif");
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantityOnHand: newQuantityOnHand },
      }),
      this.prisma.stockMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          type: dto.type,
          quantity: dto.quantity,
          reference: dto.reference,
          note: dto.note,
          performedByStaffId: staffId,
        },
      }),
    ]);
    return updated;
  }

  // ─── Order-status-triggered hooks (called from OrdersService, D-0024) ──────

  async reserveForOrder(orderId: string, items: { variantId: string; quantity: number }[], staffId?: string) {
    for (const item of items) {
      const inventoryItem = await this.getOrCreateInventoryItem(item.variantId);
      await this.prisma.$transaction([
        this.prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantityReserved: { increment: item.quantity } },
        }),
        this.prisma.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: StockMovementType.ORDER_RESERVATION,
            quantity: item.quantity,
            reference: orderId,
            performedByStaffId: staffId,
          },
        }),
      ]);
    }
  }

  async releaseReservationForOrder(
    orderId: string,
    items: { variantId: string; quantity: number }[],
    staffId?: string,
  ) {
    for (const item of items) {
      const inventoryItem = await this.getOrCreateInventoryItem(item.variantId);
      const releaseQty = Math.min(item.quantity, inventoryItem.quantityReserved);
      if (releaseQty <= 0) continue;
      await this.prisma.$transaction([
        this.prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantityReserved: { decrement: releaseQty } },
        }),
        this.prisma.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: StockMovementType.CANCELLATION_RELEASE,
            quantity: releaseQty,
            reference: orderId,
            performedByStaffId: staffId,
          },
        }),
      ]);
    }
  }

  async sellForOrder(orderId: string, items: { variantId: string; quantity: number }[], staffId?: string) {
    for (const item of items) {
      const inventoryItem = await this.getOrCreateInventoryItem(item.variantId);
      const releaseQty = Math.min(item.quantity, inventoryItem.quantityReserved);
      await this.prisma.$transaction([
        this.prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantityOnHand: { decrement: item.quantity },
            quantityReserved: { decrement: releaseQty },
          },
        }),
        this.prisma.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: StockMovementType.ORDER_SALE,
            quantity: item.quantity,
            reference: orderId,
            performedByStaffId: staffId,
          },
        }),
      ]);
    }
  }

  // ─── Replenishment suggestions (sales velocity vs. supplier lead time) ────

  async getReplenishmentSuggestions() {
    const windowDays = 30;
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * windowDays);
    const lowStock = await this.getLowStockAlerts();

    const suggestions = [];
    for (const item of lowStock) {
      const soldMovements = await this.prisma.stockMovement.aggregate({
        where: { inventoryItemId: item.id, type: StockMovementType.ORDER_SALE, createdAt: { gte: since } },
        _sum: { quantity: true },
      });
      const unitsSold = soldMovements._sum.quantity ?? 0;
      const dailyVelocity = unitsSold / windowDays;

      const primarySupplierProduct = await this.prisma.supplierProduct.findFirst({
        where: { variantId: item.variantId, isPrimarySupplier: true },
        include: { supplier: true },
      });
      const leadTimeDays = primarySupplierProduct?.supplier.leadTimeDays ?? 14;
      const demandDuringLeadTime = Math.ceil(dailyVelocity * leadTimeDays);
      const suggestedQuantity = Math.max(
        0,
        demandDuringLeadTime + item.reorderThreshold - item.quantityAvailable,
      );

      if (suggestedQuantity > 0) {
        suggestions.push({
          variantId: item.variantId,
          inventoryItemId: item.id,
          productName: item.variant.product.name,
          quantityAvailable: item.quantityAvailable,
          dailyVelocity: Math.round(dailyVelocity * 100) / 100,
          leadTimeDays,
          supplierName: primarySupplierProduct?.supplier.name ?? null,
          suggestedQuantity,
        });
      }
    }
    return suggestions;
  }
}
