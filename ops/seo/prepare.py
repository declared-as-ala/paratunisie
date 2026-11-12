"""Build a reviewable, guarded SEO patch from a catalogue export. Never connects to DB."""
import collections
import copy
import html
from html.parser import HTMLParser
import json
import re
import sys
from pathlib import Path

ORIGIN = 'https://paratunisie.com'
SOURCE = Path(sys.argv[1] if len(sys.argv) > 1 else 'scratch/seo/before.json')
OUTPUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'scratch/seo')
OUTPUT.mkdir(parents=True, exist_ok=True)
original = json.loads(SOURCE.read_text(encoding='utf-8'))
data = copy.deepcopy(original)
copybook = json.loads(Path(__file__).with_name('category-copy.json').read_text(encoding='utf-8'))
copybook.setdefault('mass-gainer', copybook['gainers-proteines'])
product_copy = json.loads(Path(__file__).with_name('product-copy.json').read_text(encoding='utf-8'))
patches, manual = [], []

def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value or ''))).strip()

def missing(value):
    return value is None or value == '' or value == '[]'

class ReadableHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in ['script', 'style']:
            self.hidden += 1
        if self.hidden:
            return
        if tag in ['h1', 'h2', 'h3', 'h4']:
            self.parts.append('\n\n' + ('## ' if tag in ['h1', 'h2'] else '### '))
        elif tag == 'li':
            self.parts.append('\n- ')
        elif tag in ['p', 'div', 'br', 'tr']:
            self.parts.append('\n')
        elif tag in ['td', 'th']:
            self.parts.append(' | ')
    def handle_endtag(self, tag):
        if tag in ['script', 'style']:
            self.hidden = max(0, self.hidden - 1)
        if not self.hidden and tag in ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'tr']:
            self.parts.append('\n')
    def handle_data(self, value):
        if not self.hidden:
            self.parts.append(value)

def readable(value):
    if not re.search(r'<(?:p|h[1-6]|div|ul|table)\b', value, re.I):
        return value
    parser = ReadableHTML()
    parser.feed(value)
    lines = []
    for line in ''.join(parser.parts).splitlines():
        line = re.sub(r'\s+', ' ', line).strip()
        # Discard obsolete shop advertising, not product specifications.
        if re.search(r'sobitas|protein\.tn|100\s*%\s*authentique|meilleur prix garanti', line, re.I):
            continue
        if line and line not in ['-', '|', '##', '###']:
            lines.append(line)
    return '\n\n'.join(lines)

def fill(row, values):
    for key, value in values.items():
        if missing(row.get(key)) and value:
            row[key] = value

def descendants(root):
    ids = {root}
    while True:
        expanded = ids | {c['id'] for c in data['categories'] if c['parentId'] in ids}
        if expanded == ids:
            return ids
        ids = expanded

def audit(snapshot):
    result = {}
    for kind in ['products', 'categories', 'brands']:
        rows = snapshot[kind]
        result[kind] = {'total': len(rows)}
        for field in ['description', 'seoTitle', 'seoDescription', 'seoH1', 'seoIntro', 'seoContent', 'seoKeywords', 'canonicalUrl', 'imageAlt', 'ogTitle', 'ogDescription', 'ogImage']:
            result[kind]['missing_' + field] = sum(missing(row.get(field)) for row in rows)
        for field in ['slug', 'seoTitle', 'seoDescription', 'description']:
            counts = collections.Counter(plain(row.get(field)).lower() for row in rows if plain(row.get(field)))
            result[kind]['duplicate_' + field] = sum(n - 1 for n in counts.values() if n > 1)
    result['products']['thin_description_under_60_words'] = sum(len(plain(p['description']).split()) < 60 for p in snapshot['products'])
    result['products']['missing_category'] = sum(not p.get('categoryId') for p in snapshot['products'])
    result['products']['missing_brand'] = sum(not p.get('brandId') for p in snapshot['products'])
    result['products']['unconfirmed_brand'] = sum(p.get('brandId', '').endswith('unknown') for p in snapshot['products'])
    result['products']['legacy_store_mentions'] = sum(bool(re.search(r'sobitas|protein\.tn', p['description'], re.I)) for p in snapshot['products'])
    result['products']['missing_real_image'] = sum(not p.get('image') or p['image'].startswith('/assets/product-') for p in snapshot['products'])
    return result

# Rename existing records without replacing IDs or changing product relations.
renames = {'proteine-whey': 'whey-proteine', 'equipements-et-accessoires-sportifs': 'accessoires'}
redirects = []
brand_slugs = {brand['slug'] for brand in data['brands']}
for brand in data['brands']:
    old = brand['slug']
    source_suffix = '-' + brand['id'].rsplit('-', 1)[-1]
    clean = old[:-len(source_suffix)] if brand['id'].startswith('sobitas-brand-') and old.endswith(source_suffix) else old
    if clean != old and clean not in brand_slugs:
        brand['slug'] = clean
        brand_slugs.add(clean)
        redirects.append({'oldPath': '/marques/' + old, 'newPath': '/marques/' + clean})
brand_by_id = {brand['id']: brand for brand in data['brands']}
for product in data['products']:
    product['brand'] = brand_by_id[product['brandId']]
gainer_path = '/mass-gainer' if any(c['slug'] == 'mass-gainer' for c in data['categories']) else '/gainers-proteines'
for old, new in {'/gainers': gainer_path, '/bcaa-acides-amines': '/acides-amines', '/marques/biotechusa': '/marques/biotech-usa'}.items():
    redirects.append({'oldPath': old, 'newPath': new})
for old, new in {
    'anabolic-whey-80-2-25kg-proactive': 'anabolic-whey-80-proactive-2-25kg',
    'micronised-creatine-optimum-nutrition-317g': 'micronized-creatine-powder-317g',
    'citruargin-300-g-real-pharm': 'citruargin-300-g',
}.items():
    if any(product['slug'] == new for product in data['products']):
        redirects.append({'oldPath': '/produits/' + old, 'newPath': '/produits/' + new})
for category in data['categories']:
    old = category['slug']
    if old in renames:
        category['slug'] = renames[old]
        redirects.append({'oldPath': '/' + old, 'newPath': '/' + category['slug']})

# Real parent collections aggregate existing products; no duplicate products.
new_categories = [
    {'id': 'paratunisie-category-nutrition', 'slug': 'nutrition-sportive', 'name': 'Nutrition sportive', 'parentId': None},
    {'id': 'paratunisie-category-gainers', 'slug': 'gainers-proteines', 'name': 'Gainers', 'parentId': 'sobitas-category-3'},
]
existing_ids = {c['id'] for c in data['categories']}
for category in new_categories:
    if category['id'] not in existing_ids:
        data['categories'].append({**category, 'indexable': True, 'status': 'ACTIVE'})
for category in data['categories']:
    if category['id'] in ['sobitas-category-1', 'sobitas-category-2', 'sobitas-category-3', 'sobitas-category-4', 'sobitas-category-5'] and category['parentId'] is None:
        category['parentId'] = 'paratunisie-category-nutrition'
    if category['slug'] in ['gainers-haute-energie', 'gainers-riches-en-proteines'] and category['parentId'] == 'sobitas-category-3':
        category['parentId'] = 'paratunisie-category-gainers'

for category in data['categories']:
    slug = category['slug']
    name, intro, heading, guide = copybook[slug]
    members = [p for p in data['products'] if p['categoryId'] in descendants(category['id']) and p['publishState'] == 'PUBLISHED']
    if not members:
        manual.append({'type': 'empty_category', 'slug': slug, 'reason': 'No published product in this category or its descendants; no products fabricated.'})
    content = f'## {heading}\n\n{guide}'
    names = list(dict.fromkeys(plain(p['name']) for p in members))[:3]
    if names:
        content += '\n\n## Repères dans cette sélection\n\n' + '\n'.join('- ' + n for n in names)
        content += '\n\n' + ' · '.join(f'[{plain(p["name"])}](/produits/{p["slug"]})' for p in members[:3])
        related_brands = {p['brand']['slug']: p['brand']['name'] for p in members}
        content += '\n\n### Marques présentes\n\n' + ' · '.join(f'[{name}](/marques/{slug})' for slug, name in list(related_brands.items())[:5])
    related = [c for c in data['categories'] if c['id'] != category['id'] and (c['parentId'] == category['id'] or (category['parentId'] and c['parentId'] == category['parentId']))]
    related = [c for c in related if any(p['categoryId'] in descendants(c['id']) for p in data['products'])][:5]
    if related:
        content += '\n\n### Catégories à comparer\n\n' + ' · '.join(f'[{copybook[c["slug"]][0]}](/{c["slug"]})' for c in related)
    if slug == 'whey-proteine':
        content += '\n\n## Questions fréquentes\n\n### Comment comparer le prix de deux whey ?\n\nComparez le prix au kilogramme, puis les protéines indiquées pour 100 g. Deux pots de poids différents ou deux portions de tailles différentes ne se comparent pas directement.\n\n### Où trouver les isolats de whey ?\n\nLa catégorie [Isolat de whey](/isolat-de-whey) regroupe ces références. Vérifiez néanmoins la composition de chaque produit, notamment les allergènes et les indications concernant le lactose.\n\n### Quelle portion de whey choisir ?\n\nSuivez les indications de la référence et tenez compte de votre alimentation. Cette page ne propose pas de dose universelle ; un professionnel de santé peut vous aider à évaluer vos besoins.'
    if slug == 'accessoires':
        content += '\n\n## Questions fréquentes\n\n### Comment choisir la taille d’un accessoire ?\n\nUtilisez les mesures indiquées sur la fiche ou le guide de taille de la marque. Les tailles peuvent varier entre fabricants.\n\n### Comment connaître les pièces fournies ?\n\nConsultez le contenu de l’emballage indiqué pour la référence. Une pièce visible sur une photo de présentation n’est pas nécessairement incluse.'
    fill(category, {
        'seoTitle': f'{name} Tunisie : formats et prix | ParaTunisie',
        'seoDescription': f'{name} en Tunisie : comparez les références, formats et prix sur ParaTunisie. Consultez les fiches pour choisir selon les caractéristiques disponibles.',
        'seoH1': f'{name} Tunisie', 'seoIntro': intro, 'seoContent': content,
        'description': intro,
        'seoKeywords': json.dumps([f'{name.lower()} tunisie', f'prix {name.lower()} tunisie', f'acheter {name.lower()}', f'{name.lower()} en ligne'], ensure_ascii=False),
        'canonicalUrl': f'{ORIGIN}/{slug}', 'imageAlt': name,
        'ogImage': category.get('heroImage') or category.get('image') or (members[0].get('image') if members else None) or '/assets/logo.png',
    })
    fill(category, {'ogTitle': category['seoTitle'], 'ogDescription': category['seoDescription']})

category_by_id = {c['id']: c for c in data['categories']}
for product in data['products']:
    name = plain(product['name'])
    brand = plain(product['brand']['name'])
    category = category_by_id[product['categoryId']]
    if product['brandId'].endswith('unknown'):
        manual.append({'type': 'unconfirmed_brand', 'slug': product['slug'], 'reason': 'Source catalogue does not identify a manufacturer; a brand was not invented.'})
    if product['categoryId'].endswith('unknown'):
        manual.append({'type': 'unclassified_bundle', 'slug': product['slug'], 'reason': 'Bundle remains in the general collection until its exact contents and classification are confirmed.'})
    if not product.get('image') or product['image'].startswith('/assets/product-'):
        product['image'] = '/assets/product-unavailable.svg'
        manual.append({'type': 'missing_image', 'slug': product['slug'], 'reason': 'Catalogue has no real photograph; a clearly labelled placeholder is used.'})
    product['description'] = readable(product['description'])
    if product['slug'] in product_copy and len(plain(product['description']).split()) < 60:
        product['description'] = product_copy[product['slug']]
        manual.append({'type': 'equipment_specifications', 'slug': product['slug'], 'reason': 'Description clarified; exact model, dimensions, load limits and included components still require manufacturer confirmation.'})
    format_pattern = r'\b\d+(?:[.,]\d+)?\s*(?:kg|gr|g|ml|litres?|capsules?|caps|tabs|tablets|comprimés|gélules|gelules|doses|servings)\b'
    labels = [name, *(v.get('label') or '' for v in product['variants'])]
    formats = list(dict.fromkeys(match.group(0) for label in labels for match in re.finditer(format_pattern, label, re.I)))
    # Catalogue facts only. Do not infer ingredients, effects, dosage or certification.
    intro = f'{name} est proposé dans la sélection {copybook[category["slug"]][0].lower()} de ParaTunisie.'
    if brand and 'inconn' not in brand.lower():
        intro += f' Retrouvez cette référence {brand} et ses informations de commande sur cette fiche.'
    paragraphs = [plain(line) for line in product['description'].split('\n') if not line.startswith(('#', '-')) and len(plain(line)) >= 70]
    if paragraphs:
        source_intro = paragraphs[0]
        sentences = re.split(r'(?<=[.!?])\s+', source_intro)
        intro = ' '.join(sentences[:2])
        if len(intro) > 420:
            intro = intro[:417].rsplit(' ', 1)[0] + '…'
    if not product.get('seoIsCustom') and 'seoTitle' not in product.get('manualOverrides', '') and not re.search(r'tunisie', product.get('seoTitle') or '', re.I):
        product['seoTitle'] = (product.get('seoTitle') or name).rstrip(' |') + ' Tunisie | ParaTunisie'
    details = f'## Référence\n\n{name}\n\n## Marque\n\n{brand}\n\n## Famille du catalogue\n\n{copybook[category["slug"]][0]}'
    if formats:
        details += '\n\n## Présentation disponible\n\n' + ', '.join(formats)
    details += f'\n\nComparez les [produits {brand}](/marques/{product["brand"]["slug"]}) ou parcourez la catégorie [{copybook[category["slug"]][0]}](/{category["slug"]}).'
    fill(product, {
        'seoH1': name, 'seoIntro': intro, 'seoContent': details,
        'canonicalUrl': f'{ORIGIN}/produits/{product["slug"]}',
        'seoKeywords': json.dumps([f'{name} Tunisie', f'{name} prix', f'{brand} Tunisie', f'{copybook[category["slug"]][0]} Tunisie'], ensure_ascii=False),
        'ogTitle': product.get('seoTitle') or name,
        'ogDescription': product.get('seoDescription') or intro,
        'ogImage': product.get('image') or (product['images'][0]['url'] if product['images'] else None),
        'imageAlt': name,
    })
    for image in product['images']:
        fill(image, {'alt': name})
    if len(plain(product['description']).split()) < 60:
        manual.append({'type': 'thin_product_copy', 'slug': product['slug'], 'reason': 'Manufacturer information required for substantive enrichment; only existing catalogue facts added.'})
    if re.search(r'sobitas|protein\.tn', product['description'], re.I):
        manual.append({'type': 'legacy_copy', 'slug': product['slug'], 'reason': 'Imported description references another shop. Review attribution and factual claims before rewriting.'})
    if not product.get('image') and not product['images']:
        manual.append({'type': 'missing_image', 'slug': product['slug'], 'reason': 'Real product photograph required; no synthetic replacement.'})

for brand in data['brands']:
    name = plain(brand['name'])
    if brand['id'].endswith('unknown'):
        brand['indexable'] = False
    members = [p for p in data['products'] if p['brandId'] == brand['id']]
    families = list(dict.fromkeys(copybook[category_by_id[p['categoryId']]['slug']][0].lower() for p in members))
    intro = f'Retrouvez les références {name} proposées sur ParaTunisie et comparez les formats et les prix affichés en dinars tunisiens.'
    content = f'## La sélection {name}\n\n' + (f'Les familles représentées dans le catalogue sont : {", ".join(families)}.' if families else 'Aucune référence de cette marque n’est actuellement proposée.')
    content += '\n\n' + '\n'.join('- ' + plain(p['name']) for p in members[:4])
    fill(brand, {'description': intro, 'seoTitle': f'{name} Tunisie : produits et prix | ParaTunisie', 'seoDescription': intro, 'seoH1': f'{name} Tunisie', 'seoIntro': intro, 'seoContent': content, 'seoKeywords': json.dumps([f'{name} Tunisie', f'prix {name} Tunisie', *families[:3]], ensure_ascii=False), 'canonicalUrl': f'{ORIGIN}/marques/{brand["slug"]}', 'imageAlt': f'Logo {name}', 'ogImage': brand.get('image') or (members[0].get('image') if members else None) or '/assets/logo.png'})
    fill(brand, {'ogTitle': brand['seoTitle'], 'ogDescription': brand['seoDescription']})

for kind, model in [('categories', 'category'), ('products', 'product'), ('brands', 'brand')]:
    before = {row['id']: row for row in original[kind]}
    for row in data[kind]:
        old = before.get(row['id'])
        if old is None:
            patches.append({'model': model, 'id': row['id'], 'create': row})
        else:
            change = {key: value for key, value in row.items() if key not in ['brand', 'category', 'images', 'variants'] and old.get(key) != value}
            if change:
                patches.append({'model': model, 'id': row['id'], 'before': {key: old.get(key) for key in change}, 'data': change})
            if model == 'product':
                images = {image['id']: image for image in old['images']}
                for image in row['images']:
                    if image != images[image['id']]:
                        patches.append({'model': 'productImage', 'id': image['id'], 'before': {'alt': images[image['id']].get('alt')}, 'data': {'alt': image['alt']}})

article_source = SOURCE.parent / 'static-articles.json'
if article_source.exists():
    existing_articles = {article['slug'] for article in original['articles']}
    product_slugs = {product['slug']: product['id'] for product in data['products']}
    for article in json.loads(article_source.read_text(encoding='utf8')):
        if article['slug'] in existing_articles:
            continue
        blocks = []
        for section in article['sections']:
            blocks.append({'type': 'heading', 'text': section['title']})
            blocks.extend({'type': 'paragraph', 'text': paragraph} for paragraph in section['content'])
            for subsection in section.get('subsections', []):
                blocks.append({'type': 'heading', 'text': subsection['title']})
                blocks.extend({'type': 'paragraph', 'text': paragraph} for paragraph in subsection['content'])
        row = {key: article[key] for key in ['slug', 'title', 'excerpt', 'category', 'readTime', 'date', 'status', 'authorName', 'featuredImage', 'seoTitle', 'indexable']}
        row.update(id='seo-article-' + article['slug'], content=json.dumps(blocks, ensure_ascii=False), metaDescription=article['seoDescription'], canonicalUrl=ORIGIN + '/conseils/' + article['slug'], ogTitle=article['seoTitle'], ogDescription=article['seoDescription'], ogImage=article['featuredImage'], targetKeyword=', '.join([article['focusKeyword'], *article['secondaryKeywords']]), publishedAt=article['date'] + 'T00:00:00.000Z', updatedAt=article['updatedAt'] + ('T00:00:00.000Z' if len(article['updatedAt']) == 10 else ''))
        row['faqs'] = {'create': [{'question': faq['question'], 'answer': faq['answer'], 'position': i} for i, faq in enumerate(article.get('faqs', []))]}
        row['products'] = {'create': [{'productId': product_slugs[item['productSlug']], 'rationale': item.get('rationale'), 'position': i} for i, item in enumerate(article.get('products', [])) if item.get('productSlug') in product_slugs]}
        patches.append({'model': 'article', 'id': row['id'], 'create': row})
        manual.append({'type': 'inherited_editorial_review', 'slug': article['slug'], 'reason': 'Existing public guide moved into the editor; health claims and cited sources require editorial/clinical review. No new medical claims written.'})

description_groups = {}
for product in data['products']:
    description_groups.setdefault(plain(product.get('description') or ''), []).append(product['slug'])
for description, slugs in description_groups.items():
    if description and len(slugs) > 1:
        manual.append({'type': 'possible_duplicate_product_identity', 'slugs': slugs, 'reason': 'Removing obsolete shop advertising revealed identical source descriptions. Confirm manufacturer/model identity before merging records or assigning a shared canonical; do not invent differences.'})

for name, value in [('manifest.json', {'version': 1, 'patches': patches, 'redirects': redirects}), ('audit-before.json', audit(original)), ('audit-proposed.json', audit(data)), ('manual-review.json', manual)]:
    (OUTPUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'patches': len(patches), 'manualReview': len(manual), 'output': str(OUTPUT)}))
