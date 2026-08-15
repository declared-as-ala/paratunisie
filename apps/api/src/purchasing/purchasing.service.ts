import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PurchaseOrderStatus, StockMovementType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryService } from "../inventory/inventory.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { ReceivePurchaseOrderDto } from "./dto/receive-purchase-order.dto";

@Injectable()
export class PurchasingService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async list() {
    return this.prisma.purchaseOrder.findMany({
      include: { supplier: true, lines: { include: { variant: { include: { product: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, lines: { include: { variant: { include: { product: true } } } } },
    });
    if (!po) throw new NotFoundException("Bon de commande introuvable");
    return po;
  }

  async create(dto: CreatePurchaseOrderDto) {
    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        status: PurchaseOrderStatus.DRAFT,
        lines: {
          create: dto.lines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            unitCostMillimes: line.unitCostMillimes,
          })),
        },
      },
      include: { lines: true, supplier: true },
    });
  }

  async markSent(id: string) {
    const po = await this.get(id);
    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException("Seul un bon de commande brouillon peut être envoyé");
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.SENT },
    });
  }

  async cancel(id: string) {
    const po = await this.get(id);
    if (po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException("Un bon de commande déjà réceptionné ne peut pas être annulé");
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.CANCELLED },
    });
  }

  // Goods receipt: appends a PurchasePriceHistory entry per line (the price actually
  // paid at this receipt), creates a Batch, records a PURCHASE_RECEIPT StockMovement,
  // and increments on-hand stock. Supports partial receipt across multiple calls.
  async receive(id: string, dto: ReceivePurchaseOrderDto, staffId: string) {
    const po = await this.get(id);
    if (po.status === PurchaseOrderStatus.CANCELLED || po.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException("Ce bon de commande ne peut plus être réceptionné");
    }

    const warehouse = dto.warehouseId
      ? await this.prisma.warehouse.findUniqueOrThrow({ where: { id: dto.warehouseId } })
      : await this.inventoryService.getDefaultWarehouse();

    for (const receiveLine of dto.lines) {
      const line = po.lines.find((l) => l.id === receiveLine.lineId);
      if (!line) throw new BadRequestException(`Ligne ${receiveLine.lineId} introuvable sur ce bon de commande`);

      const remaining = line.quantity - line.quantityReceived;
      if (receiveLine.quantityReceived > remaining) {
        throw new BadRequestException(
          `Quantité reçue (${receiveLine.quantityReceived}) supérieure à la quantité restante (${remaining}) pour ${line.variantId}`,
        );
      }

      const priceHistory = await this.prisma.purchasePriceHistory.create({
        data: {
          variantId: line.variantId,
          supplierId: po.supplierId,
          purchasePriceMillimes: line.unitCostMillimes,
          effectiveFrom: new Date(),
        },
      });

      await this.prisma.supplierProduct.upsert({
        where: { supplierId_variantId: { supplierId: po.supplierId, variantId: line.variantId } },
        update: { latestPurchasePriceMillimes: line.unitCostMillimes },
        create: {
          supplierId: po.supplierId,
          variantId: line.variantId,
          latestPurchasePriceMillimes: line.unitCostMillimes,
          isPrimarySupplier: true,
        },
      });

      const inventoryItem = await this.prisma.inventoryItem.upsert({
        where: { variantId_warehouseId: { variantId: line.variantId, warehouseId: warehouse.id } },
        update: {},
        create: { variantId: line.variantId, warehouseId: warehouse.id },
      });

      await this.prisma.$transaction([
        this.prisma.batch.create({
          data: {
            variantId: line.variantId,
            inventoryItemId: inventoryItem.id,
            warehouseId: warehouse.id,
            batchNumber: receiveLine.batchNumber || `PO-${po.id.slice(-6)}-${line.id.slice(-4)}`,
            expirationDate: receiveLine.expirationDate ? new Date(receiveLine.expirationDate) : undefined,
            quantity: receiveLine.quantityReceived,
            purchasePriceHistoryId: priceHistory.id,
          },
        }),
        this.prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantityOnHand: { increment: receiveLine.quantityReceived } },
        }),
        this.prisma.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: StockMovementType.PURCHASE_RECEIPT,
            quantity: receiveLine.quantityReceived,
            reference: po.id,
            performedByStaffId: staffId,
          },
        }),
        this.prisma.purchaseOrderLine.update({
          where: { id: line.id },
          data: { quantityReceived: { increment: receiveLine.quantityReceived } },
        }),
      ]);
    }

    const refreshed = await this.get(id);
    const fullyReceived = refreshed.lines.every((l) => l.quantityReceived >= l.quantity);
    const partiallyReceived = refreshed.lines.some((l) => l.quantityReceived > 0);
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: fullyReceived
          ? PurchaseOrderStatus.RECEIVED
          : partiallyReceived
            ? PurchaseOrderStatus.PARTIALLY_RECEIVED
            : refreshed.status,
      },
    });

    return this.get(id);
  }
}
