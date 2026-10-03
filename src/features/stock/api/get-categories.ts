import { db } from '../../../lib/db/database';
import { toCategoryKey } from '../../../lib/db/records';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export type CategoryWithCounts = {
  id: string;
  name: string;
  activeCount: number;
  archivedCount: number;
};

export async function getCategoriesWithCounts(): Promise<CategoryWithCounts[]> {
  const [categories, products] = await Promise.all([db.categories.toArray(), db.products.toArray()]);

  return categories
    .map((category) => {
      const owned = products.filter((product) => toCategoryKey(product.category) === category.nameKey);
      const archivedCount = owned.filter((product) => product.archivedAt !== null).length;
      return {
        id: category.id,
        name: category.name,
        activeCount: owned.length - archivedCount,
        archivedCount,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));
}
