# SEO_ROADMAP.md — ParaTunisie 90-Day Plan

**Created:** 2026-10-14, from `SEO_AUDIT.md`'s evidence-based findings. Revise this file as each item lands — don't let it go stale like `SEO_REMEDIATION_TODO.md` did.

## Reality check first

Per `SEO_AUDIT.md` §0, the named commercial keyword clusters (créatine, whey, gainer, ashwagandha, L-carnitine, magnésium, vitamines, nutrition sportive, compléments alimentaires, pre-workout) are all ranking position 25-100+ with zero clicks. **No combination of on-page fixes in this roadmap will move those rankings to page 1 by itself** — this is a young-domain authority problem (see `AUTHORITY_ROADMAP.md`), not a technical-debt problem. The items below are necessary (clear the remaining technical/content blockers, don't leave easy wins on the table) but not sufficient — sustained off-page authority building is the actual unlock, and is already scoped in `AUTHORITY_ROADMAP.md` but not reflected as "done" anywhere.

## URGENT — real production server correction (2026-10-14, later)

The real production server is `187.53.136.225` (Hostinger), not `145.223.118.9` (OVH, stale). DNS is correct as-is — do not change it. Two fixes are ready but blocked by the permission system; exact commands to run yourself (or grant permission for):

1. **Deploy the 8 committed code fixes** (commit `593cd1c` on branch `seo/audit-fixes-2026-10-14`) — no git on the server, so copy files directly:
```
pscp -pw "<password>" -hostkey "SHA256:m3wbnRDFs6qO4Ax3jpZi73+qS5NLw0ZPD3cZXWdXdec" src/lib/config/company.ts root@187.53.136.225:/root/paratunisie/src/lib/config/company.ts
# ...repeat for: src/lib/seo/schema.ts, src/app/layout.tsx, "src/app/marques/[slug]/page.tsx",
#   src/components/layout/logo.tsx, src/components/product/product-card.tsx, src/app/robots.ts, next.config.ts
# then on the server:
cd /root/paratunisie && docker compose -f docker-compose.prod.yml build paratunisie-web && docker compose -f docker-compose.prod.yml up -d paratunisie-web
```

2. **Apply the `www` redirect fix** to `/etc/nginx/sites-available/paratunisie-domains.conf` (already backed up to `/root/paratunisie-domains.conf.bak-20261014`): change line 2 from `server_name paratunisie.com www.paratunisie.com;` to `server_name paratunisie.com;`, then insert a new server block right after that block's closing `}` (line 47):
```nginx
server {
    server_name www.paratunisie.com;
    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/paratunisie.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paratunisie.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    return 301 https://paratunisie.com$request_uri;
}
```
Then `nginx -t && systemctl reload nginx`.

Already done and verified live on the real server: `/l-carnitine` indexable flag flipped (backed up first), SMTP confirmed working.

## NEW — biggest single finding: 9 substantial categories wrongly noindexed (2026-10-14, later)

Orphan-page check (homepage internal links vs sitemap) led to finding this is NOT isolated to `/l-carnitine` — it's a systemic bug. Every category below has well above the 5-product threshold and is linked from site navigation, but sits `indexable: false`:

| Category | Published products | 
|---|---|
| `immunite` | 623 |
| `plantes-et-herbes` | 566 |
| `articulations` | 414 |
| `probiotiques` | 386 |
| `mineraux` | 270 |
| `acides-amines` | 204 |
| `sommeil-stress` | 167 |
| `whey-isolate` | 51 |
| `bruleurs-de-graisse` | 47 |

That's **~2,728 products' worth of category hub pages invisible to Google** right now — almost certainly the single highest-leverage fix in this entire audit, bigger than any individual content or technical item. Backed up (`/root/paratunisie/category-backup-20261014-batch2.sql`). Fix (same pattern as `/l-carnitine`, blocked by the bulk-write permission classifier):
```sql
UPDATE "Category" SET indexable = true WHERE indexable = false AND id IN (
  SELECT c.id FROM "Category" c JOIN "Product" p ON p."categoryId"=c.id AND p."publishState"='PUBLISHED'
  GROUP BY c.id HAVING count(p.id) >= 5
);
```
Then restart `paratunisie-api`. Also brought 13 real, homepage-linked brand pages (BiotechUSA, Challenger Nutrition, Eric Favre, FA Engineered Nutrition, Insane Labz, Muscle Care, MusclePharm, Nutrex Research, Optimum Nutrition, OstroVit, Quamtrax, Real Pharm, Zumub) into view as confirmed-real orphan pages — same root cause as the brand-indexable bug (item 5 below), not a separate issue.

## P0 — This week

1. **Add a `www.paratunisie.com → https://paratunisie.com` redirect in Nginx Proxy Manager** (the shared `sobitas-npm` instance — NOT anything in this repo; confirmed via SSH that `ops/ovh/*.conf` aren't in the live request path at all). Either split NPM's "proxy host 12" into two hosts (one plain proxy for the apex, one Redirection Host for `www`) or add a custom redirect block to the existing host. **This touches shared infrastructure serving other businesses' sites on the same box — needs your explicit go-ahead before I touch it.** VPS SSH access is set up and ready.
2. **Flip `/l-carnitine` category to `indexable: true`** — single DB row, fully-built page, named target keyword, currently invisible to Google (confirmed via URL Inspection: "URL is unknown to Google"). Do via the admin SEO checklist UI. **Production data change — needs your go-ahead**, but this is the single highest-leverage item in this entire roadmap: near-zero risk, directly unlocks a named target cluster.
3. **`/creatine` and `/ashwagandha` overclaiming is already fixed in the database** (confirmed 2026-10-14, real server) — someone already ran the `ops/seo/apply.cjs` pipeline, replacing the unsafe text with the hedged `category-copy.json` wording. The live pages just haven't been rebuilt since, so they still serve the old unsafe static HTML. **No content rewrite needed — this is purely the `paratunisie-web` rebuild in item 4 below.** Re-verify the live meta/body text after that rebuild ships, in case any other category has the same drift.
4. **Deploy the already-fixed-in-code items from this session** (schema de-duplication, tap targets, logo `next/image`, robots.txt facets, security headers) — currently sitting uncommitted like the rest of the working tree; bundle into whatever commit/deploy cycle handles the Growth Sprint 2 work (item 6).
5. **Brand sitemap gap — root cause confirmed, fix ready, blocked by permissions.** Real bug, not a thin-content gate: the top brands by product count (Swanson Vitamins 428, NOW Foods 381, Source Naturals 153...) are all `indexable: false`, while the 4 currently-indexed brands have only 1-13 products each — no sensible pattern. Backed up (`/root/paratunisie/brand-backup-20261014.sql`, 511 lines). Fix (195 brands have 5+ published products, matching the project's existing category threshold — never de-indexes the current 4):
```sql
UPDATE "Brand" SET indexable = true WHERE indexable = false AND id IN (
  SELECT b.id FROM "Brand" b JOIN "Product" p ON p."brandId"=b.id AND p."publishState"='PUBLISHED'
  GROUP BY b.id HAVING count(p.id) >= 5
);
```
Run via `docker exec paratunisie-postgres psql -U paratunisie -d paratunisie` on `187.53.136.225`, then restart `paratunisie-api`.

## P1 — Next 2-4 weeks

6. **Commit and deploy the existing Growth Sprint 2 working tree** (`SEO_AUDIT.md` §4) — 96 files, already written, including a sitemap rewrite that fixes concern-page gating and refuses to publish incomplete data (the live `sitemap.ts` still has a hardcoded category-slug fallback and ungated concern pages — latent risk, benign only because current catalogue data happens to be healthy). This is the biggest single lever sitting idle. Needs your review/sign-off since it's a large, pre-existing change this session didn't author.
7. **Reconcile or retire `ops/seo/category-copy.json`** — confirmed its hedged draft text for `/creatine` does not match live production copy at all (different, longer copy is live); either confirm/apply it everywhere or delete it and document in `DECISIONS.md` that category copy is authored directly in the DB going forward. Leaving it in place as a stale draft risks someone mistaking it for production truth.
8. **Move `/[category]` and the homepage off `force-dynamic`** to ISR with a sensible `revalidate` window — current TTFB (~800ms) is 5-6x the documented 120-180ms baseline and eats roughly a third of the 2.5s LCP budget before paint starts (`SEO_AUDIT.md` §2.5d). Needs a product decision on acceptable staleness for stock/price display, not a blind code change.
9. **Thicken the 3 weakest category pages**: magnésium (1 FAQ, 952 products), vitamines (1 FAQ, 952 products), compléments alimentaires (2 FAQs, 3,988 products). Per `SEO_AUDIT.md` §3, these have the worst content-to-catalogue-size ratio. Needs real subject-matter content (nutrient-form comparisons, buying-by-goal structure) — a content/product task, not a pure code task.
10. **Review the magnesium FAQ's symptom-listing framing** (cramps/fatigue/nervousness as deficiency signs) — borderline self-diagnosis nudge per §21, worth a second look even though it's not an interactive diagnostic flow.
11. **Add named author/reviewer bylines + dates** to the 10+ category pages (currently all anonymous "nos experts") — E-E-A-T gap identified across every page audited.
12. **Decide and implement a redirect-to-category policy for discontinued/out-of-stock products** instead of hard 404s (`SEO_AUDIT.md` §2.4) — preserves link equity from products that go out of stock. The `product-unavailable.svg` asset already staged suggests this is partway planned.

## P2 — 4-8 weeks

13. **Content Security Policy** — start report-only, allowlisting GTM/Meta Pixel/other third-party scripts confirmed in page source, then enforce once clean.
14. **IndexNow protocol** (`SEO_AUDIT.md` §2.6) — notify Bing/Yandex proactively on publish/update.
15. **Run real Lighthouse/PageSpeed Insights** against production — this audit could not measure CWV directly (no Chrome available in the audit environment). The `seo-google` skill (already available) has a PageSpeed Insights v5 integration — use it.
16. **Complete the orphan-page diff** (internal links vs. sitemap) — not completed this pass, flagged as the natural follow-up to the brand-page gap (item 5).

## P3 — Ongoing / 90-day

17. **Execute `AUTHORITY_ROADMAP.md`** — this is the actual lever for moving the head terms in `SEO_KEYWORD_MAP.md` off page 3-10. Nothing in this roadmap substitutes for it.
18. **Re-run the GSC comparison monthly** (see `SEO_MONITORING.md`) — track whether item 1-6 deployments actually move the needle before investing further in content (item 9) or authority (item 17) work.
19. **Re-verify `SEO_REMEDIATION_TODO.md`'s remaining claims** against production the way this audit did for sitemap/schema/www-host — several other "Completed and verified" line items were not re-checked this pass and may have similarly drifted.
