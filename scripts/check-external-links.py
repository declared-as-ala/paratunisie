import re, os, urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = set()
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
                found = re.findall(r'https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s\"\'\`><]*)?', content)
                for u in found:
                    u_clean = u.rstrip('.,;)"\'')
                    if not any(ign in u_clean for ign in ['schema.org', 'paratunisie.com', 'localhost', 'example.com', 'googletagmanager', 'facebook.net', 'w3.org', 'purl.org']):
                        urls.add(u_clean)

print(f"Found {len(urls)} distinct external URLs:")
for u in sorted(urls):
    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=10)
        print(f"  [OK {resp.status}] {u}")
    except urllib.error.HTTPError as e:
        print(f"  [HTTP {e.code}] {u}")
    except Exception as e:
        print(f"  [ERR] {u}: {e}")
