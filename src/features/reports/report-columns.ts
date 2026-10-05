// Kolom didefinisikan sekali dan dipakai tampilan, CSV, dan xlsx supaya ketiganya tidak pernah berbeda.
export type ReportColumn<Row> = {
  key: Extract<keyof Row, string>;
  title: string;
  type: 'number' | 'text';
  width: number;
};

export type TransactionRow = {
  number: string;
  date: string;
  time: string;
  actor: string;
  method: string;
  subtotal: number;
  itemDiscount: number;
  transactionDiscount: number;
  total: number;
  refunded: number;
  net: number;
  status: string;
};

export type DailyRow = {
  date: string;
  transactionCount: number;
  netRevenue: number;
};

export const TRANSACTION_COLUMNS: ReportColumn<TransactionRow>[] = [
  { key: 'number', title: 'Nomor', type: 'text', width: 20 },
  { key: 'date', title: 'Tanggal', type: 'text', width: 12 },
  { key: 'time', title: 'Jam', type: 'text', width: 8 },
  { key: 'actor', title: 'Kasir', type: 'text', width: 12 },
  { key: 'method', title: 'Metode bayar', type: 'text', width: 14 },
  { key: 'subtotal', title: 'Subtotal', type: 'number', width: 14 },
  { key: 'itemDiscount', title: 'Diskon barang', type: 'number', width: 14 },
  { key: 'transactionDiscount', title: 'Diskon transaksi', type: 'number', width: 16 },
  { key: 'total', title: 'Total', type: 'number', width: 14 },
  { key: 'refunded', title: 'Retur', type: 'number', width: 12 },
  { key: 'net', title: 'Bersih', type: 'number', width: 14 },
  { key: 'status', title: 'Status', type: 'text', width: 16 },
];

export const DAILY_COLUMNS: ReportColumn<DailyRow>[] = [
  { key: 'date', title: 'Tanggal', type: 'text', width: 12 },
  { key: 'transactionCount', title: 'Transaksi', type: 'number', width: 12 },
  { key: 'netRevenue', title: 'Omzet bersih', type: 'number', width: 16 },
];
