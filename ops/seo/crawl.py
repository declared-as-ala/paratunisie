"""Bounded public HTML/image audit. Saves observations, never customer data."""
import concurrent.futures
import html
from html.parser import HTMLParser
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.title = ''; self.h1 = []; self.meta = {}; self.canonical = None; self.links = []; self.images = []; self.schemas = []; self.capture = None; self.buffer = ''
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta': self.meta[a.get('name', a.get('property', ''))] = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href')
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'img': self.images.append(a)
        if tag in ['title', 'h1'] or (tag == 'script' and a.get('type') == 'application/ld+json'): self.capture = tag; self.buffer = ''
    def handle_data(self, value):
        if self.capture: self.buffer += value
    def handle_endtag(self, tag):
        if tag != self.capture: return
        if tag == 'title': self.title = self.buffer
        elif tag == 'h1': self.h1.append(self.buffer)
        else:
            try: self.schemas.append(json.loads(self.buffer))
            except ValueError: self.schemas.append({'invalidJson': True})
        self.capture = None

def fetch(url):
    parsed = urllib.parse.urlsplit(url)
    url = urllib.parse.urlunsplit(parsed._replace(path=urllib.parse.quote(parsed.path, safe='/%:@'), query=urllib.parse.quote(parsed.query, safe='=&%/?')))
    start = time.monotonic()
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'ParaTunisie-SEO-Audit/1.0'})
        with urllib.request.urlopen(request, timeout=45) as response:
            body = response.read(); content_type = response.headers.get('Content-Type', '')
            result = {'url': url, 'finalUrl': response.url, 'status': response.status, 'seconds': round(time.monotonic()-start, 3), 'bytes': len(body), 'xRobotsTag': response.headers.get('X-Robots-Tag')}
        if 'text/html' in content_type:
            document = Document(); document.feed(body.decode('utf8', errors='replace'))
            result.update(title=document.title, h1=document.h1, meta=document.meta, canonical=document.canonical, links=document.links, images=document.images, schemas=document.schemas)
        return result
    except Exception as error:
        return {'url': url, 'status': getattr(error, 'code', None), 'error': str(error)}

if __name__ == '__main__':
    snapshot = json.loads(Path(sys.argv[1]).read_text(encoding='utf8'))
    origin = 'https://paratunisie.com'
    paths = ['/', '/shop', '/whey-proteine', '/accessoires', '/nutrition-sportive', '/gainers-proteines']
    paths += ['/produits/' + p['slug'] for p in snapshot['products']]
    paths += ['/' + c['slug'] for c in snapshot['categories']]
    paths += ['/marques/' + b['slug'] for b in snapshot['brands']]
    urls = list(dict.fromkeys(origin + p for p in paths))
    sitemap_urls = []
    try:
        with urllib.request.urlopen(origin + '/sitemap.xml', timeout=30) as response:
            sitemap_urls = [element.text for element in ET.fromstring(response.read()).iter() if element.tag.endswith('}loc')]
        urls = list(dict.fromkeys(urls + sitemap_urls))
    except Exception as error:
        print('Sitemap error:', error)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        rows = list(pool.map(fetch, urls))
    linked = set()
    excluded = ('/compte', '/checkout', '/panier', '/favoris', '/api/', '/admin', '/_next/')
    for row in rows:
        for link in row.get('links', []):
            url = urllib.parse.urljoin(row['url'], link)
            parsed = urllib.parse.urlparse(url)
            if parsed.netloc != 'paratunisie.com' or parsed.path.startswith(excluded):
                continue
            query = urllib.parse.parse_qs(parsed.query)
            if query and set(query) != {'page'}:
                continue
            linked.add(urllib.parse.urlunparse(parsed._replace(fragment='')))
    extra = sorted(linked - set(urls))
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        rows += list(pool.map(fetch, extra[:2000]))
    image_urls = list(dict.fromkeys(urllib.parse.urljoin(origin, image['url']) for p in snapshot['products'] for image in p['images']))
    image_urls += [urllib.parse.urljoin(origin, p['image']) for p in snapshot['products'] if p.get('image')]
    for row in rows:
        for image in row.get('images', []):
            source = image.get('src', '')
            if not source or source.startswith('data:'):
                continue
            url = urllib.parse.urljoin(origin, source)
            parsed = urllib.parse.urlparse(url)
            if parsed.path == '/_next/image':
                url = urllib.parse.urljoin(origin, urllib.parse.parse_qs(parsed.query).get('url', [''])[0])
            if urllib.parse.urlparse(url).netloc == 'paratunisie.com':
                image_urls.append(url)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        images = list(pool.map(fetch, dict.fromkeys(image_urls)))
    Path(sys.argv[2]).write_text(json.dumps({'pages': rows, 'images': images, 'sitemapUrls': sitemap_urls, 'uncrawledLinks': max(0, len(extra) - 2000)}, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps({'pages': len(rows), 'non200': sum(r['status'] != 200 for r in rows), 'images': len(images), 'brokenImages': sum(r['status'] != 200 for r in images)}))
