import { expect, it } from 'vitest';

import { formatDateTime } from './format-date-time';

it('memakai zona waktu yang diberikan (WIB = UTC+7) dengan format id-ID', () => {
  const text = formatDateTime('2026-10-02T14:30:00.000Z', 'Asia/Jakarta');
  expect(text).toContain('2 Okt 2026');
  expect(text).toMatch(/21[.:]30/);
});

it('tanggal yang sama bisa jatuh di hari berbeda menurut zona waktu', () => {
  expect(formatDateTime('2026-10-02T20:00:00.000Z', 'Asia/Jayapura')).toContain('3 Okt 2026');
});
