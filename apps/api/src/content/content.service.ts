import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateArticleDto {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime?: string;
  date?: string;
  content?: string;
  status?: string;
  authorName?: string;
  expertReviewer?: string;
  featuredImage?: string;
  publishedAt?: string;
  scheduledFor?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  targetKeyword?: string;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  productIds?: { productId: string; rationale?: string; position?: number }[];
  brandIds?: string[];
  concernIds?: string[];
  faqs?: { question: string; answer: string; position?: number }[];
}

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getAllArticles(options?: {
    status?: string;
    category?: string;
    search?: string;
    productId?: string;
    brandId?: string;
  }) {
    try {
      const where: Record<string, unknown> = {};

      if (options?.status) where.status = options.status;
      if (options?.category) where.category = options.category;
      if (options?.search) {
        where.OR = [
          { title: { contains: options.search, mode: "insensitive" } },
          { excerpt: { contains: options.search, mode: "insensitive" } },
          { authorName: { contains: options.search, mode: "insensitive" } },
          { targetKeyword: { contains: options.search, mode: "insensitive" } },
        ];
      }
      if (options?.productId) {
        where.products = { some: { productId: options.productId } };
      }
      if (options?.brandId) {
        where.brands = { some: { brandId: options.brandId } };
      }

      const articles = await this.prisma.article.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          products: { include: { product: { select: { id: true, name: true, image: true } } } },
          brands: { include: { brand: { select: { id: true, name: true } } } },
          concerns: { include: { concern: { select: { id: true, name: true } } } },
          faqs: { orderBy: { position: "asc" } },
        },
      });

      return articles;
    } catch {
      // DB not available — return empty array; admin shows graceful empty state
      return [];
    }
  }

  async getDashboardStats() {
    try {
      const [published, drafts, scheduled, archived, total] = await Promise.all([
        this.prisma.article.count({ where: { status: "PUBLISHED" } }),
        this.prisma.article.count({ where: { status: "DRAFT" } }),
        this.prisma.article.count({ where: { status: "SCHEDULED" } }),
        this.prisma.article.count({ where: { status: "ARCHIVED" } }),
        this.prisma.article.count(),
      ]);

      // SEO incomplete: missing seoTitle, metaDescription, or featuredImage
      const seoIncomplete = await this.prisma.article.count({
        where: {
          status: "PUBLISHED",
          OR: [
            { seoTitle: null },
            { metaDescription: null },
            { featuredImage: null },
          ],
        },
      });

      // Articles without linked products
      const noProducts = await this.prisma.article.count({
        where: {
          status: "PUBLISHED",
          products: { none: {} },
        },
      });

      return { published, drafts, scheduled, archived, total, seoIncomplete, noProducts };
    } catch {
      return { published: 0, drafts: 0, scheduled: 0, archived: 0, total: 0, seoIncomplete: 0, noProducts: 0 };
    }
  }

  async getArticleById(id: string) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id },
        include: {
          products: {
            orderBy: { position: "asc" },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  benefit: true,
                  variants: { select: { id: true, label: true, priceMillimes: true }, take: 1 },
                },
              },
            },
          },
          brands: { include: { brand: { select: { id: true, name: true, slug: true } } } },
          concerns: { include: { concern: { select: { id: true, name: true, slug: true } } } },
          faqs: { orderBy: { position: "asc" } },
        },
      });

      if (!article) throw new NotFoundException("Article not found");
      return article;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      return null;
    }
  }

  async getArticleBySlug(slug: string) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { slug },
        include: {
          products: {
            orderBy: { position: "asc" },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  slug: true,
                  benefit: true,
                  variants: { select: { id: true, label: true, priceMillimes: true }, take: 1 },
                },
              },
            },
          },
          brands: { include: { brand: { select: { id: true, name: true, slug: true } } } },
          concerns: { include: { concern: { select: { id: true, name: true, slug: true } } } },
          faqs: { orderBy: { position: "asc" } },
        },
      });

      return article;
    } catch {
      return null;
    }
  }

  async createArticle(dto: CreateArticleDto) {
    const { productIds: _p, brandIds: _b, concernIds: _c, faqs: _f, ...data } = dto as UpdateArticleDto;

    return this.prisma.article.create({
      data: {
        ...data,
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        category: dto.category,
        readTime: dto.readTime ?? "3 min",
        date: dto.date ?? new Date().toISOString().split("T")[0],
        content: dto.content ?? "[]",
        status: dto.status ?? "DRAFT",
        publishedAt: dto.status === "PUBLISHED" ? new Date() : undefined,
      },
    });
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const { productIds, brandIds, concernIds, faqs, ...data } = dto;

    const updateData: Record<string, unknown> = { ...data };

    if (dto.status === "PUBLISHED") {
      const existing = await this.prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: updateData,
    });

    // Update products
    if (productIds !== undefined) {
      await this.prisma.articleProduct.deleteMany({ where: { articleId: id } });
      if (productIds.length > 0) {
        await this.prisma.articleProduct.createMany({
          data: productIds.map((p, i) => ({
            articleId: id,
            productId: p.productId,
            rationale: p.rationale,
            position: p.position ?? i,
          })),
        });
      }
    }

    // Update brands
    if (brandIds !== undefined) {
      await this.prisma.articleBrand.deleteMany({ where: { articleId: id } });
      if (brandIds.length > 0) {
        await this.prisma.articleBrand.createMany({
          data: brandIds.map((brandId) => ({ articleId: id, brandId })),
        });
      }
    }

    // Update concerns
    if (concernIds !== undefined) {
      await this.prisma.articleConcern.deleteMany({ where: { articleId: id } });
      if (concernIds.length > 0) {
        await this.prisma.articleConcern.createMany({
          data: concernIds.map((concernId) => ({ articleId: id, concernId })),
        });
      }
    }

    // Update FAQs
    if (faqs !== undefined) {
      await this.prisma.articleFaq.deleteMany({ where: { articleId: id } });
      if (faqs.length > 0) {
        await this.prisma.articleFaq.createMany({
          data: faqs.map((faq, i) => ({
            articleId: id,
            question: faq.question,
            answer: faq.answer,
            position: faq.position ?? i,
          })),
        });
      }
    }

    return article;
  }

  async archiveArticle(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }

  async deleteArticle(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }

  async duplicateArticle(id: string) {
    const source = await this.getArticleById(id);
    if (!source) throw new NotFoundException("Article not found");

    const newSlug = `${source.slug}-copie-${Date.now()}`;
    return this.prisma.article.create({
      data: {
        title: `${source.title} (copie)`,
        slug: newSlug,
        excerpt: source.excerpt,
        category: source.category,
        readTime: source.readTime,
        date: new Date().toISOString().split("T")[0],
        content: source.content,
        status: "DRAFT",
        authorName: source.authorName,
        expertReviewer: source.expertReviewer,
        featuredImage: source.featuredImage,
        seoTitle: source.seoTitle,
        metaDescription: source.metaDescription,
        targetKeyword: source.targetKeyword,
      },
    });
  }
}
