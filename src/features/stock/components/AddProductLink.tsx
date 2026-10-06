import { Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';

export function AddProductLink() {
  const location = useLocation();

  return (
    <Button asChild>
      <Link to="/stok/baru" state={{ search: location.search }}>
        <Plus aria-hidden="true" />
        Tambah barang
      </Link>
    </Button>
  );
}
