import { db } from '../../../lib/db/database';
import { categorySchema, toCategoryKey } from '../../../lib/db/records';
import type { Category } from '../../../lib/db/records';
import { categoryNameSchema } from '../schema';
import type { CategoryNameInput } from '../schema';
import { CategoryError } from './category-error';

export async function createCategory(input: CategoryNameInput): Promise<Category> {
  const name = categoryNameSchema.parse(input);
  const nameKey = toCategoryKey(name);

  try {
    return await db.transaction('rw', db.categories, async () => {
      if (await db.categories.where('nameKey').equals(nameKey).first()) {
        throw new CategoryError('DUPLICATE_CATEGORY', name);
      }

      const now = new Date().toISOString();
      const category = categorySchema.parse({ id: crypto.randomUUID(), name, nameKey, createdAt: now, updatedAt: now });
      await db.categories.add(category);
      return category;
    });
  } catch (error) {
    // Balapan antar tab: indeks unik &nameKey bisa menolak setelah pengecekan di atas lolos.
    if (error instanceof Error && error.name === 'ConstraintError') {
      throw new CategoryError('DUPLICATE_CATEGORY', name);
    }
    throw error;
  }
}
