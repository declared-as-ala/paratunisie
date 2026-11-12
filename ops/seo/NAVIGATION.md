# Navigation and verified SEO checklist

The main navigation exposes Whey and Mass Gainer independently. Desktop links wrap at tablet widths; mobile uses a native keyboard-accessible disclosure grouped by purpose. Both use the same canonical URL definitions in `src/lib/data/storefront-navigation.ts`. No hover-only navigation or synthetic product cards are required.

`prepare-navigation.py` consumes a fresh `scratch/navigation/before.json` catalogue export. It creates a reviewable manifest, changes the existing gainer category to `/mass-gainer`, flattens `/gainers` and `/gainers-proteines` redirects, updates contextual links, and nests isolate/hydrolysed whey under the main whey family. It preserves product IDs, variants, prices and stock. Three missing Real Pharm relationships are resolved from explicit names/headings in the existing records; ambiguous manufacturers remain unresolved. No products are duplicated.

Run the manifest with `apply.cjs` (dry run first, then `--apply`). Existing redirect changes require the previous target to match. A repeated application must make zero changes. Run `setup-checklist.cjs` beside Prisma before deploying the API; it creates only the additive `SeoChecklistAudit` table. Keep a database backup and rollback container tags.

## Research and content

Public Tunisian retailer pages distinguish mass-gainer buying intent, formats and prices from whey. References consulted: [Protein.tn mass gainers](https://protein.tn/mass-gainers), [Vitamin Shop mass gainers](https://www.vitaminshop.tn/product-category/mass-gainer/). No search-volume or ranking-position estimates are claimed. Category text is original and uses the current ParaTunisie catalogue rather than competitor prices or promotional claims.

General wording avoids universal doses and guaranteed outcomes. [Inserm's discussion of protein supplements](https://presse.inserm.fr/canal-detox/consommer-plus-de-proteines-quand-on-pratique-du-sport-a-haut-niveau-vraiment/) and [ANSES's athlete-supplement assessment](https://vigilanses.anses.fr/fr/node/1456) inform that caution; they do not verify the composition of any specific catalogue product. Existing inherited guides still require professional editorial review.

## Scoring contract

Twenty deterministic checks are worth five points each. Title and description checks require useful text, not just nonempty fields. Duplicate content, placeholder images and unknown manufacturers lose points. Public HTML verifies H1, canonical, metadata, indexability, sitemap presence, contextual links, breadcrumb, schema and real price/stock data. Checks without evidence receive zero points.

Evidence is stored with a source fingerprint and expires after 24 hours. Catalogue edits invalidate affected evidence; edits to other records also update uniqueness/product-count checks. The detail dialog shows each deduction and the verification time. A 100 means compliance with this internal checklist at verification time, not a Google ranking guarantee or medical/manufacturer certification.

Admin endpoints require staff authentication:

- `GET /api/v1/catalogue/seo/checklist/product` (or `category`) returns all scores and details.
- `POST /api/v1/catalogue/seo/checklist/product/:id` fills missing fields and verifies the public page.
- `{ "repair": false }` verifies without content edits, including from an open edit drawer.

Bulk optimization processes one record at a time, reports failures and can stop after the current record. It never changes prices, stock, product identity, existing editorial text or indexability to inflate a score. Missing manufacturer facts, real photos and duplicate identity require a human decision. Stored product `seoScore` is updated only from this checklist's result; the form's separate field counter is not labeled an SEO score.

## Validation

Run API builds, admin/storefront TypeScript checks and `seo-checklist.spec.ts`. Verify the live navigation at 390, 768, 1024 and 1440 pixels, native keyboard disclosure and Escape, independent canonical anchors, category HTML and visible FAQ/schema correspondence. Re-run the public crawl and all checklist audits after the migration. Save actual product/category score totals and unresolved items; do not edit the score thresholds after seeing results merely to achieve 100.
