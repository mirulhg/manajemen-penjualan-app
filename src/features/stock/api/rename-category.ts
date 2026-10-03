import { db } from '../../../lib/db/database';
import { categorySchema, toCategoryKey } from '../../../lib/db/records';
import type { Category } from '../../../lib/db/records';
import { categoryNameSchema } from '../schema';
import type { CategoryNameInput } from '../schema';
import { CategoryError } from './category-error';

export async function renameCategory(categoryId: string, input: CategoryNameInput): Promise<Category> {
  const name = categoryNameSchema.parse(input);
  const nameKey = toCategoryKey(name);

  try {
    return await db.transaction('rw', db.categories, db.products, async () => {
      const row = await db.categories.get(categoryId);
      if (!row) throw new CategoryError('CATEGORY_NOT_FOUND');
      const category = categorySchema.parse(row);

      const owner = await db.categories.where('nameKey').equals(nameKey).first();
      if (owner && owner.id !== categoryId) throw new CategoryError('DUPLICATE_CATEGORY', name);
      if (name === category.name) throw new CategoryError('NO_CHANGE');

      const renamed = categorySchema.parse({
        ...category,
        name,
        nameKey,
        updatedAt: new Date().toISOString(),
      });
      await db.categories.put(renamed);
      // updatedAt barang sengaja tidak diubah: mengganti nama kategori bukan mengubah barang.
      await db.products
        .where('category')
        .equals(category.name)
        .modify((product) => {
          product.category = name;
        });
      return renamed;
    });
  } catch (error) {
    // Balapan antar tab: indeks unik &nameKey bisa menolak setelah pengecekan di atas lolos.
    if (error instanceof Error && error.name === 'ConstraintError') {
      throw new CategoryError('DUPLICATE_CATEGORY', name);
    }
    throw error;
  }
}
