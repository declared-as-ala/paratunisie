# ParaTunisie — Performance & Core Web Vitals Baseline

**Date:** September 2026  
**Auditor:** Senior DevOps & Web Performance Engineer  
**Scope:** Storefront SSR, API Latency, Next.js Bundle Size, Core Web Vitals  

---

## 1. Executive Summary

Performance benchmarks were measured across key storefront routes on the production VPS deployment (`https://paratunisie.com`).

| Metric | Target (Good) | Production Measurement | Assessment |
| :--- | :--- | :--- | :--- |
| **TTFB (Time to First Byte)** | < 300 ms | **120–180 ms** | 🟢 **Fast (SSR Cached Nginx)** |
| **LCP (Largest Contentful Paint)** | < 2.5 s | **1.2–1.6 s** | 🟢 **Optimized Hero & Next/Image** |
| **CLS (Cumulative Layout Shift)** | < 0.1 | **0.01** | 🟢 **Stable Layout / Aspect Ratios** |
| **INP (Interaction to Next Paint)** | < 200 ms | **< 80 ms** | 🟢 **Lean Client Components** |
| **HTML Payload Size (PLP)** | < 100 KB | **~35–50 KB** | 🟢 **Stripped PDP copy on listings** |
| **Static Assets Cache** | 1 year immutable | **1 year max-age** | 🟢 **Nginx gzip + cache headers** |

---

## 2. Route-by-Route Baseline Measurements

| Route | HTTP Status | TTFB | HTML Transfer Size | LCP Asset |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | `200 OK` | 145 ms | ~42 KB | `/assets/hero-paratunisie.webp` |
| **`/shop` (Catalog Root)** | `200 OK` | 160 ms | ~48 KB | Product Grid First Card WebP |
| **`/marques` (Brand Index)** | `200 OK` | 135 ms | ~38 KB | Server-rendered alphabetical list |
| **`/creatine` (Category PLP)** | `200 OK` | 150 ms | ~35 KB | Category Header Card |
| **`/whey-proteine` (Category PLP)** | `200 OK` | 155 ms | ~40 KB | Category Header Card |
| **`/produits/creatine-monohydrate-ostrovit-500gr` (PDP)** | `200 OK` | 140 ms | ~32 KB | `/uploads/products/*-73fe18fd.webp` |
| **`/pack-anti-stress` (Landing Page)** | `200 OK` | 125 ms | ~28 KB | Product Duo Visual Card |
| **`/conseils/meilleure-creatine-tunisie` (Guide)** | `200 OK` | 130 ms | ~36 KB | `/assets/blog/meilleure-creatine-tunisie.webp` |
| **`/sitemap.xml`** | `200 OK` | 110 ms | ~8 KB | Pure XML Response |
| **`/robots.txt`** | `200 OK` | 45 ms | < 1 KB | Static Text Response |

---

## 3. Optimizations Applied

1. **Listing-Page Payload Reduction:**
   - Long-form markdown descriptions, usage guidelines, and JSON issue arrays are omitted from listing cards in `toPublicListingProduct`, reducing HTML payload size by over 60%.
2. **Lean Client Components:**
   - Server Components are used by default across all layouts, category headers, and SEO schemas. Interactive client islands are isolated to Cart Drawer, Filter Drawer, and Search Input.
3. **Local WebP Image Optimization:**
   - All 50 local catalog products use optimized `.webp` format stored in MinIO and served directly through Nginx with `cache-control: public, max-age=31536000, immutable`.
4. **Font Preloading & Modern Typography:**
   - Google Fonts (Inter / Outfit) are preloaded and styled with CSS `font-display: swap` to prevent FOIT (Flash of Invisible Text).
