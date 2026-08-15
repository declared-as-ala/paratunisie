import * as fs from "fs";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { LocalSeoProvider } from "../provider/local-seo.provider";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function seedFromJsonl() {
  console.log("=================================================");
  console.log(" SEEDING PARATUNISIE CATALOG FROM TUNISIEPARA PRODUCTS.JSONL ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const localSeo = new LocalSeoProvider();

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
  console.log("1. Cleaning old database records...");
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

  // 3. Read products.jsonl
  const jsonlPath = "C:\\Users\\Ala\\Desktop\\parapharmacie\\apps\\api\\scraper\\tunisiepara_data\\products.jsonl";
  if (!fs.existsSync(jsonlPath)) {
    console.error(`ERROR: File not found at ${jsonlPath}`);
    await app.close();
    process.exit(1);
  }

  const rawLines = fs.readFileSync(jsonlPath, "utf-8").split("\n");
  const rawItems: any[] = [];

  for (const line of rawLines) {
    if (!line.trim()) continue;
    try {
      const item = JSON.parse(line.trim());
      if (item && item.title && item.title !== "Shop" && item.sku) {
        rawItems.push(item);
      }
    } catch {
      // Ignore malformed JSON line
    }
  }

  console.log(`2. Parsed ${rawItems.length} valid product records from products.jsonl`);

  // 4. Extract and seed Categories & Subcategories
  console.log("3. Seeding categories...");

  interface CatNode {
    name: string;
    slug: string;
    parentSlug: string | null;
  }

  const catMap = new Map<string, CatNode>(); // slug -> CatNode
  const usedCatNames = new Set<string>();

  for (const item of rawItems) {
    if (Array.isArray(item.categoryHierarchy)) {
      for (const ch of item.categoryHierarchy) {
        if (ch.slug) {
          const rawSlug = slugify(ch.slug);
          if (!rawSlug || catMap.has(rawSlug)) continue;

          let baseName = ch.name || rawSlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
          baseName = baseName.trim();

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
            parentSlug: ch.parentSlug ? slugify(ch.parentSlug) : null,
          });
        }
      }
    }

    if (Array.isArray(item.categories)) {
      for (const c of item.categories) {
        if (c.slug) {
          const rawSlug = slugify(c.slug);
          if (!rawSlug || catMap.has(rawSlug)) continue;

          let baseName = c.name || rawSlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
          baseName = baseName.trim();

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
            parentSlug: null,
          });
        }
      }
    }
  }

  // Ensure default root categories
  const defaultRoots = ["visage", "capillaire", "corps", "solaire"];
  for (const root of defaultRoots) {
    if (!catMap.has(root)) {
      const rootName = root.charAt(0).toUpperCase() + root.slice(1);
      usedCatNames.add(rootName.toLowerCase());
      catMap.set(root, { name: rootName, slug: root, parentSlug: null });
    }
  }

  const dbCatMap = new Map<string, string>(); // slug -> id

  // First pass: parent categories (parentSlug == null)
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

  // Second pass: child categories (parentSlug != null)
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
  console.log(`   ✓ Created/updated ${dbCatMap.size} categories`);

  // 5. Extract and seed Brands
  console.log("4. Seeding brands...");
  const usedBrandNames = new Set<string>();
  const dbBrandMap = new Map<string, string>(); // brandNameLower -> id

  for (const item of rawItems) {
    if (Array.isArray(item.brands) && item.brands.length > 0) {
      for (const b of item.brands) {
        if (b.name && b.name.trim()) {
          const rawBName = b.name.trim();
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
    }
  }

  const defaultBrand = await prisma.brand.upsert({
    where: { slug: "parapharmacie" },
    update: {},
    create: { name: "Parapharmacie", slug: "parapharmacie", status: "ACTIVE" },
  });

  console.log(`   ✓ Created/updated ${dbBrandMap.size} brands`);

  // 6. Seed Products, Variants, Images, CompetitorPrices & ImportedProducts
  console.log("5. Seeding products into database...");
  let count = 0;
  const usedProductSlugs = new Set<string>();

  for (const item of rawItems) {
    const sourceTitle = item.title.trim();
    const baseSku = item.sku || slugify(sourceTitle);
    let pSlug = slugify(sourceTitle) || baseSku;

    let counter = 1;
    while (usedProductSlugs.has(pSlug)) {
      counter++;
      pSlug = `${slugify(sourceTitle)}-${counter}`;
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
      for (let i = item.categoryHierarchy.length - 1; i >= 0; i--) {
        const chSlug = slugify(item.categoryHierarchy[i].slug);
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

    // Generate local SEO text
    const brandName = Array.isArray(item.brands) && item.brands[0]?.name ? item.brands[0].name : "ParaTunisie";
    const categoryName = Array.isArray(item.categories) && item.categories[0]?.name ? item.categories[0].name : "Soin";

    const seoResult = await localSeo.generate({
      name: sourceTitle,
      brand: brandName,
      category: categoryName,
      usage: item.description || "",
      sellingPriceMillimes: sellingPrice,
    });

    const primaryImage = Array.isArray(item.images) && item.images[0]?.sourceUrl
      ? item.images[0].sourceUrl
      : "/assets/product-tube.webp";

    // Create Product
    const product = await prisma.product.create({
      data: {
        slug: pSlug,
        name: seoResult.normalizedTitle || sourceTitle,
        benefit: (seoResult.benefits || []).join(", ") || "Soin dermatologique haute qualité",
        description: seoResult.longDescription || item.description || "Description non disponible",
        usage: seoResult.usage || "Appliquer sur une peau propre et sèche.",
        image: primaryImage,
        brandId,
        categoryId,
        skinTypes: JSON.stringify(["Peaux sensibles", "Toutes peaux"]),
        routineTime: JSON.stringify(["Matin", "Soir"]),
        seoTitle: seoResult.metaTitle,
        seoDescription: seoResult.metaDescription,
        seoKeywords: JSON.stringify(seoResult.keywords || []),
        seoFaq: JSON.stringify(seoResult.faq || []),
        seoScore: seoResult.seoScore || 85,
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
          create: (item.images || []).map((img: any, idx: number) => ({
            url: img.sourceUrl || primaryImage,
            alt: `${sourceTitle} - Image ${idx + 1}`,
            position: idx,
          })),
        },
      },
    });

    // Create CompetitorPrice record
    await prisma.competitorPrice.create({
      data: {
        providerId: provider.id,
        productId: product.id,
        priceMillimes: regularPrice,
        oldPriceMillimes: salePrice ? regularPrice : null,
        currency: "TND",
      },
    });

    // Create ImportedProduct record
    await prisma.importedProduct.create({
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
        seoScore: seoResult.seoScore || 85,
        productId: product.id,
      },
    });

    count++;
    if (count % 100 === 0) {
      console.log(`   Processed ${count} / ${rawItems.length} products...`);
    }
  }

  console.log(`\n=================================================`);
  console.log(` SUCCESS: Seeded ${count} products into database!`);
  console.log(` Total Categories: ${await prisma.category.count()}`);
  console.log(` Total Brands: ${await prisma.brand.count()}`);
  console.log(` Total Products: ${await prisma.product.count()}`);
  console.log(`=================================================`);

  await app.close();
}

void seedFromJsonl();
