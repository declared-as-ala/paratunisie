import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { PrismaService } from "../prisma/prisma.service";
import { categoryTreeIds } from "./category-tree";
import { calculateChecklist, ChecklistType, keywords, normalize, PageEvidence, plainText, realImage } from "./seo-checklist";

const ORIGIN = "https://paratunisie.com";
const validType = (type: string): ChecklistType => { if (type !== "product" && type !== "category") throw new BadRequestException("Type invalide"); return type; };
const fingerprint = (row: any, members: any[]) => createHash("sha256").update(JSON.stringify({ fields: [row.slug, row.name, row.seoTitle, row.seoDescription, row.seoH1, row.seoIntro, row.description, row.seoContent, row.canonicalUrl, row.seoKeywords, row.ogTitle, row.ogDescription, row.ogImage, row.image, row.imageAlt, row.indexable, row.followLinks, row.publishState, row.status, row.parentId, row.brand?.name, row.category?.slug, row.variants, row.images], members: members.map(p => [p.slug, p.indexable, p.variants]) })).digest("hex");

@Injectable()
export class SeoChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  private async snapshot(type: ChecklistType) {
    const [products, categories, audits] = await Promise.all([
      this.prisma.product.findMany({ include: { brand: true, category: true, variants: true, images: true } }),
      this.prisma.category.findMany(), this.prisma.seoChecklistAudit.findMany({ where: { key: { startsWith: `${type}:` } } }),
    ]);
    const rows: any[] = type === "product" ? products : categories;
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
      return { row, members, context, hash, evidence: saved?.evidence as PageEvidence | undefined };
    });
  }

  async report(rawType: string) {
    const type = validType(rawType);
    const rows = await this.snapshot(type);
    const items = rows.map(item => calculateChecklist(type, item.row, item.context, item.evidence));
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

  async optimize(rawType: string, id: string, repair = true) {
    const type = validType(rawType);
    let item = (await this.snapshot(type)).find(item => item.row.id === id);
    if (!item) throw new NotFoundException("Fiche introuvable");
    const changes: Record<string, any> = {};
    const row = item.row;
    const fill = (key: string, value: any) => { if ((row[key] == null || row[key] === "" || row[key] === "[]") && value) changes[key] = value; };
    const name = plainText(row.name);
    fill("seoH1", name);
    fill("canonicalUrl", `${ORIGIN}/${type === "product" ? "produits/" : ""}${row.slug}`);
    fill("seoTitle", `${name} Tunisie | ParaTunisie`);
    fill("seoDescription", `${name} sur ParaTunisie. Comparez le prix en Tunisie et consultez les informations de cette référence avant de commander.`);
    fill("seoIntro", plainText(row.description).split(/(?<=[.!?])\s/).slice(0, 2).join(" "));
    fill("seoKeywords", JSON.stringify([`${name} Tunisie`, `prix ${name}`, `acheter ${name}`]));
    fill("imageAlt", name);
    fill("ogTitle", changes.seoTitle || row.seoTitle);
    fill("ogDescription", changes.seoDescription || row.seoDescription);
    fill("ogImage", row.image || row.images?.[0]?.url || item.members[0]?.image);
    if (type === "product" && row.category?.slug && row.brand?.slug) fill("seoContent", `## Explorer cette référence\n\nRetrouvez ${name} dans [${row.category.name}](/${row.category.slug}) et comparez les autres références [${row.brand.name}](/marques/${row.brand.slug}).`);
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
