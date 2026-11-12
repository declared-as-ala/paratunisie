"""Authenticated SEO verification only. Credentials come from the environment."""
import concurrent.futures
import http.cookiejar
import json
import os
from pathlib import Path
import urllib.request

origin = 'https://paratunisie.com/api/v1'
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
payload = json.dumps({'email': os.environ['SEO_ADMIN_EMAIL'], 'password': os.environ['SEO_ADMIN_PASSWORD']}).encode()
with opener.open(urllib.request.Request(origin + '/admin-auth/login', data=payload, headers={'Content-Type': 'application/json'}), timeout=30) as response:
    assert response.status in (200, 201)
cookie = '; '.join(f'{item.name}={item.value}' for item in jar)
def request(path, data=None):
    req = urllib.request.Request(origin + path, data=None if data is None else json.dumps(data).encode(), headers={'Content-Type': 'application/json', 'Cookie': cookie})
    with urllib.request.urlopen(req, timeout=90) as response: return json.load(response)

root = Path('scratch/navigation'); root.mkdir(exist_ok=True)
for kind in ['category', 'product']:
    before = request('/catalogue/seo/checklist/' + kind)
    (root / f'{kind}-checklist-before.json').write_text(json.dumps(before, ensure_ascii=False, indent=2), encoding='utf8')
    failures = []
    def verify(item):
        try: return request(f"/catalogue/seo/checklist/{kind}/{item['id']}", {'repair': True})
        except Exception as error: return {'id': item['id'], 'error': str(error)}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        for index, result in enumerate(pool.map(verify, before['items']), 1):
            if 'error' in result: failures.append(result)
            if index % 10 == 0: print(kind, index, '/', len(before['items']), flush=True)
    after = request('/catalogue/seo/checklist/' + kind)
    after['requestFailures'] = failures
    (root / f'{kind}-checklist.json').write_text(json.dumps(after, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps({ 'type': kind, 'total': after['total'], 'perfect': after['perfect'], 'below100': after['below100'], 'failures': len(failures) }), flush=True)
