"""Extract only catalogue rows and referenced local media from a MySQL dump.

Usage: python extract-sobitas.py DUMP.sql OLD_BACKEND OUTPUT_DIRECTORY
No SQL is executed, and customer/order tables are never exported.
"""
import hashlib
import html
import json
import re
import sys
import tarfile
import unicodedata
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


def parse_rows(source, table):
    pattern = re.compile(r"INSERT INTO `" + re.escape(table) + r"`\s*\(([^)]+)\)\s*VALUES\s*")
    rows = []
    for match in pattern.finditer(source):
        columns = re.findall(r"`([^`]+)`", match[1])
        i = match.end()
        while True:
            while source[i].isspace() or source[i] == ',': i += 1
            if source[i] == ';': break
            if source[i] != '(': raise ValueError(f'{table}: expected tuple at {i}')
            i += 1
            values = []
            while True:
                while source[i].isspace(): i += 1
                if source[i] == "'":
                    i += 1
                    chars = []
                    while True:
                        ch = source[i]
                        i += 1
                        if ch == '\\':
                            ch = source[i]
                            i += 1
                            chars.append({'n': '\n', 'r': '\r', 't': '\t', '0': '\0', 'Z': '\x1a'}.get(ch, ch))
                        elif ch == "'":
                            if source[i] == "'": chars.append("'"); i += 1
                            else: break
                        else: chars.append(ch)
                    value = ''.join(chars)
                else:
                    start = i
                    while source[i] not in ',)': i += 1
                    raw = source[start:i].strip()
                    value = None if raw == 'NULL' else float(raw) if any(c in raw.lower() for c in '.e') else int(raw)
                values.append(value)
                while source[i].isspace(): i += 1
                if source[i] == ')': i += 1; break
                if source[i] != ',': raise ValueError(f'{table}: expected comma at {i}')
                i += 1
            if len(values) != len(columns): raise ValueError(f'{table}: column count mismatch')
            rows.append(dict(zip(columns, values)))
    return rows


def slug(value):
    value = unicodedata.normalize('NFKD', value or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', value).strip('-')


def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value or ''))).strip()


def main():
    dump, backend, output = map(Path, sys.argv[1:4])
    output.mkdir(parents=True, exist_ok=True)
    source = dump.read_text(encoding='utf-8-sig')
    tables = {t: parse_rows(source, t) for t in ['products', 'brands', 'categs', 'sous_categories']}
    media = {}
    missing = set()
    storage_roots = [backend / 'storage/app/public', backend / 'public/storage', backend / 'storage2/app/public']

    def image(value):
        if not value: return None
        value = str(value).replace('\\', '/').lstrip('/')
        if value.startswith(('https://', 'http://')): return value
        value = re.sub(r'^(?:storage/)+', '', value)
        for root in storage_roots:
            p = (root / value).resolve()
            if not p.is_relative_to(root.resolve()): continue
            try:
                exists = p.is_file() and p.stat().st_size
            except OSError:
                exists = False
            if exists:
                target = 'public/uploads/sobitas/' + value
                media[target] = p
                return '/uploads/sobitas/' + value
        missing.add(value)
        return None

    brands = []
    brand_map = {}
    brand_names = {}
    for row in tables['brands']:
        name = plain(row['designation_fr']) or 'Marque non renseignee'
        if name.casefold() in brand_names:
            brand_map[row['id']] = brand_names[name.casefold()]
            continue
        item = {'id': f"sobitas-brand-{row['id']}", 'name': name, 'slug': f"{slug(name)}-{row['id']}", 'description': row.get('description_fr'), 'image': image(row.get('logo'))}
        brands.append(item); brand_map[row['id']] = item['id']; brand_names[name.casefold()] = item['id']
    brands.append({'id': 'sobitas-brand-unknown', 'name': 'Marque non renseignee', 'slug': 'sobitas-marque-non-renseignee'})
    categories = []
    category_names = set()
    category_slugs = set()
    for table, prefix in [('categs', 'category'), ('sous_categories', 'subcategory')]:
        for row in tables[table]:
            name = plain(row['designation_fr']) or f"Categorie {row['id']}"
            if name.casefold() in category_names: name += f" ({prefix} {row['id']})"
            category_names.add(name.casefold())
            key = slug(row.get('slug') or name)
            if key in category_slugs: key += f"-{prefix}-{row['id']}"
            category_slugs.add(key)
            categories.append({'id': f"sobitas-{prefix}-{row['id']}", 'name': name, 'slug': key, 'description': row.get('description_fr'), 'image': image(row.get('cover')), 'parentId': f"sobitas-category-{row['categorie_id']}" if table == 'sous_categories' and row.get('categorie_id') else None})
    categories.append({'id': 'sobitas-category-unknown', 'name': 'Autres produits Sobitas', 'slug': 'autres-produits-sobitas', 'parentId': None})
    category_ids = {x['id'] for x in categories}
    for category in categories:
        if category.get('parentId') not in category_ids: category['parentId'] = None
    products = []
    slugs = set()
    for row in tables['products']:
        product_id = f"sobitas-product-{row['id']}"
        name = plain(row['designation_fr']) or f"Produit {row['id']}"
        key = slug(row.get('slug') or name)
        if key in slugs: key += f"-{row['id']}"
        slugs.add(key)
        stock = max(0, int(row.get('qte') or 0))
        price = Decimal(str(row.get('prix') or 0))
        expiry = row.get('promo_expiration_date')
        if row.get('promo') and expiry and expiry > datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'):
            promo = Decimal(str(row['promo']))
            if 0 < promo < price: price = promo
        cover = image(row.get('cover'))
        images = [cover] if cover else []
        try: gallery = json.loads(row.get('gallery') or '[]')
        except (ValueError, TypeError): gallery = []
        if isinstance(gallery, list):
            for entry in gallery:
                if isinstance(entry, str):
                    path = image(entry)
                    if path and path not in images: images.append(path)
        category_id = f"sobitas-subcategory-{row.get('sous_categorie_id')}"
        if category_id not in category_ids: category_id = 'sobitas-category-unknown'
        products.append({'id': product_id, 'slug': key, 'name': name,
            'benefit': plain(row.get('meta_description_fr'))[:300],
            'description': row.get('description_fr') or '', 'usage': '',
            'image': cover or (images[0] if images else '/assets/product-tube.webp'),
            'brandId': brand_map.get(row.get('brand_id'), 'sobitas-brand-unknown'),
            'categoryId': category_id, 'publishState': 'PUBLISHED' if row.get('publier') == 1 else 'DRAFT',
            'inStock': stock > 0, 'totalStock': stock,
            'seoTitle': name, 'seoDescription': plain(row.get('meta_description_fr')) or None,
            'imageAlt': plain(row.get('alt_cover')) or name,
            'variant': {'id': product_id + '-default', 'label': name, 'priceMillimes': int((price * 1000).quantize(Decimal('1'), rounding=ROUND_HALF_UP)), 'sku': row.get('code_product'), 'stock': stock},
            'images': [{'id': product_id + f'-image-{i}', 'url': url, 'alt': name, 'position': i} for i, url in enumerate(images)]})
    result = {'brands': brands, 'categories': categories, 'products': products}
    (output / 'catalogue.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
    with tarfile.open(output / 'media.tgz', 'w:gz', compresslevel=1) as tar:
        for target, path in sorted(media.items()): tar.add(path, arcname=target)
    report = {'sourceSha256': hashlib.sha256(dump.read_bytes()).hexdigest(), 'sourceCounts': {t: len(rows) for t, rows in tables.items()}, 'products': len(products), 'published': sum(x['publishState'] == 'PUBLISHED' for x in products), 'productsWithImages': sum(bool(x['images']) for x in products), 'mediaFiles': len(media), 'mediaBytes': sum(p.stat().st_size for p in media.values()), 'missingMedia': sorted(missing)}
    (output / 'import-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__': main()
