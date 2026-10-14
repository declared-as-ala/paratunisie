import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryMetadata, buildProductMetadata } from './metadata';
import { buildProductSchema } from './schema';

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
