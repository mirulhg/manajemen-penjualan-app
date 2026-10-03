// Tanggal lokal perangkat (bukan UTC): transaksi pukul 00.30 WIB harus masuk hari itu, bukan hari sebelumnya.
function getDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}${month}${day}`;
}

export function getSaleCounterName(date: Date): string {
  return `sale:${getDateKey(date)}`;
}

export function formatSaleNumber(date: Date, sequence: number): string {
  return `TRX-${getDateKey(date)}-${String(sequence).padStart(4, '0')}`;
}

export function getReturnCounterName(date: Date): string {
  return `saleReturn:${getDateKey(date)}`;
}

export function formatReturnNumber(date: Date, sequence: number): string {
  return `RTR-${getDateKey(date)}-${String(sequence).padStart(4, '0')}`;
}
