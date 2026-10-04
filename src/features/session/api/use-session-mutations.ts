import { useMutation, useQueryClient } from '@tanstack/react-query';

import { changePin } from './change-pin';
import { enterCashierMode, exitCashierMode } from './cashier-mode';
import { SESSION_QUERY_KEY } from './get-session';
import { resetPinWithRecoveryCode } from './reset-pin-with-recovery-code';
import { PRODUCT_ANALYTICS_QUERY_KEY } from '../../../lib/db/product-analytics';
import { setDefaultMinStock, STOCK_ALERTS_QUERY_KEY } from '../../../lib/db/stock-alerts';
import { dismissDailySummary, setAlertFlag } from './set-alert-preference';
import type { AlertFlagKey } from './set-alert-preference';
import { setAllowOversell } from './set-allow-oversell';
import { setupPin } from './setup-pin';

function useSessionMutation<Variables, Result>(action: (variables: Variables) => Promise<Result>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    // Mode, keberadaan PIN, dan izin jual melebihi stok dibaca dari settings.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ['settings'] }),
      ]),
  });
}

export function useSetupPin() {
  return useSessionMutation((pin: string) => setupPin(pin));
}

export function useChangePin() {
  return useSessionMutation(({ oldPin, newPin }: { oldPin: string; newPin: string }) => changePin(oldPin, newPin));
}

export function useResetPin() {
  return useSessionMutation(({ code, newPin }: { code: string; newPin: string }) =>
    resetPinWithRecoveryCode(code, newPin),
  );
}

export function useEnterCashierMode() {
  return useSessionMutation(() => enterCashierMode());
}

export function useExitCashierMode() {
  return useSessionMutation((pinOrRecoveryCode: string) => exitCashierMode(pinOrRecoveryCode));
}

export function useSetAllowOversell() {
  return useSessionMutation((value: boolean) => setAllowOversell(value));
}

export function useSetAlertFlag() {
  return useSessionMutation(({ key, value }: { key: AlertFlagKey; value: boolean }) => setAlertFlag(key, value));
}

export function useDismissDailySummary() {
  return useSessionMutation((dateKey: string) => dismissDailySummary(dateKey));
}

// Batas default mengubah status stok semua barang tanpa batas sendiri, jadi peringatan dan analisis ikut basi.
export function useSetDefaultMinStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: number) => setDefaultMinStock(value),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PRODUCT_ANALYTICS_QUERY_KEY }),
      ]),
  });
}
