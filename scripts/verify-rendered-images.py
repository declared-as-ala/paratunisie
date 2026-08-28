import urllib.request
import re

ctx = urllib.request.ssl._create_unverified_context()
req = urllib.request.Request('https://paratunisie.com/conseils', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as res:
    html = res.read().decode('utf-8')
    images = re.findall(r'/assets/blog/[a-z0-9\-]+\.webp', html)
    unique_images = list(set(images))
    print(f"Total blog image references found in HTML: {len(images)}")
    print(f"Unique distinct images rendered on /conseils: {len(unique_images)}")
    for img in unique_images[:10]:
        print("  ✓", img)
