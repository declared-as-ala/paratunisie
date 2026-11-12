# -*- coding: utf-8 -*-
"""
Generate 100 Unique 1200x630 WebP Cover Images for all 100 SEO Articles,
and deploy them to the production Next.js container on VPS.
"""

import os
import json
import tarfile
import tempfile
from PIL import Image, ImageDraw, ImageFont
import paramiko

VPS_HOST = "187.53.136.225"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

CATEGORY_PALETTES = {
    "whey": ((245, 158, 11), (180, 83, 9), "WHEY & ISOLATE"),
    "creatine": ((16, 185, 129), (6, 95, 70), "CRÉATINE & FORCE"),
    "gainer": ((234, 88, 12), (154, 52, 18), "MASS GAINER & VOLUME"),
    "vitamine": ((6, 182, 212), (14, 116, 144), "VITAMINES & MINÉRAUX"),
    "mineraux": ((6, 182, 212), (14, 116, 144), "SANTÉ & MINÉRAUX"),
    "sommeil": ((99, 102, 241), (49, 46, 129), "SOMMEIL & STRESS"),
    "stress": ((99, 102, 241), (49, 46, 129), "BIEN-ÊTRE & RÉCUPÉRATION"),
    "ashwagandha": ((132, 204, 22), (77, 124, 15), "PLANTES ADAPTOGÈNES"),
    "performance": ((239, 68, 68), (153, 27, 27), "PRE-WORKOUT & PUMP"),
    "pre-workout": ((239, 68, 68), (153, 27, 27), "BOOSTER & ÉNERGIE"),
    "carnitine": ((244, 63, 94), (136, 19, 55), "L-CARNITINE & MINCEUR"),
    "bruleurs": ((244, 63, 94), (136, 19, 55), "SÈCHE & THERMOGENÈSE"),
    "guides": ((20, 184, 166), (15, 118, 110), "GUIDE D'ACHAT & CONSEIL"),
    "default": ((59, 130, 246), (30, 58, 138), "GUIDE PARATUNISIE")
}

def get_palette_for_article(article):
    slug = article["slug"].lower()
    cat = article["cat_slug"].lower()
    
    for key, val in CATEGORY_PALETTES.items():
        if key in slug or key in cat:
            return val
    return CATEGORY_PALETTES["default"]

def create_banner(slug, tag, title, subtitle, color1, color2, out_dir):
    width, height = 1200, 630
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Deep Slate Dark Background
    draw = ImageDraw.Draw(img)

    # Ambient radial gradient glow
    for r in range(450, 0, -5):
        factor = 1 - r / 450
        c = (
            int(color1[0] * factor * 0.45 + 15 * (1 - factor * 0.45)),
            int(color1[1] * factor * 0.45 + 23 * (1 - factor * 0.45)),
            int(color1[2] * factor * 0.45 + 42 * (1 - factor * 0.45))
        )
        draw.ellipse([880 - r, 315 - r, 880 + r, 315 + r], fill=c)

    # Accent decorative bar
    draw.rectangle([80, 80, 86, 135], fill=color1)

    # Fonts
    try:
        font_tag = ImageFont.truetype("arialbd.ttf", 24)
        font_title = ImageFont.truetype("arialbd.ttf", 46)
        font_subtitle = ImageFont.truetype("arial.ttf", 26)
        font_brand = ImageFont.truetype("arialbd.ttf", 28)
        font_meta = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        font_tag = font_title = font_subtitle = font_brand = font_meta = ImageFont.load_default()

    # Draw Category Tag
    draw.text((105, 93), tag.upper(), fill=color1, font=font_tag)

    # Word wrapping for Title
    words = title.split(" ")
    lines = []
    curr = []
    for w in words:
        curr.append(w)
        if len(" ".join(curr)) > 30:
            lines.append(" ".join(curr[:-1]))
            curr = [w]
    if curr:
        lines.append(" ".join(curr))

    y = 175
    for line in lines[:2]:
        draw.text((80, y), line, fill=(248, 250, 252), font=font_title)
        y += 62

    # Draw Subtitle / Excerpt preview
    y += 18
    # Wrap subtitle if needed
    sub_words = subtitle.split(" ")
    sub_line = []
    for sw in sub_words:
        sub_line.append(sw)
        if len(" ".join(sub_line)) > 55:
            break
    draw.text((80, y), " ".join(sub_line) + "...", fill=(148, 163, 184), font=font_subtitle)

    # Draw Bottom Badge / Branding
    draw.line([80, 520, 1120, 520], fill=(30, 41, 59), width=2)
    draw.text((80, 545), "PARATUNISIE", fill=(16, 185, 129), font=font_brand)
    draw.text((310, 548), "• Guide & Conseils Nutritionnels", fill=(100, 116, 139), font=font_meta)
    draw.text((940, 548), "paratunisie.com", fill=(148, 163, 184), font=font_meta)

    out_path = os.path.join(out_dir, f"{slug}.webp")
    img.save(out_path, "WEBP", quality=90)
    return out_path

def main():
    json_path = os.path.join(os.path.dirname(__file__), "compiled_100_articles.json")
    with open(json_path, "r", encoding="utf-8") as f:
        articles = json.load(f)

    local_blog_dir = "public/assets/blog"
    os.makedirs(local_blog_dir, exist_ok=True)

    print(f"Generating 100 banners into {local_blog_dir}...")
    generated_files = []
    for art in articles:
        slug = art["slug"]
        title = art["title"]
        subtitle = art["excerpt"]
        c1, c2, tag = get_palette_for_article(art)
        path = create_banner(slug, tag, title, subtitle, c1, c2, local_blog_dir)
        generated_files.append(path)

    print(f"Generated all {len(generated_files)} images locally.")

    # Upload to VPS via tar stream to docker container
    print("Connecting to VPS to upload images to paratunisie-web container...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

    # Create temporary tar archive
    tar_tmp = os.path.join(tempfile.gettempdir(), "blog_100_images.tar")
    with tarfile.open(tar_tmp, "w") as tar:
        for fpath in generated_files:
            arcname = os.path.basename(fpath)
            tar.add(fpath, arcname=arcname)
    print(f"Created tar archive: {tar_tmp} ({os.path.getsize(tar_tmp)} bytes)")

    # Upload tar to VPS /tmp
    sftp = client.open_sftp()
    remote_tar = "/tmp/blog_100_images.tar"
    sftp.put(tar_tmp, remote_tar)
    sftp.close()
    print("Tar uploaded to VPS /tmp.")

    # Extract tar into container public/assets/blog/
    cmd = "docker cp /tmp/blog_100_images.tar paratunisie-web:/tmp/blog_100_images.tar && " \
          "docker exec paratunisie-web sh -c 'tar -xf /tmp/blog_100_images.tar -C public/assets/blog && rm /tmp/blog_100_images.tar' && " \
          "rm /tmp/blog_100_images.tar"
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    if err:
        print("Notice/Err:", err)

    # Check total files in container public/assets/blog
    _, out_count, _ = client.exec_command("docker exec paratunisie-web sh -c 'ls -1 public/assets/blog | wc -l'")
    print("Total images now in paratunisie-web public/assets/blog:", out_count.read().decode('utf-8').strip())

    client.close()
    print("Image generation and deployment to VPS completed successfully.")

if __name__ == "__main__":
    main()
