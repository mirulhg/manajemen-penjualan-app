import type { CategoryWithCounts } from '../api/get-categories';
import { CategoryRow } from './CategoryRow';

type CategoryListProps = {
  categories: CategoryWithCounts[];
};

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <ul className="rounded-md border border-border bg-card">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} />
      ))}
    </ul>
  );
}
