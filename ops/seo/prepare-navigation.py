"""Generate guarded changes from a fresh export. Never connects to production."""
import copy
import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'scratch/navigation')
source = json.loads((root / 'before.json').read_text(encoding='utf8'))
data = copy.deepcopy(source)
origin = 'https://paratunisie.com'
old_path, new_path = '/gainers-proteines', '/mass-gainer'
category = next(c for c in data['categories'] if c['id'] == 'paratunisie-category-gainers')
category.update(slug='mass-gainer', name='Mass Gainer')
whey = next(c for c in data['categories'] if c['slug'] == 'whey-proteine')
for child in data['categories']:
    if child['slug'] in ['isolat-de-whey', 'whey-hydrolysee']:
        child['parentId'] = whey['id']
for product in data['products']:
    if 'whey' in product['name'].lower() and product['category']['slug'] == 'proteines-completes':
        product['categoryId'] = whey['id']
redirects = []
existing = {r['oldPath']: r for r in source['redirects']}
for path in [old_path, '/gainers']:
    previous = existing.get(path)
    if not previous or previous['newPath'] != new_path:
        redirects.append({'oldPath': path, 'newPath': new_path, **({'beforeNewPath': previous['newPath']} if previous else {})})
for kind in ['products', 'categories', 'brands', 'articles']:
    for row in data[kind]:
        for key, value in list(row.items()):
            if isinstance(value, str) and key not in ['id', 'slug']:
                row[key] = value.replace(old_path, new_path)

def fit(value, limit=160):
    value = re.sub(r'<[^>]+>', ' ', value)
    value = re.sub(r'\s+', ' ', value).strip()
    if len(value) <= limit: return value
    return value[:limit-1].rsplit(' ', 1)[0].rstrip(' ,;:-') + '…'

for row in data['products'] + data['categories']:
    if not row.get('seoIsCustom'):
        meta = row.get('seoDescription') or ''
        if len(meta) < 120 or re.search(r'sobitas|protein\.tn', meta, re.I):
            row['seoDescription'] = fit(f"{row['name']} : consultez le prix en Tunisie sur ParaTunisie. Comparez les informations disponibles et le format avant de commander en ligne.")
        elif len(meta) > 170:
            row['seoDescription'] = fit(meta)
        if len(row.get('seoTitle') or '') > 80:
            row['seoTitle'] = fit(row['seoTitle'].replace(' | ParaTunisie', ''), 78)
        row['ogTitle'] = row['seoTitle']
        row['ogDescription'] = row['seoDescription']

intro_fixes = {
    'glutamine-500g-real-pharm': 'Glutamine 500g est une référence Real Pharm proposée en poudre. Consultez les informations de composition et de préparation indiquées pour ce format avant de commander.',
    'multivitamin-for-men-60-tablets-biotech-usa': 'Multivitamin for Men de BioTechUSA est présenté en boîte de 60 comprimés. Comparez les informations de cette formule et consultez les ingrédients ainsi que les indications figurant sur son emballage.',
}
real_pharm = next(b for b in data['brands'] if b['slug'] == 'real-pharm')
category_extras = json.loads(Path('ops/seo/category-navigation-enrichment.json').read_text(encoding='utf8'))
for category_row in data['categories']:
    if len(category_row.get('imageAlt') or '') < 5:
        category_row['imageAlt'] = 'Sélection de produits ' + category_row['name']
    extra = category_extras.get(category_row['slug'])
    if extra and extra not in (category_row.get('seoContent') or ''):
        category_row['seoContent'] = (category_row.get('seoContent') or '') + '\n\n' + extra
for product in data['products']:
    if product['slug'] in intro_fixes:
        product['seoIntro'] = intro_fixes[product['slug']]
    if product['slug'] in ['glutamine-500g-real-pharm', 'zma-120-caps', 'real-hydro-100-1-8kg'] and 'unknown' in product['brandId']:
        # The existing product name or opening heading explicitly names Real Pharm.
        product['brandId'] = real_pharm['id']
        product['seoContent'] = re.sub(r'Marque non renseign[eé]e', real_pharm['name'], product.get('seoContent') or '', flags=re.I)
        product['seoKeywords'] = product['seoKeywords'].replace('Marque non renseignee', real_pharm['name'])
        product['seoContent'] = product['seoContent'].replace('/marques/' + product['brand']['slug'], '/marques/' + real_pharm['slug'])

settings = {
    'mass-gainer': {
        'title': 'Mass Gainer Tunisie : prix et prise de masse | ParaTunisie',
        'meta': 'Mass Gainer en Tunisie : comparez les prix, formats et compositions pour votre prise de masse. Retrouvez les gainers disponibles sur ParaTunisie.',
        'h1': 'Mass Gainer Tunisie',
        'intro': 'Comparez les mass gainers disponibles en Tunisie sur ParaTunisie, avec leurs prix en dinars et leurs formats. Ces préparations associent généralement des glucides et des protéines ; leur composition et la taille des portions varient selon les références. Pour choisir, regardez les valeurs nutritionnelles déclarées, les ingrédients, les allergènes et le poids net. Le prix au kilogramme aide à comparer les budgets à quantité égale. Consultez chaque fiche pour connaître la disponibilité et les informations du fabricant. Un gainer se choisit en fonction de votre alimentation et de votre objectif, sans promesse de résultat automatique.',
        'keywords': ['mass gainer tunisie', 'gainer tunisie', 'mass gainer prix tunisie', 'weight gainer tunisie', 'prise de masse tunisie', 'acheter mass gainer tunisie'],
    },
    'whey-proteine': {
        'title': 'Whey Protéine Tunisie : formats et prix | ParaTunisie',
        'meta': 'Whey protéine en Tunisie : comparez les prix, formats et compositions sur ParaTunisie. Découvrez les références disponibles et choisissez votre whey.',
        'h1': 'Whey Protéine Tunisie',
        'intro': 'Retrouvez les whey protéines disponibles en Tunisie et comparez leurs prix, formats et compositions. Pour choisir une whey, vérifiez la teneur en protéines, les ingrédients et les allergènes indiqués sur chaque référence. Les produits et leur disponibilité sont présentés ci-dessous, suivis d’un guide pour comparer les formules.',
        'keywords': ['whey protéine tunisie', 'whey tunisie', 'whey protein tunisie', 'protéine tunisie', 'whey prix tunisie', 'acheter whey tunisie', 'whey isolate tunisie'],
    },
}
by_id = {c['id']: c for c in data['categories']}
def descendants(id):
    ids = {id}
    while True:
        more = ids | {c['id'] for c in data['categories'] if c.get('parentId') in ids}
        if more == ids: return ids
        ids = more

for slug, settings in settings.items():
    row = next(c for c in data['categories'] if c['slug'] == slug)
    members = sorted((p for p in data['products'] if p['categoryId'] in descendants(row['id'])), key=lambda p: p['id'])
    brand_ids = list(dict.fromkeys(p['brandId'] for p in members))[:5]
    brands = sorted((b for b in data['brands'] if b['id'] in brand_ids and 'unknown' not in b['id']), key=lambda b: b['id'])
    guides = sorted((a for a in data['articles'] if ('gainer' if slug == 'mass-gainer' else 'whey') in a['slug']), key=lambda a: a['slug'])[:3]
    related = '\n\n## Références à comparer\n\n' + '\n'.join(f"- [{p['name']}](/produits/{p['slug']})" for p in members[:3])
    related += '\n\n## Marques disponibles\n\n' + ' · '.join(f"[{b['name']}](/marques/{b['slug']})" for b in brands)
    if guides: related += '\n\n## Guides associés\n\n' + '\n'.join(f"- [{a['title']}](/conseils/{a['slug']})" for a in guides)
    content = (Path('ops/seo') / f'{slug}.md').read_text(encoding='utf8')
    content = content.replace('\n## Questions fréquentes', related + '\n\n## Questions fréquentes')
    row.update(seoTitle=settings['title'], seoDescription=settings['meta'], seoH1=settings['h1'], seoIntro=settings['intro'], seoContent=content, seoKeywords=json.dumps(settings['keywords'], ensure_ascii=False), canonicalUrl=origin+'/'+slug, ogTitle=settings['title'], ogDescription=settings['meta'], ogImage=members[0]['image'], indexable=True, followLinks=True)

# Every gainer member links to the canonical collection even when assigned to a child.
ids = descendants(category['id'])
for p in data['products']:
    if p['categoryId'] in ids and '](/mass-gainer)' not in (p.get('seoContent') or ''):
        p['seoContent'] = (p.get('seoContent') or '') + '\n\nComparez les autres formats dans la collection [Mass Gainer Tunisie](/mass-gainer).'
whey_ids = descendants(whey['id'])
for p in data['products']:
    if p['categoryId'] in whey_ids and '](/whey-proteine)' not in (p.get('seoContent') or ''):
        p['seoContent'] = (p.get('seoContent') or '') + '\n\nRetrouvez cette famille dans la sélection [Whey Protéine Tunisie](/whey-proteine).'

patches = []
for kind, model in [('products', 'product'), ('categories', 'category'), ('brands', 'brand'), ('articles', 'article')]:
    before = {r['id']: r for r in source[kind]}
    for row in data[kind]:
        original = before[row['id']]
        changes = {k:v for k,v in row.items() if k not in ['category','brand','variants','images'] and v != original.get(k)}
        if changes: patches.append({'model':model,'id':row['id'],'before':{k:original.get(k) for k in changes},'data':changes})
(root/'manifest.json').write_text(json.dumps({'version':1,'patches':patches,'redirects':redirects},ensure_ascii=False,indent=2),encoding='utf8')
(root/'proposed.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'patches':len(patches),'redirects':len(redirects),'gainerProducts':sum(p['categoryId'] in ids for p in data['products']), 'wheyProducts':sum(p['categoryId'] in whey_ids for p in data['products'])}))
