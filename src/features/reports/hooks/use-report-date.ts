import { useSearchParams } from 'react-router';

import { parseLocalDate, toLocalDateText } from '../../../utils/date-period';

// ?tanggal=YYYY-MM-DD; kosong atau bukan tanggal kalender yang ada kembali ke hari ini. Tanggal masa depan sengaja
// dibiarkan lolos supaya laporan menampilkan penolakannya, bukan diam-diam menggantinya.
export function useReportDate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = toLocalDateText(new Date());
  const requested = searchParams.get('tanggal');
  const date = requested !== null && parseLocalDate(requested) ? requested : today;

  function setDate(next: string) {
    const params = new URLSearchParams();
    if (next && next !== today) params.set('tanggal', next);
    setSearchParams(params, { replace: true });
  }

  return { date, setDate };
}
