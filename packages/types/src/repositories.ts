/**
 * Repository interfaces — the abstraction layer between frontend and backend.
 * Sprint 1-8: Mock implementations (current).
 * Sprint 9+: Real API-backed implementations.
 *
 * Components should import from these interfaces, not directly from data files.
 * The concrete implementation is swapped at the provider level.
 */

import type { ProductSummary, Order, Address, Review, Routine, LoyaltyAccount, Article } from "@paratunisie/types";

export interface ProductRepository {
  findAll(params?: { brand?: string; category?: string; concern?: string }): Promise<ProductSummary[]>;
  findBySlug(slug: string): Promise<ProductSummary | null>;
  getBrands(): Promise<{ name: string; slug: string }[]>;
  getCategories(): Promise<{ name: string; slug: string }[]>;
}

export interface OrderRepository {
  create(data: { userId: string; gouvernorat: string; fullAddress: string; items: { productVariantId: string; quantity: number; priceMillimes: number }[] }): Promise<Order>;
  findByUser(userId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
}

export interface CustomerRepository {
  create(data: { email: string; name?: string; password: string }): Promise<{ id: string }>;
  getById(id: string): Promise<{ id: string; name?: string; email: string; addresses: Address[] } | null>;
  getAddresses(userId: string): Promise<Address[]>;
  addAddress(userId: string, data: { gouvernorat: string; fullAddress: string; label?: string }): Promise<Address>;
}

export interface WishlistRepository {
  toggle(userId: string, productId: string): Promise<{ wishlisted: boolean }>;
  getByUser(userId: string): Promise<ProductSummary[]>;
}

export interface ReviewRepository {
  getByProduct(productId: string): Promise<Review[]>;
  create(userId: string, productId: string, data: { rating: number; title?: string; body?: string }): Promise<Review>;
  getProductRating(productId: string): Promise<{ average: number; count: number }>;
}

export interface RoutineRepository {
  save(userId: string, data: { tier: string; answers: unknown; items: { productId: string; slot: string; reason?: string }[] }): Promise<Routine>;
  getByUser(userId: string): Promise<Routine[]>;
}

export interface LoyaltyRepository {
  getAccount(userId: string): Promise<LoyaltyAccount | null>;
  addPoints(userId: string, points: number, type: string): Promise<LoyaltyAccount>;
}

export interface ContentRepository {
  getArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
}
