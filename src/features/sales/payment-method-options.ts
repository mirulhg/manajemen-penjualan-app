import type { PaymentMethod } from '../../lib/db/records';

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'tunai', label: 'Tunai' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris', label: 'QRIS' },
];

export function findPaymentMethod(value: string): PaymentMethod | null {
  return PAYMENT_METHOD_OPTIONS.find((method) => method.value === value)?.value ?? null;
}
