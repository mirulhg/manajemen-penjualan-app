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
    });
    expect(parseFilterParams(new URLSearchParams())).toEqual({
      query: null,
      category: null,
      status: null,
      sort: 'nama',
    });
  });

  it('mempertahankan spasi di kata kunci agar bisa mengetik "mi instan"', () => {
    expect(parseFilterParams(new URLSearchParams({ q: 'mi ' })).query).toBe('mi ');
  });
});

describe('serializeFilterParams', () => {
  it('membuang parameter kosong dari URL', () => {
    const params = serializeFilterParams({ query: null, category: null, status: 'habis', sort: 'nama' });
    expect(params.toString()).toBe('status=habis');
    expect(serializeFilterParams({ query: null, category: null, status: null, sort: 'nama' }).toString()).toBe('');
  });
});
