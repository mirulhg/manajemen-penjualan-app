import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getOpenAlerts,
  getUnreadAlertCount,
  markAllAlertsRead,
  STOCK_ALERTS_QUERY_KEY,
} from '../../../lib/db/stock-alerts';
import { getRestockList } from '../../../lib/db/restock-list';
import { toLocalDateText } from '../../../utils/date-period';

export function useOpenAlerts() {
  return useQuery({ queryKey: [...STOCK_ALERTS_QUERY_KEY, 'open'], queryFn: getOpenAlerts });
}

export function useUnreadAlertCount() {
  return useQuery({ queryKey: [...STOCK_ALERTS_QUERY_KEY, 'unread'], queryFn: getUnreadAlertCount });
}

export function useRestockList() {
  const now = new Date();
  return useQuery({
    // Tanggal di key: jendela penjualan 14 hari bergeser setiap hari.
    queryKey: [...STOCK_ALERTS_QUERY_KEY, 'restock', toLocalDateText(now)],
    queryFn: () => getRestockList(now),
  });
}

export function useMarkAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAlertsRead(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_QUERY_KEY }),
  });
}
