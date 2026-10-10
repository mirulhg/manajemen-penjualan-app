import { describe, expect, it } from 'vitest';

import { CHANGELOG_ENTRIES } from './changelog-entries';
import { CURRENT_RELEASE } from './current-release';
import { ROADMAP_ITEMS } from './roadmap-items';
import { getVisibleEntries, getVisibleRoadmap } from './visibility';

describe('data changelog', () => {
  it('latestVersion unik dan tanggal tidak naik ke bawah', () => {
    const versions = CHANGELOG_ENTRIES.map((entry) => entry.latestVersion);
    expect(new Set(versions).size).toBe(versions.length);
    const dates = CHANGELOG_ENTRIES.map((entry) => entry.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('setiap entri punya minimal satu poin dan label versi', () => {
    for (const entry of CHANGELOG_ENTRIES) {
      expect(entry.items.length).toBeGreaterThan(0);
      expect(entry.versionLabel).toContain('v');
    }
    expect(CHANGELOG_ENTRIES).toHaveLength(15);
  });

  it('CURRENT_RELEASE cocok dengan entri teratas', () => {
    const top = CHANGELOG_ENTRIES[0];
    expect(CURRENT_RELEASE.version).toBe(top?.latestVersion);
    expect(CURRENT_RELEASE.title).toBe(top?.title);
    expect(CURRENT_RELEASE.isVisibleToCashier).toBe(getVisibleEntries([top ?? CHANGELOG_ENTRIES[0]!], true).length > 0);
  });
});

describe('penyaringan Mode Kasir', () => {
  it('pemilik melihat semua entri', () => {
    expect(getVisibleEntries(CHANGELOG_ENTRIES, false)).toHaveLength(15);
  });

  it('entri yang semua poinnya khusus pemilik tidak tampil untuk kasir', () => {
    const versions = getVisibleEntries(CHANGELOG_ENTRIES, true).map((entry) => entry.latestVersion);
    for (const hidden of ['0.11.2', '0.10.3', '0.10.2', '0.8.0']) expect(versions).not.toContain(hidden);
    expect(versions).toHaveLength(11);
  });

  it('poin khusus pemilik di Fase 2 disembunyikan dari kasir', () => {
    const phase2 = getVisibleEntries(CHANGELOG_ENTRIES, true).find((entry) => entry.latestVersion === '0.6.0');
    expect(phase2?.items).toHaveLength(2);
  });

  it('rencana khusus pemilik tidak tampil untuk kasir', () => {
    const titles = getVisibleRoadmap(ROADMAP_ITEMS, true).map((item) => item.title);
    expect(titles).not.toContain('Cadangkan & pulihkan data');
    expect(titles).not.toContain('Varian produk');
    expect(titles).not.toContain('Laporan terjadwal ke email');
    expect(getVisibleRoadmap(ROADMAP_ITEMS, false)).toHaveLength(7);
  });
});
