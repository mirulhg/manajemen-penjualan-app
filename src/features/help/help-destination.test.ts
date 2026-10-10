import { describe, expect, it } from 'vitest';

import { getDestination, getVisibleDestination } from './help-destination';
import { findHelpTopic, HELP_TOPICS } from './help-topics';
import type { HelpTopicMeta } from './types';

const TOPICS: readonly HelpTopicMeta[] = HELP_TOPICS;

function topicOf(slug: string): HelpTopicMeta {
  const topic = findHelpTopic(slug);
  if (!topic) throw new Error(`topik ${slug} tidak ada`);
  return topic;
}

describe('label tujuan', () => {
  it('label tombol setiap topik sesuai tabel keputusan', () => {
    const expected: Record<string, string | null> = {
      mulai: null,
      'profil-toko': 'Buka Pengaturan',
      'tambah-barang': 'Buka Tambah barang',
      'impor-barang': 'Buka Impor barang',
      'data-contoh': 'Buka Pengaturan',
      kasir: 'Buka Kasir',
      stok: 'Buka Stok',
      'barang-masuk': 'Buka Stok',
      'ubah-barang': 'Buka Stok',
      riwayat: 'Buka Riwayat',
      'retur-batal': 'Buka Riwayat',
      peringatan: 'Buka Peringatan stok',
      dasbor: 'Buka Dasbor',
      'analisis-produk': 'Buka Analisis produk',
      laporan: 'Buka Laporan',
      kategori: 'Buka Kategori',
      pengaturan: 'Buka Pengaturan',
      'mode-kasir': 'Buka Pengaturan',
      pembaruan: 'Buka Pembaruan',
      istilah: null,
      'masalah-umum': null,
    };

    expect(TOPICS.map((topic) => topic.slug).sort()).toEqual(Object.keys(expected).sort());
    TOPICS.forEach((topic) => expect(getDestination(topic, false)?.label ?? null, topic.slug).toBe(expected[topic.slug]));
  });

  it('Mode Kasir & PIN: pemilik ke Pengaturan, kasir keluar dari Mode Kasir', () => {
    const topic = topicOf('mode-kasir');
    expect(getDestination(topic, false)).toEqual({ to: '/pengaturan', label: 'Buka Pengaturan' });
    expect(getDestination(topic, true)).toEqual({ to: '/keluar-mode-kasir', label: 'Keluar Mode Kasir' });
  });
});

describe('getVisibleDestination', () => {
  it('disembunyikan bila tujuannya halaman saat ini', () => {
    expect(getVisibleDestination(topicOf('kasir'), false, '/kasir')).toBeNull();
    expect(getVisibleDestination(topicOf('kasir'), false, '/stok')?.label).toBe('Buka Kasir');
  });
});
