const BOM = '﻿';

function escapeCell(value: string): string {
  return /[;"\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

// Pemisah ';' dan BOM UTF-8 agar langsung rapi saat dibuka di Excel dengan pengaturan Indonesia.
export function formatCsv(rows: string[][]): string {
  return BOM + rows.map((row) => row.map(escapeCell).join(';')).join('\r\n') + '\r\n';
}
