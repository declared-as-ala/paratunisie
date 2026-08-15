import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n========================================================");
  console.log("=== PARATUNISIE DATABASE CATEGORY TAXONOMY AUDIT ===");
  console.log("========================================================\n");

  // 1. All Categories in DB with parent & product count
  const allCats = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } }
    },
    orderBy: { name: "asc" }
  });

  console.log(`TOTAL CATEGORY RECORDS IN DATABASE: ${allCats.length}\n`);

  console.log("--- ALL DATABASE CATEGORIES ---");
  for (const cat of allCats) {
    const parentName = cat.parent ? cat.parent.name : "ROOT (No Parent)";
    console.log(`[ID: ${cat.id}] Name: "${cat.name}" | Slug: "${cat.slug}" | Parent: "${parentName}" (parentId: ${cat.parentId}) | Children: ${cat.children.length} | Products: ${cat._count.products}`);
  }

  // 2. Parent-Child Hierarchies
  const rootCategories = allCats.filter(c => c.parentId === null);
  console.log(`\n--- ROOT CATEGORIES (parentId === null): ${rootCategories.length} ---`);
  for (const root of rootCategories) {
    console.log(`ROOT CATEGORY: "${root.name}" (Slug: ${root.slug}, ID: ${root.id}, Products: ${root._count.products})`);
    if (root.children.length === 0) {
      console.log(`   └── (No children)`);
    } else {
      for (const child of root.children) {
        const childFull = allCats.find(c => c.id === child.id);
        console.log(`   └── CHILD: "${child.name}" (Slug: ${child.slug}, ID: ${child.id}, Products: ${childFull?._count.products ?? 0})`);
      }
    }
  }

  // 3. Specifically audit "Hygiène & Corps" and its hardcoded subcategories from mega-menu:
  // Subcategories in mega-menu:
  // - "Toilette Intime" (slug: "toilette-intime")
  // - "Gels Douche & Savons Surgras" (slug: "gel-douche-savon-surgras")
  // - "Soins des Mains, Pieds & Déodorants" (slug: "deodorant-pieds-soin-des-pieds-corps-7")

  console.log("\n========================================================");
  console.log("=== SPECIFIC AUDIT FOR: Hygiène & Corps ===");
  console.log("========================================================\n");

  const hygieneParents = allCats.filter(c => 
    c.name.toLowerCase().includes("hygiène") || 
    c.name.toLowerCase().includes("corps") ||
    c.slug.toLowerCase().includes("hygiene") ||
    c.slug.toLowerCase().includes("corps")
  );

  console.log("Categories matching 'Hygiène' or 'Corps':");
  for (const hp of hygieneParents) {
    console.log(`ID: ${hp.id}`);
    console.log(`Name: ${hp.name}`);
    console.log(`Slug: ${hp.slug}`);
    console.log(`Parent ID: ${hp.parentId}`);
    console.log(`Parent Name: ${hp.parent ? hp.parent.name : "None"}`);
    console.log(`Children Count: ${hp.children.length}`);
    console.log(`Direct Active Products: ${hp._count.products}`);
    if (hp.children.length > 0) {
      console.log(`Children:`);
      for (const ch of hp.children) {
        const chFull = allCats.find(c => c.id === ch.id);
        console.log(`  - "${ch.name}" (Slug: ${ch.slug}, ID: ${ch.id}) => ${chFull?._count.products} products`);
      }
    }
    console.log("------------------------------------------");
  }

  console.log("\nChecking the 3 subcategories listed in mega-menu for 'Hygiène & Corps':");
  const hardcodedSubSlugs = [
    { name: "Toilette Intime", slug: "toilette-intime" },
    { name: "Gels Douche & Savons Surgras", slug: "gel-douche-savon-surgras" },
    { name: "Soins des Mains, Pieds & Déodorants", slug: "deodorant-pieds-soin-des-pieds-corps-7" }
  ];

  for (const sub of hardcodedSubSlugs) {
    const match = allCats.find(c => c.slug === sub.slug || c.name.toLowerCase() === sub.name.toLowerCase());
    if (match) {
      console.log(`Subcategory "${sub.name}" (slug: "${sub.slug}") => FOUND IN DB: ID="${match.id}", Name="${match.name}", parentId="${match.parentId}", Products=${match._count.products}`);
    } else {
      console.log(`Subcategory "${sub.name}" (slug: "${sub.slug}") => NOT FOUND IN DB!`);
    }
  }

  console.log("\n========================================================");
  console.log("=== AUDIT OF ALL 7 TOP-LEVEL MENU ITEMS ===");
  console.log("========================================================\n");

  const targetTitles = [
    { title: "Visage", slug: "visage" },
    { title: "Solaire", slug: "solaire" },
    { title: "Cheveux", slug: "cheveux" },
    { title: "Bébé & Maternité", slug: "bebe-maman" },
    { title: "Santé & Orthopédie", slug: "sante-orthopedie" },
    { title: "Hygiène & Corps", slug: "hygiene-corps" },
    { title: "Maquillage", slug: "maquillage" }
  ];

  for (const item of targetTitles) {
    const exactName = allCats.find(c => c.name.toLowerCase() === item.title.toLowerCase());
    const exactSlug = allCats.find(c => c.slug === item.slug);
    
    console.log(`\nMenu Item: "${item.title}" (slug: "${item.slug}")`);
    if (exactName || exactSlug) {
      const match = exactName || exactSlug;
      console.log(`  Classification: DB CATEGORY`);
      console.log(`  Matched DB Record: ID="${match?.id}", Name="${match?.name}", Slug="${match?.slug}", parentId="${match?.parentId}", Products=${match?._count.products}`);
    } else {
      console.log(`  Classification: ALIAS / STATIC GROUP (No exact single DB Category record with name "${item.title}" or slug "${item.slug}")`);
      const related = allCats.filter(c => 
        item.title.toLowerCase().includes(c.name.toLowerCase()) || 
        c.name.toLowerCase().includes(item.title.split(' ')[0].toLowerCase())
      );
      console.log(`  Maps to DB Categories:`, related.map(r => `"${r.name}" (slug: ${r.slug}, prods: ${r._count.products})`).join(", ") || "None");
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
