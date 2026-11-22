import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MAX_SCORE_BATCH, SeoScoreService } from "./seo-score.service";
import { planProduct, ProductFacts, ProductPlan } from "./product-seo-draft";
import { isUnverifiedStock } from "../homepage/cheapest-by-category";

export type JobKind = "score-refresh" | "product-optimize";
export type JobScope = "purchasable" | "indexable" | "missing" | "ids";

export type CreateJobInput = {
  kind: JobKind;
  mode?: "dry-run" | "apply";
  scope?: JobScope;
  ids?: string[];
  /** Hard cap on the number of records a single job may handle (apply is capped at 500). */
  limit?: number;
  /** An apply job must name the finished dry-run it confirms. */
  confirmJobId?: string;
};

const SCORE_BATCH = MAX_SCORE_BATCH; // a batch can never exceed the per-request cap
const OPTIMIZE_BATCH = 40;
const MAX_APPLY = 500;
const MAX_RESULTS = 400;
const MAX_ERRORS = 200;
const MACHINE_CATEGORIES = ["materiel-de-musculation", "cardio-fitness"];

type Params = { scope?: JobScope; ids: string[]; limit?: number; confirmJobId?: string };

/**
 * In-process, resumable batch runner. One job runs at a time; state lives in the SeoJob table, so a restart resumes where
 * it stopped (the cursor is the index into params.ids). The browser only polls: nothing depends on an open page.
 */
@Injectable()
export class SeoJobService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeoJobService.name);
  private running = false;
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService, private readonly scores: SeoScoreService) {}

  async onModuleInit() {
    try {
      await this.prisma.seoJob.updateMany({ where: { status: "RUNNING" }, data: { status: "QUEUED" } }); // resume after restart
      this.timer = setInterval(() => void this.tick(), 15_000);
      this.timer.unref?.();
      void this.tick();
    } catch (error) {
      this.logger.warn(`Job runner not started: ${error instanceof Error ? error.message : error}`);
    }
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  // ───────────── public API ─────────────
  async create(input: CreateJobInput, createdBy?: string) {
    if (input.kind !== "score-refresh" && input.kind !== "product-optimize") throw new BadRequestException("Type de tâche invalide.");
    const mode = input.mode ?? "dry-run";
    if (mode !== "dry-run" && mode !== "apply") throw new BadRequestException("Mode invalide.");
    const scope: JobScope = input.scope ?? "purchasable";
    let ids: string[] = [];
    let backupTable: string | null = null;

    if (input.kind === "score-refresh") {
      ids = (await this.prisma.product.findMany({ select: { id: true }, orderBy: { id: "asc" } })).map((p) => p.id);
    } else {
      if (mode === "apply") {
        if (!input.confirmJobId) throw new BadRequestException("Une simulation terminée (confirmJobId) est requise avant d'appliquer.");
        const dry = await this.prisma.seoJob.findUnique({ where: { id: input.confirmJobId } });
        const dp = (dry?.params ?? {}) as Params;
        if (!dry || dry.mode !== "dry-run" || dry.status !== "DONE" || dry.kind !== "product-optimize") throw new BadRequestException("La simulation indiquée est introuvable ou non terminée.");
        if (dp.scope !== scope) throw new BadRequestException("Le périmètre diffère de celui de la simulation.");
      }
      ids = await this.selectIds(scope, input.ids ?? []);
      const cap = mode === "apply" ? Math.min(Number(input.limit) || MAX_APPLY, MAX_APPLY) : Number(input.limit) || ids.length;
      ids = ids.slice(0, cap);
      if (ids.length === 0) throw new BadRequestException("Aucune fiche ne correspond à ce périmètre.");
      if (mode === "apply") backupTable = await this.snapshot(ids);
    }
    const job = await this.prisma.seoJob.create({
      data: { kind: input.kind, entity: "product", mode: input.kind === "score-refresh" ? "apply" : mode, params: { scope, ids, limit: input.limit, confirmJobId: input.confirmJobId } as object, total: ids.length, backupTable, createdBy },
    });
    void this.tick();
    return this.view(job);
  }

  async get(id: string) {
    const job = await this.prisma.seoJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("Tâche introuvable.");
    return this.view(job, true);
  }
  async list() {
    const jobs = await this.prisma.seoJob.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    return jobs.map((j) => this.view(j));
  }
  async cancel(id: string) {
    const job = await this.prisma.seoJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("Tâche introuvable.");
    if (job.status === "DONE" || job.status === "CANCELLED" || job.status === "FAILED") return this.view(job);
    const updated = await this.prisma.seoJob.update({ where: { id }, data: { cancelRequested: true, ...(job.status === "QUEUED" ? { status: "CANCELLED", finishedAt: new Date() } : {}) } });
    return this.view(updated);
  }
  async retryFailures(id: string) {
    const job = await this.prisma.seoJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("Tâche introuvable.");
    const failedIds = ((job.errors as { id: string }[]) ?? []).map((e) => e.id);
    if (failedIds.length === 0) throw new BadRequestException("Aucun échec à rejouer.");
    const params = job.params as unknown as Params;
    return this.create({ kind: job.kind as JobKind, mode: job.mode as "dry-run" | "apply", scope: "ids", ids: failedIds, confirmJobId: job.mode === "apply" ? params.confirmJobId : undefined });
  }
  async exportCsv(id: string) {
    const job = await this.prisma.seoJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException("Tâche introuvable.");
    const rows = (job.results as unknown as { slug: string; action: string; reason: string; fields?: string[]; issues?: string[] }[]) ?? [];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return ["slug,action,reason,changed_fields,issues", ...rows.map((r) => [r.slug, r.action, r.reason, (r.fields ?? []).join("|"), (r.issues ?? []).join("|")].map(esc).join(","))].join("\n");
  }
  /** Restores the SEO fields of an applied job from its snapshot (text fields only; never touches price, stock or indexability). */
  async rollback(id: string) {
    const job = await this.prisma.seoJob.findUnique({ where: { id } });
    if (!job || !job.backupTable) throw new BadRequestException("Aucune sauvegarde pour cette tâche.");
    if (!/^_backup_product_seo_[a-z0-9]+$/i.test(job.backupTable)) throw new BadRequestException("Nom de sauvegarde invalide.");
    const t = job.backupTable;
    await this.prisma.$executeRawUnsafe(`UPDATE "Product" p SET "seoTitle"=b."seoTitle","seoDescription"=b."seoDescription","seoH1"=b."seoH1","seoIntro"=b."seoIntro","seoContent"=b."seoContent","seoKeywords"=b."seoKeywords","canonicalUrl"=b."canonicalUrl","ogTitle"=b."ogTitle","ogDescription"=b."ogDescription","ogImage"=b."ogImage","imageAlt"=b."imageAlt","seoScore"=b."seoScore" FROM "${t}" b WHERE b.id=p.id`);
    this.scores.invalidate();
    await this.prisma.seoJob.update({ where: { id }, data: { status: "ROLLED_BACK" } });
    return { restoredFrom: t };
  }

  // ───────────── scope selection ─────────────
  private async selectIds(scope: JobScope, ids: string[]): Promise<string[]> {
    if (scope === "ids") {
      if (ids.length === 0) throw new BadRequestException("Aucun identifiant fourni.");
      return [...new Set(ids)].slice(0, 5000);
    }
    const base = { publishState: "PUBLISHED" as const };
    let where: Record<string, unknown> = base;
    if (scope === "purchasable") where = { ...base, inStock: true, category: { slug: { notIn: MACHINE_CATEGORIES } } };
    else if (scope === "indexable") where = { ...base, indexable: true };
    else if (scope === "missing") where = { ...base, OR: [{ seoTitle: null }, { seoDescription: null }, { seoH1: null }, { seoIntro: null }] };
    const rows = await this.prisma.product.findMany({ where, select: { id: true, totalStock: true, indexable: true, inStock: true }, orderBy: [{ inStock: "desc" }, { indexable: "desc" }, { id: "asc" }] });
    // Priority: purchasable and verified stock first; unverified counts (100 / 500+) are excluded from the purchasable wave.
    return rows.filter((r) => (scope === "purchasable" ? !isUnverifiedStock(r.totalStock) : true)).map((r) => r.id);
  }

  private async snapshot(ids: string[]): Promise<string> {
    const name = `_backup_product_seo_${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}${Math.random().toString(36).slice(2, 6)}`;
    const list = ids.map((i) => `'${i.replace(/'/g, "''")}'`).join(",");
    await this.prisma.$executeRawUnsafe(
      `CREATE TABLE "${name}" AS SELECT id, slug, "seoTitle","seoDescription","seoH1","seoIntro","seoContent","seoKeywords","canonicalUrl","ogTitle","ogDescription","ogImage","imageAlt","seoScore","updatedAt" FROM "Product" WHERE id IN (${list})`,
    );
    return name;
  }

  // ───────────── runner ─────────────
  private async tick() {
    if (this.running) return;
    this.running = true;
    try {
      for (;;) {
        const job = await this.prisma.seoJob.findFirst({ where: { status: "QUEUED" }, orderBy: { createdAt: "asc" } });
        if (!job) break;
        await this.runJob(job.id);
      }
    } catch (error) {
      this.logger.error(`Job runner error: ${error instanceof Error ? error.message : error}`);
    } finally {
      this.running = false;
    }
  }

  private async runJob(id: string) {
    let job = await this.prisma.seoJob.update({ where: { id }, data: { status: "RUNNING", startedAt: new Date() } });
    const params = job.params as unknown as Params;
    const ids = params.ids;
    const size = job.kind === "score-refresh" ? SCORE_BATCH : OPTIMIZE_BATCH;
    const results = ((job.results as unknown as object[]) ?? []).slice();
    const errors = ((job.errors as unknown as object[]) ?? []).slice();
    let { processed, succeeded, failed, skipped } = job;
    try {
      for (let offset = processed; offset < ids.length; offset += size) {
        const fresh = await this.prisma.seoJob.findUnique({ where: { id }, select: { cancelRequested: true } });
        if (fresh?.cancelRequested) { await this.finish(id, "CANCELLED", { processed, succeeded, failed, skipped, results, errors }); return; }
        const batch = ids.slice(offset, offset + size);
        try {
          if (job.kind === "score-refresh") {
            const scored = await this.scores.scoreProducts(batch, true);
            succeeded += scored.length;
            skipped += batch.length - scored.length;
          } else {
            const r = await this.optimizeBatch(batch, job.mode === "apply");
            succeeded += r.optimized; skipped += r.skipped; failed += r.failed;
            for (const entry of r.entries) if (results.length < MAX_RESULTS || entry.action === "blocked") results.push(entry);
            for (const e of r.errors) if (errors.length < MAX_ERRORS) errors.push(e);
          }
        } catch (error) {
          failed += batch.length;
          for (const bid of batch) if (errors.length < MAX_ERRORS) errors.push({ id: bid, error: error instanceof Error ? error.message : "Erreur inconnue" });
        }
        processed = Math.min(offset + size, ids.length);
        job = await this.prisma.seoJob.update({ where: { id }, data: { processed, succeeded, failed, skipped, cursor: ids[processed - 1] ?? null, results: results as object, errors: errors as object } });
        await new Promise((resolve) => setImmediate(resolve));
      }
      if (job.kind === "product-optimize" && job.mode === "apply") this.scores.invalidate();
      await this.finish(id, "DONE", { processed, succeeded, failed, skipped, results, errors });
    } catch (error) {
      this.logger.error(`Job ${id} failed: ${error instanceof Error ? error.message : error}`);
      await this.finish(id, "FAILED", { processed, succeeded, failed, skipped, results, errors: [...errors, { id: "job", error: error instanceof Error ? error.message : "Erreur" }] });
    }
  }

  private async finish(id: string, status: string, state: { processed: number; succeeded: number; failed: number; skipped: number; results: object[]; errors: object[] }) {
    await this.prisma.seoJob.update({ where: { id }, data: { status, finishedAt: new Date(), processed: state.processed, succeeded: state.succeeded, failed: state.failed, skipped: state.skipped, results: state.results as object, errors: state.errors as object } });
  }

  private async optimizeBatch(batch: string[], apply: boolean) {
    const rows = await this.prisma.product.findMany({ where: { id: { in: batch } }, include: { brand: { select: { name: true, slug: true } }, category: { select: { name: true, slug: true } }, variants: { select: { label: true, priceMillimes: true, stock: true }, orderBy: { priceMillimes: "asc" }, take: 1 } } });
    const entries: { slug: string; action: string; reason: string; fields?: string[]; issues?: string[] }[] = [];
    const errors: { id: string; error: string }[] = [];
    let optimized = 0, skipped = 0, failed = 0;
    const plans: { plan: ProductPlan; row: (typeof rows)[number] }[] = [];
    for (const row of rows) {
      const facts: ProductFacts = {
        id: row.id, slug: row.slug, name: row.name, description: row.description, publishState: row.publishState, inStock: row.inStock,
        brand: row.brand, category: row.category, variantLabel: row.variants[0]?.label ?? null, image: row.image,
        seoTitle: row.seoTitle, seoDescription: row.seoDescription, seoH1: row.seoH1, seoIntro: row.seoIntro, seoContent: row.seoContent,
        seoKeywords: row.seoKeywords, canonicalUrl: row.canonicalUrl, ogTitle: row.ogTitle, ogDescription: row.ogDescription, ogImage: row.ogImage, imageAlt: row.imageAlt,
      };
      plans.push({ plan: planProduct(facts), row });
    }
    const found = new Set(rows.map((r) => r.id));
    for (const id of batch) if (!found.has(id)) { failed++; errors.push({ id, error: "Produit introuvable." }); }
    for (const { plan, row } of plans) {
      if (plan.action === "optimize") {
        if (apply) {
          try {
            const updated = await this.prisma.product.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: plan.changes });
            if (updated.count !== 1) { failed++; errors.push({ id: row.id, error: "La fiche a changé pendant l'exécution : ignorée." }); continue; }
          } catch (error) { failed++; errors.push({ id: row.id, error: error instanceof Error ? error.message : "Erreur d'écriture" }); continue; }
        }
        optimized++;
        entries.push({ slug: plan.slug, action: apply ? "applied" : "optimize", reason: plan.reason, fields: Object.keys(plan.changes) });
      } else if (plan.action === "blocked") {
        skipped++;
        entries.push({ slug: plan.slug, action: "blocked", reason: plan.reason, issues: plan.issues });
      } else {
        skipped++;
        entries.push({ slug: plan.slug, action: "skip", reason: plan.reason });
      }
    }
    if (apply && optimized > 0) await this.scores.scoreProducts(plans.filter((p) => p.plan.action === "optimize").map((p) => p.row.id), true);
    return { optimized, skipped, failed, entries, errors };
  }

  private view(job: { id: string; kind: string; entity: string; mode: string; status: string; params: unknown; total: number; processed: number; succeeded: number; failed: number; skipped: number; errors: unknown; results: unknown; backupTable: string | null; cancelRequested: boolean; createdAt: Date; startedAt: Date | null; finishedAt: Date | null }, detail = false) {
    const params = job.params as Params;
    const base = {
      id: job.id, kind: job.kind, mode: job.mode, status: job.status, scope: params?.scope ?? null, total: job.total, processed: job.processed,
      succeeded: job.succeeded, failed: job.failed, skipped: job.skipped, percent: job.total ? Math.round((job.processed / job.total) * 100) : 0,
      backupTable: job.backupTable, cancelRequested: job.cancelRequested, createdAt: job.createdAt, startedAt: job.startedAt, finishedAt: job.finishedAt,
    };
    return detail ? { ...base, errors: job.errors, results: job.results } : base;
  }
}
