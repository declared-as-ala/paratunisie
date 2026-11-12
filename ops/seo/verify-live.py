"""Read-only assertions for taxonomy, pagination, redirects and indexation."""
import json
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from crawl import fetch

root = Path('scratch/seo')
snapshot = json.loads((root / 'after.json').read_text(encoding='utf8'))
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf8'))
origin = 'https://paratunisie.com'
def api(**params):
    with urllib.request.urlopen(origin + '/api/v1/catalogue/products?' + urllib.parse.urlencode(params), timeout=30) as response:
        return json.load(response)

results = {'categories': [], 'redirects': [], 'privatePages': []}
for category in snapshot['categories']:
    ids = {category['id']}
    while True:
        expanded = ids | {c['id'] for c in snapshot['categories'] if c.get('parentId') in ids}
        if ids == expanded: break
        ids = expanded
    expected = {p['id'] for p in snapshot['products'] if p['categoryId'] in ids and p.get('published', True)}
    by_slug = api(category=category['slug'], limit=100)
    actual = {p['id'] for p in by_slug['data']}
    for page in range(2, by_slug['meta']['totalPages'] + 1):
        actual |= {p['id'] for p in api(category=category['slug'], limit=100, page=page)['data']}
    assert actual == expected, category['slug']
    by_id = api(category=category['id'], limit=1)
    assert by_id['meta']['total'] == len(expected), category['id']
    results['categories'].append({'slug': category['slug'], 'expected': len(expected), 'actual': len(actual)})

prices = []
ids = []
first = api(category='accessoires', sort='price_asc', limit=24)
for page in range(1, first['meta']['totalPages'] + 1):
    response = first if page == 1 else api(category='accessoires', sort='price_asc', limit=24, page=page)
    prices += [p['variants'][0]['priceMillimes'] for p in response['data']]
    ids += [p['id'] for p in response['data']]
assert prices == sorted(prices) and len(ids) == len(set(ids)) == first['meta']['total']
results['sortedPagination'] = {'products': len(ids), 'passed': True}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None
opener = urllib.request.build_opener(NoRedirect)
for redirect in manifest['redirects']:
    try:
        opener.open(origin + redirect['oldPath'], timeout=30)
        raise AssertionError('Expected redirect: ' + redirect['oldPath'])
    except urllib.error.HTTPError as error:
        target = urllib.parse.urljoin(origin, error.headers.get('Location', ''))
        assert error.code == 301 and target == origin + redirect['newPath'], (redirect, error.code, target)
        results['redirects'].append({'from': redirect['oldPath'], 'to': target, 'status': error.code})
for path in ['/compte', '/favoris', '/panier', '/checkout', '/whey-proteine?q=whey', '/marques/bsn-supplements', '/hmb']:
    page = fetch(origin + path)
    assert 'noindex' in (page.get('meta', {}).get('robots') or ''), (path, page.get('status'))
    results['privatePages'].append({'path': path, 'robots': page['meta']['robots']})
(root / 'live-verification.json').write_text(json.dumps(results, indent=2), encoding='utf8')
print(json.dumps({'categories': len(results['categories']), 'redirects301': len(results['redirects']), 'sortedPagination': results['sortedPagination'], 'noindexChecks': len(results['privatePages'])}))
