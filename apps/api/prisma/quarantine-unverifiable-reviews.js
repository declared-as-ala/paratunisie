const { PrismaClient, ReviewStatus } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const where = {
    status: ReviewStatus.APPROVED,
    verified: true,
    orderId: null,
  };
  const matching = await prisma.review.count({ where });

  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({
      mode: "dry-run",
      matching,
      action: "Set status=REJECTED and verified=false; retain every row for rollback/audit.",
    }, null, 2));
    return;
  }

  const result = await prisma.review.updateMany({
    where,
    data: { status: ReviewStatus.REJECTED, verified: false },
  });
  console.log(JSON.stringify({ mode: "apply", matching, updated: result.count }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
