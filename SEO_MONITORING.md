# SEO_MONITORING.md — Ongoing SEO Measurement

**Created:** 2026-10-14. Supersedes the "spec only, not yet live" state described in `SEO_MEASUREMENT_PLAN.md` — Google Search Console is now actually connected (via the `gsc` MCP server: `mcp-server-gsc`, configured in `.mcp.json`, authenticated as service account `id-gsc-mcp@midyear-clone-468921-u0.iam.gserviceaccount.com` with Full access on the `sc-domain:paratunisie.com` property). This file is the practical "how to check" companion to that plan.

## What's live and working

- **Real-time GSC querying** via Claude Code (`mcp__gsc__search_analytics`, `mcp__gsc__index_inspect`, `mcp__gsc__list_sitemaps`, `mcp__gsc__detect_quick_wins`, `mcp__gsc__list_sites`). No API cost — Search Console's API is free.
- **GA4 e-commerce events**: still spec-only per `SEO_MEASUREMENT_PLAN.md` — not verified as actually firing in production this session. Check separately.

## Baseline (2026-10-14, 28-day window 2026-09-15 to 2026-10-10)

| Metric | Value |
|---|---|
| Total clicks | 55 |
| Total impressions | 3,560 |
| Site-wide average position | ~20 (varies 10-35 day to day) |
| % of clicks that are brand-navigational (`paratunisie`) | 53% (29/55) |
| Target-cluster head-term clicks (créatine/whey/gainer/ashwagandha/magnésium/vitamines/nutrition sportive/pre-workout/omega combined) | **0** |
| Sitemap URLs | 186 (103 products, 40 articles, 13 categories, 17 static, 8 concerns, 4 brands) |
| GSC-reported sitemap "indexed" count | 0 (confirmed stale/lagging — real indexing verified via URL Inspection shows homepage/creatine/whey-proteine all genuinely indexed) |

**Use this table as the before-state.** Re-run the same query shape (see below) monthly and compare.

## How to re-check (repeatable recipe)

1. **Overall trend**: `mcp__gsc__search_analytics` with `siteUrl: "sc-domain:paratunisie.com"`, `dimensions: "date"`, last 28 days — gives daily clicks/impressions/ctr/position, small enough to read inline.
2. **Query-level and page-level pulls** (last 28d, prior 28d) will usually exceed the inline token limit and get saved to a file — don't try to read 4,000+ line files directly; either grep for specific queries/pages, or write a small Node/Python script to parse the saved JSON and extract top-N (this is what was done for this audit — see the `node -e` one-liner pattern in this session's history if repeating).
3. **Quick wins**: `mcp__gsc__detect_quick_wins` with `positionRangeMin: 4, positionRangeMax: 20, minImpressions: 3, maxCtr: 100` (the defaults are tuned for a much higher-traffic site than ParaTunisie currently is — the low `minImpressions` is necessary here or everything gets filtered out).
4. **Index verification for specific URLs**: `mcp__gsc__index_inspect` — the only reliable way to confirm real indexing status; don't trust the sitemap report's "indexed" count (confirmed stale this session).
5. **Target-cluster check**: grep the query-level pull for each cluster's head terms (see `SEO_KEYWORD_MAP.md` for the current list) and compare position/impressions/clicks against the 2026-10-14 baseline above.

## What to watch for specifically

- **Did the www redirect get added in Nginx Proxy Manager?** `curl -I https://www.paratunisie.com/` should return `301` to the apex, not `200`. (Confirmed this session: the fix is an NPM "Redirection Host" entry on the shared `sobitas-npm` proxy, not anything in this repo — `ops/ovh/*.conf` are not in the live request path.)
- **Did `/l-carnitine` get indexed after the flag flip?** Re-run `index_inspect` on it — expect `coverageState` to move from "URL is unknown to Google" to "Submitted and indexed" within 1-2 weeks of the sitemap re-including it.
- **Did any of the target-cluster head terms move off position 50+?** This is the real signal of whether the content/technical work (vs. authority work) is doing anything.
- **Any new pages disappearing from search** (impressions dropping to 0 between periods) the way `/produits/alopexy-5` and others did this period — check if it's a legitimate stock-out (expected) or a new noindex/eligibility bug (not expected) before assuming it's fine.
