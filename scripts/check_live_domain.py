import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request(
    'https://paratunisie.com/?nocache=1',
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
)
with urllib.request.urlopen(req) as resp:
    print('Status:', resp.status)
    print('Headers:')
    for k, v in resp.headers.items():
        if k.lower() in ['cf-cache-status', 'age', 'cache-control', 'x-cache', 'server', 'etag', 'date']:
            print(f'  {k}: {v}')
    html = resp.read().decode('utf-8', errors='replace')
    print('\nHTML search:')
    print('  "À LA UNE RELAX":', 'À LA UNE RELAX' in html)
    print('  "À la une Relax":', 'À la une Relax' in html)
    print('  "now-foods-ashwagandha":', 'now-foods-ashwagandha' in html)
    print('  "naturelo-magnesium":', 'naturelo-magnesium' in html)
    print('  "swanson-vitamins-full-spectrum-ashwagandha":', 'swanson-vitamins-full-spectrum-ashwagandha' in html)
    print('  "À la une Sport":', 'À la une Sport' in html)
