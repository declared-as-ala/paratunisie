import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// The `meilisearch` package (v0.60+) ships types resolvable only via a
// package.json `exports` map, which this project's `moduleResolution`
// (Node10/classic, tied to `module: commonjs` — see tsconfig.json) can't
// read. Rather than change module resolution repo-wide for one dependency,
// this file requires the package at runtime (works fine — Node's own
// resolution isn't affected) and declares just the surface actually used.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Meilisearch } = require("meilisearch");

interface MeiliSearchHit {
  id: string;
}
interface MeiliSearchResponse {
  hits: MeiliSearchHit[];
  estimatedTotalHits?: number;
}
interface MeiliIndexClient {
  updateSettings(settings: {
    searchableAttributes: string[];
    filterableAttributes: string[];
    sortableAttributes: string[];
    synonyms?: Record<string, string[]>;
  }): Promise<unknown>;
  search(query: string, opts: { limit: number; offset: number; filter: string; attributesToRetrieve: string[] }): Promise<MeiliSearchResponse>;
  addDocuments(docs: ProductSearchDoc[]): Promise<unknown>;
  deleteDocument(id: string): Promise<unknown>;
  deleteDocuments(ids: string[]): Promise<unknown>;
}
interface MeiliClient {
  index(name: string): MeiliIndexClient;
  createIndex(name: string, opts: { primaryKey: string }): Promise<unknown>;
}

export const PRODUCTS_INDEX = "products";

export type ProductSearchDoc = {
  id: string;
  name: string;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  benefit: string;
  publishState: string;
};

export type ProductSearchResult = {
  ids: string[];
  estimatedTotalHits: number;
};

/**
 * Thin façade over Meilisearch (API.md's "search" module) — real typo/
 * prefix/word-order-tolerant search over the catalogue, which Prisma's
 * `contains` filter cannot do (it requires one exact, ordered substring,
 * so "shampoo secs" or a typo'd word silently matched nothing even when
 * the product existed — see DECISIONS.md D-0031).
 *
 * Never the source of truth for product data — it only returns ranked ids;
 * CatalogueService re-fetches the real rows from Postgres afterwards, so
 * price/stock/publishState are always current at query time.
 */
@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliClient;
  private productsIndex: MeiliIndexClient;
  private indexReady = false;

  constructor(private prisma: PrismaService) {
    this.client = new Meilisearch({
      host: process.env.MEILI_HOST || "http://127.0.0.1:7700",
      apiKey: process.env.MEILI_API_KEY,
    }) as MeiliClient;
    this.productsIndex = this.client.index(PRODUCTS_INDEX);
  }

  async onModuleInit() {
    // Best-effort — a Meilisearch outage must never prevent the API from
    // starting; searchProducts() falls back to null (caller uses Prisma
    // `contains`) whenever the index isn't ready.
    try {
      await this.ensureIndexSettings();
      this.indexReady = true;
    } catch (err) {
      this.logger.warn(`Meilisearch unavailable at startup, search will fall back to Postgres: ${(err as Error).message}`);
    }
  }

  private async ensureIndexSettings(): Promise<void> {
    await this.client.createIndex(PRODUCTS_INDEX, { primaryKey: "id" }).catch(() => {});
    await this.productsIndex.updateSettings({
      searchableAttributes: ["name", "brandName", "categoryName", "benefit", "description"],
      filterableAttributes: ["publishState", "brandSlug", "categorySlug"],
      sortableAttributes: [],
      // Genuine cross-language/abbreviation equivalents only (D-0033) — no
      // concept expansion (e.g. "boutons" -> "purifiant") here, since that's
      // exactly the kind of AI reinterpretation that made unrelated products
      // outrank real matches for a literal ingredient search.
      synonyms: {
        "vitamine c": ["vitamin c", "vit c"],
        "vitamin c": ["vitamine c", "vit c"],
        "vit c": ["vitamine c", "vitamin c"],
        magnesium: ["magnésium"],
        magnésium: ["magnesium"],
        collagene: ["collagène"],
        collagène: ["collagene"],
        "spf 50": ["spf50"],
        spf50: ["spf 50"],
      },
    });
  }

  async searchProducts(
    query: string,
    opts: { limit: number; offset: number; brandSlug?: string; categorySlug?: string },
  ): Promise<ProductSearchResult | null> {
    if (!this.indexReady) return null;

    const filters = ['publishState = "PUBLISHED"'];
    if (opts.brandSlug) filters.push(`brandSlug = "${opts.brandSlug}"`);
    if (opts.categorySlug) filters.push(`categorySlug = "${opts.categorySlug}"`);

    try {
      const result = await this.productsIndex.search(query, {
        limit: opts.limit,
        offset: opts.offset,
        filter: filters.join(" AND "),
        attributesToRetrieve: ["id"],
      });
      return {
        ids: result.hits.map((hit) => hit.id),
        estimatedTotalHits: result.estimatedTotalHits ?? result.hits.length,
      };
    } catch (err) {
      this.logger.warn(`Meilisearch query failed, falling back to Postgres: ${(err as Error).message}`);
      return null;
    }
  }

  async indexProduct(productId: string): Promise<void> {
    if (!this.indexReady) return;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true, category: true },
    });
    if (!product) return;
    await this.productsIndex.addDocuments([this.toDoc(product)]).catch((err: Error) =>
      this.logger.warn(`Failed to index product ${productId}: ${err.message}`),
    );
  }

  async removeProduct(productId: string): Promise<void> {
    if (!this.indexReady) return;
    await this.productsIndex.deleteDocument(productId).catch((err: Error) =>
      this.logger.warn(`Failed to remove product ${productId} from index: ${err.message}`),
    );
  }

  async removeProducts(productIds: string[]): Promise<void> {
    if (!this.indexReady || productIds.length === 0) return;
    await this.productsIndex.deleteDocuments(productIds).catch((err: Error) =>
      this.logger.warn(`Failed to remove ${productIds.length} products from index: ${err.message}`),
    );
  }

  /** Full reindex — safe to re-run any time (POST /search/reindex, admin-only). */
  async reindexAllProducts(): Promise<{ indexed: number }> {
    await this.ensureIndexSettings();
    this.indexReady = true;

    const products = await this.prisma.product.findMany({
      include: { brand: true, category: true },
    });
    const docs = products.map((p) => this.toDoc(p));

    const BATCH_SIZE = 1000;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      await this.productsIndex.addDocuments(docs.slice(i, i + BATCH_SIZE));
    }

    this.logger.log(`Reindexed ${docs.length} products into Meilisearch`);
    return { indexed: docs.length };
  }

  private toDoc(product: {
    id: string;
    name: string;
    description: string;
    benefit: string;
    publishState: string;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
  }): ProductSearchDoc {
    return {
      id: product.id,
      name: product.name,
      brandName: product.brand.name,
      brandSlug: product.brand.slug,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      description: product.description ?? "",
      benefit: product.benefit ?? "",
      publishState: product.publishState,
    };
  }
}
