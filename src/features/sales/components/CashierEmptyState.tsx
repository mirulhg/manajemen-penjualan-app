import { Link } from 'react-router';

export function CashierEmptyState() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Belum ada barang yang bisa dijual</h2>
      <p className="mt-2 text-text-muted">Tambahkan barang dulu, lalu kembali ke halaman kasir.</p>
      <Link
        to="/stok/baru"
        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-on-primary"
      >
        Tambah barang
      </Link>
    </div>
  );
}
