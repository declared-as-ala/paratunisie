import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  BrandFacts,
  BrandPlan,
  buildScoreContext,
  isRestrictedProduct,
  markDuplicates,
  MACHINE_CATEGORY,
  planBrand,
  scoreBrand,
  Tier,
} from "./brand-seo";

export type BrandSeoRunOptions = {
  mode?: "dry-run" | "apply";
  /** Re-draft brands whose existing copy is original and valid (default: preserve it). */
  regenerate?: boolean;
  /** Also replace brands flagged seoIsCustom (default: never). */
  overwriteCustom?: boolean;
  tiers?: Tier[];
  slugs?: string[];
  limit?: number;
};

type Row = Record<string, unknown>;

/** Indexability a brand ends up with after its plan is applied. */
function finalIndexable(p: BrandPlan, f: BrandFacts): boolean {
  switch (p.action) {
    case "generate": return true;
    case "noindex":
    case "blocked": return false;
    case "preserve": return f.seoIsCustom ? f.indexable : true; // good original copy on an eligible brand
    default: return f.indexable;
  }
}

/**
 * Reliable bulk/single brand SEO workflow:
 *  1. gathers verified catalogue facts with a fixed number of queries (no N+1),
 *  2. classifies every brand (tier A/B/C), drafts original French copy only for A/B, validates it,
 *  3. detects duplicates across all drafts,
 *  4. dry-run returns the full plan; apply first snapshots the Brand table, then writes only what the plan allows.
 * Nothing here touches products, prices or stock.
 */
@Injectable()
export class BrandSeoService {
  constructor(private readonly prisma: PrismaService) {}

  async loadFacts(): Promise<BrandFacts[]> {
    const [brands, categories, aggregates, published, topRows] = await Promise.all([
      this.prisma.brand.findMany(),
      this.prisma.category.findMany({ select: { id: true, slug: true, name: true, indexable: true, status: true } }),
      this.prisma.$queryRaw<Row[]>`
        SELECT p."brandId" AS "brandId", p."categoryId" AS "categoryId",
          COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED')::int AS pub,
          COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p.indexable)::int AS idx,
          COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p."inStock")::int AS instock,
          COUNT(*) FILTER (WHERE p."publishState" = 'PUBLISHED' AND p.indexable AND p."inStock")::int AS idxin
        FROM "Product" p GROUP BY p."brandId", p."categoryId"`,
      this.prisma.product.findMany({ where: { publishState: "PUBLISHED" }, select: { brandId: true, categoryId: true, name: true, slug: true, inStock: true, indexable: true } }),
      this.prisma.product.findMany({
        where: { publishState: "PUBLISHED", indexable: true },
        select: { brandId: true, slug: true, name: true, inStock: true },
        orderBy: [{ inStock: "desc" }, { name: "asc" }],
      }),
    ]);

    const catById = new Map(categories.map((c) => [c.id, c]));
    const byBrand = new Map<string, { pub: number; idx: number; instock: number; idxin: number; machine: number; cats: Map<string, number> }>();
    for (const a of aggregates) {
      const brandId = String(a.brandId);
      const cat = catById.get(String(a.categoryId));
      const entry = byBrand.get(brandId) ?? { pub: 0, idx: 0, instock: 0, idxin: 0, machine: 0, cats: new Map<string, number>() };
      entry.pub += Number(a.pub);
      entry.idx += Number(a.idx);
      entry.instock += Number(a.instock);
      entry.idxin += Number(a.idxin);
      if (cat && MACHINE_CATEGORY.test(cat.slug)) entry.machine += Number(a.pub);
      if (cat && Number(a.idx) > 0) entry.cats.set(cat.id, (entry.cats.get(cat.id) ?? 0) + Number(a.idx));
      byBrand.set(brandId, entry);
    }
    const restricted = new Map<string, number>();
    for (const p of published) {
      const cat = catById.get(p.categoryId);
      if ((p.inStock || p.indexable) && isRestrictedProduct(p.name, p.slug, cat?.slug ?? "")) restricted.set(p.brandId, (restricted.get(p.brandId) ?? 0) + 1);
    }
    const top = new Map<string, { slug: string; name: string; inStock: boolean }[]>();
    for (const t of topRows) {
      const list = top.get(t.brandId) ?? [];
      if (list.length < 4) list.push({ slug: t.slug, name: t.name, inStock: t.inStock });
      top.set(t.brandId, list);
    }

    return brands.map((b) => {
      const e = byBrand.get(b.id);
      return {
        id: b.id, slug: b.slug, name: b.name, status: b.status, indexable: b.indexable, seoIsCustom: b.seoIsCustom,
        image: b.image, imageAlt: b.imageAlt, origin: b.origin,
        seoTitle: b.seoTitle, seoDescription: b.seoDescription, seoH1: b.seoH1, seoIntro: b.seoIntro, seoContent: b.seoContent,
        canonicalUrl: b.canonicalUrl, ogTitle: b.ogTitle, ogDescription: b.ogDescription, ogImage: b.ogImage,
        publishedCount: e?.pub ?? 0, indexableCount: e?.idx ?? 0, inStockCount: e?.instock ?? 0, indexableInStockCount: e?.idxin ?? 0,
        machineCount: e?.machine ?? 0, restrictedCount: restricted.get(b.id) ?? 0,
        categories: [...(e?.cats ?? new Map<string, number>()).entries()]
          .map(([id, count]) => ({ slug: catById.get(id)!.slug, name: catById.get(id)!.name, indexable: catById.get(id)!.indexable && catById.get(id)!.status === "ACTIVE", count }))
          .sort((x, y) => y.count - x.count || x.slug.localeCompare(y.slug)),
        topProducts: top.get(b.id) ?? [],
      };
    });
  }

  /** Read-only: current internal score, tier and actionable reasons for every brand. */
  async audit() {
    const facts = await this.loadFacts();
    const ctx = buildScoreContext(facts);
    const rows = facts.map((f) => {
      const s = scoreBrand(f, ctx);
      return {
        id: f.id, slug: f.slug, name: f.name, tier: s.tier, tierReasons: s.tierReasons, score: s.score, total: s.total,
        failed: s.checks.filter((c) => !c.passed).map((c) => ({ id: c.id, label: c.label, reason: c.reason })),
        indexable: f.indexable, seoIsCustom: f.seoIsCustom,
        products: { published: f.publishedCount, indexable: f.indexableCount, inStock: f.inStockCount },
      };
    });
    const tiers = { A: 0, B: 0, C: 0 };
    rows.forEach((r) => (tiers[r.tier] += 1));
    const avg = rows.length ? rows.reduce((s, r) => s + r.score, 0) / rows.length : 0;
    return {
      total: rows.length,
      tiers,
      averageScore: Math.round(avg * 10) / 10,
      indexableNow: rows.filter((r) => r.indexable).length,
      indexableButIneligible: rows.filter((r) => r.indexable && r.tier === "C").length,
      note: "Score interne de qualité éditoriale (0–10). Il ne garantit aucun classement Google.",
      rows,
    };
  }

  private async plans(options: BrandSeoRunOptions): Promise<{ facts: BrandFacts[]; plans: BrandPlan[] }> {
    const facts = await this.loadFacts();
    const plans = facts.map((f) => planBrand(f, { regenerate: Boolean(options.regenerate), overwriteCustom: Boolean(options.overwriteCustom) }));
    markDuplicates(plans);
    return { facts, plans };
  }

  async run(options: BrandSeoRunOptions = {}) {
    const mode = options.mode ?? "dry-run";
    if (mode !== "dry-run" && mode !== "apply") throw new BadRequestException("mode invalide (dry-run | apply)");
    const { facts, plans } = await this.plans(options);
    const factsBySlug = new Map(facts.map((f) => [f.slug, f]));
    let selected = plans;
    if (options.slugs?.length) selected = selected.filter((p) => options.slugs!.includes(p.slug));
    if (options.tiers?.length) selected = selected.filter((p) => options.tiers!.includes(p.tier));
    if (options.limit) selected = selected.slice(0, Math.min(Math.max(Number(options.limit) || 0, 1), 1000));

    // Score as it would be after the run (published copy + decided indexability).
    const afterFacts = new Map<string, BrandFacts>();
    for (const p of selected) {
      const f = factsBySlug.get(p.slug)!;
      afterFacts.set(
        p.slug,
        p.action === "generate" && p.draft
          ? { ...f, ...p.draft, indexable: true, seoIsCustom: false }
          : { ...f, ...(p.fill ?? {}), indexable: finalIndexable(p, f) },
      );
    }
    const merged = facts.map((f) => afterFacts.get(f.slug) ?? f);
    const ctxAfter = buildScoreContext(merged);

    const summary = {
      mode,
      selected: selected.length,
      byAction: {} as Record<string, number>,
      byTier: { A: 0, B: 0, C: 0 } as Record<Tier, number>,
      willBeIndexable: selected.filter((p) => finalIndexable(p, factsBySlug.get(p.slug)!)).length,
    };
    for (const p of selected) {
      summary.byAction[p.action] = (summary.byAction[p.action] ?? 0) + 1;
      summary.byTier[p.tier] += 1;
    }

    let backupTable: string | null = null;
    const failures: { slug: string; error: string }[] = [];
    let written = 0;
    if (mode === "apply") {
      const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
      backupTable = `_backup_brand_seo_${stamp}`;
      await this.prisma.$executeRawUnsafe(`CREATE TABLE "${backupTable}" AS SELECT * FROM "Brand"`);
      for (const p of selected) {
        const f = factsBySlug.get(p.slug)!;
        try {
          const wasIndexable = f.indexable;
          if (p.action === "generate" && p.draft) {
            const d = p.draft;
            await this.prisma.brand.update({
              where: { id: f.id },
              data: {
                seoTitle: d.seoTitle, seoDescription: d.seoDescription, seoH1: d.seoH1, seoIntro: d.seoIntro, seoContent: d.seoContent,
                seoKeywords: JSON.stringify(d.seoKeywords), canonicalUrl: d.canonicalUrl, ogTitle: d.ogTitle, ogDescription: d.ogDescription,
                ogImage: d.ogImage, imageAlt: d.imageAlt, indexable: true, followLinks: true, seoIsCustom: false, seoGeneratedAt: new Date(),
              },
            });
            written++;
          } else if ((p.action === "noindex" || p.action === "blocked") && wasIndexable) {
            await this.prisma.brand.update({ where: { id: f.id }, data: { indexable: false } });
            written++;
          } else if (p.action === "preserve") {
            const data: Record<string, unknown> = { ...(p.fill ?? {}) };
            if (!f.seoIsCustom && !wasIndexable && p.indexable) data.indexable = true;
            if (p.fill && Object.keys(p.fill).length > 0) data.seoGeneratedAt = new Date();
            if (Object.keys(data).length > 0) {
              await this.prisma.brand.update({ where: { id: f.id }, data });
              written++;
            }
          }
        } catch (error) {
          failures.push({ slug: p.slug, error: error instanceof Error ? error.message : "Erreur inconnue" });
        }
      }
    }

    return {
      ...summary,
      written,
      failures,
      backupTable,
      rollback: backupTable
        ? `UPDATE "Brand" b SET "seoTitle"=o."seoTitle","seoDescription"=o."seoDescription","seoH1"=o."seoH1","seoIntro"=o."seoIntro","seoContent"=o."seoContent","seoKeywords"=o."seoKeywords","canonicalUrl"=o."canonicalUrl","ogTitle"=o."ogTitle","ogDescription"=o."ogDescription","ogImage"=o."ogImage","imageAlt"=o."imageAlt",indexable=o.indexable,"seoIsCustom"=o."seoIsCustom","seoGeneratedAt"=o."seoGeneratedAt" FROM "${backupTable}" o WHERE o.id=b.id;`
        : null,
      scoreAfter: {
        average: selected.length ? Math.round((selected.reduce((s, p) => s + scoreBrand(afterFacts.get(p.slug)!, ctxAfter).score, 0) / selected.length) * 10) / 10 : 0,
        full: selected.filter((p) => scoreBrand(afterFacts.get(p.slug)!, ctxAfter).score >= 9).length,
      },
      plans: selected.map((p) => ({
        slug: p.slug, name: p.name, tier: p.tier, action: p.action, reason: p.reason, indexable: p.indexable,
        duplicateOf: p.duplicateOf ?? null,
        issues: p.issues,
        draft: p.draft ?? null,
        fill: p.fill ?? null,
        scoreAfter: scoreBrand(afterFacts.get(p.slug)!, ctxAfter).score,
      })),
    };
  }

  /** Single-brand generation used by the admin "Générer SEO" button: safe by construction, returns the draft or why it is blocked. */
  async generateOne(id: string, save: boolean) {
    const brand = await this.prisma.brand.findUnique({ where: { id }, select: { slug: true } });
    if (!brand) throw new NotFoundException("Marque introuvable");
    const result = await this.run({ mode: save ? "apply" : "dry-run", slugs: [brand.slug], regenerate: true });
    const plan = result.plans[0];
    return { action: plan.action, tier: plan.tier, reason: plan.reason, issues: plan.issues, draft: plan.draft, indexable: plan.indexable, backupTable: result.backupTable };
  }
}
