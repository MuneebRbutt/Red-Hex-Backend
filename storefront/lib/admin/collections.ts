export type AdminCollection = {
  id: string;
  name: string;
  slug: string;
  parent?: { id: string; name: string; slug?: string } | null;
};

const ROOT_SLUG = '__root_collection__';

export function isMainCategory(collection: AdminCollection): boolean {
  if (collection.slug === ROOT_SLUG) return false;
  if (!collection.parent) return collection.name.toLowerCase() !== 'root';
  return collection.parent.slug === ROOT_SLUG;
}

export function getSubcategories(
  collections: AdminCollection[],
  mainCategoryId: string,
): AdminCollection[] {
  return collections.filter((c) => c.parent?.id === mainCategoryId);
}

export function getMainCategories(collections: AdminCollection[]): AdminCollection[] {
  return collections.filter(isMainCategory);
}
