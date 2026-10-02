import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { Providers } from './app/providers';
import { router } from './app/router';
import { StartupError } from './app/StartupError';
import { seedSampleProducts } from './features/stock';
import { getEnv } from './lib/env';
import './styles/theme.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemen #root tidak ada di index.html.');
}
const root = createRoot(rootElement);

async function start() {
  try {
    if (getEnv().VITE_SEED_SAMPLE_DATA) {
      await seedSampleProducts();
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
