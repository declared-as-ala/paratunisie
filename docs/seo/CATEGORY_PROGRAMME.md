# Category programme — baseline, strategy, changes

Generated 2026-11-16 from Search Console (90 days to 2026-11-13). **No ranking improvement is claimed**: Google has not recrawled yet. Re-measure with `ops/seo/weekly_report.py` 7–14 days after deployment.

## Method (applied to every category)
1. Baseline from Search Console (`CATEGORY_BASELINE.json`): impressions, clicks, CTR, position, top queries.
2. SERP snapshot of the pages that rank (`ops/seo/serp_snapshot.py`, one public GET each): title, headings, words, schema, price range.
3. One primary intent per URL (see `KEYWORD_MAP.md`); informational queries stay on `/conseils/*`.
4. Content built only from catalogue facts + sources verified for health wording; no invented stock, shipping, reviews or certifications.
5. Technical checks with `ops/seo/category-page-check.cjs` (one H1, self canonical, schema, ItemList matches listed products, Googlebot = visitor, table prices = API).

## Priority categories

| Category | Target query | impr 90d | clicks | CTR | avg pos | Issues found | Changes | Index status |
|---|---|---:|---:|---:|---:|---|---|---|
| `/creatine` | créatine tunisie / créatine monohydrate prix tunisie | 99 | 4 | 4.0% | 71.7 | FLAGSHIP. Content 3.6k chars, generic guide block, FAQ duplicated, intro clamped to 2 lines, no price comparison. | Title/H1/meta rewritten; 1,780-word guide (forms actually in catalogue, EFSA/ISSN-grounded wording, dosage per label, precautions, profile picks with real products, FAQ x10); live price-per-100 g table; quick-link chips; intro un-clamped. | indexed (index,follow) |
| `/whey-proteine` | whey tunisie / whey protein tunisie / protéine whey | 405 | 3 | 0.7% | 64.9 | Short legacy copy; generic guide; no comparison. | Title/meta/intro rewritten; ~1,200-word guide (concentrée/isolat/hydrolysée, label reading, price per 100 g and per portion, protein % caveat, real product picks, precautions, FAQ x8); live comparison (packs and hormone-flagged product excluded). | indexed |
| `/whey-isolate` | whey isolate tunisie | 15 | 0 | 0.0% | 54.9 | Batch 5 guide (3 sections). | New layout (guide + separate FAQ); comparison appears automatically. Needs a deeper guide. | indexed |
| `/bcaa` | bcaa tunisie | 0 | 0 | 0.0% | — | Batch 7 guide; only 2 indexable products. | New layout. Distinct intent from /eaa kept. | indexed |
| `/pre-workout` | pre workout tunisie | 30 | 0 | 0.0% | 58.8 | Batch 7 guide. | New layout; stimulant safety note kept. | indexed |
| `/gainers-proteines` | gainer tunisie / mass gainer | 0 | 0 | 0.0% | — | Batch 7 guide. | New layout; comparison for powders. | indexed |
| `/magnesium` | magnésium tunisie | 86 | 0 | 0.0% | 77.6 | Batch 5 guide; SERP dominated by local pharmacy products at ~13–22 DT vs our imported 80–130 DT. | Guide deepened (forms, elemental magnesium on labels, cost per day, 250 mg/day EU upper level, precautions, 3 product tiers, FAQ x6). Angle: specific forms/brands, not the generic price query. | indexed |
| `/vitamines` | vitamines tunisie / multivitamines tunisie | 28 | 0 | 0.0% | 58.1 | Batch 5 guide (3 sections). | New layout only. Needs a deeper guide. | indexed |
| `/omega-3` | oméga 3 tunisie / omega 3 prix | 8 | 0 | 0.0% | 52.4 | Batch 5 guide (3 sections); guide page ranks instead of category for "omega 3". | New layout only. Needs a deeper guide. | indexed |
| `/collagene` | collagène tunisie | 0 | 0 | 0.0% | — | Short guide, noindex. | Claim-free guide (751 words), live comparison for powders, 6 product links; eligibility verified (6 indexable products, 2 in stock, no restricted). | NOW INDEXABLE (was noindex) |

## `/creatine` — what ranks today (2026-11-15, one GET each; rank positions unknown)

| Page | Words | Schema | Notes |
|---|---:|---|---|
| nutribeast.tn/creatine-monohydrate | 3,009 | none | long text, no structured data, 73 prices on page |
| protein.tn/creatine (Sobitas, Sousse) | 2,576 | FAQPage, ItemList, CollectionPage | title "Créatine Tunisie : Monohydrate, Prix & Marques"; separate cost-per-gram blog (2,042 words) |
| sf-nutrition.tn/monohydrate-de-creatine | 380 | CollectionPage | thin page, yet it ranks |
| protein-shop-tunisia.tn / maparatunisie.tn | 770–1,050 | Product | product pages, not categories |
| primini.tn | 574 | Product | price-comparison engine |
| paratunisie.com/creatine (before) | 1,769 | FAQPage, ItemList, CollectionPage | 27 products listed |

**Gap found**: nobody offers a live per-100 g comparison of what is in stock on the category page itself; the strongest competitor invests in cost-per-gram content on a *separate* blog page. That is the differentiator built on `/creatine`.

## What still prevents top positions (honest list)
- **Authority**: we rank 55–95 for head terms with equal technical hygiene; competitors have older domains and links. Content and UX raise the ceiling, they do not replace authority.
- **Recrawl**: Google has not yet seen the new pages; some priority URLs still show a pre-change crawl.
- **Demand is small** (whey 405 impressions in 90 days, creatine 99): expect modest absolute numbers even if positions improve.
- **Price competitiveness** on generic queries (e.g. magnésium: local products at a fraction of our imported prices).
- **A related domain (protein.tn)** occupies the same SERPs with the same templates.
- **No reviews yet** (0 authentic): a missing trust signal that competitors' product pages partly have.
- 3 priority categories still have shallow guides (whey-isolate, vitamines, omega-3).

## Rollback
`update "Category" set "seoTitle"=b."seoTitle", ... from _wave_backup_cat_flagship b where slug='creatine'` (same for `_wave_backup_cat_whey`, `_wave_backup_cat_collagene`, `_wave_backup_cat_magnesium`). UI: image `paratunisie-prod-paratunisie-web:pre-batch10`.
