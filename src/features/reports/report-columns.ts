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

export type ProfitRow = {
  sku: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  // Persen dengan satu desimal; 0 bila omzet 0.
  margin: number;
};

export type ProfitCategoryRow = {
  category: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  margin: number;
};

export const PROFIT_PRODUCT_COLUMNS: ReportColumn<ProfitRow>[] = [
  { key: 'sku', title: 'SKU', type: 'text', width: 14 },
  { key: 'name', title: 'Nama', type: 'text', width: 30 },
  { key: 'category', title: 'Kategori', type: 'text', width: 20 },
  { key: 'status', title: 'Status', type: 'text', width: 12 },
  { key: 'quantity', title: 'Terjual', type: 'number', width: 10 },
  { key: 'revenue', title: 'Omzet', type: 'number', width: 14 },
  { key: 'cogs', title: 'HPP', type: 'number', width: 14 },
  { key: 'grossProfit', title: 'Laba kotor', type: 'number', width: 14 },
  { key: 'margin', title: 'Margin (%)', type: 'number', width: 12 },
];

export const PROFIT_CATEGORY_COLUMNS: ReportColumn<ProfitCategoryRow>[] = [
  { key: 'category', title: 'Kategori', type: 'text', width: 24 },
  { key: 'revenue', title: 'Omzet', type: 'number', width: 14 },
  { key: 'cogs', title: 'HPP', type: 'number', width: 14 },
  { key: 'grossProfit', title: 'Laba kotor', type: 'number', width: 14 },
  { key: 'margin', title: 'Margin (%)', type: 'number', width: 12 },
];

export type StockRow = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  value: number;
  status: string;
};

export const STOCK_COLUMNS: ReportColumn<StockRow>[] = [
  { key: 'sku', title: 'SKU', type: 'text', width: 14 },
  { key: 'name', title: 'Nama', type: 'text', width: 30 },
  { key: 'category', title: 'Kategori', type: 'text', width: 20 },
  { key: 'unit', title: 'Satuan', type: 'text', width: 10 },
  { key: 'quantity', title: 'Stok', type: 'number', width: 10 },
  { key: 'purchasePrice', title: 'Harga beli', type: 'number', width: 14 },
  { key: 'value', title: 'Nilai persediaan', type: 'number', width: 18 },
  { key: 'status', title: 'Status', type: 'text', width: 12 },
];

export type MovementRow = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  opening: number;
  incoming: number;
  sold: number;
  returned: number;
  // Bertanda: positif menambah stok, negatif mengurangi.
  correction: number;
  closing: number;
  status: string;
};

export const MOVEMENT_COLUMNS: ReportColumn<MovementRow>[] = [
  { key: 'sku', title: 'SKU', type: 'text', width: 14 },
  { key: 'name', title: 'Nama', type: 'text', width: 30 },
  { key: 'category', title: 'Kategori', type: 'text', width: 20 },
  { key: 'unit', title: 'Satuan', type: 'text', width: 10 },
  { key: 'opening', title: 'Stok awal', type: 'number', width: 11 },
  { key: 'incoming', title: 'Masuk', type: 'number', width: 10 },
  { key: 'sold', title: 'Terjual', type: 'number', width: 10 },
  { key: 'returned', title: 'Retur/batal', type: 'number', width: 12 },
  { key: 'correction', title: 'Koreksi (±)', type: 'number', width: 12 },
  { key: 'closing', title: 'Stok akhir', type: 'number', width: 11 },
  { key: 'status', title: 'Status', type: 'text', width: 12 },
];
