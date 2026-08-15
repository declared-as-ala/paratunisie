/**
 * Mock product repository — implements ProductRepository using local data.
 * This is the Sprint 1-8 implementation. Swap to ApiProductRepository
 * when the backend is connected (Sprint 9+).
 */

import { products, productBrands, productCategories } from "@/lib/data/products";
import type { ProductSummary } from "@/lib/data/products";

export interface ProductRepository {
  findAll(params?: { brand?: string; category?: string; concern?: string }): Promise<ProductSummary[]>;
  findBySlug(slug: string): Promise<ProductSummary | null>;
  getBrands(): Promise<{ name: string; slug: string }[]>;
  getCategories(): Promise<{ name: string; slug: string }[]>;
}

export const mockProductRepository: ProductRepository = {
  async findAll(params) {
    let result = [...products];
    if (params?.brand) result = result.filter((p) => p.brand === params.brand);
    if (params?.category) result = result.filter((p) => p.category === params.category);
    if (params?.concern) result = result.filter((p) => p.concerns.includes(params.concern));
    return result;
  },

  async findBySlug(slug) {
    return products.find((p) => p.slug === slug) ?? null;
  },

  async getBrands() {
    return productBrands.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }));
  },

  async getCategories() {
    return productCategories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }));
  },
};
