# ParaTunisie — External Image Audit & Rights Verification

**Date:** September 2026  
**Auditor:** Senior Technical SEO & Data Quality Engineering  
**Scope:** 4,773 Total Catalog Products  

---

## 1. Executive Summary

As part of the SEO Phase 2 Data Quality & Compliance audit, all 4,773 product image assets were inspected across the PostgreSQL database and production storage buckets.

| Image Source / Host | Image Count | % of Catalog | In-Stock Items | Status / SEO Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Local MinIO / Uploads (`/uploads/products/*`)** | **50** | **1.05%** | **50** | ✅ **Verified, Owned, Fast WebP CDN** |
| **Protein.tn CDN (`https://admin.protein.tn/*`)** | **162** | **3.40%** | **41** | ⚠️ **External Partner CDN (Hotlinked)** |
| **iHerb / Cloudinary CDN (`https://s.iherb.cn/*`, `cloudinary`)** | **4,561** | **95.55%** | **15** | ❌ **Third-Party Hotlinked (Copyright Risk)** |
| **Total** | **4,773** | **100.0%** | **106** | — |

---

## 2. Policy & Legal Requirements

### Critical SEO & Legal Protection Rule
> **DO NOT** mass-scrape or bulk-download third-party assets (such as iHerb images) to local storage without explicit written licensing, distributor authorization, or vendor media kits.

1. **Hotlinking Penalty & Latency:**
   - External images introduce DNS lookup waterfalls, third-party rate-limiting, potential broken image 404s, and prevent Next.js image optimization (Next/Image WebP/AVIF generation).
   - In our automated SEO Quality Gate (`apps/api/src/catalogue/product-seo-quality.ts`), any product with an external hotlinked image receives the `EXTERNAL_HOTLINKED_IMAGE` warning flag and is quarantined from Google indexation (`noindex, follow`).

2. **Copyright & Commercial Usage:**
   - ParaTunisie must only host and index images where:
     1. The store photographed the physical inventory directly in Tunisia.
     2. The official brand distributor (e.g., BioTechUSA, Real Pharm, Quamtrax, Eric Favre, OstroVit) provided high-resolution media kits.
     3. ParaTunisie has documented authorization as an official retailer.

---

## 3. Migration Action Plan

```
[Official Brand Media Pack / Local Studio Shoot]
                     ↓
          [Format Validation & Clean Naming]
                     ↓
       [Lossless WebP Compression (800x800)]
                     ↓
        [Upload to MinIO: /uploads/products/]
                     ↓
[Update Database: Product.image = /uploads/products/...]
                     ↓
      [Re-Score in SEO Review Queue -> Tier A]
                     ↓
            [Release to Google Sitemap]
```

---

## 4. Required Action from Store Owner

To unlock indexation for the remaining 4,723 products:
1. Provide official distributor product image folders for prioritized brands (`BioTechUSA`, `Real Pharm`, `Quamtrax`, `Optimum Nutrition`, `OstroVit`, `Scenit Nutrition`).
2. Run direct product studio photography for fast-moving items.
3. Upload approved assets through the Admin Catalog Photo Uploader (`/admin/catalogue`).
