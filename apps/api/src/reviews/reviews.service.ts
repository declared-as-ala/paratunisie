import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma, ReviewStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AdminReviewsQueryDto } from "./dto/admin-reviews-query.dto";

const VERIFIED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMEE,
  OrderStatus.PREPARATION,
  OrderStatus.PRETE_EXPEDITION,
  OrderStatus.EXPEDIEE,
  OrderStatus.LIVREE,
];

const reviewInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  },
  order: { select: { id: true, status: true, createdAt: true } },
} satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getReviewsByProduct(productIdOrSlug: string) {
    let resolvedId = productIdOrSlug;
    const prod = await this.prisma.product.findFirst({
      where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] },
      select: { id: true },
    });
    if (prod) resolvedId = prod.id;

    return this.prisma.review.findMany({
      where: { productId: resolvedId, status: ReviewStatus.APPROVED },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createReview(
    userId: string,
    productIdOrSlug: string,
    data: { rating: number; title?: string; body?: string; orderId?: string },
  ) {
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new BadRequestException("La note doit être comprise entre 1 et 5");
    }

    const [user, product] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      this.prisma.product.findFirst({
        where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] },
        select: { id: true },
      }),
    ]);
    if (!user) throw new NotFoundException("Client introuvable");
    if (!product) throw new NotFoundException("Produit introuvable");

    const productId = product.id;
    const verifiedOrder = await this.findVerifiedOrder(userId, productId, data.orderId);

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      return this.prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          title: data.title?.trim() || null,
          body: data.body?.trim() || null,
          orderId: verifiedOrder?.id || existingReview.orderId,
          verified: Boolean(verifiedOrder || existingReview.verified),
          status: ReviewStatus.PENDING,
        },
      });
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        orderId: verifiedOrder?.id,
        rating: data.rating,
        title: data.title?.trim() || null,
        body: data.body?.trim() || null,
        status: ReviewStatus.PENDING,
        verified: Boolean(verifiedOrder),
      },
    });
  }

  async getProductRating(productIdOrSlug: string) {
    let resolvedId = productIdOrSlug;
    const prod = await this.prisma.product.findFirst({
      where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] },
      select: { id: true },
    });
    if (prod) resolvedId = prod.id;

    const result = await this.prisma.review.aggregate({
      where: { productId: resolvedId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: result._avg.rating ?? 0, count: result._count.rating };
  }

  async getAdminReviews(query: AdminReviewsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = this.buildAdminWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async getAdminStats(query: Pick<AdminReviewsQueryDto, "date"> = {}) {
    const createdAt = this.dateWhere(query.date);
    const where = createdAt ? { createdAt } : {};
    const [total, pending, approved, rejected, approvedRating] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.count({ where: { ...where, status: ReviewStatus.PENDING } }),
      this.prisma.review.count({ where: { ...where, status: ReviewStatus.APPROVED } }),
      this.prisma.review.count({ where: { ...where, status: ReviewStatus.REJECTED } }),
      this.prisma.review.aggregate({
        where: { ...where, status: ReviewStatus.APPROVED },
        _avg: { rating: true },
      }),
    ]);
    return {
      total,
      pending,
      approved,
      rejected,
      averageRating: approvedRating._avg.rating ?? 0,
    };
  }

  async getAdminReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id }, include: reviewInclude });
    if (!review) throw new NotFoundException("Avis introuvable");
    return review;
  }

  async updateStatus(id: string, status: ReviewStatus) {
    if (status !== ReviewStatus.APPROVED && status !== ReviewStatus.REJECTED) {
      throw new BadRequestException("Statut de modération invalide");
    }
    await this.getAdminReview(id);
    return this.prisma.review.update({ where: { id }, data: { status }, include: reviewInclude });
  }

  async deleteReview(id: string) {
    await this.getAdminReview(id);
    await this.prisma.review.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async findVerifiedOrder(userId: string, productId: string, requestedOrderId?: string) {
    return this.prisma.order.findFirst({
      where: {
        id: requestedOrderId,
        userId,
        status: { in: VERIFIED_ORDER_STATUSES },
        items: { some: { productId } },
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
  }

  private buildAdminWhere(query: AdminReviewsQueryDto): Prisma.ReviewWhereInput {
    const where: Prisma.ReviewWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.rating) where.rating = query.rating;
    const createdAt = this.dateWhere(query.date);
    if (createdAt) where.createdAt = createdAt;
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  private dateWhere(date?: string): Prisma.DateTimeFilter | undefined {
    if (!date || date === "all") return undefined;
    const now = new Date();
    if (date === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { gte: start };
    }
    const days = date === "7d" ? 7 : 30;
    return { gte: new Date(now.getTime() - days * 86_400_000) };
  }

  private buildOrderBy(sort?: string): Prisma.ReviewOrderByWithRelationInput {
    if (sort === "oldest") return { createdAt: "asc" };
    if (sort === "rating_desc") return { rating: "desc" };
    if (sort === "rating_asc") return { rating: "asc" };
    return { createdAt: "desc" };
  }
}
