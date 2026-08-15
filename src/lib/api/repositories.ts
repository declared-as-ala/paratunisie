/**
 * API-backed repository implementations.
 * These implement the same interfaces as the mock repositories,
 * but fetch from the real NestJS backend.
 *
 * Swap from mock to API at the provider level (see index.ts).
 */

import type { ProductSummary } from "@/lib/data/products";
import {
  fetchProducts,
  fetchProductBySlug,
  fetchBrands,
  fetchCategories,
} from "./client";

export interface ProductRepository {
  findAll(params?: { brand?: string; category?: string; concern?: string }): Promise<ProductSummary[]>;
  findBySlug(slug: string): Promise<ProductSummary | null>;
  getBrands(): Promise<{ name: string; slug: string }[]>;
  getCategories(): Promise<{ name: string; slug: string }[]>;
}

export const apiProductRepository: ProductRepository = {
  async findAll(params) {
    return fetchProducts(params);
  },

  async findBySlug(slug) {
    return fetchProductBySlug(slug);
  },

  async getBrands() {
    return fetchBrands();
  },

  async getCategories() {
    return fetchCategories();
  },
};
