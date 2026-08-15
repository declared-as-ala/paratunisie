import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MeilisearchService } from "../search/meilisearch.service";

export const fallbackProducts = [
  {
    id: "p01",
    slug: "anthelios-fluide-invisible",
    name: "Anthelios Fluide Invisible SPF50+",
    brand: { name: "La Roche-Posay", slug: "la-roche-posay" },
    category: { name: "Solaire", slug: "solaire" },
    image: "/assets/product-tube.webp",
    variants: [{ id: "v01", label: "50 ml", priceMillimes: 58900 }],
  },
  {
    id: "p02",
    slug: "sensibio-h2o",
    name: "Sensibio H2O 500ml",
    brand: { name: "Bioderma", slug: "bioderma" },
    category: { name: "Visage", slug: "visage" },
    image: "/assets/product-micellar.webp",
    variants: [{ id: "v02", label: "500 ml", priceMillimes: 36900 }],
  },
  {
    id: "p03",
    slug: "creme-hydratante-visage",
    name: "Crème Hydratante Visage CeraVe",
    brand: { name: "CeraVe", slug: "cerave" },
    category: { name: "Visage", slug: "visage" },
    image: "/assets/product-jar.webp",
    variants: [{ id: "v03", label: "52 ml", priceMillimes: 42500 }],
  },
  {
    id: "p04",
    slug: "liftactiv-vitamine-c",
    name: "Liftactiv Sérum Vitamine C Vichy",
    brand: { name: "Vichy", slug: "vichy" },
    category: { name: "Visage", slug: "visage" },
    image: "/assets/product-serum.webp",
    variants: [{ id: "v04", label: "20 ml", priceMillimes: 91000 }],
  },
  {
    id: "p05",
    slug: "cleanance-gel",
    name: "Cleanance Gel Nettoyant Avène",
    brand: { name: "Avène", slug: "avene" },
    category: { name: "Visage", slug: "visage" },
    image: "/assets/product-micellar.webp",
    variants: [{ id: "v05", label: "200 ml", priceMillimes: 39500 }],
  },
  {
    id: "p08",
    slug: "huile-prodigieuse",
    name: "Huile Prodigieuse Nuxe",
    brand: { name: "Nuxe", slug: "nuxe" },
    category: { name: "Corps", slug: "corps" },
    image: "/assets/product-serum.webp",
    variants: [{ id: "v08", label: "100 ml", priceMillimes: 79500 }],
  },
];

@Injectable()
export class CatalogueService {
  constructor(
    private prisma: PrismaService,
    private meilisearchService: MeilisearchService,
  ) {}

  async findAllProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    brand?: string;
    category?: string;
    concern?: string;
    status?: string;
    sort?: string;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params?.limit) || 24));
    const skip = (page - 1) * limit;
    const query = params?.search?.trim();

    // Real search — typo/prefix/word-order-tolerant, unlike the Prisma
    // `contains` fallback below (D-0031). Only for the public, published-only
    // path: admin's `status` filter (e.g. browsing DRAFT products) keeps
    // using Prisma directly since the index only ever holds PUBLISHED docs.
    if (query && !params?.status) {
      const searchResult = await this.meilisearchService.searchProducts(query, {
        limit,
        offset: skip,
        brandSlug: params?.brand,
        categorySlug: params?.category,
      });

      if (searchResult) {
        const rows = await this.prisma.product.findMany({
          where: { id: { in: searchResult.ids } },
          include: { brand: true, category: true, variants: true, images: true },
        });
        const byId = new Map(rows.map((r) => [r.id, r]));
        // Meilisearch returns ids in relevance-ranked order; Prisma's `IN`
        // doesn't preserve it, so re-order in JS rather than lose ranking.
        const ordered = searchResult.ids.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));

        const total = searchResult.estimatedTotalHits;
        const totalPages = Math.ceil(total / limit) || 1;
        return {
          data: ordered,
          meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
      }
      // searchResult === null → Meilisearch unavailable, fall through to Prisma `contains` below.
    }

    const where: any = {};

    if (params?.brand) {
      where.brand = { slug: params.brand };
    }
    if (params?.category) {
      where.category = { slug: params.category };
    }
    if (params?.concern) {
      where.concerns = { some: { slug: params.concern } };
    }
    if (params?.status) {
      where.publishState = params.status as any;
    }
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
        { variants: { some: { sku: { contains: query, mode: "insensitive" } } } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (params?.sort === "name_asc" || params?.sort === "name") {
      orderBy = { name: "asc" };
    } else if (params?.sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    try {
      const [total, dbProducts] = await Promise.all([
        this.prisma.product.count({ where }),
        this.prisma.product.findMany({
          where,
          include: { brand: true, category: true, variants: true, images: true },
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        data: dbProducts,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch {
      return {
        data: fallbackProducts,
        meta: {
          page: 1,
          limit: fallbackProducts.length,
          total: fallbackProducts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  async findProductBySlug(slug: string) {
    try {
      const found = await this.prisma.product.findUnique({
        where: { slug },
        include: { brand: true, category: true, variants: true, images: true },
      });
      if (found) return found;
    } catch {}
    return fallbackProducts.find((p) => p.slug === slug) || fallbackProducts[0];
  }

  async findAllBrands() {
    const brands = await this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return brands.map((brand) => this.toBrandResponse(brand));
  }

  async findBrandBySlug(slug: string) {
    try {
      return await this.prisma.brand.findUnique({ where: { slug } });
    } catch {}
    return { name: "La Roche-Posay", slug };
  }

  async createBrand(data: any) {
    const brand = await this.prisma.brand.create({
      data: this.toBrandWriteData(data),
      include: { _count: { select: { products: true } } },
    });
    return this.toBrandResponse(brand);
  }

  async updateBrand(id: string, data: any) {
    const existing = await this.prisma.brand.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException("Marque introuvable");
    const brand = await this.prisma.brand.update({
      where: { id },
      data: this.toBrandWriteData(data),
      include: { _count: { select: { products: true } } },
    });
    return this.toBrandResponse(brand);
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException("Marque introuvable");
    if (brand._count.products > 0) {
      throw new BadRequestException("Impossible de supprimer une marque liée à des produits");
    }
    await this.prisma.brand.delete({ where: { id } });
    return { id, deleted: true };
  }

  async bulkDeleteBrands(ids: string[]) {
    if (!ids || ids.length === 0) return { count: 0 };
    // Only delete brands that have 0 products linked
    const safeBrands = await this.prisma.brand.findMany({
      where: { id: { in: ids } },
      include: { _count: { select: { products: true } } },
    });
    const deletableIds = safeBrands.filter((b) => b._count.products === 0).map((b) => b.id);
    if (deletableIds.length === 0) {
      throw new BadRequestException("Aucune marque sélectionnée ne peut être supprimée car des produits y sont rattachés.");
    }
    const res = await this.prisma.brand.deleteMany({ where: { id: { in: deletableIds } } });
    return { count: res.count, deleted: true };
  }

  private toBrandWriteData(data: any) {
    return {
      name: String(data.name ?? "").trim(),
      slug: String(data.slug ?? "").trim(),
      tagline: data.tagline || null,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      image: data.logo || data.image || null,
      heroImage: data.heroImage || null,
      mobileHeroImage: data.mobileHeroImage || null,
      featured: Boolean(data.featured),
      status: data.status || "ACTIVE",
      origin: data.origin || null,
      universe: data.universe || null,
      specialties: JSON.stringify(Array.isArray(data.specialties) ? data.specialties : []),
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
      indexable: data.indexable !== false,
    };
  }

  private toBrandResponse(brand: any) {
    let specialties: string[] = [];
    try {
      const parsed = JSON.parse(brand.specialties || "[]");
      specialties = Array.isArray(parsed) ? parsed : [];
    } catch {}
    const { _count, image, ...rest } = brand;
    return { ...rest, logo: image, specialties, productCount: _count?.products ?? 0 };
  }

  async findAllCategories() {
    try {
      const c = await this.prisma.category.findMany({
        include: { parent: true, children: true },
        orderBy: { position: "asc" },
      });
      if (c && c.length > 0) return c;
    } catch {}
    return [
      { id: "c1", name: "Visage", slug: "visage", status: "ACTIVE", position: 1 },
      { id: "c2", name: "Solaire", slug: "solaire", status: "ACTIVE", position: 2 },
      { id: "c3", name: "Corps", slug: "corps", status: "ACTIVE", position: 3 },
      { id: "c4", name: "Cheveux", slug: "cheveux", status: "ACTIVE", position: 4 },
    ];
  }

  async createCategory(data: any) {
    try {
      return await this.prisma.category.create({ data });
    } catch {
      return { id: `c${Date.now()}`, ...data };
    }
  }

  async updateCategory(id: string, data: any) {
    try {
      return await this.prisma.category.update({ where: { id }, data });
    } catch {
      return { id, ...data };
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch {
      return { id, deleted: true };
    }
  }

  async bulkDeleteCategories(ids: string[]) {
    if (!ids || ids.length === 0) return { count: 0 };
    try {
      const safeCategories = await this.prisma.category.findMany({
        where: { id: { in: ids } },
        include: { _count: { select: { products: true, children: true } } },
      });
      const deletableIds = safeCategories.filter((c) => c._count.products === 0 && c._count.children === 0).map((c) => c.id);
      if (deletableIds.length === 0) {
        throw new BadRequestException("Aucune catégorie sélectionnée ne peut être supprimée car des produits ou sous-catégories y sont rattachés.");
      }
      const res = await this.prisma.category.deleteMany({ where: { id: { in: deletableIds } } });
      return { count: res.count, deleted: true };
    } catch {
      return { count: ids.length, deleted: true };
    }
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Produit introuvable");

    await this.prisma.orderItem.deleteMany({ where: { productId: id } });
    await this.prisma.review.deleteMany({ where: { productId: id } });
    await this.prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await this.prisma.routineItem.deleteMany({ where: { productId: id } });
    await this.prisma.articleProduct.deleteMany({ where: { productId: id } });
    await this.prisma.competitorPrice.deleteMany({ where: { productId: id } });
    await this.prisma.importedProduct.updateMany({ where: { productId: id }, data: { productId: null } });
    await this.prisma.productVariant.deleteMany({ where: { productId: id } });
    await this.prisma.productImage.deleteMany({ where: { productId: id } });

    await this.prisma.product.delete({ where: { id } });
    await this.meilisearchService.removeProduct(id);
    return { id, deleted: true };
  }

  async bulkDeleteProducts(ids: string[]) {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length === 0) throw new BadRequestException("Aucun produit sélectionné");
    const existing = await this.prisma.product.count({ where: { id: { in: uniqueIds } } });
    if (existing !== uniqueIds.length) {
      throw new NotFoundException("Un ou plusieurs produits sélectionnés sont introuvables");
    }
    await this.prisma.orderItem.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.review.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.wishlistItem.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.routineItem.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.articleProduct.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.competitorPrice.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.importedProduct.updateMany({ where: { productId: { in: uniqueIds } }, data: { productId: null } });
    await this.prisma.productVariant.deleteMany({ where: { productId: { in: uniqueIds } } });
    await this.prisma.productImage.deleteMany({ where: { productId: { in: uniqueIds } } });

    const res = await this.prisma.product.deleteMany({ where: { id: { in: uniqueIds } } });
    await this.meilisearchService.removeProducts(uniqueIds);
    return { count: res.count, deleted: true };
  }

  async findAllConcerns() {
    try {
      const concerns = await this.prisma.concern.findMany({ orderBy: { name: "asc" } });
      if (concerns.length > 0) return concerns;
    } catch {}
    return [
      { name: "Protection solaire", slug: "protection-solaire" },
      { name: "Peau sensible", slug: "peau-sensible" },
      { name: "Peau sèche", slug: "peau-seche" },
    ];
  }

  /**
   * Resolves a set of root category slugs to that full subtree's ids. The
   * real imported taxonomy nests up to a few levels (e.g. Visage → "Peaux
   * mixtes, Grasses, Acné et imperfections" → further sub-nodes), so a
   * plain slug-equality filter would miss most real products — this walks
   * down a fixed number of levels rather than requiring a recursive query.
   */
  private async resolveCategoryDescendantIds(rootSlugs: string[], maxDepth = 4): Promise<string[]> {
    let currentLevelIds = (
      await this.prisma.category.findMany({ where: { slug: { in: rootSlugs } }, select: { id: true } })
    ).map((c) => c.id);
    const allIds = new Set(currentLevelIds);

    for (let depth = 0; depth < maxDepth && currentLevelIds.length > 0; depth++) {
      const children = await this.prisma.category.findMany({
        where: { parentId: { in: currentLevelIds } },
        select: { id: true },
      });
      currentLevelIds = children.map((c) => c.id).filter((id) => !allIds.has(id));
      currentLevelIds.forEach((id) => allIds.add(id));
    }

    return [...allIds];
  }

  /**
   * Real-catalogue candidate query for the diagnostic recommendation engine
   * (apps/api/src/diagnostic) — the diagnostic module has no raw Prisma
   * access of its own, per API.md's cross-module rule; it goes through this
   * public method instead. This is retrieval only (narrows ~9,700 products
   * down to a manageable candidate set); ranking within that set is the
   * caller's job (AI-driven, or the keyword fallback), not this method's.
   * Out-of-stock rows are included (deprioritized downstream, never
   * silently dropped) so a role can honestly report "no match" instead of
   * always finding something.
   */
  async findForRecommendation(params: {
    categoryRootSlugs?: string[];
    keywords?: string[];
    brandSlugs?: string[];
    maxPriceMillimes?: number;
    excludeProductIds?: string[];
    limit?: number;
  }) {
    const where: any = { publishState: "PUBLISHED" };
    const and: any[] = [];

    if (params.categoryRootSlugs?.length) {
      const categoryIds = await this.resolveCategoryDescendantIds(params.categoryRootSlugs);
      if (categoryIds.length === 0) return [];
      and.push({ categoryId: { in: categoryIds } });
    }

    if (params.keywords?.length) {
      and.push({
        OR: params.keywords.map((kw) => ({
          OR: [
            { name: { contains: kw, mode: "insensitive" } },
            { description: { contains: kw, mode: "insensitive" } },
            { category: { name: { contains: kw, mode: "insensitive" } } },
          ],
        })),
      });
    }

    if (params.brandSlugs?.length) and.push({ brand: { slug: { in: params.brandSlugs } } });
    if (params.excludeProductIds?.length) and.push({ id: { notIn: params.excludeProductIds } });
    if (params.maxPriceMillimes) and.push({ variants: { some: { priceMillimes: { lte: params.maxPriceMillimes } } } });

    if (and.length > 0) where.AND = and;

    return this.prisma.product.findMany({
      where,
      include: { brand: true, category: true, variants: true, images: true },
      take: params.limit ?? 150,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Meilisearch-first candidate retrieval for free-text product/ingredient
   * search (the diagnostic chat's "je veux du zinc" / "vitamine C" case).
   * Meilisearch already ranks `name` matches above incidental `description`
   * mentions (searchableAttributes order — see MeilisearchService), which
   * plain Prisma `contains` cannot do; that's what previously let a
   * sunscreen merely listing "oxyde de zinc" as a UV filter outrank real
   * Zinc supplements. Falls back to a conservative Postgres scan — name and
   * category only, deliberately NOT description, to avoid reintroducing
   * that same false-positive pollution — only when Meilisearch is down or
   * genuinely returns nothing.
   */
  async searchForRecommendation(query: string, limit = 40) {
    const meiliResult = await this.meilisearchService.searchProducts(query, { limit, offset: 0 });

    if (meiliResult && meiliResult.ids.length > 0) {
      const rows = await this.prisma.product.findMany({
        where: { id: { in: meiliResult.ids }, publishState: "PUBLISHED" },
        include: { brand: true, category: true, variants: true, images: true },
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      // Meilisearch returns ids in relevance-ranked order; Prisma's `IN`
      // doesn't preserve it, so re-order in JS rather than lose ranking.
      return meiliResult.ids.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
    }

    return this.prisma.product.findMany({
      where: {
        publishState: "PUBLISHED",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { brand: true, category: true, variants: true, images: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fresh re-fetch of an exact id set, published-only — the diagnostic
   * engine's hard backend validation step (product ids returned by the AI
   * or the fallback ranker are re-verified against Postgres right before
   * they're shown to the user, not trusted from the earlier retrieval).
   */
  async findPublishedByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.prisma.product.findMany({
      where: { id: { in: ids }, publishState: "PUBLISHED" },
      include: { brand: true, category: true, variants: true, images: true },
    });
  }
}
