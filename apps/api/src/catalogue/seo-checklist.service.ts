import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { PrismaService } from "../prisma/prisma.service";
import { categoryTreeIds } from "./category-tree";
import { calculateChecklist, ChecklistType, derivedCategoryEvidence, keywords, normalize, PageEvidence, plainText, realImage } from "./seo-checklist";
import { planCategory } from "./category-seo-draft";
import { SeoScoreService } from "./seo-score.service";
import { planProduct, ProductFacts } from "./product-seo-draft";

const ORIGIN = "https://paratunisie.com";
const validType = (type: string): ChecklistType => { if (type !== "product" && type !== "category") throw new BadRequestException("Type invalide"); return type; };
const fingerprint = (row: any, members: any[]) => createHash("sha256").update(JSON.stringify({ fields: [row.slug, row.name, row.seoTitle, row.seoDescription, row.seoH1, row.seoIntro, row.description, row.seoContent, row.canonicalUrl, row.seoKeywords, row.ogTitle, row.ogDescription, row.ogImage, row.image, row.imageAlt, row.indexable, row.followLinks, row.publishState, row.status, row.parentId, row.brand?.name, row.category?.slug, row.variants, row.images], members: members.map(p => [p.slug, p.indexable, p.variants]) })).digest("hex");

@Injectable()
export class SeoChecklistService {
  constructor(private readonly prisma: PrismaService, private readonly scores: SeoScoreService) {}

  /**
   * Category snapshot only (51 rows). The product catalogue (~12,000 rows) is never loaded whole: products are scored per page
   * through SeoScoreService, and a category only needs a few light columns of its member products.
   */
  private async snapshot(requested: ChecklistType) {
    const type = requested as ChecklistType;
    if (requested === "product") throw new BadRequestException("Les scores produits sont paginés : utilisez /catalogue/seo/scores/product?ids=…");
    const [products, categories, audits] = await Promise.all([
      this.prisma.product.findMany({ select: { id: true, slug: true, categoryId: true, publishState: true, indexable: true, image: true, variants: { select: { priceMillimes: true, stock: true } } } }),
      this.prisma.category.findMany(), this.prisma.seoChecklistAudit.findMany({ where: { key: { startsWith: `${type}:` } } }),
    ]);
    const rows: any[] = categories;
    const count = (values: string[]) => { const result = new Map<string, number>(); for (const value of values) result.set(value, (result.get(value) || 0) + 1); return result; };
    const slugs = count(rows.map(row => row.slug));
    const titles = count(rows.map(row => normalize(row.seoTitle)));
    const descriptions = count(rows.map(row => normalize(type === "product" ? row.description : row.seoContent)));
    const auditMap = new Map(audits.map(audit => [audit.key, audit]));
    return rows.map(row => {
      const ids = type === "category" ? new Set(categoryTreeIds(categories, [row.id])) : new Set<string>();
      const members = type === "category" ? products.filter(p => ids.has(p.categoryId) && p.publishState === "PUBLISHED") : [];
      const context = { uniqueSlug: slugs.get(row.slug) === 1, uniqueTitle: titles.get(normalize(row.seoTitle)) === 1, uniqueDescription: descriptions.get(normalize(type === "product" ? row.description : row.seoContent)) === 1, productCount: members.length };
      const hash = fingerprint(row, members);
      const candidate = auditMap.get(`${type}:${row.id}`);
      const saved = candidate?.sourceHash === hash && Date.now() - candidate.checkedAt.getTime() < 24 * 60 * 60 * 1000 ? candidate : undefined;
      const verified = saved?.evidence as PageEvidence | undefined;
      return { row, members, context, hash, evidence: verified ?? derivedCategoryEvidence(row, members), source: verified ? "verified" : "derived" };
    });
  }

  async report(rawType: string) {
    const requested = validType(rawType);
    const type = requested as ChecklistType;
    if (requested === "product") throw new BadRequestException("Les scores produits sont paginés : utilisez /catalogue/seo/scores/product?ids=…");
    const rows = await this.snapshot(type);
    const items = rows.map(item => ({ ...calculateChecklist(type, item.row, item.context, item.evidence), source: item.source }));
    return { items, total: items.length, perfect: items.filter(i => i.score === 100).length, below100: items.filter(i => i.score < 100).length, checklistVersion: 1, note: "Checklist interne ; aucun classement Google garanti. Les contrôles publics expirent après 24 h ou une modification des données." };
  }

  private async readPublic(path: string) {
    // Only this fixed storefront origin can be fetched; no admin-supplied host.
    const url = new URL(path, ORIGIN);
    if (url.origin !== ORIGIN) throw new Error("Hôte externe non autorisé");
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), redirect: "manual", headers: { "User-Agent": "ParaTunisie-SEO-Checklist/1.0", "Cache-Control": "no-cache" } });
    return { response, body: await response.text() };
  }

  private async verify(type: ChecklistType, row: any, members: any[]): Promise<PageEvidence> {
    const path = `/${type === "product" ? "produits/" : ""}${row.slug}`;
    const url = ORIGIN + path;
    const evidence: PageEvidence = { checkedAt: new Date().toISOString(), http: false, indexable: false, sitemap: false, schema: false, offer: false, breadcrumb: false, internalLinks: false, image: false, h1: false, metadata: false };
    try {
      const [page, sitemap, robots] = await Promise.all([this.readPublic(path), this.readPublic("/sitemap.xml"), this.readPublic("/robots.txt")]);
      const $ = load(page.body);
      evidence.http = page.response.status === 200;
      const canonical = $('link[rel="canonical"]').attr("href");
      const directives = `${$('meta[name="robots"]').attr("content") || ""},${page.response.headers.get("x-robots-tag") || ""}`;
      const blocked = robots.body.split("\n").some(line => { const match = line.match(/^Disallow:\s*(\/\S*)/i); return match && path.startsWith(match[1]); });
      evidence.indexable = evidence.http && canonical === url && !/noindex|none/i.test(directives) && robots.response.status === 200 && !blocked;
      const xml = load(sitemap.body, { xmlMode: true });
      evidence.sitemap = sitemap.response.status === 200 && xml("loc").toArray().some(node => xml(node).text() === url);
      evidence.h1 = $("h1").length === 1 && normalize($("h1").first().text()) === normalize(row.seoH1 || row.name);
      evidence.metadata = Boolean($("title").text() && $('meta[name="description"]').attr("content") && canonical === url && $('meta[property="og:title"]').attr("content") && $('meta[name="twitter:card"]').attr("content"));
      const schemas: any[] = [];
      $('script[type="application/ld+json"]').each((_i, element) => { try { const value = JSON.parse($(element).text()); schemas.push(...(Array.isArray(value) ? value : value["@graph"] || [value])); } catch {} });
      const breadcrumb = schemas.find(s => s["@type"] === "BreadcrumbList");
      evidence.breadcrumb = Boolean(breadcrumb?.itemListElement?.length >= 2 && $('nav[aria-label*="Ariane"], nav[aria-label*="ariane"]').length);
      // Exclude global navigation/footer. Links must come from the page body.
      const content = $("main").clone(); content.find("header,footer,nav").remove();
      const links = new Set(content.find("a[href]").toArray().map(a => $(a).attr("href") || "").filter(href => /^\/(?:produits\/|marques\/|conseils\/|[a-z0-9-]+$)/.test(href)));
      evidence.internalLinks = links.size >= 2;
      const image = type === "product" ? row.image || row.images?.[0]?.url : row.ogImage;
      if (realImage(image)) {
        const imageUrl = new URL(image, ORIGIN);
        if (imageUrl.origin === ORIGIN) { const response = await fetch(imageUrl, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(8000) }); evidence.image = response.ok && (response.headers.get("content-type") || "").startsWith("image/"); }
      }
      if (type === "product") {
        const schema = schemas.find(s => s["@type"] === "Product");
        evidence.schema = Boolean(schema?.name && schema?.sku && schema?.image?.length && schema?.description && normalize(schema.name) === normalize(row.name));
        const offer = schema?.offers;
        evidence.offer = Boolean(offer && offer.priceCurrency === "TND" && Number(offer.price) === row.variants[0]?.priceMillimes / 1000 && offer.url === url && offer.availability === `https://schema.org/${row.variants.some((v: any) => v.stock > 0) ? "InStock" : "OutOfStock"}`);
      } else {
        evidence.schema = Boolean(schemas.find(s => s["@type"] === "CollectionPage" && s.url === url));
        const listing = schemas.find(s => s["@type"] === "ItemList");
        const allowed = new Set(members.map(p => `${ORIGIN}/produits/${p.slug}`));
        evidence.offer = Boolean(listing?.itemListElement?.length > 0 && listing.itemListElement.every((item: any) => allowed.has(item.url || item.item?.url) && page.body.includes(new URL(item.url || item.item.url).pathname)));
      }
    } catch (error) { evidence.error = error instanceof Error ? error.message : "Échec du contrôle public"; }
    return evidence;
  }

  /** Single-product optimisation: loads only that product (never the catalogue), plans safely, applies with optimistic locking. */
  private async optimizeProduct(id: string, repair: boolean) {
    const load = () => this.prisma.product.findUnique({ where: { id }, include: { brand: true, category: true, variants: true, images: true } });
    let row = await load();
    if (!row) throw new NotFoundException("Fiche introuvable");
    const facts: ProductFacts = {
      id: row.id, slug: row.slug, name: row.name, description: row.description, publishState: row.publishState, inStock: row.inStock,
      brand: row.brand, category: row.category, variantLabel: row.variants[0]?.label ?? null, image: row.image,
      seoTitle: row.seoTitle, seoDescription: row.seoDescription, seoH1: row.seoH1, seoIntro: row.seoIntro, seoContent: row.seoContent,
      seoKeywords: row.seoKeywords, canonicalUrl: row.canonicalUrl, ogTitle: row.ogTitle, ogDescription: row.ogDescription, ogImage: row.ogImage, imageAlt: row.imageAlt,
    };
    const plan = planProduct(facts);
    const changedFields: string[] = [];
    if (repair && plan.action === "optimize") {
      const updated = await this.prisma.product.updateMany({ where: { id, updatedAt: row.updatedAt }, data: plan.changes });
      if (updated.count !== 1) throw new BadRequestException("La fiche a changé. Rechargez avant d’optimiser.");
      changedFields.push(...Object.keys(plan.changes));
      this.scores.invalidate();
      row = (await load())!;
    }
    const evidence = await this.verify("product", row, []);
    await this.prisma.seoChecklistAudit.upsert({ where: { key: `product:${id}` }, create: { key: `product:${id}`, sourceHash: "v2", evidence: evidence as object, checkedAt: new Date(evidence.checkedAt) }, update: { sourceHash: "v2", evidence: evidence as object, checkedAt: new Date(evidence.checkedAt) } });
    const [score] = await this.scores.scoreProducts([id], true);
    return { ...score, changedFields, plan: { action: plan.action, reason: plan.reason, issues: plan.issues } };
  }

  async optimize(rawType: string, id: string, repair = true) {
    const requested = validType(rawType);
    if (requested === "product") return this.optimizeProduct(id, repair);
    const type = requested as ChecklistType;
    let item = (await this.snapshot(type)).find(item => item.row.id === id);
    if (!item) throw new NotFoundException("Fiche introuvable");
    const changes: Record<string, any> = {};
    const row = item.row;
    // Gap filling only (see category-seo-draft.ts): empty / out-of-range / wrong-canonical fields are completed from catalogue
    // facts; existing text and indexability are never replaced.
    const treeIds = categoryTreeIds(await this.prisma.category.findMany({ select: { id: true, slug: true, name: true, parentId: true } }), [row.id]);
    const top = await this.prisma.product.groupBy({ by: ["brandId"], where: { categoryId: { in: treeIds }, publishState: "PUBLISHED", indexable: true }, _count: { _all: true }, orderBy: { _count: { brandId: "desc" } }, take: 3 });
    const brandRows = top.length ? await this.prisma.brand.findMany({ where: { id: { in: top.map((t) => t.brandId) } }, select: { id: true, name: true } }) : [];
    const brandNames = top.map((t) => brandRows.find((b) => b.id === t.brandId)?.name).filter((n): n is string => Boolean(n));
    const plan = planCategory({
      id: row.id, slug: row.slug, name: row.name, status: row.status, image: row.heroImage || row.image || item.members.find((m: any) => m.image)?.image || null, brands: brandNames,
      seoTitle: row.seoTitle, seoDescription: row.seoDescription, seoH1: row.seoH1, seoIntro: row.seoIntro, seoKeywords: row.seoKeywords, canonicalUrl: row.canonicalUrl,
      ogTitle: row.ogTitle, ogDescription: row.ogDescription, ogImage: row.ogImage, imageAlt: row.imageAlt,
    });
    if (plan.action === "optimize") Object.assign(changes, plan.changes);
    // Existing editorial text, clinical facts and indexability are never overwritten.
    if (repair && Object.keys(changes).length) {
      const model = type === "product" ? this.prisma.product : this.prisma.category;
      const updated = await (model as any).updateMany({ where: { id, updatedAt: row.updatedAt }, data: changes });
      if (updated.count !== 1) throw new BadRequestException("La fiche a changé. Rechargez avant d’optimiser.");
      item = (await this.snapshot(type)).find(item => item.row.id === id)!;
    }
    const evidence = await this.verify(type, item.row, item.members);
    await this.prisma.seoChecklistAudit.upsert({ where: { key: `${type}:${id}` }, create: { key: `${type}:${id}`, sourceHash: item.hash, evidence, checkedAt: new Date(evidence.checkedAt) }, update: { sourceHash: item.hash, evidence, checkedAt: new Date(evidence.checkedAt) } });
    const result = calculateChecklist(type, item.row, item.context, evidence);
    if (type === "product" && row.seoScore !== result.score) await this.prisma.product.update({ where: { id }, data: { seoScore: result.score } });
    return { ...result, changedFields: repair ? Object.keys(changes) : [] };
  }
}
