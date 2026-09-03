import { PrismaClient } from "@prisma/client";
import { evaluateProductSeoQuality } from "../src/catalogue/product-seo-quality";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

function normalizeTitle(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

async function main() {
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, variants: true },
    orderBy: { id: "asc" },
  });

  const titleCounts = new Map<string, number>();
  for (const product of products) {
    const key = normalizeTitle(product.name);
    titleCounts.set(key, (titleCounts.get(key) || 0) + 1);
  }

  const issueCounts = new Map<string, number>();
  const assessments = products.map((product) => {
    const result = evaluateProductSeoQuality({
      ...product,
      duplicateTitle: (titleCounts.get(normalizeTitle(product.name)) || 0) > 1,
    });
    for (const issue of result.issues) {
      issueCounts.set(issue.code, (issueCounts.get(issue.code) || 0) + 1);
    }
    return { product, result };
  });

  const eligible = assessments.filter(({ result }) => result.eligible).length;
  const summary = {
    mode: APPLY ? "apply" : "dry-run",
    total: products.length,
    eligible,
    noindex: products.length - eligible,
    issueCounts: Object.fromEntries([...issueCounts.entries()].sort((a, b) => b[1] - a[1])),
  };

  if (!APPLY) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const reviewedAt = new Date();
  const batchSize = 100;
  for (let offset = 0; offset < assessments.length; offset += batchSize) {
    const batch = assessments.slice(offset, offset + batchSize);
    await prisma.$transaction(
      batch.map(({ product, result }) => prisma.product.update({
        where: { id: product.id },
        data: {
          indexable: result.eligible,
          seoQualityScore: result.score,
          seoQualityIssues: JSON.stringify(result.issues),
          seoReviewedAt: reviewedAt,
        },
      })),
    );
  }

  const [brandsNoindexed, categoriesNoindexed] = await prisma.$transaction([
    prisma.brand.updateMany({
      where: { indexable: true, products: { none: { publishState: "PUBLISHED", indexable: true } } },
      data: { indexable: false },
    }),
    prisma.category.updateMany({
      where: { indexable: true, products: { none: { publishState: "PUBLISHED", indexable: true } } },
      data: { indexable: false },
    }),
  ]);

  console.log(JSON.stringify({
    ...summary,
    updated: assessments.length,
    brandsNoindexed: brandsNoindexed.count,
    categoriesNoindexed: categoriesNoindexed.count,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
