import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { Providers } from './app/providers';
import { router } from './app/router';
import { StartupError } from './app/StartupError';
import { SAMPLE_PRODUCT_SKUS, seedSampleProducts } from './features/stock';
import { getEnv } from './lib/env';
import './styles/theme.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemen #root tidak ada di index.html.');
}
const root = createRoot(rootElement);

// Impor dinamis: generator dan jalur createSale tidak ikut bundle utama.
async function seedSales() {
  try {
    const { seedSampleSales } = await import('./features/sales');
    await seedSampleSales(SAMPLE_PRODUCT_SKUS);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Data penjualan contoh gagal dibuat (${detail}). Hapus database "manajemen-stok" di DevTools (Application, IndexedDB), lalu muat ulang halaman.`,
    );
  }
}

async function start() {
  try {
    const env = getEnv();
    if (env.VITE_SEED_SAMPLE_DATA) {
      const isSeeded = await seedSampleProducts(env.VITE_SEED_EXTRA_PRODUCTS);
      if (isSeeded && env.VITE_SEED_SAMPLE_SALES) {
        await seedSales();
      }
    }
  } catch (error) {
    root.render(
      <StrictMode>
        <StartupError error={error} />
      </StrictMode>,
    );
    return;
  }

  root.render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
}

void start();
