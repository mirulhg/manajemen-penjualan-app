import { db } from '../../../lib/db/database';
import { CategoryError } from './category-error';

export async function deleteCategory(categoryId: string): Promise<void> {
  await db.transaction('rw', db.categories, db.products, async () => {
    const category = await db.categories.get(categoryId);
    if (!category) throw new CategoryError('CATEGORY_NOT_FOUND');

    // Produk arsip ikut dihitung: mereka tetap butuh kategorinya.
    const usageCount = await db.products.where('category').equals(category.name).count();
    if (usageCount > 0) throw new CategoryError('CATEGORY_NOT_EMPTY', category.name, usageCount);

    await db.categories.delete(categoryId);
  });
}
