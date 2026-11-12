# PARATUNISIE_AUDIT.md — Phase 1 Architecture & Catalog Audit

**Status: Phase 1 (audit) only.** This document covers real, verified findings from both live systems. It does not cover design, implementation, SEO content, or testing — those are later phases of the master engagement and have not been started yet. See "Honest scope note" at the end.

**Date:** 2026-11-12. Verified live against production (`187.53.136.225`), not from memory or assumption.

---

## 1. ParaTunisie — confirmed architecture

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind. Repo root `C:\Users\Ala\Desktop\parapharmacie`, deployed as `paratunisie-web`.
- **Admin:** separate Next.js app, `apps/admin`, deployed as `paratunisie-admin`.
- **Backend:** NestJS, `apps/api`, deployed as `paratunisie-api`.
- **Database:** PostgreSQL via Prisma, container `paratunisie-postgres`.
- **Search:** Meilisearch (`paratunisie-meilisearch`).
- **Object storage:** MinIO (`paratunisie-minio`).
- **Cache/queue:** Redis (`paratunisie-redis`).
- **Reverse proxy:** host-level nginx (not containerized), Certbot-managed TLS.
- Design tokens, component library, and most of the storefront (header, homepage sections, PLP, PDP, checkout, pagination) were already substantially built and iterated on across prior sessions this year — this is not a greenfield project.

**Current catalog size (verified via direct query, 2026-11-12):**
| | Count |
|---|---|
| Products | 4,773 |
| Brands | 410 |
| Categories | 27 |

**Known gap relevant to §8 (data integration):** the `Product` model has **no GTIN/EAN/SKU/barcode field at all**. Matching products between the two systems by barcode (the master prompt's preferred method) isn't possible today without first adding that column — this needs a small additive migration before any real catalog-matching work can start.

## 2. Protein.tn / Sobitas — confirmed architecture (new discovery this session)

- **Backend:** Laravel (PHP), container `sobitas-backend-v2`, plus `sobitas-backend-v2-queue` and `sobitas-backend-v2-scheduler` for background jobs.
- **Frontend:** separate app, `sobitas-frontend`.
- **Database:** MySQL 8.0, container `sobitas-mysql`, database `protein_db`.
- **Proxy:** `sobitas-laravel-nginx-v2`.
- **Cache:** `sobitas-redis`.
- This is a much larger, more mature application than it first appears: 129 tables, including its own loyalty program, affiliate/referral system, POS (`cash_sessions`, `cash_movements`), a "fitness" module (workout programs, body-progress tracking, AI supplement recommendations), marketing/newsletter tooling, and an **`audit_logs` table** (something ParaTunisie's schema doesn't have at all — worth copying the pattern, independent of the catalog work).

**Current catalog size (verified via direct Laravel/Tinker query, 2026-11-12):**
| | Count |
|---|---|
| Products (`products` table) | 11,890 (11,888 published) |
| Brands | 604 |
| Top-level categories | 8 |
| Subcategories (`sous_categories`) | 50 |

**Product data quality signal (verified counts, not estimated):**
- `seo_title` populated on 11,598 / 11,890 products (**97.5%**) — genuinely high existing SEO coverage, a real enrichment asset.
- `gtin` populated on 5,059 / 11,890 products (**42.5%**) — a real but partial matching key; the other ~57% will need brand+name+format matching instead, with ambiguous matches flagged for manual review per your own instruction, not auto-merged.
- `sku` populated on **0** products — the column exists but is unused; not a usable matching key despite being in the schema.
- There's an existing AI content-draft pipeline (`ai_description_draft`, `ai_faq_draft`, `ai_review_status`, `ai_model` columns) — but **`ai_review_status = 'approved'` on 0 rows**. This means any AI-drafted description/FAQ content sitting in that table has **not been human-reviewed by anyone yet**. I will not treat those drafts as validated source data during enrichment — they're exactly the kind of unverified content your own brief (and this project's CLAUDE.md) says not to blindly publish.

## 3. What this means for §8 (catalog integration), concretely

- A real one-to-one GTIN match is possible for ~42% of protein.tn's catalog against a ParaTunisie product, **once a `gtin` column is added to ParaTunisie's schema** (doesn't exist yet).
- The remaining ~58% needs brand + normalized name + format matching, which is inherently fuzzy — per your own instruction, these get flagged for review, not auto-merged.
- protein.tn's `seo_title`/`seo_description`/`og_*` fields are a legitimately strong, high-coverage enrichment source for ParaTunisie's SEO fields — but **must be rewritten to be ParaTunisie-specific**, not copied verbatim (your own instruction, and avoids duplicate-content risk across your two live domains).
- The `ai_description_draft`/`ai_faq_draft` columns should be treated as **unreviewed raw material at best**, not a source of truth — using them would mean importing content nobody at either company has verified.
- Images: protein.tn's `cover`, `gallery`, `images` (json) fields need their actual storage location confirmed next (local disk vs. S3-compatible vs. a CDN) before any copy pipeline can be built — not yet checked.

## 4. Honest scope note

The request this audit responds to ("MASTER PROMPT — PARATUNISIE 2026") is an 18-section, agency-scale engagement: full redesign, a new design system, a homepage/category/PDP rebuild, a cross-database catalog-enrichment pipeline, a full SEO strategy, Core Web Vitals work, a merchandising admin extension, full test coverage, and a production deployment — with 9 separate deliverable documents.

This document is **Phase 1 only**: a real, verified architecture and catalog audit, done directly against both live systems (not assumed from the prompt's own description of them). It deliberately does not claim progress on the design system, homepage redesign, data-import tooling, SEO strategy, performance work, or testing — those haven't been started, and claiming otherwise would violate the engagement's own stated rule ("Do not claim a deployment is successful until verified" / "Do not claim tests passed without running them").

**Recommended next concrete step**: pick one of §4 (design system direction) or §8 Step A (the full `PRODUCT_DATA_MAPPING.md` field-by-field table) to do next as its own real, complete piece of work, rather than attempting all remaining phases at once. Both are substantial on their own.
