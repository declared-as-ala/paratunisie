const { PrismaClient, ReviewStatus, OrderStatus } = require("@prisma/client");

const prisma = new PrismaClient();
const ELIGIBLE_ORDER_STATUSES = new Set([
  OrderStatus.CONFIRMEE,
  OrderStatus.PREPARATION,
  OrderStatus.PRETE_EXPEDITION,
  OrderStatus.EXPEDIEE,
  OrderStatus.LIVREE,
]);

function classify(review) {
  if (!review.orderId || !review.order) return "UNVERIFIABLE_NO_ORDER";
  if (review.order.userId !== review.userId) return "ORDER_CUSTOMER_MISMATCH";
  if (!ELIGIBLE_ORDER_STATUSES.has(review.order.status)) return "ORDER_STATUS_INELIGIBLE";
  if (!review.order.items.some((item) => item.productId === review.productId)) {
    return "ORDER_PRODUCT_MISMATCH";
  }
  return "VERIFIED_PURCHASE";
}

async function main() {
  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      userId: true,
      productId: true,
      orderId: true,
      status: true,
      verified: true,
      createdAt: true,
      order: {
        select: {
          userId: true,
          status: true,
          items: { select: { productId: true } },
        },
      },
    },
  });

  const classifications = {};
  for (const review of reviews) {
    const result = classify(review);
    classifications[result] = (classifications[result] || 0) + 1;
  }

  const approvedVerifiedWithoutOrder = await prisma.review.count({
    where: {
      status: ReviewStatus.APPROVED,
      verified: true,
      orderId: null,
    },
  });

  console.log(JSON.stringify({
    auditedAt: new Date().toISOString(),
    total: reviews.length,
    classifications,
    approvedVerifiedWithoutOrder,
    containsPersonalData: false,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
