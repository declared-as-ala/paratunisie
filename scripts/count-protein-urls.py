import urllib.request
import re
import ssl

ctx = ssl._create_unverified_context()

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
        return res.read().decode('utf-8', errors='ignore')

all_product_urls = set()
for sm in [
    'https://protein.tn/sitemaps/products-0.xml',
    'https://protein.tn/sitemaps/products-1.xml',
    'https://protein.tn/sitemaps/products-2.xml',
]:
    xml = fetch(sm)
    urls = re.findall(r'<loc>([^<]+)</loc>', xml)
    print(f"{sm}: {len(urls)} URLs")
    all_product_urls.update(urls)

print(f"\nTotal unique product URLs in sitemaps: {len(all_product_urls)}")

listings_xml = fetch('https://protein.tn/sitemaps/listings.xml')
listing_urls = re.findall(r'<loc>([^<]+)</loc>', listings_xml)
print(f"Total category/listing URLs in sitemaps: {len(listing_urls)}")
for l in listing_urls[:10]:
    print(" -", l)
