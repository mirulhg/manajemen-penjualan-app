import { useSearchParams } from 'react-router';

import { parsePeriodParams, serializePeriodParams } from '../../../utils/date-period';
import type { PeriodSelection } from '../../../utils/date-period';
import { DASHBOARD_PERIODS } from './use-dashboard-period';

export const SLOW_MOVER_THRESHOLDS = [7, 14, 30, 60, 90] as const;
export type SlowMoverThreshold = (typeof SLOW_MOVER_THRESHOLDS)[number];
export type RankingKey = 'omzet' | 'laba';

const DEFAULT_PERIOD = '30-hari';
const DEFAULT_THRESHOLD: SlowMoverThreshold = 30;

type AnalysisParams = {
  selection: PeriodSelection;
  threshold: SlowMoverThreshold;
  ranking: RankingKey;
};

// Periode, ambang lambat laku, dan urutan peringkat semuanya di URL; mengubah satu tidak menghapus yang lain.
export function useAnalysisParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params: AnalysisParams = {
    selection: parsePeriodParams(searchParams, DASHBOARD_PERIODS, DEFAULT_PERIOD),
    threshold:
      SLOW_MOVER_THRESHOLDS.find((value) => String(value) === searchParams.get('ambang')) ?? DEFAULT_THRESHOLD,
    ranking: searchParams.get('urut') === 'laba' ? 'laba' : 'omzet',
  };

  function write(next: AnalysisParams) {
    const query = serializePeriodParams(next.selection, new URLSearchParams(), DEFAULT_PERIOD);
    if (next.threshold !== DEFAULT_THRESHOLD) query.set('ambang', String(next.threshold));
    if (next.ranking !== 'omzet') query.set('urut', next.ranking);
    setSearchParams(query, { replace: true });
  }

  return {
    ...params,
    setSelection: (patch: Partial<PeriodSelection>) =>
      write({ ...params, selection: { ...params.selection, ...patch } }),
    setThreshold: (threshold: SlowMoverThreshold) => write({ ...params, threshold }),
    setRanking: (ranking: RankingKey) => write({ ...params, ranking }),
  };
}
