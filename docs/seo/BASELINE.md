# SEO Baseline (2026-11-14)

Source: live requests to https://paratunisie.com and read-only SQL. No Google data available (see TASKS.md SEO-003).

| Item | Value |
|---|---|
| robots.txt | Allow all; disallows /admin, /checkout, /panier, /compte, /favoris, /api/, `?sort=`, `?q=`, `?brand=`; sitemap declared |
| Sitemap | 1 file, 174 URLs: 100 products, 40 articles, 4 brands, ~30 static + category pages. No sitemap index |
| Host/protocol | http, www → 301 → https://paratunisie.com (single hop) |
| Home | 200, 1 H1, canonical set, JSON-LD: Organization, OnlineStore, WebSite+SearchAction; HTML 598 KB |
| Category (/creatine) | 200, `index, follow`, canonical, BreadcrumbList + CollectionPage/ItemList; 412 KB |
| Indexable product | `/produits/anabolic-whey-80-2-25kg-proactive`: `index, follow`, Product+Offer+shipping+returns+BreadcrumbList, no AggregateRating |
| Non-indexable product | e.g. `/produits/mt-capra-clean-casein-protein-cinnamon-roll-480-g`: `noindex, follow, nocache` |
| Caching | `Cache-Control: private, no-cache, no-store` on pages (dynamic) |
| Published products | 11,888 (100 indexable / 11,788 not) |
| In stock | 164 |
| Reviews | 2,500, all REJECTED; none shown publicly |
| Legacy URLs | /blog, /brands, /qui-sommes-nous, /proteine-sousse: 404 before Batch 1 |
| Search Console / CWV / Merchant Center | NOT AVAILABLE — repeat this baseline when access exists |

Repeat with: `curl -s https://paratunisie.com/robots.txt`, `curl -s https://paratunisie.com/sitemap.xml`, and the SQL in `docs/seo/CATALOG_AUDIT.md`.
