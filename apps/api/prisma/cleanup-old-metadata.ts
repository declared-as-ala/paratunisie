import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVE_CATEGORY_SLUGS = [
  "creatine",
  "whey-proteine",
  "gainers-proteines",
  "pre-workout",
  "bcaa",
  "eaa",
  "beta-alanine",
  "citrulline",
  "zinc",
  "omega-3",
  "magnesium",
  "vitamines",
  "ashwagandha",
  "boosters-hormonaux",
  "l-carnitine",
  "bruleurs-de-graisse",
];

const ACTIVE_BRAND_SLUGS = [
  "ostrovit",
  "optimum-nutrition",
  "biotechusa",
  "real-pharm",
  "quamtrax",
  "eric-favre",
  "victor-martinez",
  "challenger-nutrition",
  "insane-labz",
  "zumub",
  "muscle-care",
  "weightworld",
  "sfd-nutrition",
  "scenit-nutrition",
  "proactive",
  "xtend",
  "fa-engineered-nutrition",
  "nutrex-research",
];

async function main() {
  console.log("Cleaning old unreferenced categories and brands...");

  // 1. Delete categories not in ACTIVE_CATEGORY_SLUGS
  await prisma.category.updateMany({
    where: { slug: { notIn: ACTIVE_CATEGORY_SLUGS } },
    data: { parentId: null },
  });

  const deletedCategories = await prisma.category.deleteMany({
    where: {
      slug: { notIn: ACTIVE_CATEGORY_SLUGS },
      products: { none: {} },
    },
  });
  console.log(`Deleted ${deletedCategories.count} old categories.`);

  // 2. Delete brands not in ACTIVE_BRAND_SLUGS
  const deletedBrands = await prisma.brand.deleteMany({
    where: {
      slug: { notIn: ACTIVE_BRAND_SLUGS },
      products: { none: {} },
    },
  });
  console.log(`Deleted ${deletedBrands.count} old brands.`);

  // 3. Count remaining
  const catCount = await prisma.category.count();
  const brandCount = await prisma.brand.count();
  const prodCount = await prisma.product.count();

  console.log(`Remaining in DB:`);
  console.log(`- Categories: ${catCount}`);
  console.log(`- Brands: ${brandCount}`);
  console.log(`- Products: ${prodCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
