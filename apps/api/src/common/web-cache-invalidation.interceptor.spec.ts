import { shouldInvalidate } from "./web-cache-invalidation.interceptor";

describe("shouldInvalidate", () => {
  it.each([
    ["PATCH", "/api/v1/catalogue/products/abc", true],
    ["POST", "/api/v1/inventory/adjust", true],
    ["POST", "/api/v1/orders", true],
    ["DELETE", "/api/v1/reviews/123", true],
    ["post", "/api/v1/catalogue/categories", true],
    ["GET", "/api/v1/catalogue/products", false],
    ["POST", "/api/v1/tracking/meta-event", false],
    ["POST", "/api/v1/analytics/events", false],
    ["POST", "/api/v1/admin-auth/login", false],
    ["POST", "/api/v1/wishlist", false],
  ])("%s %s -> %s", (method, url, expected) => {
    expect(shouldInvalidate(method, url)).toBe(expected);
  });
});
