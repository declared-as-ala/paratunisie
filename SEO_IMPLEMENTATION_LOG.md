# SEO_IMPLEMENTATION_LOG.md

## 2026-10-14 — Full evidence-based SEO audit + safe code fixes

### Method
Connected Google Search Console via the `gsc` MCP server (new this session — see `apps/api/.env`/`.mcp.json` setup earlier in conversation history). Ran 4 parallel specialist audits (technical, schema, sitemap, content) against live production `https://paratunisie.com` and the local codebase, cross-referenced against real GSC query/page/index data. No paid third-party SEO API was used (DataForSEO explicitly declined by user). Full findings in `SEO_AUDIT.md`.

### Code changes made this session

1. **`src/lib/config/company.ts`** — added `alternateNames: ["Para Tunisie", "ParaTunisie.com", "ParaTunisie en Ligne"]` to the single source-of-truth company config (previously this list only existed hardcoded inside `layout.tsx`'s hand-written schema).

2. **`src/lib/seo/schema.ts`**:
   - `buildOrganizationSchema()` now includes `alternateName` sourced from `COMPANY_CONFIG.alternateNames`.
   - Added `buildOnlineStoreSchema()` (new) — the `OnlineStore` node previously only existed hand-written in `layout.tsx`.
   - Added `buildBrandSchema(brand)` (new) — previously the `Brand` JSON-LD on `/marques/[slug]` was hand-constructed inline in that page, a second schema source outside the "centralized" file.

3. **`src/app/layout.tsx`** — replaced the hand-written `storeJsonLd` object (Organization + OnlineStore + WebSite, duplicating `schema.ts`'s unused builders) with calls to `buildOrganizationSchema()`/`buildOnlineStoreSchema()`/`buildWebSiteSchema()`, combined via a small `storeGraphNode()` helper that strips the per-node `@context` for the shared `@graph`. **Why:** CLAUDE.md §6 requires JSON-LD be generated from the same data source that renders the page, never hand-duplicated — the old code had `schema.ts`'s Organization/WebSite builders sitting completely unused (confirmed via repo-wide grep) while `layout.tsx` maintained its own copy that could silently drift.

4. **`src/app/marques/[slug]/page.tsx`** — replaced the inline hand-written `Brand` JSON-LD construction with a call to the new `buildBrandSchema()`. Removed the now-unused `COMPANY_CONFIG` and `buildCanonicalUrl` imports (no longer needed directly in this file).

5. **`ops/ovh/nginx.conf`** — added a dedicated `www.paratunisie.com` HTTPS server block that 301-redirects to the apex. **Correction (later in this session, after SSH verification):** this file is NOT in the live request path. The actual production reverse proxy is a shared Nginx Proxy Manager instance (`sobitas-npm`, serving multiple unrelated client sites on the same VPS), confirmed via `docker exec sobitas-npm cat /data/nginx/proxy_host/12.conf` — it proxies `paratunisie.com`/`www.paratunisie.com` directly to `paratunisie-web:3000`, bypassing `paratunisie-gateway` and both `ops/ovh/*.conf` files entirely. This edit is harmless but does not fix the live issue. The real fix (an NPM "Redirection Host" entry) touches shared infrastructure serving other businesses — not applied without explicit approval. SSH access to the VPS was re-established this session (password updated) and is ready to use once approved.

6. **`src/components/layout/logo.tsx`** — replaced raw `<img>` with `next/image` (`width={1536} height={1024}`, the real PNG dimensions) so AVIF/WebP optimization applies. CLAUDE.md §18 compliance.

7. **`src/components/product/product-card.tsx`** — favorite button `size-7 sm:size-7.5` → `size-11 sm:size-7.5`; add-to-cart/"Demander" buttons `h-8.5 sm:h-9` → `h-11 sm:h-9`. Brings the mobile/base tap target to the CLAUDE.md §5 44px minimum on every product card sitewide, while leaving the `sm:` (pointer-capable) size unchanged.

8. **`src/app/robots.ts`** — added `Disallow: /*?*sort=`, `/*?*q=`, `/*?*brand=` per `SEO.md`'s faceted-navigation crawl-budget rule. Verified live against local dev server.

9. **`next.config.ts`** — `poweredByHeader: false`; new `headers()` applying `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` to every route. Verified live (`curl -sI http://localhost:3000/`). A full CSP was deliberately deferred — needs GTM/Meta Pixel domain allowlisting first.

### Second pass — cross-checking against 4 parallel specialist audits (technical/schema/sitemap/content), each independently reading the live site and codebase

The GSC-synthesis pass above ran concurrently with 4 separately-scoped audits. Cross-referencing surfaced one correction (the nginx root cause above) and several findings the first pass didn't cover, now fixed:

10. Re-verified `npx tsc --noEmit`, `npm run lint` (0 errors), `npm run build` all clean after items 6-9 above.
11. Started local dev server and curled `robots.txt` and response headers directly to confirm items 8-9 render correctly, not just compile.

### Explicitly NOT done this session (and why)
- **`/l-carnitine` indexable flag** — highest-value single fix (fully-built page for a named target keyword, currently `noindex` + absent from Google's index per live URL Inspection), but it's a direct production database write. Exact fix: flip `Category.indexable` to `true` via the admin SEO checklist UI. Needs go-ahead.
- **The real `www` redirect** — needs an NPM "Redirection Host" entry on shared infrastructure. Needs go-ahead (see item 5's correction above).
- **Committing/deploying the pre-existing Growth Sprint 2 working tree** (96 files, unrelated to this audit, already staged before this session started) — left untouched per instruction to preserve existing in-progress work; flagged in `SEO_ROADMAP.md` as the single biggest lever still sitting idle.
- **Content rewrites** for `/creatine` ("gélules certifiées", "sans aucun trouble digestif") and `/ashwagandha` (cortisol/stress/sleep meta claim) overclaiming, and the thin category pages (magnésium, vitamines, compléments alimentaires) — production DB content needing compliance/product sign-off on replacement wording, not a mechanical fix.
- **TTFB/`force-dynamic` → ISR conversion** — right direction, but picking a safe revalidate window for live stock/price data is a product decision.
- **Brand-sitemap-gap investigation** (4 of ~410 brands), **orphan-page diff**, **IndexNow**, **CSP**, **real Lighthouse/CWV measurement** — flagged, not completed; need more time/tooling than this pass had.
