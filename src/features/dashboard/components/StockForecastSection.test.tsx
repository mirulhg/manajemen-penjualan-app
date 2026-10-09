// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../../test/render';
import { resetDatabaseWithSeed } from '../../../test/reset-database';
import { StockForecastSection } from './StockForecastSection';

describe('StockForecastSection', () => {
  beforeEach(resetDatabaseWithSeed);

  it('tanpa penjualan menyebut 14 hari terakhir, bukan periode yang dipilih', async () => {
    renderWithProviders(<StockForecastSection />);

    expect(await screen.findByText('Belum ada penjualan dalam 14 hari terakhir.')).toBeTruthy();
    expect(screen.queryByText('Belum ada penjualan di periode ini.')).toBeNull();
  });
});
