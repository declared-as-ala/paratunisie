# Technical Audit (2026-11-14)

**Good:** HTTPS with HSTS; single-hop host redirects; canonicals present on home/category/product; one H1 per page; BreadcrumbList on category/product; Product+Offer+shipping+returns JSON-LD from verified data; no AggregateRating without real reviews; faceted params (`sort`, `q`, `brand`) disallowed in robots.txt; server-rendered HTML contains title, H1, price, availability and product links.

**Issues**
- SEO-001/002 mass `noindex` (see CATALOG_AUDIT.md).
- SEO-004 four legacy URLs returned 404 (fixed in code, 308 redirects).
- SEO-005 return-policy schema contradicted /retours (fixed in code).
- SEO-011 no page caching (`no-store`), 400–600 KB HTML on home/category.
- Sitemap has no sitemap index and covers only indexable URLs (correct by design, but tiny).
- Not checked yet (needs tools): Core Web Vitals field data, internal link graph, hreflang (site is French-only), Merchant Center feed.

**Infra:** single VPS, Docker Compose (`paratunisie-web/api/admin/postgres/redis/minio/meilisearch`), shared reverse proxy in front. No staging environment; rollback = previous Docker image tags + dated source backups in `/root/paratunisie-backups`.
