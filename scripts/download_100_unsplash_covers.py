# -*- coding: utf-8 -*-
import os
import json
import urllib.request
import concurrent.futures
from io import BytesIO
from PIL import Image

OUT_DIR = "public/assets/blog"
os.makedirs(OUT_DIR, exist_ok=True)

with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
    manifest = json.load(f)

def process_image(item):
    slug = item["slug"]
    url = item["unsplash_url"]
    out_path = os.path.join(OUT_DIR, f"{slug}.webp")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            raw = r.read()
        img = Image.open(BytesIO(raw)).convert("RGB")
        # Ensure exact 16:9 1200x675
        if img.size != (1200, 675):
            img = img.resize((1200, 675), Image.Resampling.LANCZOS)
        img.save(out_path, "WEBP", quality=82, method=6)
        size_kb = round(os.path.getsize(out_path) / 1024, 1)
        return {
            "id": item["id"],
            "slug": slug,
            "unsplash_photo_id": item["unsplash_photo_id"],
            "source_url": f"https://unsplash.com/photos/{item['unsplash_photo_id']}",
            "cdn_url": url,
            "license": "Unsplash License (Free for commercial and editorial use)",
            "local_image_path": f"/assets/blog/{slug}.webp",
            "dimensions": "1200x675 (16:9)",
            "file_size_kb": size_kb,
            "alt_text": item["image_alt"],
            "verification_status": "VERIFIED",
        }
    except Exception as e:
        return {
            "id": item["id"],
            "slug": slug,
            "unsplash_photo_id": item["unsplash_photo_id"],
            "source_url": url,
            "verification_status": f"ERROR: {e}",
        }

print(f"Downloading & optimizing {len(manifest)} 16:9 WebP covers...")
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    results = list(ex.map(process_image, manifest))

ok_count = sum(1 for r in results if r["verification_status"] == "VERIFIED")
err_items = [r for r in results if r["verification_status"] != "VERIFIED"]
print(f"Done! Verified: {ok_count}/{len(manifest)}, Errors: {len(err_items)}")
if err_items:
    for e in err_items[:5]:
        print("  ERR:", e)

with open("scripts/image_source_manifest.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
