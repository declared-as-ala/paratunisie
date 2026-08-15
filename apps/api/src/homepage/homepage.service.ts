import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface UpdateSectionConfigDto {
  sectionKey: string;
  enabled?: boolean;
  position?: number;
  mode?: "MANUAL" | "AUTOMATIC" | "HYBRID";
  title?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface CreateCampaignDto {
  title: string;
  eyebrow?: string;
  description?: string;
  desktopMedia?: string;
  mobileMedia?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  position?: number;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

const DEFAULT_SECTIONS = [
  { sectionKey: "hero", position: 1, title: "Votre routine beauté commence par le bon conseil", enabled: true, mode: "MANUAL", settings: {} },
  { sectionKey: "best_sellers", position: 3, title: "Les favoris ParaTunisie", enabled: true, mode: "HYBRID", settings: { limit: 8 } },
  { sectionKey: "promotions", position: 4, title: "Offres du moment", enabled: true, mode: "AUTOMATIC", settings: { limit: 6 } },
  { sectionKey: "routine_bundle", position: 5, title: "Routine sur-mesure", enabled: true, mode: "MANUAL", settings: {} },
  { sectionKey: "new_arrivals", position: 6, title: "Nouveautés", enabled: true, mode: "AUTOMATIC", settings: { limit: 8 } },
  { sectionKey: "featured_brands", position: 7, title: "Marques de confiance", enabled: true, mode: "AUTOMATIC", settings: {} },
  { sectionKey: "seasonal_campaign", position: 8, title: "L'été sous haute protection", enabled: true, mode: "HYBRID", settings: {} },
  { sectionKey: "everyday_essentials", position: 9, title: "Les essentiels du quotidien", enabled: true, mode: "AUTOMATIC", settings: { limit: 6 } },
  { sectionKey: "shop_by_budget", position: 10, title: "Pour chaque budget", enabled: true, mode: "AUTOMATIC", settings: {} },
  { sectionKey: "expert_advice", position: 11, title: "Conseils de nos pharmaciens", enabled: true, mode: "AUTOMATIC", settings: {} },
  { sectionKey: "trust_reassurance", position: 12, title: "Pourquoi nous faire confiance", enabled: true, mode: "MANUAL", settings: {} },
];

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Initializes default homepage sections if not created yet.
   */
  private async ensureDefaultSections() {
    try {
      const count = await this.prisma.homepageConfig.count();
      if (count === 0) {
        for (const s of DEFAULT_SECTIONS) {
          await this.prisma.homepageConfig.create({
            data: {
              sectionKey: s.sectionKey,
              position: s.position,
              title: s.title,
              enabled: s.enabled,
              mode: s.mode,
              settings: JSON.stringify(s.settings),
            },
          });
        }
      }
    } catch {
      /* DB fallback */
    }
  }

  /**
   * Returns storefront homepage configuration with dynamically resolved products,
   * active seasonal campaigns, concerns with real product counts, and expert advice.
   */
  async getStorefrontConfig() {
    await this.ensureDefaultSections();

    try {
      // 1. Fetch section configs
      const rawConfigs = await this.prisma.homepageConfig.findMany({
        orderBy: { position: "asc" },
      });

      const sections = rawConfigs.map((c) => {
        let settings = {};
        try {
          settings = JSON.parse(c.settings);
        } catch {
          settings = {};
        }
        return {
          sectionKey: c.sectionKey,
          enabled: c.enabled,
          position: c.position,
          mode: c.mode,
          title: c.title,
          description: c.description,
          settings,
        };
      });

      // 2. Fetch active seasonal campaigns
      const now = new Date();
      const rawCampaigns = await this.prisma.homepageCampaign.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null },
          ],
        },
        orderBy: { position: "asc" },
      });

      const campaigns = rawCampaigns.map((c) => ({
        ...c,
        productIds: JSON.parse(c.productIds || "[]"),
      }));

      // 3. Fetch concerns with real product counts
      const concerns = await this.prisma.concern.findMany({
        include: {
          _count: { select: { products: true } },
        },
      });

      const concernsWithCounts = concerns.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      }));

      // 4. Fetch products for Best Sellers & New Arrivals
      const allProducts = await this.prisma.product.findMany({
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          variants: { orderBy: { priceMillimes: "asc" } },
        },
        take: 20,
      });

      // 5. Fetch expert articles with linked products
      const articles = await this.prisma.article.findMany({
        where: { status: "PUBLISHED" },
        take: 3,
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  image: true,
                  variants: { select: { priceMillimes: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      return {
        sections,
        campaigns,
        concerns: concernsWithCounts,
        products: allProducts,
        articles,
      };
    } catch {
      return {
        sections: DEFAULT_SECTIONS,
        campaigns: [],
        concerns: [],
        products: [],
        articles: [],
      };
    }
  }

  /**
   * Returns admin homepage configuration with product margin, stock, and cost details.
   */
  async getAdminConfig() {
    await this.ensureDefaultSections();

    try {
      const sections = await this.prisma.homepageConfig.findMany({
        orderBy: { position: "asc" },
      });

      const campaigns = await this.prisma.homepageCampaign.findMany({
        orderBy: { updatedAt: "desc" },
      });

      const products = await this.prisma.product.findMany({
        include: {
          brand: { select: { name: true } },
          variants: true,
          _count: { select: { orderItems: true } },
        },
      });

      const enrichedProducts = products.map((p) => {
        const variant = p.variants[0];
        const sellingPrice = variant ? variant.priceMillimes / 1000 : 0;
        const stock = variant ? variant.stock : 0;
        // Estimated margin for admin merchandising reference
        const estimatedCost = Math.round(sellingPrice * 0.65 * 1000) / 1000;
        const grossMargin = Math.round((sellingPrice - estimatedCost) * 1000) / 1000;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image,
          brandName: p.brand?.name ?? "ParaTunisie",
          sellingPrice,
          estimatedCost,
          grossMargin,
          stock,
          salesCount: p._count.orderItems,
        };
      });

      return {
        sections: sections.map((s) => ({
          ...s,
          settings: JSON.parse(s.settings || "{}"),
        })),
        campaigns: campaigns.map((c) => ({
          ...c,
          productIds: JSON.parse(c.productIds || "[]"),
        })),
        products: enrichedProducts,
      };
    } catch {
      return { sections: [], campaigns: [], products: [] };
    }
  }

  /**
   * Updates a homepage section config.
   */
  async updateSectionConfig(dto: UpdateSectionConfigDto) {
    const { sectionKey, settings, ...rest } = dto;
    const existing = await this.prisma.homepageConfig.findUnique({
      where: { sectionKey },
    });

    const updateData: Record<string, unknown> = { ...rest };
    if (settings !== undefined) {
      updateData.settings = JSON.stringify(settings);
    }

    if (!existing) {
      return this.prisma.homepageConfig.create({
        data: {
          sectionKey,
          enabled: dto.enabled ?? true,
          position: dto.position ?? 0,
          mode: dto.mode ?? "HYBRID",
          title: dto.title,
          description: dto.description,
          settings: JSON.stringify(settings ?? {}),
        },
      });
    }

    return this.prisma.homepageConfig.update({
      where: { sectionKey },
      data: updateData,
    });
  }

  /**
   * Seasonal Campaign management methods.
   */
  async createCampaign(dto: CreateCampaignDto) {
    const { productIds, startDate, endDate, ...rest } = dto;
    return this.prisma.homepageCampaign.create({
      data: {
        ...rest,
        title: dto.title,
        status: dto.status ?? "DRAFT",
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        productIds: JSON.stringify(productIds ?? []),
      },
    });
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    const { productIds, startDate, endDate, ...rest } = dto;
    const updateData: Record<string, unknown> = { ...rest };

    if (productIds !== undefined) {
      updateData.productIds = JSON.stringify(productIds);
    }
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }

    return this.prisma.homepageCampaign.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCampaign(id: string) {
    return this.prisma.homepageCampaign.delete({ where: { id } });
  }
}
