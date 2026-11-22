import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryMetadata, buildPageMetadata, buildProductMetadata } from './metadata';
import { buildProductSchema, gtinProperty } from './schema';

describe('social image ownership', () => {
  it('never exposes a third-party og:image and falls back to the product image', () => {
    const metadata = buildPageMetadata({ title: 'X', description: 'Y', path: '/produits/x', image: 'https://paratunisie.com/paratunisie-media/products/x.webp', ogImage: 'https://admin.protein.tn/storage/produits/a.jpg' });
    assert.equal(JSON.stringify(metadata.openGraph), JSON.stringify(metadata.openGraph).replace(/protein\.tn/g, ''));
    assert.match(JSON.stringify(metadata.openGraph), /paratunisie-media\/products\/x\.webp/);
  });
});

describe('catalogue search rendering', () => {
  it('keeps a discoverable page two with its own title and canonical', () => {
    const metadata = buildCategoryMetadata({ name: 'Whey', slug: 'whey-proteine', seoTitle: 'Whey Tunisie | ParaTunisie', page: 2 });
    assert.equal(metadata.alternates?.canonical, 'https://paratunisie.com/whey-proteine?page=2');
    assert.deepEqual(metadata.title, { absolute: 'Whey Tunisie — Page 2 | ParaTunisie' });
    assert.equal(typeof metadata.robots === 'object' && metadata.robots?.index, true);
  });
  it('noindexes filtered collections without canonicalizing clean page two to page one', () => {
    const metadata = buildCategoryMetadata({ name: 'Whey', slug: 'whey-proteine', page: 2, hasFilters: true });
    assert.equal(metadata.alternates?.canonical, 'https://paratunisie.com/whey-proteine');
    assert.equal(typeof metadata.robots === 'object' && metadata.robots?.index, false);
  });
  it('honours edited social fields and excludes HTML from the description', () => {
    const metadata = buildProductMetadata({ name: 'Reference', slug: 'reference', seoDescription: '<p>Une description.</p>', ogTitle: 'Titre social', ogImage: '/uploads/reference.webp', followLinks: false });
    assert.equal(metadata.description, 'Une description.');
    assert.equal(metadata.openGraph?.title, 'Titre social');
    assert.equal(typeof metadata.robots === 'object' && metadata.robots?.follow, false);
  });
  it('uses actual prices and stock, and never creates a rating or product photo', () => {
    const product = { name: 'Reference', slug: 'reference', priceTnd: 129.9, inStock: false, image: '/assets/product-unavailable.svg' };
    const schema = buildProductSchema(product);
    assert.equal(schema.offers.price, '129.900');
    assert.equal(schema.offers.priceCurrency, 'TND');
    assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
    assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.image, undefined);
    assert.equal(buildProductSchema({ ...product, rating: { average: 4.5, count: 2 } }).aggregateRating?.reviewCount, 2);
  });
});

describe('brand pages', () => {
  it('fallback metadata never claims official status', async () => {
    const { buildBrandMetadata } = await import('./metadata');
    const m = buildBrandMetadata({ name: 'Solgar', slug: 'solgar' });
    const text = JSON.stringify(m);
    assert.doesNotMatch(text, /officiel/i);
    assert.match(JSON.stringify(m.title), /Solgar/);
  });
  it('CollectionPage lists real products only, without offers or ratings', async () => {
    const { buildBrandCollectionSchema } = await import('./schema');
    const schema = buildBrandCollectionSchema({ name: 'Solgar', slug: 'solgar', products: [{ slug: 'a', name: 'A' }, { slug: 'b', name: 'B' }] });
    assert.equal(schema['@type'], 'CollectionPage');
    assert.equal(schema.mainEntity.numberOfItems, 2);
    assert.match(schema.mainEntity.itemListElement[0].url, /\/produits\/a$/);
    assert.doesNotMatch(JSON.stringify(schema), /offers|aggregateRating|review/i);
  });
  it('caps the ItemList', async () => {
    const { buildBrandCollectionSchema } = await import('./schema');
    const products = Array.from({ length: 50 }, (_v, i) => ({ slug: `p${i}`, name: `P${i}` }));
    assert.equal(buildBrandCollectionSchema({ name: 'X', slug: 'x', products }).mainEntity.itemListElement.length, 24);
  });
});

describe('product structured data integrity', () => {
  const base = { name: 'Créatine 300 g', slug: 'creatine-300-g', priceTnd: 59, inStock: true, image: 'https://paratunisie.com/paratunisie-media/products/c.webp' };
  it('turns Markdown descriptions into plain text', async () => {
    const { buildProductSchema } = await import('./schema');
    const out = buildProductSchema({ ...base, description: '### Titre\n\nTexte avec **gras** et un [lien](/x).\n\n- Point un\n- Point deux' });
    assert.doesNotMatch(out.description, /[#*\[\]]|\(\/x\)/);
    assert.match(out.description, /Texte avec gras et un lien\./);
  });
  it('removes headings that sit inline in the text', async () => {
    const { buildProductSchema } = await import('./schema');
    const out = buildProductSchema({ ...base, description: "Poids : 0,06 kg ### Poids de l'article Le poids inclut l'emballage" });
    assert.doesNotMatch(out.description, /#/);
    assert.match(out.description, /Poids de l'article Le poids inclut/);
  });
  it('never publishes a slug or an empty value as SKU', async () => {
    const { buildProductSchema } = await import('./schema');
    assert.equal('sku' in buildProductSchema({ ...base, description: 'x' }), false);
    assert.equal(buildProductSchema({ ...base, description: 'x', sku: 'REF-42' }).sku, 'REF-42');
  });
  it('never invents review text, author or date', async () => {
    const { buildProductSchema } = await import('./schema');
    const reviews = [
      { id: '1', rating: 5, title: null, body: null, verified: true, createdAt: '2026-11-01T10:00:00Z', user: { name: 'Sami' } },
      { id: '2', rating: 4, title: null, body: 'Bon produit, livraison rapide.', verified: true, createdAt: '2026-11-02T10:00:00Z', user: { name: null } },
      { id: '3', rating: 4, title: null, body: 'Conforme à la description.', verified: true, createdAt: '2026-11-03T10:00:00Z', user: { name: 'Leila' } },
    ];
    const out = buildProductSchema({ ...base, description: 'x', rating: { average: 4.5, count: 3 }, reviews });
    assert.equal(out.review?.length, 1, 'only the review with real text, a real author and a date is marked up');
    assert.equal(out.review?.[0].author.name, 'Leila');
    assert.doesNotMatch(JSON.stringify(out), /Très satisfait|Client Vérifié/);
  });
  it('omits ratings when there are no real reviews', async () => {
    const { buildProductSchema } = await import('./schema');
    const out = buildProductSchema({ ...base, description: 'x', rating: { average: 0, count: 0 }, reviews: [] });
    assert.equal('aggregateRating' in out, false);
    assert.equal('review' in out, false);
  });
});

describe('gtinProperty', () => {
  it('emits only structurally valid GTINs and never invents one', () => {
    assert.deepEqual(gtinProperty('4006381333931'), { gtin13: '4006381333931' });
    assert.deepEqual(gtinProperty('96385074'), { gtin8: '96385074' });
    assert.deepEqual(gtinProperty('4006381333932'), {});
    assert.deepEqual(gtinProperty('123'), {});
    assert.deepEqual(gtinProperty(null), {});
    assert.deepEqual(gtinProperty(undefined), {});
  });
});
