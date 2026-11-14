import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Read-only product data-quality report for the admin app.
 * Every check is a fixed SQL predicate (no user input is interpolated); the only user inputs are
 * `page`, `pageSize` and the `q` search term, which are always bound parameters.
 * Nothing here merges, edits or deletes products.
 */
export const QUALITY_CHECKS = [
  "duplicate-names",
  "duplicate-skus",
  "slug-suffix-collisions",
  "size-variants",
  "flavor-variants",
  "suspicious-category",
  "missing-brand",
  "invalid-units",
  "missing-image",
  "thin-description",
  "legacy-branding",
  "restricted-substance",
] as const;
export type QualityCheck = (typeof QUALITY_CHECKS)[number];

export const QUALITY_LABELS: Record<QualityCheck, string> = {
  "duplicate-names": "Noms dupliqués",
  "duplicate-skus": "SKU dupliqués entre produits",
  "slug-suffix-collisions": "Slugs avec suffixe numérique (collision probable)",
  "size-variants": "Même produit, tailles différentes",
  "flavor-variants": "Même produit, saveurs différentes",
  "suspicious-category": "Catégorie suspecte (à vérifier)",
  "missing-brand": "Marque absente ou générique",
  "invalid-units": "Unités invalides dans le nom",
  "missing-image": "Image absente ou non hébergée chez nous",
  "thin-description": "Description trop courte (< 160 caractères)",
  "legacy-branding": "Mention d'une autre enseigne (PROTEIN.TN / Sobitas)",
  "restricted-substance": "Substance à revue juridique (hormones, etc.)",
};

const PUBLISHED = Prisma.sql`p."publishState" = 'PUBLISHED'`;
const NAME_KEY = Prisma.sql`lower(regexp_replace(trim(name), '\\s+', ' ', 'g'))`;
const SIZE_KEY = Prisma.sql`trim(regexp_replace(lower(name), '[0-9]+([.,][0-9]+)?\\s?(kg|g|mg|ml|l|oz|lbs?|caps?|capsules?|gélules?|comprimés?|tablets?|softgels?|gommes|sachets?|servings?|portions?)(?![a-zà-ÿ])', '', 'g'))`;
const FLAVOR_KEY = Prisma.sql`lower(regexp_replace(name, '\\s[–-]\\s.*$', ''))`;

function predicate(check: QualityCheck): Prisma.Sql {
  switch (check) {
    case "duplicate-names":
      return Prisma.sql`p.id IN (SELECT id FROM "Product" WHERE "publishState"='PUBLISHED' AND ${NAME_KEY} IN (SELECT ${NAME_KEY} FROM "Product" WHERE "publishState"='PUBLISHED' GROUP BY 1 HAVING count(*) > 1))`;
    case "duplicate-skus":
      return Prisma.sql`p.id IN (SELECT "productId" FROM "ProductVariant" WHERE sku IS NOT NULL AND sku <> '' AND sku IN (SELECT sku FROM "ProductVariant" WHERE sku IS NOT NULL AND sku <> '' GROUP BY sku HAVING count(DISTINCT "productId") > 1))`;
    case "slug-suffix-collisions":
      return Prisma.sql`p.slug ~ '-[0-9]+$' AND EXISTS (SELECT 1 FROM "Product" o WHERE o.id <> p.id AND o.slug = regexp_replace(p.slug, '-[0-9]+$', ''))`;
    case "size-variants":
      return Prisma.sql`p.id IN (SELECT id FROM "Product" WHERE "publishState"='PUBLISHED' AND ${SIZE_KEY} IN (SELECT ${SIZE_KEY} FROM "Product" WHERE "publishState"='PUBLISHED' AND length(${SIZE_KEY}) > 6 GROUP BY 1 HAVING count(DISTINCT name) > 1))`;
    case "flavor-variants":
      return Prisma.sql`p.id IN (SELECT id FROM "Product" WHERE "publishState"='PUBLISHED' AND ${FLAVOR_KEY} IN (SELECT ${FLAVOR_KEY} FROM "Product" WHERE "publishState"='PUBLISHED' AND name ~ '\\s[–-]\\s' GROUP BY 1 HAVING count(DISTINCT name) > 1))`;
    case "suspicious-category":
      return Prisma.sql`(
        (p.name ~* 'cr[ée]atine' AND c.slug !~ 'creatine|pack|accessoires') OR
        (p.name ~* 'whey' AND c.slug !~ 'whey|isolate|proteine|pack|gainer|mass') OR
        (p.name ~* '\\m(bcaa|eaa)\\M' AND c.slug !~ 'eaa|acides|bcaa|amin|pack') OR
        (p.name ~* 'shaker|gant|ceinture|sangle' AND c.slug !~ 'accessoire|materiel|shaker')
      )`;
    case "missing-brand":
      return Prisma.sql`(b.id IS NULL OR b.name ILIKE 'autres marques' OR length(trim(b.name)) < 2)`;
    case "invalid-units":
      // A number is a decimal tail when preceded by [0-9,.] (e.g. "2,268 kg"), so only stand-alone numbers are flagged.
      return Prisma.sql`(p.name ~* '(^|[^0-9,.])[0-9]{3,5}\\s?kgs?\\M' OR p.name ~* '(^|[^0-9,.])[0-9]{5,}\\s?g\\M' OR p.name ~* '(^|[^0-9,.])0\\s?(kg|g|ml)\\M')`;
    case "missing-image":
      return Prisma.sql`(p.image IS NULL OR p.image = '' OR p.image ~* 'placeholder|product-tube|product-unavailable' OR (p.image ~* '^https?://' AND p.image !~* '^https://(www\\.)?paratunisie\\.com/'))`;
    case "thin-description":
      return Prisma.sql`length(coalesce(p.description, '')) < 160`;
    case "legacy-branding":
      return Prisma.sql`(p.description ~* 'protein\\.tn|sobitas' OR p."seoDescription" ~* 'protein\\.tn|sobitas' OR p."seoContent" ~* 'protein\\.tn|sobitas')`;
    case "restricted-substance":
      return Prisma.sql`p.name ~* '(^|[^a-z0-9])(mk-?677|ibutamoren|sarms?|ostarine|ligandrol|lgd-?4033|rad-?140|testolone|cardarine|gw-?501516|stenabolic|dhea|7-?keto|pregnenolone|prohormones?|1-?andro|4-?andro|epiandrosterone|clenbuterol|ephedra|ephedrine|dnp|oxandrolone|anavar|tamoxifen|nolvadex|clomiphene|hcg)([^a-z0-9]|$)'`;
  }
}

const FROM = Prisma.sql`FROM "Product" p LEFT JOIN "Brand" b ON b.id = p."brandId" LEFT JOIN "Category" c ON c.id = p."categoryId"`;

@Injectable()
export class CatalogueQualityService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const counts = await Promise.all(
      QUALITY_CHECKS.map(async (check) => {
        const rows = await this.prisma.$queryRaw<{ n: bigint }[]>(
          Prisma.sql`SELECT count(*)::bigint AS n ${FROM} WHERE ${PUBLISHED} AND ${predicate(check)}`,
        );
        return { check, label: QUALITY_LABELS[check], count: Number(rows[0]?.n ?? 0) };
      }),
    );
    const total = await this.prisma.product.count({ where: { publishState: "PUBLISHED" } });
    return { totalPublished: total, checks: counts };
  }

  async list(check: string, pageInput?: number, pageSizeInput?: number, q?: string) {
    if (!(QUALITY_CHECKS as readonly string[]).includes(check)) {
      return { check, items: [], pagination: { page: 1, pageSize: 25, total: 0, pageCount: 0 }, error: "Contrôle inconnu." };
    }
    const pageSize = Math.min(100, Math.max(1, Math.floor(Number(pageSizeInput) || 25)));
    const page = Math.max(1, Math.floor(Number(pageInput) || 1));
    const term = (q ?? "").trim().slice(0, 80);
    const search = term ? Prisma.sql`AND (p.name ILIKE ${"%" + term + "%"} OR p.slug ILIKE ${"%" + term + "%"})` : Prisma.empty;
    const where = Prisma.sql`WHERE ${PUBLISHED} AND ${predicate(check as QualityCheck)} ${search}`;

    const [rows, totalRows] = await Promise.all([
      this.prisma.$queryRaw<
        { id: string; slug: string; name: string; indexable: boolean; inStock: boolean; image: string; brand: string | null; category: string | null; descLength: number }[]
      >(Prisma.sql`
        SELECT p.id, p.slug, p.name, p.indexable, p."inStock", p.image, b.name AS brand, c.name AS category,
               length(coalesce(p.description, ''))::int AS "descLength"
        ${FROM} ${where}
        ORDER BY lower(p.name), p.id
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`),
      this.prisma.$queryRaw<{ n: bigint }[]>(Prisma.sql`SELECT count(*)::bigint AS n ${FROM} ${where}`),
    ]);
    const total = Number(totalRows[0]?.n ?? 0);
    return {
      check,
      label: QUALITY_LABELS[check as QualityCheck],
      items: rows,
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    };
  }
}
