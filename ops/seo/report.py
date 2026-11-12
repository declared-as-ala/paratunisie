"""Summarise saved observations; never convert an untested check into a pass."""
import collections
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'scratch/seo')
def load(name):
    path = root / name
    return json.loads(path.read_text(encoding='utf8')) if path.exists() else None

def page_metrics(crawl):
    if not crawl:
        return {}
    pages = crawl['pages']
    products = [p for p in pages if '/produits/' in p['url'] and p['url'] == p.get('finalUrl') and p['status'] == 200]
    schema_errors = []
    for page in products:
        schemas = [schema for schema in page.get('schemas', []) if isinstance(schema, dict) and schema.get('@type') == 'Product']
        issues = []
        if len(schemas) != 1:
            issues.append('Expected one Product schema')
        else:
            schema = schemas[0]
            offer = schema.get('offers', {})
            if offer.get('priceCurrency') != 'TND': issues.append('Currency')
            try:
                if float(offer.get('price', -1)) <= 0: issues.append('Price')
            except (TypeError, ValueError): issues.append('Price')
            if offer.get('availability') not in ['https://schema.org/InStock', 'https://schema.org/OutOfStock', 'https://schema.org/PreOrder']: issues.append('Availability')
            if not schema.get('name') or not schema.get('sku'): issues.append('Identity')
            if not schema.get('image'): issues.append('Real product image missing')
            if offer.get('url') != page.get('canonical'): issues.append('Offer/canonical conflict')
        if issues: schema_errors.append({'url': page['url'], 'issues': issues})
    inbound = collections.Counter(link for page in pages for link in page.get('links', []))
    canonical_pages = [p for p in pages if p['status'] == 200 and p['url'] == p.get('finalUrl') and p.get('canonical') == p.get('finalUrl') and 'noindex' not in (p.get('meta', {}).get('robots') or '')]
    missing_sitemap = [p['url'] for p in canonical_pages if not urlparse(p['url']).query and p['url'] not in crawl.get('sitemapUrls', []) and p['url'].rstrip('/') not in crawl.get('sitemapUrls', [])]
    return {
        'pages': len(pages), 'productPages': len(products),
        'non200': [p['url'] for p in pages if p['status'] != 200],
        'missingProductSchema': sum(not any(isinstance(s, dict) and s.get('@type') == 'Product' for s in p.get('schemas', [])) for p in products),
        'schemaIssues': schema_errors,
        'missingCanonical': sum(not p.get('canonical') for p in products),
        'missingProductTitle': sum(not p.get('title') for p in products),
        'missingProductMetaDescription': sum(not p.get('meta', {}).get('description') for p in products),
        'missingProductH1': sum(not p.get('h1') for p in products),
        'productsWithoutDiscoveredInboundLinks': [p['url'] for p in products if not inbound[urlparse(p['url']).path] and not inbound[p['url']]],
        'brokenImageUrls': [p['url'] for p in crawl['images'] if p['status'] != 200],
        'indexableMissingSitemap': missing_sitemap,
        'sitemapRedirects': [p['url'] for p in pages if p['url'] in crawl.get('sitemapUrls', []) and p['url'] != p.get('finalUrl')],
        'uncrawledLinks': crawl.get('uncrawledLinks', 0),
    }

before, after = load('audit-before.json'), load('audit-after.json')
before_web = page_metrics(load('crawl-full-before.json') or load('crawl-before.json'))
after_web = page_metrics(load('crawl-after.json'))
summary = {'databaseBefore': before, 'databaseAfter': after, 'webBefore': before_web, 'webAfter': after_web, 'manualReview': load('manual-review.json'), 'mobile': load('mobile/results.json')}
snapshot = load('after.json')
crawl = load('crawl-after.json')
if snapshot and crawl:
    catalogue = {p['slug']: p for p in snapshot['products']}
    offer_mismatches = []
    checked = 0
    for page in crawl['pages']:
        slug = urlparse(page['url']).path.removeprefix('/produits/')
        if slug not in catalogue or page['status'] != 200 or page['url'] != page.get('finalUrl'):
            continue
        product = catalogue[slug]
        for schema in page.get('schemas', []):
            if not isinstance(schema, dict) or schema.get('@type') != 'Product':
                continue
            checked += 1
            expected_price = product['variants'][0]['priceMillimes'] / 1000
            expected_stock = 'https://schema.org/' + ('InStock' if sum(v['stock'] for v in product['variants']) > 0 else 'OutOfStock')
            offer = schema.get('offers', {})
            if float(offer.get('price', -1)) != expected_price or offer.get('availability') != expected_stock:
                offer_mismatches.append(page['url'])
    summary['offerVerification'] = {'checked': checked, 'priceOrStockMismatches': offer_mismatches}
    baseline = load('before.json')
    old = {p['id']: p for p in baseline['products']}
    changed_commerce = [p['slug'] for p in snapshot['products'] if p['id'] not in old or p['variants'] != old[p['id']]['variants']]
    summary['commercePreserved'] = {'sameProductIds': set(old) == {p['id'] for p in snapshot['products']}, 'changedVariantRecords': changed_commerce}
(root / 'report.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps({'beforePages': before_web.get('pages'), 'afterPages': after_web.get('pages'), 'afterNon200': after_web.get('non200'), 'schemaIssues': after_web.get('schemaIssues'), 'missingSitemap': after_web.get('indexableMissingSitemap')}, ensure_ascii=True))
