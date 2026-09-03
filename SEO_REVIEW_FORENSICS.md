# ParaTunisie Review Integrity Forensics

Audit date: 2026-09-03
Scope: Production PostgreSQL, review-writing code, seed/deployment scripts, public review API, PDP UI, and Product structured data.

## Executive finding

The production review corpus is synthetic and cannot be represented as genuine customer or verified-purchase feedback.

No review was tied to an order. Nevertheless, every review was approved and marked verified, public PDPs displayed “Achat vérifié,” and the same rows generated Product `AggregateRating` and `Review` JSON-LD.

## Production evidence before remediation

| Check | Result |
| --- | ---: |
| Reviews | 2,500 |
| Approved | 2,500 |
| Stored `verified=true` | 2,500 |
| Reviews with `orderId` | 0 |
| Reviews matching same-order product | 0 |
| Reviews linked to eligible order status | 0 |
| Orders in the database | 7 |
| Products with reviews | 50 |
| Reviews per reviewed product | exactly 50 |
| Average rating on every reviewed product | 4.86 |
| Distinct review users | 50 |
| Reviews per review user | exactly 50 |
| Duplicate body groups | 398 |
| Extra reviews attributable to duplicate bodies | 2,102 |

Every generated timestamp fell at the same hour of day across a synthetic date spread. These distribution fingerprints agree with the generator source.

## Source provenance

`apps/api/prisma/seed-reviews.js` previously:

- declared a pool of invented “authentic Tunisian customer names” and email addresses;
- generated exactly 50 reviews for every selected product;
- reused templated titles/bodies with small suffix variations;
- forced ratings to 4 or 5 stars;
- set `status: APPROVED` and `verified: true` without an order;
- deleted all existing reviews before inserting the generated corpus.

Three tracked deployment/rebuild scripts explicitly executed that generator.

This is direct provenance evidence, not an inference from review similarity alone.

## Classification

| Classification | Count | Public eligibility |
| --- | ---: | --- |
| `VERIFIED_PURCHASE` | 0 | Eligible after moderation |
| `UNVERIFIABLE_NO_ORDER` | 2,500 | Ineligible |
| `ORDER_CUSTOMER_MISMATCH` | 0 | Ineligible |
| `ORDER_PRODUCT_MISMATCH` | 0 | Ineligible |
| `ORDER_STATUS_INELIGIBLE` | 0 | Ineligible |

## Remediation decision

The 2,500 rows will be quarantined, not deleted:

- `status` changes from `APPROVED` to `REJECTED`;
- `verified` changes from `true` to `false`;
- review IDs, text, timestamps, user links, and product links remain intact for audit and rollback;
- synthetic user records are not deleted in this remediation because they may need a separate identity/collision audit;
- the verified-purchase decision is derived at read time from same-user + same-product + eligible-order evidence;
- Product rating/review JSON-LD is emitted only from that eligible public set;
- the generator is disabled and deployment invocations are removed.

## Backup and reversibility

Before remediation, a full production custom-format PostgreSQL dump was created at:

`/opt/paratunisie/backups/seo-remediation-prechange-20260903-224938.dump`

The dump was restored into the isolated temporary database `seo_restore_verify_20260903`. Critical row counts matched production exactly (4,773 products, 27 categories, 410 brands, 2,500 reviews, 7 orders, 117 users, 20 articles), after which the temporary database was removed. A SHA-256 sidecar exists beside the dump.

## Privacy

This report intentionally excludes names, email addresses, review IDs, order IDs, credentials, and all other customer-level data.
