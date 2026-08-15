/**
 * Repository provider — picks the correct data source based on environment.
 *
 * When NEXT_PUBLIC_API_URL is set (or API is running on localhost:3001),
 * the frontend fetches from the real NestJS backend.
 * Otherwise, it falls back to local mock data (Sprint 1-8 behavior).
 *
 * Server Components import from here; Client Components receive data as props.
 */

import type { ProductRepository } from "./repositories";
import { apiProductRepository } from "./repositories";
import { products } from "@/lib/data/products";

/** Fallback: local mock data (Sprint 1-8 behavior) */
const mockProductRepository: ProductRepository = {
  async findAll(params) {
    let result = [...products];
    if (params?.brand) result = result.filter((p) => p.brand === params.brand);
    if (params?.category) result = result.filter((p) => p.category === params.category);
    if (params?.concern) {
      const concern = params.concern;
      result = result.filter((p) => p.concerns.includes(concern));
    }
    return result;
  },
  async findBySlug(slug) {
    return products.find((p) => p.slug === slug) ?? null;
  },
  async getBrands() {
    const brands = [...new Set(products.map((p) => p.brand))].sort();
    return brands.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }));
  },
  async getCategories() {
    const cats = [...new Set(products.map((p) => p.category))].sort();
    return cats.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }));
  },
};

const useApi = !!process.env.NEXT_PUBLIC_API_URL || process.env.NODE_ENV === "development";

export const productRepository: ProductRepository = useApi
  ? apiProductRepository
  : mockProductRepository;
