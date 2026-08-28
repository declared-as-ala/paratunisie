import re
import os

with open('src/components/layout/navigation/mega-menu.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

images = re.findall(r'image:\s*"([^"]+)"', content)
print(f"Total images in mega-menu: {len(images)}")
missing = []
for img in images:
    path = img.lstrip('/')
    if not os.path.exists(f'public/{path}'):
        missing.append(img)
        print(f"  [MISSING] {img}")
    else:
        print(f"  [OK] {img}")

print(f"Total missing images: {len(missing)}")
