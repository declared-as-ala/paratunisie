# SEO_AUDIT.md — ParaTunisie Evidence-Based SEO Audit

**Date:** 2026-10-14
**Method:** Live Google Search Console data (via the `gsc` MCP server, newly connected this session) + direct verification against production (`https://paratunisie.com`) and the local codebase. No paid third-party SEO API (DataForSEO/Semrush/OpenSEO) was used or required.
**Scope:** Full-site technical/schema/sitemap/content audit, correlated with real ranking/click data, focused on the commercial keyword clusters: créatine, whey protein, mass gainer, ashwagandha, L-carnitine, magnésium, vitamines, nutrition sportive, compléments alimentaires, pre-workout.

This supersedes stale figures in `SEO_REMEDIATION_TODO.md`/`SEO_REMEDIATION_REPORT.md` where they conflict with what's verified live below — those documents describe a September 2026 state; this audit reflects October 14, 2026 production reality.

---

## 0. Headline finding: the target keyword clusters are not yet competitive in Google

This is the single most important fact from this audit. Real GSC data (2026-09-15 to 2026-10-10, 28 days) shows:

| Query (head term) | Position | Impressions | Clicks |
|---|---|---|---|
| `creatine` | 99.2 | 6 | 0 |
| `creatine tunisie` | 93.0 | 2 | 0 |
| `creatine monohydrate tunisie` | 89.4 | 5 | 0 |
| `whey tunisie` | 73.0 | 21 | 0 |
| `whey protein tunisie` | 54.9 | 8 | 0 |
| `nutrition sportive tunisie` | 66.9 | 17 | 0 |
| `ashwagandha tunisie` | 91.5 | 4 | 0 |
| `magnesium tunisie` | 74.3 | 3 | 0 |
| `omega 3 tunisie` | 97.0 | 1 | 0 |
| `pre workout tunisie` | 26.5 | 2 | 0 |
| `parapharmacie tunisie` | 97.1 | 11 | 0 |

**Every single head term for the named clusters sits at position 25-100+ and has zero clicks in the last 28 days.** This is a large regression from `SEO_KEYWORD_MAP.md`'s September baseline, which already showed weak positions (`#55` for whey, `#93` for pre-workout) but not this deep.

What *is* generating real traffic (55 total clicks site-wide over 28 days, 3,560 impressions):
- **The brand name itself**: `paratunisie` (29 clicks, 1,927 impressions, position 3.3) — **53% of all organic clicks are navigational searches for the brand, not product/category discovery.**
- A long tail of unrelated OTC/parapharmacy product names (`pierre cardin cc cream`, `citrolax`, `mk-677`, `enemacol`, `dip belt`) — real products, real impressions, but nothing to do with the sports-nutrition clusters being targeted.

**Conclusion:** the site's prior SEO remediation (documented as "complete" in `SEO_REMEDIATION_TODO.md`) fixed real technical debt, but it has not yet produced ranking visibility for the commercial keywords that matter for revenue. This is consistent with a young domain with limited authority (see `AUTHORITY_ROADMAP.md`) — on-page fixes alone will not move position 70→10; that needs sustained authority-building, which is already scoped but not yet executed.

---

## 1. Critical findings

### 1.1 — `www.paratunisie.com` serves live content directly instead of redirecting (duplicate host)
- **Evidence:** `curl -I https://www.paratunisie.com/` → `200 OK`, byte-identical to the apex. `http://www.paratunisie.com` redirects to `https://www.paratunisie.com` (not to the apex).
- **Real root cause (corrected after direct VPS verification — this superseded an earlier, wrong hypothesis):** Neither `ops/ovh/nginx.conf` nor `ops/ovh/domain-proxy.conf` control live traffic at all. SSH'd into the VPS and confirmed the actual internet-facing reverse proxy is a **shared Nginx Proxy Manager instance (`sobitas-npm`)** that also serves several unrelated client sites on the same box (sobitas, clickmenu, ioma, lexai, matable, qualiflow). Its generated config (`docker exec sobitas-npm cat /data/nginx/proxy_host/12.conf`) has a single block: `server_name paratunisie.com www.paratunisie.com;` proxying both directly to `paratunisie-web:3000`, bypassing the `paratunisie-gateway` container (and both `ops/ovh/*.conf` files) entirely. An earlier pass in this session added a `www` redirect block to `ops/ovh/nginx.conf` believing that file was deployed — **it is not in the live request path and that edit has zero effect in production.** It's harmless and was left in place for config-file consistency, but should not be relied on as a fix.
- **Impact:** `SEO_REMEDIATION_TODO.md` P0-5 claims "Enforce one canonical host with a single permanent redirect — Completed and verified in production." This is false today. Mitigated somewhat by correct in-page `rel="canonical"` tags pointing to the apex, but two fully crawlable hosts exist.
- **Status: NOT FIXED — requires a change to shared infrastructure.** The real fix is adding a "Redirection Host" entry for `www.paratunisie.com → https://paratunisie.com` in the NPM admin UI (or splitting proxy host 12 into two entries). This is a shared proxy serving other businesses' sites too, so it was not touched without explicit approval. VPS SSH access was re-established this session (password rotated mid-session, updated) — ready to apply the moment you approve.

### 1.2 — Homepage Organization/WebSite JSON-LD was hand-duplicated, bypassing the "centralized" schema builder
- **Evidence:** `src/lib/seo/schema.ts` defines `buildOrganizationSchema()`/`buildWebSiteSchema()`, but `grep -rln "buildOrganizationSchema|buildWebSiteSchema" src/` returned only `schema.ts` itself — dead code. `src/app/layout.tsx` instead hand-wrote an equivalent `storeJsonLd` object.
- **Impact:** violates CLAUDE.md §6 ("JSON-LD generated from the same data source... never hand-duplicated content that can drift out of sync") and falsifies `SEO_REMEDIATION_REPORT.md`'s claim that this is centralized.
- **Status: FIXED IN CODE** — `layout.tsx` now calls `buildOrganizationSchema()` + `buildOnlineStoreSchema()` (new) + `buildWebSiteSchema()` from `schema.ts`. Added the missing `alternateName` field to `COMPANY_CONFIG`/`buildOrganizationSchema()` so no real signal was lost in the consolidation. Typecheck passes.

### 1.3 — `/marques/[slug]` had its own second hand-written `Brand` schema source
- **Evidence:** no `buildBrandSchema` existed in `schema.ts`; the Brand JSON-LD was constructed inline in `src/app/marques/[slug]/page.tsx`.
- **Status: FIXED IN CODE** — added `buildBrandSchema()` to `schema.ts`, wired `marques/[slug]/page.tsx` to use it, removed the now-redundant inline `COMPANY_CONFIG` import from that file.

---

## 2. High-priority findings

### 2.1 — `/l-carnitine` (one of the named target keywords) is `noindex` and absent from the sitemap, despite being fully built
- **Evidence:** live page returns HTTP 200 with complete title/meta/H1/canonical/24 real product links, but `<meta name="robots" content="noindex, follow, nocache"/>`. The category API record has `indexable: false` explicitly set while every SEO field (`seoTitle`, `seoDescription`, `seoH1`, `seoIntro`, `seoContent`, OG fields, canonical) is fully populated — a mismatch pattern consistent with a forgotten/stray flag, not deliberate policy. **Confirmed independently via live GSC URL Inspection: `coverageState: "URL is unknown to Google"`** — Google has never even crawled it, because it's both noindexed and missing from the sitemap (no discovery path at all).
- **Status: NOT YET FIXED** — this is a production database flag (`Category.indexable`), not a code change. Flipping it is low-risk and high-value (fully-written page for a named target keyword, currently invisible to Google), but it's a direct production data write, which per your instructions needs a quick go-ahead rather than being bundled into "safe code changes." Recommended action: flip `indexable: true` on this category via the admin SEO checklist UI (`apps/admin/src/components/seo-checklist.tsx` / the category drawer), then it will pick up in the next sitemap generation automatically.

### 2.2 — `SEO_REMEDIATION_TODO.md`'s production figures are stale
- **Evidence:** doc claims "87 qualified URLs," "50 eligible products." Live sitemap has **186 URLs**, including **103 product pages** — more than double. Doc's "Updated: 2026-09-04" timestamp predates the `96173cb` Growth Sprint 2 commit.
- **Status:** documentation correction only — see `SEO_IMPLEMENTATION_LOG.md`.

### 2.3 — Only 4 of ~410 active brands appear in the sitemap
- **Evidence:** sitemap breakdown: 17 static, 13 categories, 103 products, **4 brands**, 40 articles, 8 concerns = 186. `P0-6` claims "~410 brand links" are server-rendered on `/marques` (true — verified separately), but the sitemap's brand eligibility join (`catalogue.service.ts` `getSitemapData`) requires ≥1 indexable product, and only 4 brands currently pass that join.
- **Status: NOT YET FIXED** — needs investigation into whether this is a genuine data gap (most brands genuinely have 0 currently-indexable products) or a join bug. Flagged for follow-up, not fixed blind.

### 2.4 — Discontinued/out-of-stock products hard-404 instead of soft-redirecting
- **Evidence:** cross-referencing GSC's biggest page-level traffic *losses* (e.g. `/produits/alopexy-5`: 137→0 impressions, 15→0 clicks; `/produits/minoxidil-5`: -7 clicks; `/produits/capixy-intense-tonic-spray-125ml`: -8 clicks) against live status: all now return genuine `404` (or `200` + `noindex`). This is the stock-eligibility gate working as designed (CLAUDE.md §20 — don't index what isn't real/available), not a bug. But the pages 404 rather than redirecting to the parent category, losing link equity that a 301 could preserve.
- **Status:** roadmap item, not fixed this pass (requires deciding a redirect-to-category policy, a larger architectural change — the new `public/assets/product-unavailable.svg` asset already staged suggests this is already being worked on).

### 2.5 — Security response headers were entirely absent
- **Evidence:** `curl -sI` on `/` and `/creatine` showed no `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`. `X-Powered-By: Next.js` was exposed (minor fingerprinting leak).
- **Status: FIXED IN CODE** — `next.config.ts` now sets `poweredByHeader: false` and a `headers()` function adding HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` on every route. Verified live against the local dev server (`curl -sI http://localhost:3000/` shows all four). A full `Content-Security-Policy` was deliberately **not** added — it needs careful allowlisting of GTM/Meta Pixel/other third-party scripts first (confirmed present in page source) and risks breaking them if rushed; left as a P2 roadmap item with a report-only rollout recommended.

### 2.5b — Tap targets below 44px and raw `<img>` logo (fixed in code this pass)
- **Evidence:** `src/components/product/product-card.tsx` — favorite button was `size-7`/`size-7.5` (28-30px), add-to-cart/"Demander" buttons were `h-8.5`/`h-9` (34-36px), both below CLAUDE.md §5's 44px mobile minimum, on every product card sitewide. `src/components/layout/logo.tsx` used a raw `<img>` tag (no `next/image`, no AVIF/WebP, violates CLAUDE.md §18).
- **Status: FIXED IN CODE** — favorite button is now `size-11` (44px) at the mobile/base breakpoint (kept smaller at `sm:` for pointer-capable viewports, per the technical audit's own reasoning); both action buttons are now `h-11` (44px) at base. Logo now renders via `next/image` with explicit `width={1536} height={1024}` (the real asset dimensions) so AVIF/WebP optimization applies. `tsc`/`lint`/`build` all clean after the change.

### 2.5c — robots.txt was missing `Disallow` rules for low-value facet parameters
- **Evidence:** `SEO.md`'s faceted-navigation rule requires disallowing crawl of `?sort=`/`?q=`/`?brand=` permutations to protect crawl budget; `src/app/robots.ts` had no such rules, and the on-page filter `<form>` on every category page is a real crawlable GET form generating those permutations.
- **Status: FIXED IN CODE** — added `Disallow: /*?*sort=`, `/*?*q=`, `/*?*brand=` to `src/app/robots.ts`. Verified live against local dev server.

### 2.5d — TTFB (~800ms) is roughly 5-6x the documented 120-180ms baseline
- **Evidence:** `src/app/[category]/page.tsx:10` sets `export const dynamic = "force-dynamic"`, so every request re-fetches from the live API with `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` — confirmed via repeated `curl -w` timing showing ~780-870ms TTFB on homepage and category pages. At current traffic levels this isn't melting the server, but it eats roughly a third of the entire 2.5s LCP budget before paint even starts, which matters on the mid-range mobile/3G hardware `PERFORMANCE.md` targets.
- **Status: NOT FIXED this pass** — moving these routes to ISR (`revalidate: N`) is the right direction, but picking a safe revalidate window for an e-commerce site with live stock/price data is a product decision, not a mechanical code change; left as a P1 roadmap item rather than guessed at.

### 2.5e — `FAQPage` JSON-LD on commercial hub pages won't earn Google rich results (documentation correction, not a code defect)
- **Evidence:** `src/app/[category]/page.tsx` correctly emits `FAQPage` schema (via `buildFaqSchema()`) on all 13 commercial hub pages, generated from the same on-page FAQ content (no drift, CLAUDE.md §6 compliant). However, Google restricted `FAQPage` rich results to government/healthcare sites in August 2023 — a commercial parapharmacy site will not get SERP FAQ snippets from this markup.
- **Status:** no code change needed or recommended — the markup is valid and may still help AI/LLM citation (GEO), just not Google rich results. `SEO.md`/`SEO_REMEDIATION_TODO.md` should not claim FAQ rich-result value for these pages if they currently do.

### 2.6 — IndexNow protocol not implemented
- **Evidence:** zero matches for "indexnow" anywhere in the repo.
- **Status:** roadmap item.

### 2.7 — Live overclaiming on `/creatine` and `/ashwagandha` (CLAUDE.md §21 compliance issue)
- **Evidence:** see §3 below for the exact quoted text. Both instances are in production-database `seoDescription`/`seoContent` fields (the category-copy admin content), not static code — `ops/seo/category-copy.json` exists in the repo with properly hedged draft language for these exact categories but does not match what's live, meaning the DB content was edited independently of that file at some point.
- **Status: NOT FIXED this pass** — this is a direct production content edit requiring product/compliance judgment on the replacement wording (not a mechanical fix), and per your "no production changes without approval" instruction. Recommended fix text in `SEO_ROADMAP.md`.

---

## 3. Content quality findings (by category page)

All 10 target category pages are **genuinely server-rendered, substantive, real copy** — not the templated boilerplate living in `apps/api/src/catalogue/catalogue-seo.service.ts` or `ops/seo/category-copy.json` (both confirmed unused/dead for this purpose; a third, better dataset is what's actually live). No fabricated data, no fake reviews, no fake urgency found anywhere (CLAUDE.md §20 clean).

Ranked most → least substantive:

1. **Créatine** — Substantive (4 FAQs, real dosing specificity), but carries two real overclaiming instances worth fixing alongside the ashwagandha one: the live `<meta name="description">` says *"gélules certifiées"* — certified by whom, to what standard? No certifying body named anywhere on the page, and `ops/seo/category-copy.json`'s own draft for this category explicitly instructs *"N'attribuez pas une certification à un produit si elle n'est pas explicitement documentée"* — the live copy violates the project's own written rule. The on-page FAQ also states *"sans aucun trouble digestif"* (zero digestive discomfort, absolute) — creatine is well-tolerated for most people but GI discomfort is a documented minority effect in the literature; stating zero risk as unqualified fact with no citation is an overclaim pattern. Note: `category-copy.json`'s hedged draft text does **not** match what's actually live on this page at all (different, longer copy is live) — the file appears to be a stale/superseded draft, not a description of production reality; same may be true for the other 12 category pages (not individually re-verified).
2. **Whey protéine** — Substantive. Isolate-vs-concentrate % breakdown, calorie-myth FAQ.
3. **Pre-workout** — Substantive. Beta-alanine tingling explained accurately, stacking guidance.
4. **Nutrition sportive** — Best local context (Tunisia-climate storage advice).
5. **Gainers/Prise de masse** — Good (realistic "1-1.5kg/month" claim, no fake promises), slightly thinner FAQ.
6. **Ashwagandha** — ⚠️ **Compliance flag, confirmed at two levels**: body FAQ phrases "contribue à réguler le cortisol" as fact rather than hedged. Separately, the live `<meta name="description">` (shown verbatim in every Google search snippet, outside any on-page disclaimer) reads: *"Plante adaptogène pure pour réduire le stress, réguler le cortisol et améliorer le sommeil"* — an unqualified cortisol/stress/sleep claim with no "peut"/"traditionnellement utilisée pour" hedge anywhere in that string. `ARTICLE_REVIEW_QUEUE.md` already flags Ashwagandha as Medium YMYL risk for *articles*, but this meta description sits entirely outside that disclaimer system. Also thinnest FAQ (2 items) despite being a named target keyword.
7. **L-carnitine** — Confirmed as a genuine dedicated cluster (own title/H1/meta, not folded into a parent), but thin (1 FAQ) — compounded by the noindex bug in §2.1.
8. **Compléments alimentaires** — Thin relative to its 3,988-product breadth (2 FAQs for a near-catalogue-wide hub).
9. **Vitamines** — Thin (1 FAQ) relative to 952 products; title promises D3/K2 specificity the body copy doesn't deliver.
10. **Magnésium** — Thinnest (1 FAQ), and its answer ("signes d'un manque de magnésium" — cramps, fatigue, nervousness) reads closer to symptom/self-diagnosis framing than pure product education — a softer CLAUDE.md §21 flag, worth comparing against how other pages hedge.

**Cross-cutting E-E-A-T gap (all 10 pages):** no named author/reviewer anywhere (all say anonymous "nos experts"), no visible published/updated date, no citations for the specific physiological claims made (accurate claims, just uncited). No fabricated review counts or ratings found anywhere (clean on §20).

---

## 4. What's already built but not yet live

A substantial, high-quality Growth Sprint 2 rewrite is sitting **staged/uncommitted** in the working tree (96 files, +2,783/-1,511 lines), including:
- A rewritten `src/app/sitemap.ts` that refuses to publish an incomplete sitemap (throws instead of silently falling back to stale data) and gates concern pages on having real live products.
- A new centralized `apps/api/src/catalogue/seo-checklist.ts` + service + admin UI component for per-page SEO scoring.
- A `category-tree.ts` utility for correct category-subtree resolution.
- Extensive navigation/mega-menu simplification (-771 lines).

**None of this is deployed.** The live site is running older code. This working tree was not created by this audit session — it predates this conversation. Not touched beyond the specific fixes listed in §1, per your instruction to preserve existing in-progress work.

---

## 5. What this audit could NOT establish

- **Core Web Vitals / Lighthouse**: no Chrome/Lighthouse binary was available in the audit environment. Static-HTML signals only (viewport meta present, 2 render-blocking stylesheets on homepage, no `fetchpriority` hint on the likely LCP image) — explicitly unverified, not a pass.
- **Full orphan-page diff** (internal links vs. sitemap) — not completed; flagged as highest-priority follow-up given the brand-page gap in §2.3.
- **Keyword search volumes** — no paid keyword-volume API was used (by your instruction). All numbers in this document are real GSC impressions/clicks/position, not estimated search volume.
- **AggregateRating fabrication check on a live PDP** — code-level review of `buildProductSchema()` confirms it correctly gates `aggregateRating` behind `rating.count > 0`, but this wasn't confirmed against a live product page with real reviews.
