import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://paratunisie.com/pre-workout',
    'https://paratunisie.com/conseils/meilleur-pre-workout-tunisie'
]

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            title = re.search(r'<title>(.*?)</title>', html)
            h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html)
            canonical = re.search(r'<link rel="canonical" href="([^"]*)"', html)
            robots = re.search(r'<meta name="robots" content="([^"]*)"', html)
            print(f"URL: {url}")
            print(f"  Title: {title.group(1) if title else 'N/A'}")
            print(f"  H1: {h1.group(1) if h1 else 'N/A'}")
            print(f"  Canonical: {canonical.group(1) if canonical else 'N/A'}")
            print(f"  Robots: {robots.group(1) if robots else 'N/A'}")
            print()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
