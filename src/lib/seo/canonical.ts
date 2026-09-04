/**
 * Centralized Canonical URL builder for ParaTunisie.
 *
 * Rules:
 * 1. Always uses the canonical apex origin: `https://paratunisie.com`
 * 2. Strips any `www.` or alternative schemes/hosts.
 * 3. Normalizes paths: ensures leading slash, removes trailing slashes (except root `/`), collapses duplicate slashes.
 * 4. Strips tracking parameters (`fbclid`, `gclid`, `utm_*`, `ref`, etc.).
 * 5. Handles pagination and faceted queries deterministically:
 *    - By default, query parameters are stripped so canonical points to clean landing URL.
 *    - If `allowPagination` is enabled and `page > 1`, preserves `?page=N`.
 */

export const CANONICAL_ORIGIN = "https://paratunisie.com";

export interface CanonicalOptions {
  /**
   * Optional page number for paginated routes. If > 1 and allowPagination is true, adds ?page=N.
   */
  page?: number | string | null;
  /**
   * Whether to include page query parameter in the canonical. Default is false (clean root canonical).
   */
  allowPagination?: boolean;
  /**
   * Additional explicit query params to preserve if needed (e.g. for specific unique landing variations).
   */
  allowedParams?: Record<string, string | number | boolean | undefined>;
}

/**
 * Normalizes a path string:
 * - "/produits//test/" -> "/produits/test"
 * - "" or "/" -> "/"
 * - "https://www.paratunisie.com/shop" -> "/shop"
 */
export function normalizeCanonicalPath(rawPath: string): string {
  if (!rawPath) return "/";

  let path = rawPath.trim();

  // If full URL provided, extract pathname
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      path = url.pathname;
    } catch {
      path = path.replace(/^https?:\/\/[^/]+/i, "");
    }
  }

  // Remove query string or hash if embedded in path
  const queryIndex = path.indexOf("?");
  if (queryIndex !== -1) {
    path = path.slice(0, queryIndex);
  }
  const hashIndex = path.indexOf("#");
  if (hashIndex !== -1) {
    path = path.slice(0, hashIndex);
  }

  // Normalize duplicate slashes
  path = path.replace(/\/+/g, "/");

  // Ensure leading slash
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // Remove trailing slash if length > 1 (e.g. "/shop/" -> "/shop", but "/" remains "/")
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * Builds the canonical URL for any route on paratunisie.com.
 *
 * @param path Relative path (e.g. "/produits/creatine-real-pharm") or absolute URL.
 * @param options Optional configuration for pagination or allowed parameters.
 * @returns Fully-qualified canonical URL on `https://paratunisie.com`.
 */
export function buildCanonicalUrl(path: string, options?: CanonicalOptions): string {
  const normalizedPath = normalizeCanonicalPath(path);

  if (normalizedPath === "/" && !options?.page && !options?.allowedParams) {
    return CANONICAL_ORIGIN;
  }

  const url = new URL(normalizedPath, CANONICAL_ORIGIN);

  // Handle pagination if explicitly allowed and > 1
  if (options?.allowPagination && options?.page) {
    const pageNum = typeof options.page === "string" ? parseInt(options.page, 10) : options.page;
    if (Number.isInteger(pageNum) && pageNum > 1) {
      url.searchParams.set("page", pageNum.toString());
    }
  }

  // Handle allowed explicit query params
  if (options?.allowedParams) {
    for (const [key, value] of Object.entries(options.allowedParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // Return full href, ensuring no trailing slash if not root
  const result = url.toString();
  if (result.endsWith("/") && result !== `${CANONICAL_ORIGIN}/` && result !== CANONICAL_ORIGIN) {
    return result.slice(0, -1);
  }
  return result;
}
