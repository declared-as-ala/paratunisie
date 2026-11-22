import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { calculateChecklist, normalize, PageEvidence, realImage } from "./seo-checklist";
import { evaluateProductSeoQuality } from "./product-seo-quality";
import { categoryTreeIds } from "./category-tree";

export const MAX_SCORE_BATCH = 100;
const TTL_MS = 5 * 60 * 1000;
const SITE = "https://paratunisie.com";

export type ProductScore = {
  id: string;
  slug: string;
  name: string;
  score: number;
  grade: string;
  /** "derived" = computed from stored data; "verified" = a fresh public-page audit exists and the row did not change since. */
  source: "derived" | "verified";
  indexable: boolean;
  inSitemap: boolean;
  /** Eligibility to be indexed (quality gate) is independent of the SEO content score. */
  eligible: boolean;
  blockers: string[];
  failed: { id: string; label: string; reason: string }[];
};

type UniquenessIndex = { at: number; titles: Map<string, number>; descriptions: Map<string, number>; names: Map<string, number> };

/**
 * Scores the products currently on screen (<= 100 ids) instead of the whole catalogue.
 *
 * Evidence: the storefront renders a single H1, a Product JSON-LD, breadcrumbs and category/brand links for every product
 * whose stored data is complete, so those public-page checks are DERIVED from the stored data and labelled "derived".
 * A live public-page audit (SeoChecklistAudit) replaces them when it is fresh and the row has not changed since.
 * Uniqueness is measured against the whole catalogue with a 5-minute in-memory index (three short text columns).
 */
@Injectable()
export class SeoScoreService {
  private index?: UniquenessIndex;
  constructor(private readonly prisma: PrismaService) {}

  invalidate(): void {
    this.index = undefined;
  }

  private async uniqueness(): Promise<UniquenessIndex> {
    if (this.index && Date.now() - this.index.at < TTL_MS) return this.index;
    const rows = await this.prisma.product.findMany({ select: { name: true, seoTitle: true, description: true, publishState: true } });
    const count = (map: Map<string, number>, value: string) => { if (value) map.set(value, (map.get(value) ?? 0) + 1); };
    const titles = new Map<string, number>(), descriptions = new Map<string, number>(), names = new Map<string, number>();
    for (const r of rows) {
      count(titles, normalize(r.seoTitle));
      count(descriptions, normalize(r.description));
      if (r.publishState === "PUBLISHED") count(names, normalize(r.name));
    }
    this.index = { at: Date.now(), titles, descriptions, names };
    return this.index;
  }

  /** Public-page evidence implied by the stored data of a product (no network call). */
  static derivedEvidence(row: any): PageEvidence {
    const published = row.publishState === "PUBLISHED";
    const variant = row.variants?.[0];
    const selfCanonical = !row.canonicalUrl || row.canonicalUrl === `${SITE}/produits/${row.slug}`;
    const hasImage = realImage(row.image || row.images?.[0]?.url);
    const stockSum = (row.variants ?? []).reduce((s: number, v: any) => s + Math.max(0, v.stock || 0), 0);
    const priceOk = Boolean(variant && Number.isInteger(variant.priceMillimes) && variant.priceMillimes > 0);
    return {
      checkedAt: new Date().toISOString(),
      http: published,
      indexable: published && row.indexable !== false && selfCanonical,
      sitemap: published && row.indexable !== false && selfCanonical,
      h1: Boolean((row.seoH1 || row.name || "").trim()),
      metadata: Boolean(row.seoTitle?.trim() && row.seoDescription?.trim()),
      schema: Boolean(row.name && variant?.sku && hasImage && row.description?.trim()),
      offer: priceOk && row.inStock === stockSum > 0,
      breadcrumb: Boolean(row.category?.slug && row.brand?.slug),
      internalLinks: Boolean(row.category?.slug && row.brand?.slug),
      image: hasImage,
    };
  }

  async scoreProducts(ids: string[], persist = true): Promise<ProductScore[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (unique.length === 0) return [];
    if (unique.length > MAX_SCORE_BATCH) throw new BadRequestException(`Maximum ${MAX_SCORE_BATCH} fiches par requête.`);
    const [rows, audits, index] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: unique } }, include: { brand: true, category: true, variants: true, images: { select: { url: true, alt: true } } } }),
      this.prisma.seoChecklistAudit.findMany({ where: { key: { in: unique.map((id) => `product:${id}`) } } }),
      this.uniqueness(),
    ]);
    const auditByKey = new Map(audits.map((a) => [a.key, a]));
    const out: ProductScore[] = [];
    const changed: { id: string; score: number; stored: number }[] = [];
    for (const row of rows as any[]) {
      const audit = auditByKey.get(`product:${row.id}`);
      const verified = audit && audit.checkedAt.getTime() >= row.updatedAt.getTime() && Date.now() - audit.checkedAt.getTime() < 24 * 3600 * 1000;
      const evidence = (verified ? (audit!.evidence as unknown as PageEvidence) : SeoScoreService.derivedEvidence(row));
      const context = {
        uniqueSlug: true, // slug is a unique column
        uniqueTitle: (index.titles.get(normalize(row.seoTitle)) ?? 0) === 1,
        uniqueDescription: (index.descriptions.get(normalize(row.description)) ?? 0) === 1,
        productCount: 0,
      };
      const result = calculateChecklist("product", row, context, evidence);
      const gate = evaluateProductSeoQuality({ ...row, duplicateTitle: (index.names.get(normalize(row.name)) ?? 0) > 1 });
      out.push({
        id: row.id, slug: row.slug, name: row.name, score: result.score, grade: result.grade, source: verified ? "verified" : "derived",
        indexable: row.indexable !== false, inSitemap: evidence.sitemap, eligible: gate.eligible,
        blockers: gate.issues.filter((i) => i.severity === "BLOCKER").map((i) => i.code),
        failed: result.checks.filter((c) => !c.passed).map((c) => ({ id: c.id, label: c.label, reason: c.reason })),
      });
      if (row.seoScore !== result.score) changed.push({ id: row.id, score: result.score, stored: row.seoScore });
    }
    if (persist && changed.length) await this.writeScores(changed);
    const order = new Map(unique.map((id, i) => [id, i]));
    return out.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  /** Raw UPDATE so the score refresh never touches updatedAt (it feeds sitemap lastmod and optimistic locking). */
  async writeScores(rows: { id: string; score: number }[]): Promise<void> {
    if (rows.length === 0) return;
    const values = Prisma.join(rows.map((r) => Prisma.sql`(${r.id}, ${r.score}::int)`));
    await this.prisma.$executeRaw`UPDATE "Product" p SET "seoScore" = v.score FROM (VALUES ${values}) AS v(id, score) WHERE p.id = v.id AND p."seoScore" <> v.score`;
  }

  /** Catalogue-wide figures from persisted columns only (one cheap aggregate query). */
  async summary() {
    const [row] = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE "seoScore" >= 90)::int AS excellent,
        COUNT(*) FILTER (WHERE "seoScore" >= 70 AND "seoScore" < 90)::int AS good,
        COUNT(*) FILTER (WHERE "seoScore" < 70)::int AS weak,
        COUNT(*) FILTER (WHERE "publishState" = 'PUBLISHED' AND indexable)::int AS indexable,
        COUNT(*) FILTER (WHERE "publishState" = 'PUBLISHED' AND NOT indexable)::int AS noindex,
        COALESCE(ROUND(AVG("seoScore")), 0)::int AS average
      FROM "Product"`;
    const [jobs] = await Promise.all([
      this.prisma.seoJob.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, kind: true, status: true, mode: true, processed: true, total: true, failed: true, finishedAt: true, createdAt: true } }),
    ]);
    return { ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)])), recentJobs: jobs, note: "Score interne (0-100) ; il ne garantit aucun classement Google." };
  }

  /**
   * Admin products table with server-side filters and sorting on the PERSISTED score (indexed column).
   * Same { data, meta } shape as the catalogue list, raw rows (including seoScore) so the editor keeps working.
   */
  async adminList(params: { page?: number; limit?: number; q?: string; brand?: string; category?: string; status?: string; stock?: string; indexable?: string; seoMin?: string; seoMax?: string; sort?: string }) {
    const page = Math.max(1, Math.floor(Number(params.page) || 1));
    const limit = Math.max(1, Math.min(100, Math.floor(Number(params.limit) || 25)));
    const where: Prisma.ProductWhereInput = { publishState: (params.status as "PUBLISHED" | "DRAFT") || "PUBLISHED" };
    const and: Prisma.ProductWhereInput[] = [];
    if (params.q?.trim()) {
      const q = params.q.trim();
      and.push({ OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }, { brand: { name: { contains: q, mode: "insensitive" } } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }] });
    }
    if (params.brand) {
      const tokens = params.brand.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
      and.push({ brand: { OR: [{ slug: { in: tokens.map((t) => t.toLowerCase()) } }, { name: { in: tokens, mode: "insensitive" } }] } });
    }
    if (params.category) {
      const categories = await this.prisma.category.findMany({ select: { id: true, slug: true, name: true, parentId: true } });
      and.push({ categoryId: { in: categoryTreeIds(categories, params.category.split(/[|,]/)) } });
    }
    if (params.stock === "instock") and.push({ inStock: true });
    else if (params.stock === "onorder") and.push({ inStock: false });
    else if (params.stock === "low") and.push({ inStock: true, totalStock: { gte: 1, lte: 5 } });
    else if (params.stock === "purchasable") and.push({ inStock: true, totalStock: { notIn: [100], lt: 500 }, category: { slug: { notIn: ["materiel-de-musculation", "cardio-fitness"] } } });
    if (params.indexable === "true") and.push({ indexable: true });
    else if (params.indexable === "false") and.push({ indexable: false });
    const min = Number(params.seoMin), max = Number(params.seoMax);
    if (params.seoMin !== undefined && params.seoMin !== "" && Number.isFinite(min)) and.push({ seoScore: { gte: min } });
    if (params.seoMax !== undefined && params.seoMax !== "" && Number.isFinite(max)) and.push({ seoScore: { lte: max } });
    if (and.length) where.AND = and;
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      params.sort === "seo_asc" ? [{ seoScore: "asc" }, { id: "asc" }]
      : params.sort === "seo_desc" ? [{ seoScore: "desc" }, { id: "asc" }]
      : params.sort === "name" ? [{ inStock: "desc" }, { name: "asc" }]
      : [{ inStock: "desc" }, { createdAt: "desc" }, { id: "asc" }];
    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, include: { brand: true, category: true, variants: true, images: { select: { id: true, url: true, alt: true, position: true } } }, orderBy, skip: (page - 1) * limit, take: limit }),
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  /** True catalogue-wide availability figures (the admin cards used to count only the 25 rows on screen). */
  async stockStats() {
    const [row] = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED')::int AS published,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p."inStock")::int AS in_stock,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p."inStock" AND p."totalStock" BETWEEN 1 AND 5)::int AS low_stock,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND NOT p."inStock")::int AS on_order,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p."inStock" AND (p."totalStock" = 100 OR p."totalStock" >= 500))::int AS unverified_stock,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p."inStock" AND c.slug IN ('materiel-de-musculation','cardio-fitness'))::int AS machines_in_stock,
        COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p."inStock" AND p."totalStock" <> 100 AND p."totalStock" < 500 AND c.slug NOT IN ('materiel-de-musculation','cardio-fitness'))::int AS purchasable_verified
      FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"`;
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));
  }
}
