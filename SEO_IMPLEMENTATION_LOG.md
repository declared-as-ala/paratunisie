# SEO_IMPLEMENTATION_LOG.md

## 2026-10-14 (later) — CRITICAL: real production server identified; earlier fixes redone there

### The real server was never 145.223.118.9
Everything earlier in this log (and the earlier-session SMTP fix) targeted `145.223.118.9` (OVH), believed to be production because the user had previously given SSH access to it for an unrelated fix. It is NOT what `paratunisie.com` DNS resolves to. Real production is **`187.53.136.225`** (Hostinger, hostname `srv1764709`), confirmed via `nslookup paratunisie.com`/`www.paratunisie.com`/`admin.paratunisie.com` and direct SSH. The site was migrated there around 2026-10-12 (fresh `paratunisie_pg.sql.gz` DB dump and `meili_data.tar.gz` present in `/root/paratunisie`, file timestamps "Oct 12"). `145.223.118.9` is a stale leftover from before the migration — DO NOT treat it as production going forward. User confirmed DNS is correct as-is; no DNS change needed.

### Redone on the real server (187.53.136.225)
- **SMTP**: `.env` there already has the correct app password (`zpcs tvlh ysck stdm`) — verified `VERIFY_OK` live from inside `paratunisie-api`. No action needed; the earlier OVH fix turned out to be moot for the real site, but the real site was already fine independently.
- **`/l-carnitine` indexable flag**: backed up (`/root/paratunisie/category-backup-20261014-realserver.sql`), flipped `true` in the real production Postgres, `paratunisie-api` restarted. Verified live: API returns `"indexable":true`, page meta is now `<meta name="robots" content="index, follow"/>`, HTTP 200. **This fix is genuinely live now.**
- **`www` redirect root cause (real server)**: a host-level (non-Docker) nginx at `/etc/nginx/sites-available/paratunisie-domains.conf`, Certbot-managed, dedicated solely to paratunisie.com/admin.paratunisie.com (not a shared multi-tenant proxy — safe to edit in isolation). Its single HTTPS server block matches both `paratunisie.com` and `www.paratunisie.com` with no redirect between them. Fix identified (split into two server blocks, www one returning `301` to apex) but **not yet applied** — blocked by the permission system (see below).

### Correction: creatine/ashwagandha overclaiming is already fixed in the database — just not deployed
Checked the real production DB directly: `creatine`'s `seoDescription`/`seoContent` and `ashwagandha`'s already contain safer, more hedged text (the creatine `seoContent` is word-for-word the cautious draft from `ops/seo/category-copy.json` — someone already ran the apply pipeline against the database). But the **live page still serves the old overclaiming text** ("gélules certifiées", "sans aucun trouble digestif") — confirmed via direct curl of the live meta tag. This means `/creatine` and `/ashwagandha` are statically pre-rendered and the build is stale relative to the database; this is a deployment/rebuild problem, not a content-writing problem. No DB content change was made for these two — none was needed. Folded into the same `paratunisie-web` rebuild blocked below.

### Brand sitemap gap — root cause confirmed (continued after user re-approval)
Confirmed via direct query: only 4 of 410 brands are `indexable: true`, and it's a real bug — the top brands by published-product count (Swanson Vitamins 428, NOW Foods 381, Source Naturals 153, down to dozens more) are ALL `indexable: false`, while the 4 currently-true brands have just 1-13 products each. Backed up (`brand-backup-20261014.sql`, 511 lines). Fix drafted (195 brands qualify at the existing 5+ product threshold, additive only, never de-indexes the current 4) — blocked by the same bulk-write permission classifier. Exact SQL in `SEO_ROADMAP.md` item 5.

### First content-plan article drafted
Wrote `ops/seo/drafts/l-carnitine-liquide-vs-gelules.md` as a complete, reviewable draft (not auto-published — publishing requires the CMS/Article data model, and per your own instruction unverified drafts stay drafts). Demonstrates the quality bar for the remaining 49; batch-by-batch drafting continues from here.

### Note on this session's permission boundaries
Every production-write action beyond the single-row `/l-carnitine` flag got hard-blocked regardless of in-chat approval (file deploy via `pscp`, the nginx `www` redirect edit, and this bulk brand-indexable UPDATE) — these need either a Claude Code settings permission rule or you running them directly; "I approve" in chat doesn't satisfy this gate. All exact commands are centralized in `SEO_ROADMAP.md`'s "URGENT" section for when you're back.

### Blocked this session, needs you
- **Deploying the 8 already-committed code fixes** (schema de-dup, tap targets, logo, robots.txt, security headers) to `187.53.136.225` — there's no git repo on that server (manual/rsync-deployed), so this needs a file copy (`pscp`) + container rebuild. The `pscp` command was denied by the permission system ("Production Deploy" classifier) on two attempts.
- **Applying the `www` redirect nginx fix** — a `sed` edit to the isolated, paratunisie-only config file above was denied ("Remote Shell Writes" classifier).
- Config backed up first in both cases before any attempt (`/root/paratunisie-domains.conf.bak-20261014`, category table dump above) — nothing was left half-changed.
- Per your "don't ask, proceed" instruction while you're away: these are hard permission-system blocks, not something I can talk my way past, and there's no one to approve an interactive prompt right now — so I'm not retrying them further unattended. Add a Bash permission rule for `pscp`/remote nginx edits, or do these two steps yourself, when you're back. Exact commands are in `SEO_ROADMAP.md`.


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
