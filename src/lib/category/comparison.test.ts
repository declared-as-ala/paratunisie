import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildComparison, parseWeightGrams, pricePer100gDt } from './comparison';

describe('parseWeightGrams', () => {
  const cases: [string, number | null][] = [
    ['300 g', 300], ['300g', 300], ['500GR', 500], ['1 kg', 1000], ['2,27 kg', 2270], ['1.5kg', 1500], ['17,85 oz', 506.0],
    ['90 gélules', null], ['750 mg', null], ['120 caps', null], ['', null],
  ];
  for (const [text, expected] of cases) {
    it(`"${text}" -> ${expected}`, () => {
      const got = parseWeightGrams(text);
      if (expected === null) assert.equal(got, null);
      else assert.ok(got !== null && Math.abs(got - expected) < 1, `got ${got}`);
    });
  }
  it('falls back to the product name when the size label has no weight', () => {
    assert.equal(parseWeightGrams('Format standard', 'CREATINE MONOHYDRATE 500G - QUAMTRAX'), 500);
    assert.equal(parseWeightGrams('6l', 'Magnesium 90 tablets'), null);
  });
});

describe('buildComparison', () => {
  const p = (slug: string, brand: string, price: number, size: string, inStock = true) => ({ slug, name: slug, brand, size, priceMillimes: price, inStock });
  it('computes the price per 100 g from the real variant price and sorts cheapest first', () => {
    const { rows, bestSlugs } = buildComparison([p('a', 'A', 149000, '500 g'), p('b', 'B', 59000, '150 g'), p('c', 'C', 102000, '300 g')]);
    assert.deepEqual(rows.map((r) => r.slug), ['a', 'c', 'b']);
    assert.equal(rows[0].per100gDt, 29.8);
    assert.equal(rows[2].per100gDt, 39.3);
    assert.deepEqual(bestSlugs, ['a']);
  });
  it('marks every product that ties for the lowest price per 100 g', () => {
    const { bestSlugs } = buildComparison([p('a', 'A', 149000, '500 g'), p('b', 'B', 149000, '500 g'), p('c', 'C', 169000, '500 g')]);
    assert.deepEqual(bestSlugs.sort(), ['a', 'b']);
  });
  it('lists only products in stock and never claims a best price with a single comparable product', () => {
    const out = buildComparison([p('a', 'A', 100000, '500 g'), p('off', 'B', 1000, '500 g', false)]);
    assert.equal(out.rows.length, 1);
    assert.deepEqual(out.bestSlugs, []);
  });
  it('excludes packs and noindex products from the table', () => {
    const out = buildComparison([p('a', 'A', 100000, '500 g'), p('b', 'B', 120000, '500 g'), { ...p('whey-testo', 'C', 90000, '500 g'), indexable: false }, p('pack-professionnel', 'D', 699000, 'Format standard')]);
    assert.deepEqual(out.rows.map((r) => r.slug), ['a', 'b']);
  });
  it('keeps products without a readable weight, last, without inventing a figure', () => {
    const { rows } = buildComparison([p('caps', 'X', 50000, '90 gélules'), p('pdr', 'Y', 90000, '300 g')]);
    assert.equal(rows[1].slug, 'caps');
    assert.equal(rows[1].per100gDt, null);
  });
  it('pricePer100gDt rounds to one decimal', () => assert.equal(pricePer100gDt(149000, 500), 29.8));
});
