"""Create a reviewable report from completed audits; no fabricated passes."""
import json
from pathlib import Path
root = Path('scratch/seo')
r = json.loads((root / 'report.json').read_text(encoding='utf8'))
b, a = r['databaseBefore'], r['databaseAfter']
bw, aw = r['webBefore'], r['webAfter']
live = json.loads((root / 'live-verification.json').read_text(encoding='utf8'))
rows = []
def row(label, before, after, status=None):
    rows.append(f'| {label} | {before} | {after} | {status or ("Pass" if after == 0 else "Review")} |')
row('Unexpectedly empty main landing pages', 4, sum(c['actual'] == 0 for c in live['categories'] if c['slug'] in ['whey-proteine', 'accessoires', 'nutrition-sportive', 'gainers-proteines']))
for label, field in [('Products missing descriptions','missing_description'), ('Products missing SEO titles','missing_seoTitle'), ('Products missing meta descriptions','missing_seoDescription'), ('Products missing stored canonical','missing_canonicalUrl'), ('Products missing keywords','missing_seoKeywords'), ('Products missing image ALT','missing_imageAlt'), ('Duplicate product SEO titles','duplicate_seoTitle'), ('Duplicate product descriptions','duplicate_description'), ('Descriptions under 60 words','thin_description_under_60_words'), ('Products without category','missing_category'), ('Products without brand relation','missing_brand'), ('Products without confirmed manufacturer','unconfirmed_brand'), ('Missing real product photographs','missing_real_image'), ('Descriptions mentioning former shops','legacy_store_mentions')]:
    row(label,b['products'][field],a['products'][field])
row('Categories missing SEO titles',b['categories']['missing_seoTitle'],a['categories']['missing_seoTitle'])
row('Categories missing long SEO content',b['categories']['missing_seoContent'],a['categories']['missing_seoContent'])
for label, key in [('Products missing rendered Product schema','missingProductSchema'), ('Products missing rendered canonical','missingCanonical')]: row(label,bw[key],aw[key])
row('Non-200 public crawl responses',len(bw['non200']),len(aw['non200']))
row('Broken image responses',len(bw['brokenImageUrls']),len(aw['brokenImageUrls']))
row('Products without discovered inbound links',len(bw['productsWithoutDiscoveredInboundLinks']),len(aw['productsWithoutDiscoveredInboundLinks']))
row('Indexable canonical pages missing sitemap',len(bw['indexableMissingSitemap']),len(aw['indexableMissingSitemap']))
row('Sitemap URLs redirecting',len(bw['sitemapRedirects']),len(aw['sitemapRedirects']))
text = '''# ParaTunisie SEO deployment report

Live site: https://paratunisie.com/
Priority collections: https://paratunisie.com/whey-proteine and https://paratunisie.com/accessoires
Admin: https://admin.paratunisie.com/admin

## Root cause and delivered changes

The storefront used category slugs that did not match the imported database taxonomy, and parent-category filtering did not consistently include descendants. Static product references also linked to nonexistent products and outdated brand slugs. The database is PostgreSQL through Prisma, not MongoDB.

The deployment aligns canonical category slugs, resolves category IDs and slugs through the full hierarchy, and renders real products on the server. Two parent collections organize existing products without duplicating them. Search, brand filters and sorting apply before pagination; pagination has crawlable links and its own canonical, while filtered pages are noindex.

All 328 products, 52 categories and 54 brands now have stored SEO fields. Category guides are individually written. Existing product descriptions retain source information, render safely, and lose obsolete retailer advertising; four thin equipment descriptions now explain the available facts and identify missing specifications. Product content contains relevant category, brand and guide links. Forty existing guides are available in the article editor. Custom SEO, keywords, canonicals, social previews and indexability are editable in admin.

Product and Offer markup use real catalogue prices, TND and availability. Ratings appear only when real reviews exist. Missing photographs are disclosed instead of replaced with a misleading product image. Empty collections and unconfirmed-brand pages remain accessible with noindex and are omitted from the sitemap. The sitemap uses current published content and modification dates.

## Before / after

| Area | Before | After | Status |
| --- | ---: | ---: | --- |
''' + '\n'.join(rows)
text += f'''

The after crawl covered {aw['pages']} public URLs and {aw['productPages']} product pages. The baseline's 86 non-200 observations comprise 85 HTTP 404 responses and one crawler Unicode-encoding error; some baseline 404s were transient API timeouts. Baseline image checks covered database images; the after crawl also covers images discovered in rendered HTML. Stored-field omissions do not mean the old pages lacked fallback metadata. “Under 60 words” is a diagnostic threshold, not a quality or ranking guarantee.

## Verification and deployment safety

- Database backup: `/home/ubuntu/paratunisie/backups/seo-before/database.dump`; previous running images tagged `before-seo`.
- Guarded, serializable migration: 535 changes applied; the second application made zero changes. Preparing again from the final export also produced zero entity patches. See `deployment.json`.
- All {len(live['categories'])} category results match their recursive database product sets, including ID-versus-slug queries.
- {len(live['redirects'])} legacy URLs return HTTP 301 to their final canonical targets.
- Price sorting across all {live['sortedPagination']['products']} accessories preserves order without duplicate products across pages.
- Product offer verification: {r['offerVerification']['checked']} checked, {len(r['offerVerification']['priceOrStockMismatches'])} price/stock mismatches.
- Product IDs preserved: {r['commercePreserved']['sameProductIds']}; changed variant records: {len(r['commercePreserved']['changedVariantRecords'])}.
- API/frontend/admin builds, TypeScript checks, canonical/schema tests, category traversal/pagination tests and quality-evaluator regression tests passed.
- Mobile observations and screenshots are in `mobile/`. LCP and CLS are single unthrottled lab observations, not a field Core Web Vitals pass. INP and Search Console data were unavailable.
- Mobile cold/repeat LCP: whey 4.812/1.848 seconds, accessories 1.176/0.692 seconds, whey page 2 0.680/0.892 seconds, tested product 2.556/0.680 seconds. All four pages had CLS 0, no horizontal overflow and no hydration errors. The first cold navigation transferred approximately 399 KB of JavaScript; subsequent pages reused cached bundles. The slow cold response remains a performance limitation to monitor.
- The www host returned HTTP 301 from both the VPS and the origin. One local Python request received a Cloudflare 403; review edge bot rules in Cloudflare if Search Console reports access failures. The full apex-domain crawl succeeded.

## Manual review still required

- One real photograph: `best-collagen-premium-350g-scenit-nutrition`.
- Ten products have unconfirmed manufacturer names; three bundles need precise classification.
- Four equipment records need manufacturer model/specification confirmation.
- One pair of existing JX Fitness machine records has identical descriptions after obsolete shop advertising was removed: `machine-a-cuisses-interieure-et-exterieure-selective` and `machine-a-cuisses-interieure-et-exterieure-selective-jx-fitness`. Confirm whether these are the same model before merging or canonicalizing them. Artificial wording differences would conceal this data issue.
- Four category families currently have no stock catalogue entries: HMB, recovery after training, sports T-shirts and magnesium. They are intentionally noindex until products are assigned; no fake products were added.
- Forty inherited guides require editorial/clinical review of their existing health statements and sources. Existing product information is not independently certified manufacturer evidence.
- Composition/quality heuristics are review flags, not proof of missing ingredients. See `quality-review.json` and the exact item list in `manual-review.json`.
- No Google Search Console submission, backlink-account audit, measured keyword volumes, field INP or Google-hosted Rich Results Test certification is claimed. JSON-LD was checked programmatically against the rendered pages and current catalogue.

Keyword intent research and references: `../../ops/seo/RESEARCH.md`. Reusable maintenance workflow: `../../ops/seo/README.md`. No ranking position is promised.
'''
(root / 'REPORT.md').write_text(text, encoding='utf8')
print(root / 'REPORT.md')
