import { describe, expect, it } from 'vitest';

import { HELP_CONTENT } from './help-content';
import { HELP_GROUPS, HELP_TOPICS } from './help-topics';
import { filterSections, getVisibleTopics } from './help-visibility';
import type { HelpBlock, HelpSection } from './types';

function collectText(sections: readonly HelpSection[]): string {
  const parts: string[] = [];
  function visitBlock(block: HelpBlock) {
    if (block.type === 'paragraph') parts.push(block.text);
    if (block.type === 'steps' || block.type === 'list') {
      block.items.forEach((item) => parts.push(item.text, ...(item.children ?? [])));
    }
    if (block.type === 'table') block.rows.forEach((row) => parts.push(...row.cells));
    if (block.type === 'faq') {
      block.items.forEach((item) => {
        parts.push(item.question);
        item.answer.forEach(visitBlock);
      });
    }
  }
  sections.forEach((section) => section.blocks.forEach(visitBlock));
  return parts.join('\n');
}

describe('isi panduan', () => {
  it('setiap topik punya isi, dan setiap isi punya topik', () => {
    expect(Object.keys(HELP_CONTENT).sort()).toEqual(HELP_TOPICS.map((topic) => topic.slug).sort());
    HELP_TOPICS.forEach((topic) => expect(HELP_CONTENT[topic.slug].length).toBeGreaterThan(0));
  });

  it('memuat 21 topik dengan slug unik dan kelompok yang dikenal', () => {
    expect(HELP_TOPICS).toHaveLength(21);
    expect(new Set(HELP_TOPICS.map((topic) => topic.slug)).size).toBe(21);
    const groups = HELP_GROUPS.map((group) => group.id);
    HELP_TOPICS.forEach((topic) => expect(groups).toContain(topic.group));
  });

  it('teks Lupa PIN dan nilai stok minus mengikuti perilaku terbaru', () => {
    const modeKasir = collectText(HELP_CONTENT['mode-kasir']);
    expect(modeKasir).toContain('ketuk "Lupa PIN?", isi kode pemulihan dan PIN baru, lalu tekan "Simpan PIN baru"');
    expect(modeKasir).not.toContain('masuk Mode Kasir dulu');
    expect(collectText(HELP_CONTENT.istilah)).toContain('Stok minus dihitung 0.');
    expect(collectText(HELP_CONTENT['masalah-umum'])).toContain('di Pengaturan → "PIN pemilik" → "Lupa PIN?"');
  });

  it('tidak menampilkan penanda khusus pemilik atau kasir sebagai teks', () => {
    HELP_TOPICS.forEach((topic) => {
      const text = collectText(HELP_CONTENT[topic.slug]);
      expect(text).not.toMatch(/\(Khusus (pemilik|kasir)\)|\(pemilik\)/);
    });
  });
});

describe('penyaringan menurut mode', () => {
  const owner = { isCashierMode: false, canCashierSeeAlerts: false };
  const cashier = { isCashierMode: true, canCashierSeeAlerts: false };

  it('kasir hanya melihat topik untuk semua, dan peringatan hanya bila diizinkan', () => {
    const titles = getVisibleTopics(cashier).map((topic) => topic.title);
    expect(titles).toEqual(['Mencatat penjualan di Kasir', 'Melihat daftar stok', 'Mode Kasir & PIN', 'Apa yang baru & Segera hadir', 'Kamus istilah', 'Tanya jawab']);
    expect(getVisibleTopics({ ...cashier, canCashierSeeAlerts: true }).map((topic) => topic.slug)).toContain('peringatan');
    expect(getVisibleTopics(owner)).toHaveLength(21);
  });

  it('menyembunyikan baris istilah pemilik dari kasir', () => {
    const text = collectText(filterSections(HELP_CONTENT.istilah, true));
    expect(text).toContain('SKU');
    expect(text).not.toContain('HPP');
    expect(collectText(filterSections(HELP_CONTENT.istilah, false))).toContain('HPP');
  });

  it('menampilkan butir khusus kasir hanya di Mode Kasir dan butir khusus pemilik sebaliknya', () => {
    const cashierText = collectText(filterSections(HELP_CONTENT.stok, true));
    const ownerText = collectText(filterSections(HELP_CONTENT.stok, false));
    expect(cashierText).toContain('harga beli dan nilai stok tidak ditampilkan');
    expect(cashierText).not.toContain('Nilai stok');
    expect(ownerText).toContain('Nilai stok');
    expect(ownerText).not.toContain('harga beli dan nilai stok tidak ditampilkan');
  });

  it('menyembunyikan tanya-jawab dan langkah khusus pemilik dari kasir', () => {
    const faq = collectText(filterSections(HELP_CONTENT['masalah-umum'], true));
    expect(faq).not.toContain('Salah memasukkan transaksi');
    expect(faq).toContain('Lupa PIN');
    expect(collectText(filterSections(HELP_CONTENT.peringatan, true))).not.toContain('Bagikan daftar');
    expect(collectText(filterSections(HELP_CONTENT.peringatan, false))).toContain('Bagikan daftar');
  });
});
