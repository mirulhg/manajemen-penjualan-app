import { describe, expect, it } from 'vitest';

import { parseFilterParams, serializeFilterParams } from './parse-filter-params';

describe('parseFilterParams', () => {
  it('membaca ketiga parameter yang valid', () => {
    const params = new URLSearchParams('q=mi&kategori=Sembako&status=menipis');
    expect(parseFilterParams(params)).toEqual({
      query: 'mi',
      category: 'Sembako',
      status: 'menipis',
      sort: 'nama',
      archived: false,
    });
  });

  it('menganggap status tidak valid sebagai semua', () => {
    expect(parseFilterParams(new URLSearchParams('status=ngawur')).status).toBeNull();
  });

  it('menganggap parameter kosong atau tidak ada sebagai null', () => {
    expect(parseFilterParams(new URLSearchParams('q='))).toEqual({
      query: null,
      category: null,
      status: null,
      sort: 'nama',
      archived: false,
    });
    expect(parseFilterParams(new URLSearchParams())).toEqual({
      query: null,
      category: null,
      status: null,
      sort: 'nama',
      archived: false,
    });
  });

  it('mempertahankan spasi di kata kunci agar bisa mengetik "mi instan"', () => {
    expect(parseFilterParams(new URLSearchParams({ q: 'mi ' })).query).toBe('mi ');
  });
});

describe('serializeFilterParams', () => {
  it('membuang parameter kosong dari URL', () => {
    const params = serializeFilterParams({ query: null, category: null, status: 'habis', sort: 'nama', archived: false });
    expect(params.toString()).toBe('status=habis');
    expect(serializeFilterParams({ query: null, category: null, status: null, sort: 'nama', archived: false }).toString()).toBe('');
  });
});

describe('parameter urut', () => {
  it('nilai tidak valid atau tidak ada menjadi nama', () => {
    expect(parseFilterParams(new URLSearchParams('urut=ngawur')).sort).toBe('nama');
    expect(parseFilterParams(new URLSearchParams()).sort).toBe('nama');
  });

  it('nilai valid dibaca', () => {
    expect(parseFilterParams(new URLSearchParams('urut=stok-sedikit')).sort).toBe('stok-sedikit');
  });

  it('nama tidak ditulis ke URL, urutan lain ditulis', () => {
    const base = { query: null, category: null, status: null } as const;
    expect(serializeFilterParams({ ...base, sort: 'nama', archived: false }).has('urut')).toBe(false);
    expect(serializeFilterParams({ ...base, sort: 'terbaru', archived: false }).toString()).toBe('urut=terbaru');
  });
});
