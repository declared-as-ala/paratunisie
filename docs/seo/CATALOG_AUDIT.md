# Catalogue Audit (read-only, 2026-11-14)

All numbers from production PostgreSQL (`Product`, `Category`, `Brand`, `Review`).

## State
- Products: 11,895 (11,888 PUBLISHED, 7 DRAFT = ParaTunisie-only items hidden by the Sobitas sync).
- Indexable: 100 of 11,888 published. `seoIsCustom`: 7.
- Descriptions: 3 under 120 chars, 85 between 120–400, 11,800 over 400 (imported Sobitas copy, rebranded).
- Images: 0 placeholders, 0 empty; 11,888 on MinIO.
- Prices: 0 zero-price variants. Stock: 164 in stock, 11,724 not.
- Brands: 613 (406 non-indexable); 8 products under "Autres marques".
- Duplicate lower-cased names: 75 groups (largest: 5 variants of one Nutricost gummy).
- Suspicious units: 6 names with a 4-digit "kg" value (e.g. "2268 kg").
- Reviews: 2,500 on 50 products, all REJECTED.

## Categories (published products, indexable?)
vitamines 1,933 (yes), plantes-et-herbes 1,519 (no), immunite 840 (no), sommeil-stress 771 (no), mineraux 663 (no), antioxydants 639 (no), articulations 592 (no), digestion 477 (no), magnesium 458 (yes), probiotiques 433 (no), omega-3 336 (yes), collagene 274 (no), creatine 257 (yes), acides-amines 251 (no), boosters-hormonaux 230 (no), pre-workout 228 (yes), zinc 225 (yes), whey-proteine 168 (yes).

## Indexation dry-run (no change applied)
| Rule | Products |
|---|---|
| Currently noindex | 11,788 |
| A: noindex and in stock | 95 |
| C: in stock, description ≥ 400 chars, real brand | 86 |
| D: noindex but in an already-indexable category | 3,825 |
| Description ≥ 800 chars | 5,154 |
| noindex with FAQ present | 373 |

**Recommendation (needs approval, Category C):** stage it. Wave 1: rule A (95 in-stock products). Wave 2: products in indexable categories with description ≥ 800 chars and a FAQ or real brand, in batches of ~500, watching Search Console "Crawled – not indexed" before continuing. Do not index all 11.8k at once: descriptions are imported and many near-duplicate variants exist.

## Queries
```sql
select "publishState", indexable, count(*) from "Product" group by 1,2;
select count(*) from "Product" where "publishState"='PUBLISHED' and name ~* '\m\d{4,}\s?kg\M';
select status, count(*) from "Review" group by 1;
```
