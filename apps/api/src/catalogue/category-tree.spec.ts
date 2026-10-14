import { categoryTreeIds } from './category-tree';

const tree = [
  { id: 'a', slug: 'nutrition', name: 'Nutrition', parentId: null },
  { id: 'b', slug: 'proteines', name: 'Protéines', parentId: 'a' },
  { id: 'c', slug: 'whey', name: 'Whey', parentId: 'b' },
  { id: 'd', slug: 'accessoires', name: 'Accessoires', parentId: null },
];
test('includes all depths without unrelated categories', () => {
  expect(categoryTreeIds(tree, ['NUTRITION'])).toEqual(['a', 'b', 'c']);
  expect(categoryTreeIds(tree, ['b'])).toEqual(['b', 'c']);
  expect(categoryTreeIds(tree, ['Protéines'])).toEqual(['b', 'c']);
  expect(categoryTreeIds(tree, ['missing'])).toEqual([]);
});
test('terminates on cycles and deduplicates overlapping roots', () => {
  expect(categoryTreeIds([{ ...tree[0], parentId: 'c' }, ...tree.slice(1)], ['nutrition', 'whey'])).toEqual(['a', 'c', 'b']);
});
