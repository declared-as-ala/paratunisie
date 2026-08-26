import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type SeoEntityType = "product" | "category" | "brand";

const SITE_URL = "https://paratunisie.com";

function clean(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function jsonStrings(values: string[]): string {
  return JSON.stringify([...new Set(values.map(clean).filter(Boolean))]);
}

function fitMeta(value: string): string {
  let text = clean(value);
  if (text.length < 140) text = `${text} Consultez les informations, les formats disponibles et la livraison partout en Tunisie.`;
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157);
  return `${shortened.slice(0, shortened.lastIndexOf(" "))}…`;
}

function productIntent(name: string, category: string): string {
  const haystack = `${name} ${category}`.toLowerCase();
  if (/cr[ée]atine/.test(haystack)) return "créatine et nutrition sportive";
  if (/whey|prot[ée]ine|gainer/.test(haystack)) return "protéines et nutrition sportive";
  if (/pre.?workout|booster/.test(haystack)) return "pré-workout et nutrition sportive";
  if (/vitamin|zinc|magn[ée]sium|omega/.test(haystack)) return "vitamines et compléments alimentaires";
  if (/solaire|spf|sun/.test(haystack)) return "protection solaire";
  if (/visage|s[ée]rum|cr[èe]me|peau/.test(haystack)) return "soins du visage";
  return "produits de parapharmacie";
}

function score(data: Record<string, unknown>) {
  const keys = ["seoTitle", "seoDescription", "seoH1", "canonicalUrl", "imageAlt", "ogTitle", "ogDescription", "ogImage", "seoContent"];
  return Math.round((keys.filter((key) => clean(data[key])).length / keys.length) * 100);
}

@Injectable()
export class CatalogueSeoService {
  constructor(private readonly prisma: PrismaService) {}

  generateProduct(product: any) {
    const name = clean(product.name);
    const brand = clean(product.brand?.name);
    const category = clean(product.category?.name) || "Parapharmacie";
    const format = clean(product.variants?.[0]?.label);
    const intent = productIntent(name, category);
    // Product names in this catalogue already carry their commercial format.
    // Variant labels can be stale import artefacts (for example “450ML” on
    // tablets), so they inform the body copy but never get blindly appended.
    const displayName = name;
    const title = `${displayName} en Tunisie | ParaTunisie`;
    const description = fitMeta(`Découvrez ${displayName}${brand ? ` de ${brand}` : ""} sur ParaTunisie, dans notre gamme ${intent}. Disponible en Tunisie avec livraison.`);
    const intro = `${displayName}${brand ? ` par ${brand}` : ""} est disponible sur ParaTunisie pour compléter votre sélection de ${intent} en Tunisie.`;
    const content = `Retrouvez ${displayName} dans notre catalogue ${category.toLowerCase()}. Consultez les informations produit, le format${format ? ` ${format}` : ""}, les conseils d’utilisation et la disponibilité avant de commander. ParaTunisie livre partout en Tunisie. Les informations présentées restent descriptives et ne remplacent pas l’avis d’un professionnel de santé.`;
    const image = clean(product.image || product.images?.[0]?.url);
    const generated: any = {
      seoTitle: title,
      seoDescription: description,
      seoH1: displayName,
      seoIntro: intro,
      seoContent: content,
      seoKeywords: jsonStrings([name, brand, category, `${name} Tunisie`, intent, "parapharmacie en ligne Tunisie"]),
      canonicalUrl: `${SITE_URL}/produits/${product.slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      imageAlt: `${displayName}${brand ? ` – ${brand}` : ""}`,
      indexable: true,
      followLinks: true,
      seoIsCustom: false,
      seoGeneratedAt: new Date(),
    };
    generated.seoScore = score(generated);
    return generated;
  }

  generateCategory(category: any) {
    const name = clean(category.name);
    const parent = clean(category.parent?.name);
    const productNames = (category.products ?? []).slice(0, 3).map((p: any) => clean(p.name)).filter(Boolean);
    const title = `${name} en Tunisie | Acheter en ligne | ParaTunisie`;
    const description = fitMeta(`Découvrez notre sélection ${name.toLowerCase()} en Tunisie${parent ? `, dans l’univers ${parent}` : ""}. Comparez les produits disponibles et commandez sur ParaTunisie.`);
    const intro = `Explorez notre gamme ${name.toLowerCase()} disponible en Tunisie, choisie pour répondre à différents besoins et formats.`;
    const examples = productNames.length ? ` La sélection comprend notamment ${productNames.join(", ")}.` : "";
    return {
      seoTitle: title,
      seoDescription: description,
      seoH1: `${name} en Tunisie`,
      seoIntro: intro,
      seoContent: `Choisissez vos produits ${name.toLowerCase()} selon leur marque, leur format et les informations indiquées sur chaque fiche.${examples} ParaTunisie réunit une offre de parapharmacie et de compléments disponible avec livraison en Tunisie. Consultez les conseils d’utilisation et demandez conseil à un professionnel de santé en cas de doute.`,
      seoKeywords: jsonStrings([`${name} Tunisie`, `${name} en ligne`, parent, "parapharmacie Tunisie"]),
      canonicalUrl: `${SITE_URL}/${category.slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: clean(category.heroImage || category.image),
      imageAlt: `Sélection ${name} disponible en Tunisie`,
      indexable: true,
      followLinks: true,
      seoIsCustom: false,
      seoGeneratedAt: new Date(),
    };
  }

  generateBrand(brand: any) {
    const name = clean(brand.name);
    const specialties = Array.isArray(brand.specialties) ? brand.specialties : (() => { try { return JSON.parse(brand.specialties || "[]"); } catch { return []; } })();
    const specialty = clean(specialties[0]) || "parapharmacie et compléments";
    const title = `${name} Tunisie | Produits ${name} | ParaTunisie`;
    const description = fitMeta(`Découvrez les produits ${name} disponibles en Tunisie sur ParaTunisie : ${specialty.toLowerCase()}, informations, prix et livraison.`);
    return {
      seoTitle: title,
      seoDescription: description,
      seoH1: `${name} Tunisie`,
      seoIntro: `Retrouvez la sélection ${name} disponible en Tunisie sur ParaTunisie.`,
      seoContent: `Explorez les références ${name} proposées dans notre catalogue. Comparez les formats, les usages et la disponibilité de chaque produit avant de commander en ligne avec livraison en Tunisie.`,
      seoKeywords: jsonStrings([`${name} Tunisie`, `produits ${name}`, `${name} en ligne`, specialty]),
      canonicalUrl: `${SITE_URL}/marques/${brand.slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: clean(brand.heroImage || brand.image),
      imageAlt: `Produits ${name} disponibles en Tunisie`,
      indexable: true,
      followLinks: true,
      seoIsCustom: false,
      seoGeneratedAt: new Date(),
    };
  }

  async generateOne(type: SeoEntityType, id: string, save = true) {
    let entity: any;
    let generated: any;
    if (type === "product") {
      entity = await this.prisma.product.findUnique({ where: { id }, include: { brand: true, category: true, variants: true, images: true } });
      if (!entity) throw new NotFoundException("Produit introuvable");
      generated = this.generateProduct(entity);
      if (save) await this.prisma.product.update({ where: { id }, data: generated });
    } else if (type === "category") {
      entity = await this.prisma.category.findUnique({ where: { id }, include: { parent: true, products: { select: { name: true }, take: 3 } } });
      if (!entity) throw new NotFoundException("Catégorie introuvable");
      generated = this.generateCategory(entity);
      if (save) await this.prisma.category.update({ where: { id }, data: generated });
    } else if (type === "brand") {
      entity = await this.prisma.brand.findUnique({ where: { id } });
      if (!entity) throw new NotFoundException("Marque introuvable");
      generated = this.generateBrand(entity);
      if (save) await this.prisma.brand.update({ where: { id }, data: generated });
    } else throw new BadRequestException("Type SEO invalide");
    return { ...generated, seoGeneratedAt: generated.seoGeneratedAt.toISOString() };
  }

  async generateBulk(type: SeoEntityType, mode: "missing" | "all" = "missing", cursor?: string, limit = 25) {
    const take = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const model: any = type === "product" ? this.prisma.product : type === "category" ? this.prisma.category : type === "brand" ? this.prisma.brand : null;
    if (!model) throw new BadRequestException("Type SEO invalide");
    const where: any = mode === "missing" ? { seoIsCustom: false, OR: [{ seoTitle: null }, { seoDescription: null }, { seoH1: null }, { canonicalUrl: null }] } : { seoIsCustom: false };
    const rows = await model.findMany({
      where,
      orderBy: { id: "asc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      ...(type === "product" ? { include: { brand: true, category: true, variants: true, images: true } } : {}),
      ...(type === "category" ? { include: { parent: true, products: { select: { name: true }, take: 3 } } } : {}),
    });
    let succeeded = 0;
    const failures: { id: string; error: string }[] = [];
    for (const row of rows) {
      if (mode === "missing" && row.seoIsCustom) continue;
      try {
        const generated = type === "product" ? this.generateProduct(row) : type === "category" ? this.generateCategory(row) : this.generateBrand(row);
        const data = mode === "missing"
          ? Object.fromEntries(Object.entries(generated).filter(([key]) => key === "seoGeneratedAt" || key === "seoScore" || row[key] === null || row[key] === undefined || row[key] === "" || row[key] === "[]"))
          : generated;
        await model.update({ where: { id: row.id }, data });
        succeeded++;
      } catch (error) {
        failures.push({ id: row.id, error: error instanceof Error ? error.message : "Erreur inconnue" });
      }
    }
    return { processed: rows.length, succeeded, failures, nextCursor: rows.length === take ? rows.at(-1)?.id : null, done: rows.length < take };
  }

  async report() {
    const [products, categories, brands] = await Promise.all([
      this.prisma.product.findMany({ select: { id: true, slug: true, seoTitle: true, seoDescription: true, seoH1: true } }),
      this.prisma.category.findMany({ select: { id: true, slug: true, seoTitle: true, seoDescription: true, seoH1: true } }),
      this.prisma.brand.findMany({ select: { id: true, slug: true, seoTitle: true, seoDescription: true, seoH1: true } }),
    ]);
    const all = [...products, ...categories, ...brands];
    const duplicates = (field: "slug" | "seoTitle" | "seoDescription" | "seoH1") => {
      const counts = new Map<string, number>();
      all.forEach((row: any) => { const value = clean(row[field]).toLowerCase(); if (value) counts.set(value, (counts.get(value) || 0) + 1); });
      return [...counts.entries()].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
    };
    const stats = (rows: any[]) => ({ total: rows.length, withSeo: rows.filter((r) => clean(r.seoTitle) && clean(r.seoDescription)).length, missingSeo: rows.filter((r) => !clean(r.seoTitle) || !clean(r.seoDescription)).length });
    return { products: stats(products), categories: stats(categories), brands: stats(brands), duplicates: { titles: duplicates("seoTitle"), descriptions: duplicates("seoDescription"), h1: duplicates("seoH1"), slugs: duplicates("slug") } };
  }
}
