import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listCategories() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log("=================================================");
  console.log(` TOTAL CATEGORIES IN DATABASE: ${categories.length} `);
  console.log("=================================================");
  categories.forEach((c, idx) => {
    console.log(`${idx + 1}. "${c.name}" (slug: "${c.slug}") - ${c._count.products} products`);
  });

  await prisma.$disconnect();
}

listCategories();
