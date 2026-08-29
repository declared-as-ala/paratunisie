import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductRequestDto } from "./dto/create-product-request.dto";
import { UpdateProductRequestDto } from "./dto/update-product-request.dto";

@Injectable()
export class ProductRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductRequestDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, name: true, slug: true },
    });

    if (!product) {
      throw new NotFoundException(`Produit introuvable: ${dto.productId}`);
    }

    return this.prisma.productRequest.create({
      data: {
        productId: dto.productId,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim() || null,
        quantity: dto.quantity || 1,
        message: dto.message?.trim() || null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            brand: { select: { name: true } },
          },
        },
      },
    });
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.productRequest.count({ where }),
      this.prisma.productRequest.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async update(id: string, dto: UpdateProductRequestDto) {
    const existing = await this.prisma.productRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Demande #${id} introuvable.`);
    }

    return this.prisma.productRequest.update({
      where: { id },
      data: {
        status: dto.status,
        adminNotes: dto.adminNotes,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            brand: { select: { name: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.productRequest.delete({ where: { id } });
  }
}
