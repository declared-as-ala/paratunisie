import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { ImportsService } from "../services/imports.service";
import { SeoGeneratorService } from "../services/seo-generator.service";
import { PrismaService } from "../../prisma/prisma.service";

async function runRegeneration() {
  console.log("=================================================");
  console.log(" RE-GENERATING SEO WITH NEW QUALITY & SAFETY ENGINE ");
  console.log("=================================================");

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const seoService = app.get(SeoGeneratorService);
  const importsService = app.get(ImportsService);

  const importedProducts = await prisma.importedProduct.findMany({
    take: 10,
    include: { product: { include: { variants: true } } },
    orderBy: { scrapedAt: "asc" },
  });

  console.log(`Found ${importedProducts.length} products to re-evaluate.\n`);

  for (const item of importedProducts) {
    const scraped = JSON.parse(item.sourceData || "{}");
    if (!scraped.sourceTitle) continue;

    // Capture BEFORE state
    const beforeState = {
      title: item.product?.name,
      seoTitle: item.product?.seoTitle,
      metaDescription: item.product?.seoDescription,
      shortDescription: item.product?.benefit,
      descriptionSnippet: item.product?.description?.substring(0, 150),
      seoScore: item.seoScore,
      faq: item.product?.seoFaq,
    };

    // Re-generate using new Local Engine & Safety rules
    // Competitor price is NOT passed as selling price!
    const newSeo = await seoService.generateProductSeo(scraped, {
      importedProductId: item.id,
      sellingPriceMillimes: item.product?.variants?.[0]?.priceMillimes,
    });

    const factsHash = seoService.computeFactsHash({
      name: scraped.sourceTitle,
      brand: scraped.sourceBrand,
      category: scraped.sourceCategory,
      volumeSize: scraped.volumeSize,
      ingredients: scraped.ingredients,
      usage: scraped.usage,
      verifiedBenefits: scraped.benefits,
    });

    // Update Product in DB
    if (item.product) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          name: newSeo.normalizedTitle,
          slug: newSeo.slug,
          seoTitle: newSeo.metaTitle,
          seoDescription: newSeo.metaDescription,
          description: newSeo.longDescription,
          usage: newSeo.usage || "",
          seoKeywords: JSON.stringify(newSeo.keywords),
          seoFaq: JSON.stringify(newSeo.faq),
          seoScore: newSeo.seoScore,
        },
      });

      await prisma.importedProduct.update({
        where: { id: item.id },
        data: {
          seoScore: newSeo.seoScore,
          factsHash,
          seoPromptVersion: newSeo.promptVersion,
        },
      });
    }

    console.log(`\n=================================================`);
    console.log(`PRODUCT: ${scraped.sourceTitle}`);
    console.log(`=================================================`);
    console.log(`--- BEFORE ---`);
    console.log(`Title: ${beforeState.title}`);
    console.log(`Meta Title: ${beforeState.seoTitle}`);
    console.log(`Meta Desc: ${beforeState.metaDescription}`);
    console.log(`SEO Score: ${beforeState.seoScore}`);

    console.log(`\n--- AFTER (IMPROVED ENGINE) ---`);
    console.log(`Normalized Title: ${newSeo.normalizedTitle}`);
    console.log(`Slug: ${newSeo.slug}`);
    console.log(`Meta Title: ${newSeo.metaTitle}`);
    console.log(`Meta Desc: ${newSeo.metaDescription}`);
    console.log(`SEO Score: ${newSeo.seoScore}`);
    console.log(`Zero Price Leak Check: ${newSeo.metaDescription.includes("DT") ? (item.product?.variants?.[0]?.priceMillimes ? "YES (Valid Selling Price)" : "LEAK ERROR") : "NO PRICE LEAK"}`);
    console.log(`FAQ Count: ${newSeo.faq.length}`);
  }

  await app.close();
}

void runRegeneration();
