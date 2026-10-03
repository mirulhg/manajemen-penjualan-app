import { getReturnPath } from '../../utils/return-path';

export function getListPath(locationState: unknown): string {
  return getReturnPath(locationState, '/stok');
}
