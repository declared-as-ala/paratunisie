import { CatalogueService } from './catalogue.service';
jest.mock('../search/meilisearch.service', () => ({ MeilisearchService: class {} }));

test('a category search includes nested products and does not use the flat search index', async () => {
  const findMany = jest.fn().mockResolvedValue([]);
  const searchProducts = jest.fn();
  const service = new CatalogueService({
    category: { findMany: jest.fn().mockResolvedValue([
      { id: 'root', slug: 'nutrition', name: 'Nutrition', parentId: null },
      { id: 'child', slug: 'proteines', name: 'Proteines', parentId: 'root' },
      { id: 'leaf', slug: 'whey', name: 'Whey', parentId: 'child' },
    ]) }, product: { findMany, count: jest.fn().mockResolvedValue(0) },
  } as any, { searchProducts } as any);
  await service.findAllProducts({ category: 'nutrition', search: 'whey', page: 1.5 });
  expect(searchProducts).not.toHaveBeenCalled();
  expect(findMany.mock.calls[0][0].where.categoryId.in).toEqual(['root', 'child', 'leaf']);
  expect(findMany.mock.calls[0][0].where.inStock).toBeUndefined();
  expect(findMany.mock.calls[0][0].skip).toBe(0);
});

test('price sorting happens before pagination and uses a stable tie breaker', async () => {
  const rows = [
    { id: 'c', variants: [{ priceMillimes: 3000 }] },
    { id: 'b', variants: [{ priceMillimes: 1000 }] },
    { id: 'a', variants: [{ priceMillimes: 1000 }] },
  ];
  const findMany = jest.fn().mockResolvedValueOnce(rows).mockImplementationOnce(async ({ where }) => rows.filter((row) => where.id.in.includes(row.id)));
  const service = new CatalogueService({ product: { findMany } } as any, {} as any);
  const result = await service.findAllProducts({ sort: 'price_asc', page: 2, limit: 1 });
  expect(result.meta.total).toBe(3);
  expect(result.data.map((product) => product.id)).toEqual(['b']);
  expect(result.meta.hasNextPage).toBe(true);
});
