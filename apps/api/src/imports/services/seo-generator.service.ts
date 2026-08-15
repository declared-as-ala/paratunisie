import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { LocalSeoProvider } from "../provider/local-seo.provider";
import { OpenAiSeoProvider } from "../provider/openai-seo.provider";
import { GeneratedSeoResult, SeoFactsInput } from "../provider/seo-provider.interface";
import { ScrapedProductDetails } from "../provider/catalog-provider.interface";

@Injectable()
export class SeoGeneratorService {
  private readonly logger = new Logger(SeoGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly localSeoProvider: LocalSeoProvider,
    private readonly openAiSeoProvider: OpenAiSeoProvider
  ) {}

  slugify(text: string): string {
    return this.localSeoProvider.slugify(text);
  }

  computeFactsHash(facts: SeoFactsInput): string {
    const raw = JSON.stringify({
      name: facts.name,
      brand: facts.brand,
      category: facts.category,
      volumeSize: facts.volumeSize,
      ingredients: facts.ingredients,
      usage: facts.usage,
      verifiedBenefits: facts.verifiedBenefits,
      sellingPriceMillimes: facts.sellingPriceMillimes,
    });
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  async generateProductSeo(
    facts: ScrapedProductDetails,
    options?: { sellingPriceMillimes?: number; importedProductId?: string }
  ): Promise<GeneratedSeoResult> {
    const seoFacts: SeoFactsInput = {
      name: facts.sourceTitle,
      brand: facts.sourceBrand,
      category: facts.sourceCategory,
      volumeSize: facts.volumeSize,
      ingredients: facts.ingredients,
      usage: facts.usage,
      verifiedBenefits: facts.benefits,
      sellingPriceMillimes: options?.sellingPriceMillimes,
      sourceUrl: facts.sourceUrl,
    };

    const factsHash = this.computeFactsHash(seoFacts);
    const aiEnabled = process.env.SEO_AI_ENABLED === "true";
    const providerCode = aiEnabled ? (process.env.SEO_AI_PROVIDER || "openai") : "local";
    const apiKey = process.env.OPENAI_API_KEY;
    const model = aiEnabled ? (process.env.SEO_AI_MODEL || "gpt-4o-mini") : "local-engine-v1";
    const promptVersion = process.env.SEO_PROMPT_VERSION || "v1";

    // 1. Caching Check: Has this exact factual input already been generated with current provider/model/promptVersion?
    const cached = await this.prisma.seoGenerationLog.findFirst({
      where: {
        factsHash,
        provider: providerCode,
        model,
        promptVersion,
        status: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
    });

    if (cached && cached.createdContent) {
      try {
        this.logger.log(`[SEO CACHE HIT] Using cached SEO for ${facts.sourceTitle}`);
        const parsed = JSON.parse(cached.createdContent);
        return {
          ...parsed,
          provider: providerCode,
          model,
          promptVersion,
          durationMs: 0,
        };
      } catch {
        // Cache parse error fallback
      }
    }

    // 2. Generate content via AI or Local Engine
    let result: GeneratedSeoResult;
    let errorMsg: string | undefined;

    if (aiEnabled && providerCode === "openai" && apiKey) {
      try {
        this.logger.log(`[SEO AI] Generating via OpenAI ${model} for ${facts.sourceTitle}...`);
        result = await this.openAiSeoProvider.generate(seoFacts, {
          apiKey,
          model,
          promptVersion,
        });
      } catch (err) {
        errorMsg = (err as Error).message;
        this.logger.error(`[SEO AI FAIL] Falling back to Local Engine: ${errorMsg}`);
        result = this.localSeoProvider.generate(seoFacts, promptVersion);
      }
    } else {
      result = this.localSeoProvider.generate(seoFacts, promptVersion);
    }

    // 3. Log generation results & tokens to SeoGenerationLog
    await this.prisma.seoGenerationLog.create({
      data: {
        importedProductId: options?.importedProductId,
        provider: result.provider,
        model: result.model,
        promptVersion: result.promptVersion,
        factsHash,
        inputTokens: result.inputTokens || 0,
        outputTokens: result.outputTokens || 0,
        totalTokens: result.totalTokens || 0,
        estimatedCostUsd: result.estimatedCostUsd || 0.0,
        durationMs: result.durationMs,
        status: errorMsg ? "FAILED" : "SUCCESS",
        error: errorMsg,
        createdContent: JSON.stringify(result),
      },
    });

    return result;
  }

  // Duplicate Content Similarity Detection (Jaccard 3-gram text similarity)
  calculateTextSimilarity(text1: string, text2: string): number {
    const getGrams = (t: string) => {
      const s = t.toLowerCase().replace(/[^a-z0-9]/g, "");
      const grams = new Set<string>();
      for (let i = 0; i < s.length - 2; i++) {
        grams.add(s.substring(i, i + 3));
      }
      return grams;
    };

    const g1 = getGrams(text1);
    const g2 = getGrams(text2);
    if (g1.size === 0 || g2.size === 0) return 0;

    let intersection = 0;
    g1.forEach((g) => {
      if (g2.has(g)) intersection++;
    });

    const union = g1.size + g2.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  // Category Original SEO Generator
  generateCategorySeo(categoryName: string, availableBrands: string[]) {
    const slug = this.slugify(categoryName);
    const brandsList = availableBrands.slice(0, 5).join(", ");
    return {
      h1: categoryName,
      seoTitle: `${categoryName} en Tunisie - Parapharmacie | ParaTunisie`,
      metaDescription: `Découvrez notre gamme ${categoryName} en Tunisie. Retrouvez les plus grandes marques (${brandsList}) avec livraison rapide et paiement à la livraison.`,
      seoIntroduction: `Bienvenue dans la catégorie **${categoryName}** de ParaTunisie. Retrouvez des soins parapharmaceutiques sélectionnés pour répondre aux exigences quotidiennes de votre peau et de votre santé.`,
      seoBottomContent: `Achetez vos soins **${categoryName}** en toute confiance sur ParaTunisie. Profitez d'une expédition rapide et d'un service client dédié partout en Tunisie.`,
      faq: [
        {
          question: `Quelles sont les marques disponibles en ${categoryName} ?`,
          answer: `ParaTunisie propose une sélection de marques réputées telles que ${brandsList}.`,
        },
        {
          question: `Comment se passe la livraison des produits ${categoryName} ?`,
          answer: `La livraison est effectuée à domicile sur toute la Tunisie avec paiement à la livraison.`,
        },
      ],
      keywords: [`${slug} tunisie`, `parapharmacie ${slug} tunisie`, `acheter ${slug} tunisie`],
    };
  }

  // Brand Original SEO Generator
  generateBrandSeo(brandName: string, productCount: number) {
    const slug = this.slugify(brandName);
    return {
      h1: brandName,
      seoTitle: `Produits ${brandName} en Tunisie | ParaTunisie`,
      metaDescription: `Retrouvez tous les soins et produits de la marque ${brandName} en Tunisie sur ParaTunisie. Commandez en ligne avec livraison rapide à domicile.`,
      description: `Découvrez la sélection **${brandName}** sur ParaTunisie (${productCount} référence${productCount > 1 ? "s" : ""} disponible${productCount > 1 ? "s" : ""}). Produits certifiés parapharmacie avec paiement à la livraison.`,
      keywords: [`${brandName.toLowerCase()} tunisie`, `produits ${brandName.toLowerCase()} tunisie`, `prix ${brandName.toLowerCase()} tunisie`],
    };
  }
}
