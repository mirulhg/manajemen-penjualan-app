import { useMutation, useQueryClient } from '@tanstack/react-query';

import { changePin } from './change-pin';
import { enterCashierMode, exitCashierMode } from './cashier-mode';
import { SESSION_QUERY_KEY } from './get-session';
import { resetPinWithRecoveryCode } from './reset-pin-with-recovery-code';
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
