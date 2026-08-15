export interface CategoryDiscovery {
  name: string;
  url: string;
  parentName?: string;
}

export interface ProductDiscovery {
  externalId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceCategory?: string;
  sourceBrand?: string;
  sourcePriceMillimes?: number;
  sourceOldPriceMillimes?: number;
}

export interface ScrapedProductDetails {
  externalId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceCategory?: string;
  sourceBrand?: string;
  sourcePriceMillimes?: number;
  sourceOldPriceMillimes?: number;
  description?: string;
  usage?: string;
  ingredients?: string;
  benefits?: string[];
  skinTypes?: string[];
  volumeSize?: string;
  mainImage?: string;
  galleryImages?: string[];
  rawMetadata?: Record<string, any>;
}

export interface CatalogProvider {
  readonly code: string;
  readonly name: string;
  readonly baseUrl: string;

  discoverCategories(): Promise<CategoryDiscovery[]>;
  discoverProducts(options?: {
    categoryUrl?: string;
    limit?: number;
    maxPages?: number;
  }): Promise<ProductDiscovery[]>;
  scrapeProduct(url: string): Promise<ScrapedProductDetails>;
}
