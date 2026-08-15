import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoryKeywordImages = [
  { keyword: "visage", image: "/assets/category-visage.webp" },
  { keyword: "solaire", image: "/assets/category-solaire.webp" },
  { keyword: "soleil", image: "/assets/category-solaire.webp" },
  { keyword: "cheveux", image: "/assets/category-cheveux.webp" },
  { keyword: "capillaire", image: "/assets/category-cheveux.webp" },
  { keyword: "corps", image: "/assets/category-corps.webp" },
  { keyword: "hydrat", image: "/assets/product-jar.webp" },
  { keyword: "nettoy", image: "/assets/product-micellar.webp" },
  { keyword: "serum", image: "/assets/product-serum.webp" },
  { keyword: "anti-age", image: "/assets/product-serum.webp" },
  { keyword: "bebe", image: "/assets/product-jar.webp" },
];

function getCategoryPhoto(name: string, slug: string): string {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();

  for (const item of categoryKeywordImages) {
    if (s.includes(item.keyword) || n.includes(item.keyword)) {
      return item.image;
    }
  }

  const defaults = [
    "/assets/category-visage.webp",
    "/assets/category-solaire.webp",
    "/assets/category-cheveux.webp",
    "/assets/category-corps.webp",
    "/assets/product-jar.webp",
    "/assets/product-serum.webp",
    "/assets/product-tube.webp",
  ];
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
  }
  return defaults[Math.abs(hash) % defaults.length];
}

async function main() {
  console.log("Seeding category photos in bulk...");
  const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  console.log(`Found ${categories.length} categories.`);

  const batchSize = 250;
  for (let i = 0; i < categories.length; i += batchSize) {
    const chunk = categories.slice(i, i + batchSize);
    await prisma.$transaction(
      chunk.map((cat) => {
        const photo = getCategoryPhoto(cat.name, cat.slug);
        return prisma.category.update({
          where: { id: cat.id },
          data: { image: photo, heroImage: photo },
        });
      })
    );
    console.log(`Updated ${Math.min(i + batchSize, categories.length)} / ${categories.length} categories...`);
  }

  console.log("Successfully updated all category photos!");
}

main()
  .catch((e) => {
    console.error("Error seeding category photos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
