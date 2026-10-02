const SKELETON_FIELD_COUNT = 8;

export function NewProductSkeleton() {
  return (
    <div>
      <p className="sr-only" role="status">
        Memuat formulir
      </p>
      <div aria-hidden="true" className="space-y-4">
        {Array.from({ length: SKELETON_FIELD_COUNT }, (_, index) => (
          <div key={index}>
            <div className="h-4 w-1/4 rounded-md bg-border" />
            <div className="mt-2 h-11 rounded-md bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
