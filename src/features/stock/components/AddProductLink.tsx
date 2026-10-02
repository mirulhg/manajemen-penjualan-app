import { Link, useLocation } from 'react-router';

export function AddProductLink() {
  const location = useLocation();

  return (
    <Link
      to="/stok/baru"
      state={{ search: location.search }}
      className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-on-primary"
    >
      Tambah barang
    </Link>
  );
}
