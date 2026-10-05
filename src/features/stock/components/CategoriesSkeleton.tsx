const SKELETON_ROW_COUNT = 5;

export function CategoriesSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat kategori
      </p>
      <ul aria-hidden="true" className="rounded-md border border-border bg-card">
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <li key={index} className="border-b border-border px-4 py-3">
            <div className="h-4 w-1/3 rounded-md bg-border" />
            <div className="mt-2 h-3 w-1/4 rounded-md bg-border" />
          </li>
        ))}
      </ul>
    </div>
  );
}
