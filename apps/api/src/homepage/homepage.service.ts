import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductPublishState } from "@prisma/client";
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

export const FEATURED_SECTION_KEY = "featured_product";

/** Admin-editable settings of the homepage featured product. Price and stock are NEVER stored here. */
export interface FeaturedProductSettings {
  productSlug?: string;
  headline?: string;
  description?: string;
  imageUrl?: string;
  bullets?: string[];
  ctaLabel?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  startsAt?: string;
  endsAt?: string;
}

// Used until an admin saves a configuration: the campaign currently running on Meta Ads.
const DEFAULT_FEATURED: FeaturedProductSettings = {
  productSlug: "anabolic-whey-80-2-25kg-proactive",
  secondaryCtaLabel: "Voir toutes les whey",
  secondaryCtaUrl: "/whey-proteine",
};

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
  { sectionKey: "expert_advice", position: 11, title: "Guides et informations", enabled: true, mode: "AUTOMATIC", settings: {} },
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

  /**
   * Resolves the featured homepage product. Price, stock and the product image come from the live
   * catalogue (single source of truth); only copy and CTA come from the admin configuration.
   * Returns null when disabled, outside its schedule, or when the product is not published.
   */
  async getFeaturedProduct() {
    let enabled = true;
    let settings: FeaturedProductSettings = { ...DEFAULT_FEATURED };
    let title: string | null = null;
    let description: string | null = null;
    try {
      const row = await this.prisma.homepageConfig.findUnique({ where: { sectionKey: FEATURED_SECTION_KEY } });
      if (row) {
        enabled = row.enabled;
        title = row.title;
        description = row.description;
        try {
          settings = { ...JSON.parse(row.settings || "{}") };
        } catch {
          settings = {};
        }
      }
    } catch {
      /* fall back to defaults */
    }
    if (!enabled || !settings.productSlug) return null;

    const now = Date.now();
    if (settings.startsAt && now < new Date(settings.startsAt).getTime()) return null;
    if (settings.endsAt && now > new Date(settings.endsAt).getTime()) return null;

    const product = await this.prisma.product.findFirst({
      where: { slug: settings.productSlug, publishState: ProductPublishState.PUBLISHED },
      include: { brand: true, category: true, variants: { orderBy: { priceMillimes: "asc" } }, images: { orderBy: { position: "asc" } } },
    });
    if (!product || product.variants.length === 0) return null;

    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    return {
      config: {
        headline: (title || settings.headline || "").trim() || null,
        description: (description || settings.description || "").trim() || null,
        bullets: (settings.bullets ?? []).map((b) => String(b).trim()).filter(Boolean).slice(0, 4),
        imageUrl: settings.imageUrl?.trim() || null,
        ctaLabel: settings.ctaLabel?.trim() || null,
        secondaryCtaLabel: settings.secondaryCtaLabel?.trim() || null,
        secondaryCtaUrl: settings.secondaryCtaUrl?.trim() || null,
      },
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        benefit: product.benefit || null,
        brand: { name: product.brand.name, slug: product.brand.slug },
        category: { name: product.category.name, slug: product.category.slug },
        image: product.image || product.images[0]?.url || null,
        imageAlt: product.imageAlt || null,
        sizeLabel: variant.label,
        priceMillimes: variant.priceMillimes,
        stock,
        inStock: stock > 0,
        variants: product.variants.map((v) => ({ label: v.label, priceMillimes: v.priceMillimes })),
      },
    };
  }

  /**
   * Best sellers from REAL order data: units sold on non-cancelled orders. Only published, in-stock
   * products are returned, and nothing is returned until at least `MIN_BEST_SELLERS` distinct products
   * have genuine sales, so the storefront hides the section instead of inventing a ranking.
   */
  async getBestSellers(limit = 8) {
    const MIN_BEST_SELLERS = 4;
    const safeLimit = Math.min(Math.max(Math.trunc(limit) || 8, 1), 12);
    try {
      const grouped = await this.prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { status: { notIn: ["ANNULEE", "REFUSEE", "RETOURNEE"] } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: safeLimit * 3,
      });
      if (grouped.length === 0) return [];
      const products = await this.prisma.product.findMany({
        where: { id: { in: grouped.map((g) => g.productId) }, publishState: ProductPublishState.PUBLISHED, inStock: true },
        include: { brand: true, category: true, variants: true, images: { orderBy: { position: "asc" } } },
      });
      const byId = new Map(products.map((p) => [p.id, p]));
      const ranked = grouped.map((g) => byId.get(g.productId)).filter((p): p is NonNullable<typeof p> => Boolean(p)).slice(0, safeLimit);
      return ranked.length >= MIN_BEST_SELLERS ? ranked : [];
    } catch {
      return [];
    }
  }
}
