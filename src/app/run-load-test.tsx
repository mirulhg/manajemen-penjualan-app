import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';

import { seedLoadTest } from '../features/sales/seed-load-test';
import { LoadTestScreen } from './LoadTestScreen';
import type { LoadTestState } from './LoadTestScreen';

// Dimuat lewat import() dinamis di dalam cabang import.meta.env.DEV, jadi seed uji beban tidak masuk build produksi.
// Selesai (resolve) setelah pengguna menekan "Buka aplikasi".
export function runLoadTest(root: Root, notice: string | null): Promise<void> {
  return new Promise((resolve) => {
    function show(state: LoadTestState) {
      root.render(
        <StrictMode>
          <LoadTestScreen state={state} notice={notice} onContinue={resolve} />
        </StrictMode>,
      );
    }

    show({ phase: 'running', done: 0, total: 0 });
    seedLoadTest(new Date(), (done, total) => show({ phase: 'running', done, total })).then(
      (result) => show(result ? { phase: 'done', ...result } : { phase: 'skipped' }),
      (error: unknown) => show({ phase: 'failed', message: error instanceof Error ? error.message : String(error) }),
    );
  });
}
