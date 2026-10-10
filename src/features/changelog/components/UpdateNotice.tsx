import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { shouldNotifyUpdate } from '../api/changelog-state';
import { CURRENT_RELEASE } from '../current-release';

type UpdateNoticeProps = {
  isCashierMode: boolean;
};

const NOTICE_DURATION_MS = 8000;

// Toast sekali per versi. Tidak merender apa pun, dan tidak boleh menghalangi aplikasi terbuka.
export function UpdateNotice({ isCashierMode }: UpdateNoticeProps) {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  // Sinkronisasi dengan sistem luar: membaca catatan versi di IndexedDB lalu menampilkan toast Sonner. Penjaga ref mencegah dobel di StrictMode.
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function notify() {
      try {
        if (!(await shouldNotifyUpdate(CURRENT_RELEASE.version))) return;
        // Kasir tidak perlu diberi tahu perubahan yang semuanya khusus pemilik; kuncinya tetap tercatat.
        if (isCashierMode && !CURRENT_RELEASE.isVisibleToCashier) return;
        toast(`Diperbarui ke versi ${CURRENT_RELEASE.version}`, {
          description: CURRENT_RELEASE.title,
          duration: NOTICE_DURATION_MS,
          action: { label: 'Lihat yang baru', onClick: () => void navigate('/pembaruan') },
        });
      } catch {
        // Pemberitahuan hanya pelengkap: bila catatan versi tidak terbaca, aplikasi tetap dibuka tanpa toast.
      }
    }

    void notify();
  }, [isCashierMode, navigate]);

  return null;
}
