import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import {
  CatalogProvider,
  CategoryDiscovery,
  ProductDiscovery,
  ScrapedProductDetails,
} from "./catalog-provider.interface";

@Injectable()
export class TunisieParaProvider implements CatalogProvider {
  readonly code = "tunisiepara";
  readonly name = "TunisiePara.com";
  readonly baseUrl = "https://tunisiepara.com";
  private readonly logger = new Logger(TunisieParaProvider.name);

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} on ${url}`);
    }
    return res.text();
  }

  parsePriceToMillimes(priceStr?: string): number | undefined {
    if (!priceStr) return undefined;
    const clean = priceStr
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    if (!clean) return undefined;

    const parts = clean.split(".");
    if (parts.length > 2) {
      const whole = parts.slice(0, -1).join("");
      const decimal = parts[parts.length - 1];
      const val = parseFloat(`${whole}.${decimal}`);
      return isNaN(val) ? undefined : Math.round(val * 1000);
    }

    const val = parseFloat(clean);
    if (isNaN(val)) return undefined;

    if (clean.includes(".")) {
      const decimals = clean.split(".")[1] || "";
      if (decimals.length === 1) return Math.round(val * 1000);
      if (decimals.length === 2) return Math.round(val * 1000);
      if (decimals.length === 3) return Math.round(val * 1000);
    }
    return Math.round(val * 1000);
  }

  async discoverCategories(): Promise<CategoryDiscovery[]> {
    this.logger.log(`Exploration des catégories sur ${this.baseUrl}...`);
    const html = await this.fetchHtml(`${this.baseUrl}/shop/`);
    const $ = cheerio.load(html);
    const categories: CategoryDiscovery[] = [];
    const seen = new Set<string>();

    $("a[href*='/categorie-produit/']").each((_, el) => {
      const href = $(el).attr("href");
      const name = $(el).text().trim();
      if (!href || !name || seen.has(href) || name.toLowerCase().includes("accueil")) return;
      seen.add(href);

      const parts = href.split("/categorie-produit/")[1]?.split("/").filter(Boolean) || [];
      const parentName = parts.length > 1 ? parts[parts.length - 2] : undefined;

      categories.push({
        name,
        url: href,
        parentName,
      });
    });

    return categories;
  }

  async discoverProducts(options?: {
    categoryUrl?: string;
    limit?: number;
    maxPages?: number;
  }): Promise<ProductDiscovery[]> {
    const products: ProductDiscovery[] = [];
    const seenUrls = new Set<string>();
    const limit = options?.limit ?? 1000;
    const maxPages = options?.maxPages ?? Math.max(10, Math.ceil(limit / 10));
    const startUrl = options?.categoryUrl || `${this.baseUrl}/shop/`;

    let page = 1;
    let hasNext = true;

    while (hasNext && page <= maxPages && products.length < limit) {
      const targetUrl =
        page === 1
          ? startUrl
          : startUrl.endsWith("/")
          ? `${startUrl}page/${page}/`
          : `${startUrl}?paged=${page}`;

      try {
        this.logger.log(`Exploration de la page catalogue ${page}: ${targetUrl}`);
        const html = await this.fetchHtml(targetUrl);
        const $ = cheerio.load(html);

        const items = $(".product, article.product, li.product, div.product-small, ul.products li");
        if (items.length === 0) {
          hasNext = false;
          break;
        }

        let newProductsOnPage = 0;
        items.each((_, el) => {
          if (products.length >= limit) return;

          const titleEl = $(el).find(".woocommerce-loop-product__title, .product-title, h2, h3").first();
          const linkEl = $(el).find("a[href*='/produit/'], a[href*='/shop/'], a.woocommerce-LoopProduct-link").first();
          const url = linkEl.attr("href") || $(el).find("a").first().attr("href");
          const title = titleEl.text().trim() || linkEl.text().trim();

          if (!url || !title || seenUrls.has(url)) return;
          seenUrls.add(url);

          const priceEl = $(el).find(".price ins .amount, .price .amount").first();
          const oldPriceEl = $(el).find(".price del .amount").first();

          const priceMillimes = this.parsePriceToMillimes(priceEl.text());
          const oldPriceMillimes = this.parsePriceToMillimes(oldPriceEl.text());

          const externalId = url.split("/").filter(Boolean).pop() || url;

          products.push({
            externalId,
            sourceUrl: url,
            sourceTitle: title,
            sourcePriceMillimes: priceMillimes,
            sourceOldPriceMillimes: oldPriceMillimes,
          });
          newProductsOnPage++;
        });

        if (newProductsOnPage === 0) {
          hasNext = false;
        } else {
          page++;
        }
      } catch (err) {
        this.logger.warn(`Erreur lors de l'exploration de ${targetUrl}: ${(err as Error).message}`);
        hasNext = false;
      }
    }

    return products;
  }

  async scrapeProduct(productUrl: string): Promise<ScrapedProductDetails> {
    const html = await this.fetchHtml(productUrl);
    const $ = cheerio.load(html);

    const externalId = productUrl.split("/").filter(Boolean).pop() || productUrl;

    const sourceTitle =
      $("h1.product_title, h1.entry-title").first().text().trim() ||
      $("h1").first().text().trim();

    let sourceBrand: string | undefined;
    const brandMeta = $(".posted_in a, .product_meta a[href*='marque'], .brand-link, .product-brand").first().text().trim();
    if (brandMeta) {
      sourceBrand = brandMeta;
    } else {
      const titleWords = sourceTitle.split(" ");
      if (titleWords.length > 0 && titleWords[0].length > 2) {
        sourceBrand = titleWords[0];
      }
    }

    let sourceCategory: string | undefined;
    $(".posted_in a, .product_meta a[href*='categorie']").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.toLowerCase() !== sourceBrand?.toLowerCase()) {
        sourceCategory = text;
      }
    });

    const priceEl = $(".summary .price ins .amount, .summary .price .amount").first();
    const oldPriceEl = $(".summary .price del .amount").first();

    const sourcePriceMillimes = this.parsePriceToMillimes(priceEl.text());
    const sourceOldPriceMillimes = this.parsePriceToMillimes(oldPriceEl.text());

    let description =
      $("#tab-description, .woocommerce-Tabs-panel--description, .product-description").text().trim() ||
      $(".short-description, .woocommerce-product-details__short-description").text().trim();

    description = description.replace(/\s+/g, " ").trim();

    let usage: string | undefined;
    let ingredients: string | undefined;

    $(".woocommerce-Tabs-panel, .tab-pane, .accordion-item").each((_, el) => {
      const id = $(el).attr("id") || "";
      const text = $(el).text().trim();
      if (id.includes("usage") || id.includes("conseil")) {
        usage = text;
      } else if (id.includes("ingredient") || id.includes("composition")) {
        ingredients = text;
      }
    });

    if (!usage) {
      const usageMatch = description.match(/(?:conseils? d'utilisation|utilisation|mode d'emploi)\s*:\s*([^.]+)/i);
      if (usageMatch) usage = usageMatch[1].trim();
    }
    if (!ingredients) {
      const ingrMatch = description.match(/(?:composition|ingrédients|actifs principaux)\s*:\s*([^.]+)/i);
      if (ingrMatch) ingredients = ingrMatch[1].trim();
    }

    const volumeMatch = sourceTitle.match(/(\d+\s*(?:ml|g|cl|l|kg|gélules|capsules|comprimés))/i);
    const volumeSize = volumeMatch ? volumeMatch[1] : undefined;

    const mainImgEl = $(".woocommerce-product-gallery__image img, .product-images img").first();
    const mainImage = mainImgEl.attr("data-large_image") || mainImgEl.attr("src");

    const galleryImages: string[] = [];
    $(".woocommerce-product-gallery__image img").each((_, el) => {
      const src = $(el).attr("data-large_image") || $(el).attr("src");
      if (src && !galleryImages.includes(src)) {
        galleryImages.push(src);
      }
    });

    return {
      externalId,
      sourceUrl: productUrl,
      sourceTitle,
      sourceBrand,
      sourceCategory,
      sourcePriceMillimes,
      sourceOldPriceMillimes,
      description,
      usage,
      ingredients,
      volumeSize,
      mainImage,
      galleryImages,
    };
  }
}
