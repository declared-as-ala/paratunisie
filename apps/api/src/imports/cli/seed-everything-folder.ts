import * as fs from "fs";
import * as path from "path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function seedEverything() {
  console.log("=================================================");
  console.log(" HIGH-SPEED SEEDING OF ALL TUNISIEPARA DATA ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const folderPath = "C:\\Users\\Ala\\Desktop\\parapharmacie\\apps\\api\\scraper\\tunisiepara_data";

  // 1. Ensure ImportProvider exists
  const provider = await prisma.importProvider.upsert({
    where: { code: "tunisiepara" },
    update: { baseUrl: "https://tunisiepara.com" },
    create: {
      code: "tunisiepara",
      name: "TunisiePara",
      baseUrl: "https://tunisiepara.com",
    },
  });

  // 2. Clean current database records
  console.log("1. Cleaning all current database records...");
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.routineItem.deleteMany();
  await prisma.articleProduct.deleteMany();
  await prisma.competitorPriceHistory.deleteMany();
  await prisma.competitorPrice.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.seoGenerationLog.deleteMany();
  await prisma.importError.deleteMany();
  await prisma.importedProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryMapping.deleteMany();
  await prisma.brandMapping.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  console.log("   ✓ Database cleaned successfully.");

  // 3. Seed Categories from categories.json
  console.log("2. Reading and seeding Categories...");
  interface CatNode {
    name: string;
    slug: string;
    parentSlug: string | null;
  }
  const catMap = new Map<string, CatNode>();
  const usedCatNames = new Set<string>();

  const catJsonPath = path.join(folderPath, "categories.json");
  if (fs.existsSync(catJsonPath)) {
    try {
      const catArray = JSON.parse(fs.readFileSync(catJsonPath, "utf-8"));
      if (Array.isArray(catArray)) {
        for (const item of catArray) {
          if (!item.name || !item.slug) continue;
          let rawSlug = slugify(item.slug);
          if (!rawSlug || catMap.has(rawSlug)) continue;

          let parentSlug: string | null = null;
          if (item.parentUrl) {
            const parts = item.parentUrl.replace(/\/$/, "").split("/");
            parentSlug = slugify(parts[parts.length - 1]);
          }

          let baseName = item.name.trim();
          let uniqueName = baseName;
          let counter = 1;
          while (usedCatNames.has(uniqueName.toLowerCase())) {
            counter++;
            uniqueName = `${baseName} ${counter}`;
          }
          usedCatNames.add(uniqueName.toLowerCase());

          catMap.set(rawSlug, {
            name: uniqueName,
            slug: rawSlug,
            parentSlug,
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse categories.json", e);
    }
  }

  // Fallback defaults
  const defaultRoots = ["visage", "capillaire", "corps", "solaire", "hygiene", "bebe-maman", "marques"];
  for (const root of defaultRoots) {
    if (!catMap.has(root)) {
      const rootName = root.charAt(0).toUpperCase() + root.slice(1);
      usedCatNames.add(rootName.toLowerCase());
      catMap.set(root, { name: rootName, slug: root, parentSlug: null });
    }
  }

  const dbCatMap = new Map<string, string>(); // slug -> id

  // Pass 1: Parent categories
  for (const node of catMap.values()) {
    if (!node.parentSlug) {
      const cat = await prisma.category.upsert({
        where: { slug: node.slug },
        update: { name: node.name },
        create: {
          name: node.name,
          slug: node.slug,
          status: "ACTIVE",
          position: 1,
        },
      });
      dbCatMap.set(node.slug, cat.id);
    }
  }

  // Pass 2: Child categories
  for (const node of catMap.values()) {
    if (node.parentSlug) {
      const parentId = dbCatMap.get(node.parentSlug) || null;
      const cat = await prisma.category.upsert({
        where: { slug: node.slug },
        update: { name: node.name, parentId },
        create: {
          name: node.name,
          slug: node.slug,
          parentId,
          status: "ACTIVE",
          position: 1,
        },
      });
      dbCatMap.set(node.slug, cat.id);
    }
  }

  const rootCatId = dbCatMap.get("visage") || Array.from(dbCatMap.values())[0];
  console.log(`   ✓ Created ${dbCatMap.size} categories`);

  // 4. Seed Brands from brands.json
  console.log("3. Reading and seeding Brands...");
  const usedBrandNames = new Set<string>();
  const dbBrandMap = new Map<string, string>(); // brandNameLower -> id

  const brandJsonPath = path.join(folderPath, "brands.json");
  if (fs.existsSync(brandJsonPath)) {
    try {
      const brandArray = JSON.parse(fs.readFileSync(brandJsonPath, "utf-8"));
      if (Array.isArray(brandArray)) {
        for (const item of brandArray) {
          if (!item.name || !item.name.trim()) continue;
          const rawBName = item.name.trim();
          const bSlug = slugify(rawBName);
          if (!bSlug || dbBrandMap.has(rawBName.toLowerCase())) continue;

          let uniqueBName = rawBName;
          let counter = 1;
          while (usedBrandNames.has(uniqueBName.toLowerCase())) {
            counter++;
            uniqueBName = `${rawBName} ${counter}`;
          }
          usedBrandNames.add(uniqueBName.toLowerCase());

          const brand = await prisma.brand.upsert({
            where: { slug: bSlug },
            update: { name: uniqueBName },
            create: {
              name: uniqueBName,
              slug: bSlug,
              status: "ACTIVE",
              origin: "France",
            },
          });
          dbBrandMap.set(rawBName.toLowerCase(), brand.id);
        }
      }
    } catch (e) {
      console.warn("Failed to parse brands.json", e);
    }
  }

  const defaultBrand = await prisma.brand.upsert({
    where: { slug: "parapharmacie" },
    update: {},
    create: { name: "Parapharmacie", slug: "parapharmacie", status: "ACTIVE" },
  });

  console.log(`   ✓ Created ${dbBrandMap.size} brands`);

  // 5. Gather All Products from products.json, products.jsonl, and catalog.json
  console.log("4. Gathering products from folder...");
  const productMap = new Map<string, any>(); // pSlug -> productObj

  function addProduct(item: any) {
    if (!item || !item.title || item.title === "Shop" || !item.sku) return;
    const sourceTitle = item.title.trim();
    const baseSku = item.sku || slugify(sourceTitle);
    const pSlug = slugify(sourceTitle) || baseSku;
    if (!productMap.has(pSlug)) {
      productMap.set(pSlug, { ...item, pSlug, sourceTitle, sku: baseSku });
    }
  }

  // Source 1: products.jsonl
  const jsonlPath = path.join(folderPath, "products.jsonl");
  if (fs.existsSync(jsonlPath)) {
    const lines = fs.readFileSync(jsonlPath, "utf-8").split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        addProduct(JSON.parse(line.trim()));
      } catch {}
    }
  }

  // Source 2: products.json
  const prodJsonPath = path.join(folderPath, "products.json");
  if (fs.existsSync(prodJsonPath)) {
    try {
      const pArr = JSON.parse(fs.readFileSync(prodJsonPath, "utf-8"));
      if (Array.isArray(pArr)) {
        for (const item of pArr) addProduct(item);
      }
    } catch {}
  }

  // Source 3: catalog.json
  const catLogPath = path.join(folderPath, "catalog.json");
  if (fs.existsSync(catLogPath)) {
    try {
      const catLogObj = JSON.parse(fs.readFileSync(catLogPath, "utf-8"));
      if (Array.isArray(catLogObj.products)) {
        for (const item of catLogObj.products) addProduct(item);
      }
    } catch {}
  }

  const allProducts = Array.from(productMap.values());
  console.log(`   ✓ Total unique products collected: ${allProducts.length}`);

  // 6. High-Speed Batch Insertion into PostgreSQL
  console.log("5. High-Speed Batch Inserting products into database...");
  const usedProductSlugs = new Set<string>();

  const batchSize = 25;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const chunk = allProducts.slice(i, i + batchSize);

    await prisma.$transaction(
      async (tx) => {
        for (const item of chunk) {
          const sourceTitle = item.sourceTitle;
          let pSlug = item.pSlug;

          let counter = 1;
          while (usedProductSlugs.has(pSlug)) {
            counter++;
            pSlug = `${item.pSlug}-${counter}`;
          }
          usedProductSlugs.add(pSlug);

          // Find Brand
          let brandId = defaultBrand.id;
          if (Array.isArray(item.brands) && item.brands.length > 0) {
            for (const b of item.brands) {
              if (b.name && dbBrandMap.has(b.name.trim().toLowerCase())) {
                brandId = dbBrandMap.get(b.name.trim().toLowerCase())!;
                break;
              }
            }
          }

          // Find Category
          let categoryId = rootCatId;
          if (Array.isArray(item.categoryHierarchy) && item.categoryHierarchy.length > 0) {
            for (let k = item.categoryHierarchy.length - 1; k >= 0; k--) {
              const chSlug = slugify(item.categoryHierarchy[k].slug);
              if (chSlug && dbCatMap.has(chSlug)) {
                categoryId = dbCatMap.get(chSlug)!;
                break;
              }
            }
          } else if (Array.isArray(item.categories) && item.categories.length > 0) {
            for (const c of item.categories) {
              const cSlug = slugify(c.slug);
              if (cSlug && dbCatMap.has(cSlug)) {
                categoryId = dbCatMap.get(cSlug)!;
                break;
              }
            }
          }

          // Prices & Stock
          const regularPrice = item.prices?.regularPriceMillimes || item.prices?.currentPriceMillimes || 25000;
          const salePrice = item.prices?.salePriceMillimes || null;
          const sellingPrice = salePrice || regularPrice;
          const stockQty = item.stock === "IN_STOCK" ? 50 : 0;

          const brandName = Array.isArray(item.brands) && item.brands[0]?.name ? item.brands[0].name : "ParaTunisie";
          const categoryName = Array.isArray(item.categories) && item.categories[0]?.name ? item.categories[0].name : "Soin";

          const primaryImage = Array.isArray(item.images) && item.images[0]?.sourceUrl
            ? item.images[0].sourceUrl
            : "/assets/product-tube.webp";

          // Create Product
          const product = await tx.product.create({
            data: {
              slug: pSlug,
              name: sourceTitle,
              benefit: "Soin dermatologique haute qualité pour peaux sensibles et exigences quotidiennes.",
              description: item.description || "Description non disponible",
              usage: "Appliquer généreusement sur une peau propre et sèche matin et soir.",
              image: primaryImage,
              brandId,
              categoryId,
              skinTypes: JSON.stringify(["Peaux sensibles", "Toutes peaux"]),
              routineTime: JSON.stringify(["Matin", "Soir"]),
              seoTitle: `${sourceTitle} | ParaTunisie`,
              seoDescription: `Achetez ${sourceTitle} en Tunisie au meilleur prix parapharmacie. Livraison rapide.`,
              seoKeywords: JSON.stringify([sourceTitle, brandName, categoryName]),
              seoFaq: JSON.stringify([
                { question: "Comment utiliser ce produit ?", answer: "Appliquer sur peau propre et masser délicatement." },
                { question: "Est-il adapté aux peaux sensibles ?", answer: "Oui, formule haute tolérance dermatologique." }
              ]),
              seoScore: 92,
              publishState: "PUBLISHED",
              variants: {
                create: {
                  label: sourceTitle,
                  priceMillimes: sellingPrice,
                  sku: pSlug,
                  stock: stockQty,
                },
              },
              images: {
                create: (item.images || []).slice(0, 3).map((img: any, idx: number) => ({
                  url: img.sourceUrl || primaryImage,
                  alt: `${sourceTitle} - Image ${idx + 1}`,
                  position: idx,
                })),
              },
            },
          });

          // Create CompetitorPrice
          await tx.competitorPrice.create({
            data: {
              providerId: provider.id,
              productId: product.id,
              priceMillimes: regularPrice,
              oldPriceMillimes: salePrice ? regularPrice : null,
              currency: "TND",
            },
          });

          // Create ImportedProduct
          await tx.importedProduct.create({
            data: {
              providerId: provider.id,
              externalId: pSlug,
              sourceUrl: item.source?.url || `https://tunisiepara.com/shop/${pSlug}/`,
              sourceTitle,
              sourceCategory: categoryName,
              sourceBrand: brandName,
              sourcePrice: regularPrice,
              sourceOldPrice: salePrice ? regularPrice : null,
              sourceData: JSON.stringify(item),
              status: "IMPORTED",
              seoStatus: "GENERATED",
              seoScore: 92,
              productId: product.id,
            },
          });
        }
      },
      { timeout: 60000 }
    );

    if ((i + batchSize) % 500 === 0 || i + batchSize >= allProducts.length) {
      console.log(`   ✓ Inserted batch ${Math.min(i + batchSize, allProducts.length)} / ${allProducts.length} products...`);
    }
  }

  console.log(`\n=================================================`);
  console.log(` SUCCESS: High-speed seeded ALL ${allProducts.length} products!`);
  console.log(` Total Categories: ${await prisma.category.count()}`);
  console.log(` Total Brands: ${await prisma.brand.count()}`);
  console.log(` Total Products: ${await prisma.product.count()}`);
  console.log(`=================================================`);

  await app.close();
}

void seedEverything();
