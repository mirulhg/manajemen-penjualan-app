type SaleActionErrorCode =
  | 'SALE_NOT_FOUND'
  | 'ALREADY_CANCELLED'
  | 'ITEM_NOT_IN_SALE'
  | 'RETURN_EXCEEDS_REMAINING'
  | 'PRODUCT_NOT_FOUND';

const MESSAGES: Record<SaleActionErrorCode, string> = {
  SALE_NOT_FOUND: 'Transaksi tidak ditemukan.',
  ALREADY_CANCELLED: 'Transaksi ini sudah dibatalkan.',
  ITEM_NOT_IN_SALE: 'Barang yang diretur tidak ada di transaksi ini.',
  RETURN_EXCEEDS_REMAINING: 'Jumlah retur melebihi sisa yang bisa diretur.',
  PRODUCT_NOT_FOUND: 'Barang di transaksi ini sudah tidak ada, jadi stoknya tidak bisa dikembalikan.',
};

export class SaleActionError extends Error {
  readonly code: SaleActionErrorCode;
  // Nama barang yang jumlah returnya melebihi sisa, bila ada; dipakai untuk pesan di baris yang tepat.
  readonly saleItemId: string | null;

  constructor(code: SaleActionErrorCode, saleItemId: string | null = null) {
    super(MESSAGES[code]);
    this.name = 'SaleActionError';
    this.code = code;
    this.saleItemId = saleItemId;
  }
}
