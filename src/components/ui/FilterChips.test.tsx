// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FilterChips } from './FilterChips';

const CHIPS = [
  { key: 'a', text: 'Sembako', removeLabel: 'Hapus A', patch: { category: null } },
  { key: 'b', text: 'Menipis', removeLabel: 'Hapus B', patch: { status: null } },
];

describe('FilterChips', () => {
  afterEach(cleanup);

  it('chip yang dihapus hilang dari DOM, chip lain tetap', async () => {
    const { rerender } = render(<FilterChips chips={CHIPS} onRemove={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);

    rerender(<FilterChips chips={CHIPS.slice(1)} onRemove={vi.fn()} />);

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Hapus A' })).toBeNull());
    expect(screen.getByRole('button', { name: 'Hapus B' })).toBeTruthy();
  });

  it('chip terakhir dihapus: seluruh daftar filter aktif hilang', async () => {
    const { rerender } = render(<FilterChips chips={CHIPS.slice(0, 1)} onRemove={vi.fn()} />);
    expect(screen.getByRole('list', { name: 'Filter aktif' })).toBeTruthy();

    rerender(<FilterChips chips={[]} onRemove={vi.fn()} />);

    await waitFor(() => expect(screen.queryByRole('list')).toBeNull());
  });

  it('mengetuk chip mengirim patch-nya', () => {
    const onRemove = vi.fn();
    render(<FilterChips chips={CHIPS} onRemove={onRemove} />);

    screen.getByRole('button', { name: 'Hapus B' }).click();

    expect(onRemove).toHaveBeenCalledWith({ status: null });
  });
});
