import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    'https://paratunisie.com/',
    'https://paratunisie.com/whey-proteine',
    'https://paratunisie.com/creatine',
    'https://paratunisie.com/pre-workout',
    'https://paratunisie.com/nutrition-sportive',
    'https://paratunisie.com/complements-alimentaires',
    'https://paratunisie.com/ashwagandha',
    'https://paratunisie.com/omega-3',
    'https://paratunisie.com/magnesium',
    'https://paratunisie.com/vitamines',
    'https://paratunisie.com/gainers-proteines',
    'https://paratunisie.com/conseils/meilleure-creatine-tunisie',
    'https://paratunisie.com/conseils/whey-protein-tunisie-guide',
    'https://paratunisie.com/conseils/meilleur-pre-workout-tunisie',
    'https://paratunisie.com/conseils/ashwagandha-bienfaits-musculation',
    'https://paratunisie.com/conseils/omega-3-tunisie-guide',
    'https://paratunisie.com/conseils/magnesium-bisglycinate-bienfaits',
    'https://paratunisie.com/conseils/vitamine-d3-k2-tunisie',
    'https://paratunisie.com/conseils/meilleur-gainer-tunisie'
]

print("=== SPRINT 2 COMPREHENSIVE LIVE AUDIT ===\n")
all_passed = True

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            status = resp.status
            html = resp.read().decode('utf-8', errors='ignore')
            title = re.search(r'<title>(.*?)</title>', html)
            h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html)
            canonical = re.search(r'<link rel="canonical" href="([^"]*)"', html)
            robots = re.search(r'<meta name="robots" content="([^"]*)"', html)
            
            t_str = title.group(1) if title else "MISSING"
            h_str = h1.group(1) if h1 else "MISSING"
            c_str = canonical.group(1) if canonical else "MISSING"
            r_str = robots.group(1) if robots else "MISSING"
            
            print(f"[{status}] {url}")
            print(f"    Title:     {t_str}")
            print(f"    H1:        {h_str}")
            print(f"    Canonical: {c_str}")
            print(f"    Robots:    {r_str}")
            print()
            
            if status != 200 or t_str == "MISSING" or c_str == "MISSING":
                all_passed = False
    except Exception as e:
        print(f"[FAIL] {url} - Error: {e}\n")
        all_passed = False

if all_passed:
    print(">>> ALL AUDITED URLS RETURNED HTTP 200 WITH VALID SEO TAGS & CANONICALS! <<<")
