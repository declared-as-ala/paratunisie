import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ImportStatus, ProductPublishState, SeoStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CatalogProvider } from "../provider/catalog-provider.interface";
import { TunisieParaProvider } from "../provider/tunisiepara.provider";
import { MediaService } from "./media.service";
import { SeoGeneratorService } from "./seo-generator.service";
import { ImportQueryDto } from "../dto/import-query.dto";
import { RunImportDto } from "../dto/run-import.dto";
import { BrandMappingDto, CategoryMappingDto } from "../dto/update-mapping.dto";

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);
  private readonly providers = new Map<string, CatalogProvider>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tunisieParaProvider: TunisieParaProvider,
    private readonly mediaService: MediaService,
    private readonly seoGeneratorService: SeoGeneratorService
  ) {
    this.registerProvider(this.tunisieParaProvider);
  }

  private registerProvider(provider: CatalogProvider) {
    this.providers.set(provider.code, provider);
  }

  private getProvider(code = "tunisiepara"): CatalogProvider {
    const provider = this.providers.get(code);
    if (!provider) {
      throw new NotFoundException(`Fournisseur d'import introuvable: ${code}`);
    }
    return provider;
  }

  private async ensureProviderRecord(provider: CatalogProvider) {
    return this.prisma.importProvider.upsert({
      where: { code: provider.code },
      update: { baseUrl: provider.baseUrl, name: provider.name },
      create: {
        code: provider.code,
        name: provider.name,
        baseUrl: provider.baseUrl,
        isActive: true,
      },
    });
  }

  async getOverview(providerCode = "tunisiepara") {
    const provider = this.getProvider(providerCode);
    const dbProvider = await this.ensureProviderRecord(provider);

    const [
      discovered,
      imported,
      updated,
      ignored,
      failed,
      reviewRequired,
      lastRun,
      categoryCount,
      brandCount,
    ] = await Promise.all([
      this.prisma.importedProduct.count({ where: { providerId: dbProvider.id } }),
      this.prisma.importedProduct.count({ where: { providerId: dbProvider.id, status: ImportStatus.IMPORTED } }),
      this.prisma.importedProduct.count({ where: { providerId: dbProvider.id, status: ImportStatus.UPDATED } }),
      this.prisma.importedProduct.count({ where: { providerId: dbProvider.id, status: ImportStatus.IGNORED } }),
      this.prisma.importedProduct.count({ where: { providerId: dbProvider.id, status: ImportStatus.FAILED } }),
      this.prisma.importedProduct.count({ where: { providerId: dbProvider.id, status: ImportStatus.REVIEW_REQUIRED } }),
      this.prisma.importRun.findFirst({
        where: { providerId: dbProvider.id },
        orderBy: { startedAt: "desc" },
      }),
      this.prisma.categoryMapping.count({ where: { providerId: dbProvider.id } }),
      this.prisma.brandMapping.count({ where: { providerId: dbProvider.id } }),
    ]);

    return {
      provider: {
        code: dbProvider.code,
        name: dbProvider.name,
        baseUrl: dbProvider.baseUrl,
      },
      stats: {
        totalDiscovered: discovered,
        imported,
        updated,
        ignored,
        failed,
        reviewRequired,
        pending: discovered - (imported + ignored + failed),
        categoryMappingsCount: categoryCount,
        brandMappingsCount: brandCount,
        lastSyncAt: lastRun?.startedAt || null,
      },
    };
  }

  async getImportedProducts(query: ImportQueryDto) {
    const provider = this.getProvider(query.providerCode || "tunisiepara");
    const dbProvider = await this.ensureProviderRecord(provider);

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: any = { providerId: dbProvider.id };
    if (query.status) where.status = query.status;
    if (query.seoStatus) where.seoStatus = query.seoStatus;
    if (query.brand) where.sourceBrand = { contains: query.brand, mode: "insensitive" };
    if (query.category) where.sourceCategory = { contains: query.category, mode: "insensitive" };
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { sourceTitle: { contains: search, mode: "insensitive" } },
        { sourceUrl: { contains: search, mode: "insensitive" } },
        { externalId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.importedProduct.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              publishState: true,
              seoTitle: true,
              seoDescription: true,
              description: true,
              seoFaq: true,
              seoKeywords: true,
              seoScore: true,
              brand: { select: { name: true } },
              category: { select: { name: true } },
            },
          },
          errors: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { scrapedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.importedProduct.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async discoverCatalog(dto: RunImportDto) {
    const provider = this.getProvider(dto.providerCode || "tunisiepara");
    const dbProvider = await this.ensureProviderRecord(provider);

    this.logger.log(`Lancement de la découverte du catalogue ${provider.name}...`);

    const run = await this.prisma.importRun.create({
      data: {
        providerId: dbProvider.id,
        status: ImportStatus.IMPORTING,
        dryRun: Boolean(dto.dryRun),
      },
    });

    try {
      const discoveredItems = await provider.discoverProducts({
        categoryUrl: dto.categoryUrl,
        limit: dto.limit ?? 50,
      });

      let newCount = 0;
      let updateCount = 0;

      for (const item of discoveredItems) {
        if (dto.dryRun) continue;

        const existing = await this.prisma.importedProduct.findUnique({
          where: {
            providerId_externalId: {
              providerId: dbProvider.id,
              externalId: item.externalId,
            },
          },
        });

        if (!existing) {
          await this.prisma.importedProduct.create({
            data: {
              providerId: dbProvider.id,
              externalId: item.externalId,
              sourceUrl: item.sourceUrl,
              sourceTitle: item.sourceTitle,
              sourceCategory: item.sourceCategory,
              sourceBrand: item.sourceBrand,
              sourcePrice: item.sourcePriceMillimes,
              sourceOldPrice: item.sourceOldPriceMillimes,
              status: ImportStatus.DISCOVERED,
            },
          });
          newCount++;
        } else {
          await this.prisma.importedProduct.update({
            where: { id: existing.id },
            data: {
              sourcePrice: item.sourcePriceMillimes ?? existing.sourcePrice,
              sourceOldPrice: item.sourceOldPriceMillimes ?? existing.sourceOldPrice,
              lastCheckedAt: new Date(),
            },
          });
          updateCount++;
        }

        // Auto-seed Category and Brand Mappings if present
        if (item.sourceCategory) {
          await this.prisma.categoryMapping.upsert({
            where: { providerId_sourceCategory: { providerId: dbProvider.id, sourceCategory: item.sourceCategory } },
            update: {},
            create: { providerId: dbProvider.id, sourceCategory: item.sourceCategory },
          });
        }
        if (item.sourceBrand) {
          await this.prisma.brandMapping.upsert({
            where: { providerId_sourceBrand: { providerId: dbProvider.id, sourceBrand: item.sourceBrand } },
            update: {},
            create: { providerId: dbProvider.id, sourceBrand: item.sourceBrand },
          });
        }
      }

      await this.prisma.importRun.update({
        where: { id: run.id },
        data: {
          status: ImportStatus.IMPORTED,
          discoveredCount: discoveredItems.length,
          importedCount: newCount,
          updatedCount: updateCount,
          finishedAt: new Date(),
        },
      });

      return {
        runId: run.id,
        discoveredCount: discoveredItems.length,
        newCount,
        updateCount,
        dryRun: dto.dryRun,
      };
    } catch (err) {
      await this.prisma.importRun.update({
        where: { id: run.id },
        data: {
          status: ImportStatus.FAILED,
          finishedAt: new Date(),
          logsJson: JSON.stringify([{ error: (err as Error).message }]),
        },
      });
      throw err;
    }
  }

  async runImportBatch(dto: RunImportDto) {
    const provider = this.getProvider(dto.providerCode || "tunisiepara");
    const dbProvider = await this.ensureProviderRecord(provider);

    const limit = dto.limit ?? 10;
    const pendingItems = await this.prisma.importedProduct.findMany({
      where: {
        providerId: dbProvider.id,
        status: { in: [ImportStatus.DISCOVERED, ImportStatus.PENDING, ImportStatus.FAILED] },
      },
      take: limit,
      orderBy: { scrapedAt: "asc" },
    });

    let successCount = 0;
    let failCount = 0;

    for (const item of pendingItems) {
      try {
        if (dto.dryRun) {
          this.logger.log(`[DRY-RUN] Importation simulée de ${item.sourceTitle}`);
          successCount++;
          continue;
        }

        await this.importSingleProduct(dbProvider.id, item, provider, dto);
        successCount++;
      } catch (cause) {
        failCount++;
        const message = (cause as Error).message;
        this.logger.error(`Échec import ${item.sourceUrl}: ${message}`);

        await this.prisma.importedProduct.update({
          where: { id: item.id },
          data: { status: ImportStatus.FAILED },
        });

        await this.prisma.importError.create({
          data: {
            importedProductId: item.id,
            url: item.sourceUrl,
            step: "IMPORT_BATCH",
            message,
            stackTrace: (cause as Error).stack,
          },
        });
      }
    }

    return {
      processed: pendingItems.length,
      successCount,
      failCount,
      dryRun: dto.dryRun,
    };
  }

  async importSingleProduct(
    providerId: string,
    item: any,
    provider: CatalogProvider,
    options?: RunImportDto
  ) {
    // 1. Scrape details
    const scraped = await provider.scrapeProduct(item.sourceUrl);

    // 2. Resolve or Create Brand
    const brandName = scraped.sourceBrand || item.sourceBrand || "Marque ParaTunisie";
    const brandMapping = await this.prisma.brandMapping.findUnique({
      where: { providerId_sourceBrand: { providerId, sourceBrand: brandName } },
    });
    let targetBrandId = brandMapping?.targetBrandId;

    if (!targetBrandId) {
      const brandSlug = this.seoGeneratorService.slugify(brandName);
      const brand = await this.prisma.brand.upsert({
        where: { slug: brandSlug },
        update: {},
        create: {
          name: brandName,
          slug: brandSlug,
          status: "ACTIVE",
        },
      });
      targetBrandId = brand.id;
    }

    // 3. Resolve or Create Category
    const categoryName = scraped.sourceCategory || item.sourceCategory || "Soins";
    const categoryMapping = await this.prisma.categoryMapping.findUnique({
      where: { providerId_sourceCategory: { providerId, sourceCategory: categoryName } },
    });
    let targetCategoryId = categoryMapping?.targetCategoryId;

    if (!targetCategoryId) {
      const categorySlug = this.seoGeneratorService.slugify(categoryName);
      const category = await this.prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: {
          name: categoryName,
          slug: categorySlug,
          status: "ACTIVE",
        },
      });
      targetCategoryId = category.id;
    }

    // 4. Download main image (no hotlinking!)
    let mainImageUrl = "/assets/product-tube.webp";
    if (options?.downloadImages !== false && scraped.mainImage) {
      const downloaded = await this.mediaService.downloadAndStoreImage(
        scraped.mainImage,
        scraped.sourceTitle,
        0
      );
      if (downloaded) {
        mainImageUrl = downloaded.url;
      }
    }

    // 5. Generate Original SEO Payload (Strictly ZERO competitor price leak!)
    const seoPayload = await this.seoGeneratorService.generateProductSeo(scraped, {
      importedProductId: item.id,
    });
    const factsHash = this.seoGeneratorService.computeFactsHash({
      name: scraped.sourceTitle,
      brand: scraped.sourceBrand,
      category: scraped.sourceCategory,
      volumeSize: scraped.volumeSize,
      ingredients: scraped.ingredients,
      usage: scraped.usage,
      verifiedBenefits: scraped.benefits,
    });

    // 6. Price calculations — Competitor price is kept separate from selling price!
    // ParaTunisie selling price defaults to competitor price initially ONLY if selling price is empty,
    // but SEO generator receives NO price unless explicitly configured.

    // 7. Find or Create Product (Idempotent matching)
    let product = item.productId
      ? await this.prisma.product.findUnique({ where: { id: item.productId } })
      : await this.prisma.product.findUnique({ where: { slug: seoPayload.slug } });

    if (!product) {
      product = await this.prisma.product.create({
        data: {
          slug: seoPayload.slug,
          name: seoPayload.normalizedTitle,
          benefit: seoPayload.benefits[0] || "Soin parapharmacie haute performance",
          description: seoPayload.longDescription,
          usage: seoPayload.usage || "",
          image: mainImageUrl,
          brandId: targetBrandId,
          categoryId: targetCategoryId,
          seoTitle: seoPayload.metaTitle,
          seoDescription: seoPayload.metaDescription,
          seoKeywords: JSON.stringify(seoPayload.keywords),
          seoFaq: JSON.stringify(seoPayload.faq),
          seoScore: seoPayload.seoScore,
          publishState: options?.autoPublish ? ProductPublishState.PUBLISHED : ProductPublishState.DRAFT,
          variants: {
            create: [
              {
                label: scraped.volumeSize || "Format Standard",
                priceMillimes: scraped.sourcePriceMillimes || 0,
                stock: 50,
              },
            ],
          },
        },
      });
    } else {
      // Respect manualOverrides
      const overrides: string[] = JSON.parse(product.manualOverrides || "[]");
      const updateData: any = {};

      if (!overrides.includes("name")) updateData.name = seoPayload.normalizedTitle;
      if (!overrides.includes("description")) updateData.description = seoPayload.longDescription;
      if (!overrides.includes("usage")) updateData.usage = seoPayload.usage;
      if (!overrides.includes("image") && mainImageUrl !== "/assets/product-tube.webp") updateData.image = mainImageUrl;
      if (!overrides.includes("seoTitle")) updateData.seoTitle = seoPayload.metaTitle;
      if (!overrides.includes("seoDescription")) updateData.seoDescription = seoPayload.metaDescription;

      updateData.seoScore = seoPayload.seoScore;
      updateData.seoKeywords = JSON.stringify(seoPayload.keywords);
      updateData.seoFaq = JSON.stringify(seoPayload.faq);

      product = await this.prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
    }

    // 8. Duplicate Content Similarity Detection
    const recentProducts = await this.prisma.product.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: { description: true },
    });
    let maxSimilarity = 0;
    for (const recent of recentProducts) {
      if (recent.description && product.description) {
        const sim = this.seoGeneratorService.calculateTextSimilarity(product.description, recent.description);
        if (sim > maxSimilarity) maxSimilarity = sim;
      }
    }
    const isSimilar = maxSimilarity > 0.7;

    // 9. Store Competitor Price & Price History (Internal Business Intelligence)
    if (scraped.sourcePriceMillimes) {
      const compPrice = await this.prisma.competitorPrice.upsert({
        where: {
          providerId_productId: {
            providerId,
            productId: product.id,
          },
        },
        update: {
          priceMillimes: scraped.sourcePriceMillimes,
          oldPriceMillimes: scraped.sourceOldPriceMillimes,
          checkedAt: new Date(),
        },
        create: {
          providerId,
          productId: product.id,
          priceMillimes: scraped.sourcePriceMillimes,
          oldPriceMillimes: scraped.sourceOldPriceMillimes,
        },
      });

      await this.prisma.competitorPriceHistory.create({
        data: {
          competitorPriceId: compPrice.id,
          priceMillimes: scraped.sourcePriceMillimes,
          oldPriceMillimes: scraped.sourceOldPriceMillimes,
        },
      });
    }

    // 10. Update ImportedProduct Record
    await this.prisma.importedProduct.update({
      where: { id: item.id },
      data: {
        productId: product.id,
        sourceTitle: scraped.sourceTitle,
        sourceBrand: scraped.sourceBrand,
        sourceCategory: scraped.sourceCategory,
        sourcePrice: scraped.sourcePriceMillimes,
        sourceOldPrice: scraped.sourceOldPriceMillimes,
        sourceData: JSON.stringify(scraped),
        status: isSimilar ? ImportStatus.REVIEW_REQUIRED : ImportStatus.IMPORTED,
        seoStatus: SeoStatus.GENERATED,
        seoScore: seoPayload.seoScore,
        factsHash,
        seoPromptVersion: seoPayload.promptVersion,
        similarityFlag: isSimilar,
        lastCheckedAt: new Date(),
      },
    });

    return product;
  }

  async publishProduct(importedProductId: string, state: ProductPublishState) {
    const item = await this.prisma.importedProduct.findUnique({
      where: { id: importedProductId },
      include: { product: { include: { variants: true } } },
    });
    if (!item || !item.product) {
      throw new NotFoundException("Produit importé ou produit associé introuvable");
    }

    // Backend Guard: Cannot publish a product without a valid ParaTunisie selling price!
    if (state === ProductPublishState.PUBLISHED) {
      const variant = item.product.variants[0];
      if (!variant || !variant.priceMillimes || variant.priceMillimes <= 0) {
        throw new BadRequestException(
          "Impossible de publier un produit sans prix de vente ParaTunisie valide (sellingPriceMillimes)."
        );
      }
    }

    await this.prisma.product.update({
      where: { id: item.product.id },
      data: { publishState: state },
    });

    await this.prisma.importedProduct.update({
      where: { id: item.id },
      data: { status: ImportStatus.IMPORTED, seoStatus: SeoStatus.APPROVED },
    });

    return { id: item.id, publishState: state };
  }

  async setCategoryMapping(dto: CategoryMappingDto) {
    const provider = this.getProvider(dto.providerCode);
    const dbProvider = await this.ensureProviderRecord(provider);

    return this.prisma.categoryMapping.upsert({
      where: {
        providerId_sourceCategory: {
          providerId: dbProvider.id,
          sourceCategory: dto.sourceCategory,
        },
      },
      update: { targetCategoryId: dto.targetCategoryId },
      create: {
        providerId: dbProvider.id,
        sourceCategory: dto.sourceCategory,
        targetCategoryId: dto.targetCategoryId,
      },
    });
  }

  async setBrandMapping(dto: BrandMappingDto) {
    const provider = this.getProvider(dto.providerCode);
    const dbProvider = await this.ensureProviderRecord(provider);

    return this.prisma.brandMapping.upsert({
      where: {
        providerId_sourceBrand: {
          providerId: dbProvider.id,
          sourceBrand: dto.sourceBrand,
        },
      },
      update: { targetBrandId: dto.targetBrandId },
      create: {
        providerId: dbProvider.id,
        sourceBrand: dto.sourceBrand,
        targetBrandId: dto.targetBrandId,
      },
    });
  }

  async getErrors() {
    return this.prisma.importError.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        importedProduct: {
          select: { sourceTitle: true, sourceUrl: true },
        },
      },
    });
  }

  async getSeoStats() {
    const [totalGenerated, totalFailed, totalCached, aggregateTokens] = await Promise.all([
      this.prisma.seoGenerationLog.count({ where: { status: "SUCCESS" } }),
      this.prisma.seoGenerationLog.count({ where: { status: "FAILED" } }),
      this.prisma.seoGenerationLog.count({ where: { status: "CACHED" } }),
      this.prisma.seoGenerationLog.aggregate({
        _sum: {
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          estimatedCostUsd: true,
        },
      }),
    ]);

    const activeProvider = process.env.SEO_AI_ENABLED === "true" ? (process.env.SEO_AI_PROVIDER || "openai") : "local";
    const activeModel = process.env.SEO_AI_ENABLED === "true" ? (process.env.SEO_AI_MODEL || "gpt-4o-mini") : "local-engine-v1";
    const promptVersion = process.env.SEO_PROMPT_VERSION || "v1";

    return {
      aiEnabled: process.env.SEO_AI_ENABLED === "true",
      activeProvider,
      activeModel,
      promptVersion,
      totalGenerated,
      totalFailed,
      totalCached,
      totalTokens: aggregateTokens._sum.totalTokens || 0,
      estimatedCostUsd: aggregateTokens._sum.estimatedCostUsd || 0.0,
    };
  }

  async deleteImportedProduct(id: string) {
    const item = await this.prisma.importedProduct.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Produit importé introuvable");

    if (item.productId) {
      const pid = item.productId;
      await this.prisma.importedProduct.update({ where: { id }, data: { productId: null } });
      await this.prisma.orderItem.deleteMany({ where: { productId: pid } });
      await this.prisma.review.deleteMany({ where: { productId: pid } });
      await this.prisma.wishlistItem.deleteMany({ where: { productId: pid } });
      await this.prisma.routineItem.deleteMany({ where: { productId: pid } });
      await this.prisma.articleProduct.deleteMany({ where: { productId: pid } });
      await this.prisma.competitorPrice.deleteMany({ where: { productId: pid } });
      await this.prisma.productVariant.deleteMany({ where: { productId: pid } });
      await this.prisma.productImage.deleteMany({ where: { productId: pid } });
      await this.prisma.product.delete({ where: { id: pid } });
    }

    await this.prisma.importedProduct.delete({ where: { id } });
    return { id, deleted: true };
  }

  async bulkDeleteImportedProducts(ids: string[]) {
    if (!ids || ids.length === 0) return { count: 0 };
    const items = await this.prisma.importedProduct.findMany({
      where: { id: { in: ids } },
      select: { id: true, productId: true },
    });

    const productIds = items.map((i) => i.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      await this.prisma.importedProduct.updateMany({
        where: { id: { in: ids } },
        data: { productId: null },
      });
      await this.prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.review.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.routineItem.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.articleProduct.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.competitorPrice.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.productVariant.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.productImage.deleteMany({ where: { productId: { in: productIds } } });
      await this.prisma.product.deleteMany({ where: { id: { in: productIds } } });
    }

    const res = await this.prisma.importedProduct.deleteMany({ where: { id: { in: ids } } });
    return { count: res.count, deleted: true };
  }
}
