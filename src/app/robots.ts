import type { MetadataRoute } from "next";

const SITE_URL = "https://paratunisie.com";

/**
 * Was entirely missing in production — /robots.txt fell through to the
 * catch-all [category] dynamic route and rendered the noindex 404 page
 * instead of real crawl directives. Disallows only genuinely private/
 * non-indexable areas (SEO.md "Indexation Rules") — everything public
 * (shop, categories, brands, products, conseils, besoins) stays crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/panier", "/compte", "/favoris", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
