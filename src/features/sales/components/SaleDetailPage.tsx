import { HelpLink } from '../../help';
import { useLocation, useParams } from 'react-router';

import { SubpageLayout } from '../../../components/layout/SubpageLayout';
import { getReturnPath } from '../../../utils/return-path';
import { StockListError } from '../../stock';
import { useSaleDetail } from '../api/use-sale-detail';
import { SaleActions } from './SaleActions';
import { SaleDetailInfo } from './SaleDetailInfo';
import { SaleDetailItems } from './SaleDetailItems';
import { SaleDetailSkeleton } from './SaleDetailSkeleton';
import { SaleNotFound } from './SaleNotFound';
import { SaleReturnsList } from './SaleReturnsList';

const BACK_LABEL = 'Kembali ke riwayat';
const HEADING = 'Detail Transaksi';

export function SaleDetailPage() {
  const { saleId = '' } = useParams();
  const location = useLocation();
  const { data: detail, isPending, error, refetch } = useSaleDetail(saleId);
  // location.state bertipe any dari router; dipersempit ke unknown sebelum dipakai.
  const locationState: unknown = location.state;
  const backTo = getReturnPath(locationState, '/penjualan');

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return (
      <SubpageLayout title="Detail transaksi" heading={HEADING} action={<HelpLink topic="retur-batal" />} back={{ to: backTo, label: BACK_LABEL }}>
        <SaleDetailSkeleton />
      </SubpageLayout>
    );
  }

  if (error) {
    return (
      <SubpageLayout title="Detail transaksi" heading={HEADING} action={<HelpLink topic="retur-batal" />} back={{ to: backTo, label: BACK_LABEL }}>
        <StockListError error={error} onRetry={handleRetry} />
      </SubpageLayout>
    );
  }

  if (!detail) {
    return (
      <SubpageLayout title="Transaksi tidak ditemukan" heading={HEADING} action={<HelpLink topic="retur-batal" />} back={{ to: backTo, label: BACK_LABEL }}>
        <SaleNotFound />
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title={detail.sale.number} heading={HEADING} action={<HelpLink topic="retur-batal" />} back={{ to: backTo, label: BACK_LABEL }}>
      <SaleDetailInfo sale={detail.sale} />
      <SaleDetailItems progress={detail.progress} />
      <SaleReturnsList returns={detail.returns} progress={detail.progress} />
      <SaleActions detail={detail} />
    </SubpageLayout>
  );
}
