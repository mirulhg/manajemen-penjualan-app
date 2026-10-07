import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { clearDemoData } from '../clear-demo-data';

// Memuat atau menghapus mengubah hampir semua data, jadi seluruh cache disegarkan.
function useDemoMutation(action: () => Promise<void>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => toast.success(successMessage),
    onSettled: () => queryClient.invalidateQueries(),
  });
}

export function useLoadDemoData() {
  // Impor dinamis: seed dan jalur transaksi kasir tidak ikut bundle utama (banner dimuat di AppLayout).
  return useDemoMutation(async () => {
    const { loadDemoData } = await import('../load-demo-data');
    await loadDemoData();
  }, 'Data contoh dimuat');
}

export function useClearDemoData() {
  return useDemoMutation(clearDemoData, 'Data contoh dihapus');
}
