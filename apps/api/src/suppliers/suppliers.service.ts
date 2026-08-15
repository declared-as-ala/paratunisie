import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSupplierDto, UpdateSupplierDto } from "./dto/supplier.dto";
import { CreatePurchasePriceHistoryDto } from "./dto/purchase-price-history.dto";

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.supplier.findMany({
      include: {
        supplierProducts: { include: { variant: { include: { product: { include: { brand: true } } } } } },
      },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        supplierProducts: { include: { variant: { include: { product: { include: { brand: true } } } } } },
      },
    });
    if (!supplier) throw new NotFoundException("Fournisseur introuvable");
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.get(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    const purchaseOrderCount = await this.prisma.purchaseOrder.count({ where: { supplierId: id } });
    if (purchaseOrderCount > 0) {
      throw new BadRequestException(
        "Ce fournisseur a des bons de commande associés et ne peut pas être supprimé — désactivez-le à la place.",
      );
    }
    return this.prisma.supplier.delete({ where: { id } });
  }

  // ─── Purchase price history (append-only, D-0017) ──────────────────────

  async listPurchasePriceHistory(variantId?: string, supplierId?: string) {
    return this.prisma.purchasePriceHistory.findMany({
      where: { variantId, supplierId },
      include: { variant: { include: { product: true } }, supplier: true },
      orderBy: { effectiveFrom: "desc" },
    });
  }

  async addPurchasePriceHistory(supplierId: string, dto: CreatePurchasePriceHistoryDto) {
    await this.get(supplierId);

    const entry = await this.prisma.purchasePriceHistory.create({
      data: {
        variantId: dto.variantId,
        supplierId,
        purchasePriceMillimes: dto.purchasePriceMillimes,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
      },
    });

    await this.prisma.supplierProduct.upsert({
      where: { supplierId_variantId: { supplierId, variantId: dto.variantId } },
      update: { latestPurchasePriceMillimes: dto.purchasePriceMillimes },
      create: {
        supplierId,
        variantId: dto.variantId,
        latestPurchasePriceMillimes: dto.purchasePriceMillimes,
        isPrimarySupplier: true,
      },
    });

    return entry;
  }
}
