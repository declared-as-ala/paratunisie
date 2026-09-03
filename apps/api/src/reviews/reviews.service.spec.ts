import { OrderStatus, ReviewStatus } from "@prisma/client";
import { ReviewsService } from "./reviews.service";

describe("ReviewsService", () => {
  function setup() {
    const prisma = {
      review: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({ _avg: { rating: null }, _count: { rating: 0 } }),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ id: "user-1" }) },
      product: { findFirst: jest.fn().mockResolvedValue({ id: "product-1" }) },
      order: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    } as any;
    return { prisma, service: new ReviewsService(prisma) };
  }

  it("shows pending reviews in the paginated admin list", async () => {
    const { prisma, service } = setup();
    await service.getAdminReviews({ status: ReviewStatus.PENDING, page: 1 });
    expect(prisma.review.findMany.mock.calls[0][0]).toEqual(expect.objectContaining({
      where: { status: ReviewStatus.PENDING }, skip: 0, take: 20,
    }));
  });

  it("queries only approved reviews linked to an eligible same-product order", async () => {
    const { prisma, service } = setup();
    await service.getReviewsByProduct("product-1");
    expect(prisma.review.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        productId: "product-1",
        status: ReviewStatus.APPROVED,
        order: {
          is: {
            status: { in: [OrderStatus.CONFIRMEE, OrderStatus.PREPARATION, OrderStatus.PRETE_EXPEDITION, OrderStatus.EXPEDIEE, OrderStatus.LIVREE] },
            items: { some: { productId: "product-1" } },
          },
        },
      },
    }));
  });

  it("approves a review", async () => {
    const { prisma, service } = setup();
    prisma.review.findUnique.mockResolvedValue({ id: "review-1" });
    prisma.review.update.mockResolvedValue({ id: "review-1", status: ReviewStatus.APPROVED });
    await service.updateStatus("review-1", ReviewStatus.APPROVED);
    expect(prisma.review.update.mock.calls[0][0].data.status).toBe(ReviewStatus.APPROVED);
  });

  it("rejects a review", async () => {
    const { prisma, service } = setup();
    prisma.review.findUnique.mockResolvedValue({ id: "review-1" });
    prisma.review.update.mockResolvedValue({ id: "review-1", status: ReviewStatus.REJECTED });
    await service.updateStatus("review-1", ReviewStatus.REJECTED);
    expect(prisma.review.update.mock.calls[0][0].data.status).toBe(ReviewStatus.REJECTED);
  });

  it("deletes an existing review", async () => {
    const { prisma, service } = setup();
    prisma.review.findUnique.mockResolvedValue({ id: "review-1" });
    await service.deleteReview("review-1");
    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: "review-1" } });
  });

  it("calculates public rating only from reviews whose order belongs to the reviewer", async () => {
    const { prisma, service } = setup();
    prisma.review.findMany.mockResolvedValue([
      { rating: 5, userId: "user-1", order: { userId: "user-1" } },
      { rating: 4, userId: "user-2", order: { userId: "user-2" } },
      { rating: 5, userId: "user-3", order: { userId: "different-user" } },
    ]);
    await expect(service.getProductRating("product-1")).resolves.toEqual({ average: 4.5, count: 2 });
    expect(prisma.review.findMany.mock.calls[0][0].where.status).toBe(ReviewStatus.APPROVED);
  });

  it("does not expose an approved stored-verified review when the order belongs to another user", async () => {
    const { prisma, service } = setup();
    prisma.review.findMany.mockResolvedValue([
      {
        id: "review-1",
        userId: "user-1",
        verified: true,
        order: { userId: "different-user" },
        user: { name: "Client" },
      },
    ]);
    await expect(service.getReviewsByProduct("product-1")).resolves.toEqual([]);
  });

  it("searches client, email, product, title and body on the backend", async () => {
    const { prisma, service } = setup();
    await service.getAdminReviews({ search: "amina" });
    const or = prisma.review.findMany.mock.calls[0][0].where.OR;
    expect(or).toHaveLength(5);
    expect(or).toEqual(expect.arrayContaining([
      { user: { name: { contains: "amina", mode: "insensitive" } } },
      { product: { name: { contains: "amina", mode: "insensitive" } } },
    ]));
  });

  it("applies rating filter and backend pagination", async () => {
    const { prisma, service } = setup();
    await service.getAdminReviews({ rating: 5, page: 3, pageSize: 20 });
    expect(prisma.review.findMany.mock.calls[0][0]).toEqual(expect.objectContaining({
      where: { rating: 5 }, skip: 40, take: 20,
    }));
  });

  it("marks a purchase verified only from a matching valid order", async () => {
    const { prisma, service } = setup();
    prisma.order.findFirst.mockResolvedValue({ id: "order-1" });
    prisma.review.create.mockImplementation(({ data }: any) => Promise.resolve(data));
    const result = await service.createReview("user-1", "product-1", { rating: 5, orderId: "order-1" });
    expect(prisma.order.findFirst.mock.calls[0][0].where).toEqual({
      id: "order-1",
      userId: "user-1",
      status: { in: [OrderStatus.CONFIRMEE, OrderStatus.PREPARATION, OrderStatus.PRETE_EXPEDITION, OrderStatus.EXPEDIEE, OrderStatus.LIVREE] },
      items: { some: { productId: "product-1" } },
    });
    expect(result).toEqual(expect.objectContaining({ verified: true, orderId: "order-1", status: ReviewStatus.PENDING }));
  });

  it("clears a stale verified flag when an updated review has no eligible order", async () => {
    const { prisma, service } = setup();
    prisma.review.findFirst.mockResolvedValue({ id: "review-1", orderId: null, verified: true });
    prisma.review.update.mockImplementation(({ data }: any) => Promise.resolve(data));
    const result = await service.createReview("user-1", "product-1", { rating: 4 });
    expect(result).toEqual(expect.objectContaining({ verified: false, orderId: null, status: ReviewStatus.PENDING }));
  });

  it("uses the exact pending database count and approved-only average", async () => {
    const { prisma, service } = setup();
    prisma.review.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(9)
      .mockResolvedValueOnce(1);
    prisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.6 } });
    await expect(service.getAdminStats()).resolves.toEqual({ total: 12, pending: 2, approved: 9, rejected: 1, averageRating: 4.6 });
    expect(prisma.review.count.mock.calls[1][0].where.status).toBe(ReviewStatus.PENDING);
    expect(prisma.review.aggregate.mock.calls[0][0].where.status).toBe(ReviewStatus.APPROVED);
  });
});
