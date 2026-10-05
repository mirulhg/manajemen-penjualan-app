import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';

export function AddProductLink() {
  const location = useLocation();

  return (
    <Button asChild size="lg"><Link to="/stok/baru" state={{ search: location.search }}>
      Tambah barang
    </Link></Button>
  );
}
