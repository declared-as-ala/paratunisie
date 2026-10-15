type CategoryNode = { id: string; slug: string; name: string; parentId: string | null };

/** Resolve IDs, names or slugs and every descendant, even in a malformed cycle. */
export function categoryTreeIds(categories: CategoryNode[], tokens: string[]): string[] {
  const wanted = new Set(tokens.map((token) => token.trim().toLowerCase()));
  const ids = new Set(categories.filter((c) =>
    [c.id, c.slug, c.name].some((value) => wanted.has(value.toLowerCase())),
  ).map((c) => c.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        changed = true;
      }
    }
  }
  return [...ids];
}
