import urllib.request
import urllib.error
import re
import ssl

ctx = ssl._create_unverified_context()

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
            return res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[ERR] {url}: {e}")
        return None

robots = fetch('https://protein.tn/robots.txt')
print("=== ROBOTS.TXT ===")
if robots:
    print(robots[:1000])

sitemap = fetch('https://protein.tn/sitemap.xml')
print("=== SITEMAP.XML ===")
if sitemap:
    print(sitemap[:1000])

for sm in [
    'https://protein.tn/sitemap_index.xml',
    'https://protein.tn/wp-sitemap.xml',
    'https://protein.tn/wp-sitemap-posts-product-1.xml',
    'https://protein.tn/product-sitemap.xml',
    'https://protein.tn/product-sitemap1.xml'
]:
    content = fetch(sm)
    if content:
        print(f"✓ Found sitemap: {sm} ({len(content)} bytes)")
        urls = re.findall(r'<loc>([^<]+)</loc>', content)
        print(f"  Total <loc> entries: {len(urls)}")
        for u in urls[:5]:
            print(f"   - {u}")
