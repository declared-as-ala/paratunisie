/**
 * Sprint 10 — Real Commerce Module Stubs
 *
 * These are placeholder implementations that will be replaced with real
 * service integrations once the backend is running.
 *
 * Search: Meilisearch integration
 * Payments: Cash on Delivery only (D-0014)
 * Reviews: Real review system
 * Loyalty: Real loyalty ledger
 * Admin: Admin panel foundation
 */

export interface SearchService {
  indexProducts(products: unknown[]): Promise<void>;
  search(query: string, filters?: Record<string, string[]>): Promise<{ hits: unknown[]; count: number }>;
  deleteIndex(indexName: string): Promise<void>;
}

export interface PaymentService {
  createCodPayment(orderId: string, amount: number): Promise<{ status: string; reference: string }>;
  confirmPayment(orderId: string): Promise<{ status: string }>;
}

export interface MeilisearchConfig {
  host: string;
  apiKey: string;
  indexName: string;
}

/**
 * Placeholder Meilisearch search service.
 * Replace with real Meilisearch client when backend is connected.
 */
export const createMeilisearchService = (config: MeilisearchConfig): SearchService => ({
  async indexProducts(products) {
    console.log(`[Search] Indexing ${products.length} products to ${config.indexName}`);
  },
  async search(query, filters) {
    console.log(`[Search] Searching "${query}" with filters:`, filters);
    return { hits: [], count: 0 };
  },
  async deleteIndex(indexName) {
    console.log(`[Search] Deleting index ${indexName}`);
  },
});

/**
 * Placeholder COD payment service.
 * Real implementation will interact with Aramex COD workflow.
 */
export const createCodPaymentService = (): PaymentService => ({
  async createCodPayment(orderId, amount) {
    console.log(`[Payment] COD payment created for order ${orderId}: ${amount} millimes`);
    return { status: "pending", reference: `COD-${orderId}` };
  },
  async confirmPayment(orderId) {
    console.log(`[Payment] COD payment confirmed for order ${orderId}`);
    return { status: "confirmed" };
  },
});
